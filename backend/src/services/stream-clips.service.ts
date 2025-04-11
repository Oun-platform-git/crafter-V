import { 
  IvsClient, 
  GetStreamCommand,
  GetStreamCommandOutput,
  GetStreamCommandInput,
  CreateRecordingConfigurationCommand,
  CreateRecordingConfigurationCommandInput,
  CreateRecordingConfigurationCommandOutput
} from '@aws-sdk/client-ivs';
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand,
  DeleteObjectCommandInput 
} from '@aws-sdk/client-s3';
import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';

interface ClipMetadata {
  id: string;
  userId: string;
  channelId: string;
  title: string;
  description?: string;
  duration: number;
  createdAt: Date;
  status: 'processing' | 'ready' | 'failed';
  url?: string;
  clipArn?: string;
}

interface UpdateClipMetadata {
  title?: string;
  description?: string;
  status?: 'processing' | 'ready' | 'failed';
  url?: string;
}

interface IvsClipResponse {
  clip?: {
    arn: string;
    state: string;
    sourceArn: string;
    playbackUrl?: string;
  };
  $metadata?: {
    httpStatusCode: number;
    requestId: string;
    attempts: number;
    totalRetryDelay: number;
  };
}

export class StreamClipsService {
  private ivsClient: IvsClient;
  private s3Client: S3Client;
  private redis: Redis;
  private readonly MAX_POLL_ATTEMPTS = 30; // 5 minutes at 10-second intervals
  private readonly POLL_INTERVAL = 10000; // 10 seconds

  constructor() {
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };

    this.ivsClient = new IvsClient(config);
    this.s3Client = new S3Client(config);
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async createClip(channelArn: string, userId: string, startTime: number, duration: number): Promise<ClipMetadata> {
    try {
      // For IVS clips, we need to use the recording configuration
      const recordingConfigInput: CreateRecordingConfigurationCommandInput = {
        name: `clip-${randomUUID()}`,
        destinationConfiguration: {
          s3: {
            bucketName: process.env.S3_CLIPS_BUCKET || 'crafterv-clips'
          }
        },
        thumbnailConfiguration: {
          recordingMode: "INTERVAL",
          targetIntervalSeconds: 1
        }
      };

      const recordingCommand = new CreateRecordingConfigurationCommand(recordingConfigInput);
      const recordingResponse: CreateRecordingConfigurationCommandOutput = await this.ivsClient.send(recordingCommand);

      const clipId = randomUUID();
      
      // Store clip metadata
      const clipMetadata: ClipMetadata = {
        id: clipId,
        userId,
        channelId: channelArn,
        title: `Clip ${new Date().toISOString()}`,
        duration,
        createdAt: new Date(),
        status: 'processing',
        clipArn: recordingResponse.recordingConfiguration?.arn
      };

      await this.redis.set(`clip:${clipId}`, JSON.stringify(clipMetadata));

      // Start polling for clip status
      this.pollClipStatus(clipId, channelArn).catch(error => {
        console.error('Error polling clip status:', error);
      });

      return clipMetadata;
    } catch (error) {
      console.error('Error creating clip:', error);
      throw new Error('Failed to create stream clip');
    }
  }

  private async pollClipStatus(clipId: string, channelArn: string, attempts = 0): Promise<void> {
    try {
      if (attempts >= this.MAX_POLL_ATTEMPTS) {
        await this.updateClipMetadata(clipId, { status: 'failed' });
        return;
      }

      const input: GetStreamCommandInput = {
        channelArn
      };

      const command = new GetStreamCommand(input);
      const response: GetStreamCommandOutput = await this.ivsClient.send(command);

      if (!response.stream) {
        throw new Error('Invalid response from IVS: No stream data returned');
      }

      switch (response.stream.state) {
        case 'LIVE':
          await this.updateClipMetadata(clipId, {
            status: 'ready',
            url: response.stream.playbackUrl
          });
          break;
        case 'OFFLINE':
          await this.updateClipMetadata(clipId, { status: 'failed' });
          break;
        default:
          // Continue polling
          setTimeout(() => {
            this.pollClipStatus(clipId, channelArn, attempts + 1).catch(error => {
              console.error('Error in poll iteration:', error);
            });
          }, this.POLL_INTERVAL);
      }
    } catch (error) {
      console.error('Error polling clip status:', error);
      await this.updateClipMetadata(clipId, { status: 'failed' });
    }
  }

  async getClip(clipId: string): Promise<ClipMetadata | null> {
    try {
      const clipData = await this.redis.get(`clip:${clipId}`);
      if (!clipData) return null;

      const clip = JSON.parse(clipData) as ClipMetadata;
      clip.createdAt = new Date(clip.createdAt);
      return clip;
    } catch (error) {
      console.error('Error getting clip:', error);
      throw new Error('Failed to get clip information');
    }
  }

  async updateClipMetadata(clipId: string, metadata: UpdateClipMetadata): Promise<ClipMetadata> {
    try {
      const currentData = await this.getClip(clipId);
      if (!currentData) {
        throw new Error('Clip not found');
      }

      const updatedData = { ...currentData, ...metadata };
      await this.redis.set(`clip:${clipId}`, JSON.stringify(updatedData));

      return updatedData;
    } catch (error) {
      console.error('Error updating clip metadata:', error);
      throw new Error('Failed to update clip metadata');
    }
  }

  async listClips(channelId: string, limit = 20, offset = 0): Promise<ClipMetadata[]> {
    try {
      const clipKeys = await this.redis.keys(`clip:*`);
      const clips: ClipMetadata[] = [];

      for (const key of clipKeys) {
        const clipData = await this.redis.get(key);
        if (clipData) {
          const clip = JSON.parse(clipData) as ClipMetadata;
          clip.createdAt = new Date(clip.createdAt);
          if (clip.channelId === channelId) {
            clips.push(clip);
          }
        }
      }

      return clips
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(offset, offset + limit);
    } catch (error) {
      console.error('Error listing clips:', error);
      throw new Error('Failed to list clips');
    }
  }

  async deleteClip(clipId: string, userId: string): Promise<void> {
    try {
      const clip = await this.getClip(clipId);
      if (!clip) {
        throw new Error('Clip not found');
      }
      if (clip.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Delete from S3 if exists
      if (clip.url) {
        const urlParts = new URL(clip.url);
        const key = urlParts.pathname.slice(1); // Remove leading slash

        const deleteInput: DeleteObjectCommandInput = {
          Bucket: process.env.S3_CLIPS_BUCKET || 'crafterv-clips',
          Key: key
        };

        await this.s3Client.send(new DeleteObjectCommand(deleteInput));
      }

      // Delete metadata
      await this.redis.del(`clip:${clipId}`);
    } catch (error) {
      console.error('Error deleting clip:', error);
      throw new Error('Failed to delete clip');
    }
  }
}
