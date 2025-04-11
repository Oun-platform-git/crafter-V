import { 
  MediaLiveClient as MediaStoreClient, 
  CreateChannelCommand as CreateContainerCommand, 
  StartChannelCommand as StartRecordingCommand, 
  StopChannelCommand as StopRecordingCommand, 
  DeleteChannelCommand as DeleteContainerCommand,
  CreateChannelCommandInput as CreateContainerCommandInput,
  StartChannelCommandInput as StartRecordingCommandInput,
  StopChannelCommandInput as StopRecordingCommandInput,
  DeleteChannelCommandInput as DeleteContainerCommandInput,
  CreateChannelCommandOutput
} from '@aws-sdk/client-medialive';
import { 
  MediaConvertClient, 
  CreateJobCommand, 
  GetJobCommand,
  CreateJobCommandInput,
  GetJobCommandInput,
  Job
} from '@aws-sdk/client-mediaconvert';
import { 
  CloudWatchClient, 
  PutMetricDataCommand,
  PutMetricDataCommandInput
} from '@aws-sdk/client-cloudwatch';
import { 
  S3Client, 
  DeleteObjectCommand,
  DeleteObjectCommandInput
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

interface MediaConvertJobSettings {
  Inputs: {
    FileInput: string;
  }[];
  OutputGroups: {
    Name: string;
    OutputGroupSettings: {
      Type: string;
      FileGroupSettings: {
        Destination: string;
      };
    };
    Outputs: {
      ContainerSettings: {
        Container: string;
      };
      VideoDescription: {
        CodecSettings: {
          Codec: string;
        };
      };
      AudioDescriptions: {
        CodecSettings: {
          Codec: string;
        };
      }[];
    }[];
  }[];
}

interface RecordingConfig {
  format: 'MP4' | 'HLS';
  quality: 'HIGH' | 'STANDARD';
  retention: number; // Days to keep the recording
  outputSettings?: {
    resolution?: string;
    bitrate?: number;
    codec?: string;
  };
}

interface RecordingMetadata {
  id: string;
  channelId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  size?: number;
  format: string;
  quality: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  url?: string;
  containerArn?: string;
}

export class StreamRecordingService {
  private s3: S3Client;
  private mediaStore: MediaStoreClient;
  private mediaConvert: MediaConvertClient;
  private cloudWatch: CloudWatchClient;
  private activeRecordings: Map<string, RecordingMetadata>;

  constructor() {
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('Required AWS environment variables are missing');
    }

    const config = {
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    };

    this.s3 = new S3Client(config);
    this.mediaStore = new MediaStoreClient(config);
    this.mediaConvert = new MediaConvertClient(config);
    this.cloudWatch = new CloudWatchClient(config);
    this.activeRecordings = new Map();
  }

  async startRecording(channelId: string, config: RecordingConfig): Promise<RecordingMetadata> {
    try {
      const channelName = `recording-${channelId}-${Date.now()}`;
      const containerInput: CreateContainerCommandInput = {
        Name: channelName,
        Destinations: [{
          Id: 'destination1',
          Settings: [{
            Url: `s3://${process.env.AWS_RECORDINGS_BUCKET}/raw/${channelId}/${randomUUID()}`
          }]
        }],
        EncoderSettings: {
          TimecodeConfig: {
            Source: 'EMBEDDED'
          },
          VideoDescriptions: [{
            Name: 'video_1',
            CodecSettings: {
              H264Settings: {
                RateControlMode: config.quality === 'HIGH' ? 'CBR' : 'VBR',
                Bitrate: config.outputSettings?.bitrate || (config.quality === 'HIGH' ? 5000000 : 2000000)
              }
            }
          }],
          AudioDescriptions: [{
            Name: 'audio_1',
            AudioSelectorName: 'default_audio_selector',
            CodecSettings: {
              AacSettings: {
                RateControlMode: 'CBR',
                Bitrate: 192000
              }
            }
          }],
          OutputGroups: [{
            Name: 'File',
            OutputGroupSettings: {
              HlsGroupSettings: {
                Destination: {
                  DestinationRefId: 'destination1'
                }
              }
            },
            Outputs: [{
              OutputName: 'output1',
              VideoDescriptionName: 'video_1',
              AudioDescriptionNames: ['audio_1'],
              OutputSettings: {
                HlsOutputSettings: {
                  NameModifier: '_stream',
                  HlsSettings: {
                    StandardHlsSettings: {
                      M3u8Settings: {
                        PcrControl: 'PCR_EVERY_PES_PACKET',
                        TimedMetadataBehavior: 'NO_PASSTHROUGH',
                        ProgramNum: 1
                      },
                      AudioRenditionSets: 'PROGRAM_AUDIO'
                    }
                  }
                }
              }
            }]
          }]
        },
        Tags: {
          channelId: channelId,
          type: 'recording'
        }
      };

      const containerCommand = new CreateContainerCommand(containerInput);
      const container = await this.mediaStore.send(containerCommand);
      const channelArn = (container as any).Channel?.Arn;

      if (!channelArn) {
        throw new Error('Failed to create container: No ARN returned');
      }

      const recordingId = randomUUID();
      const metadata: RecordingMetadata = {
        id: recordingId,
        channelId,
        startTime: Date.now(),
        format: config.format,
        quality: config.quality,
        status: 'recording',
        containerArn: channelArn
      };

      const recordingInput: StartRecordingCommandInput = {
        ChannelId: channelArn
      };

      const recordingCommand = new StartRecordingCommand(recordingInput);
      await this.mediaStore.send(recordingCommand);

      this.activeRecordings.set(recordingId, metadata);
      await this.logMetric('RecordingStarted', 1, channelId);

      return metadata;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording');
    }
  }

  async stopRecording(recordingId: string): Promise<RecordingMetadata> {
    try {
      const recording = this.activeRecordings.get(recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      if (!recording.containerArn) {
        throw new Error('Recording container ARN not found');
      }

      const stopInput: StopRecordingCommandInput = {
        ChannelId: recording.containerArn.split('/').pop() // Extract the channel ID from the ARN
      };

      const stopCommand = new StopRecordingCommand(stopInput);
      await this.mediaStore.send(stopCommand);

      recording.endTime = Date.now();
      recording.duration = recording.endTime - recording.startTime;
      recording.status = 'processing';

      await this.logMetric('RecordingStopped', 1, recording.channelId);
      await this.processRecording(recordingId);

      return recording;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw new Error('Failed to stop recording');
    }
  }

  async getRecording(recordingId: string): Promise<RecordingMetadata> {
    const recording = this.activeRecordings.get(recordingId);
    if (!recording) {
      throw new Error('Recording not found');
    }
    return recording;
  }

  async listRecordings(channelId: string): Promise<RecordingMetadata[]> {
    return Array.from(this.activeRecordings.values())
      .filter(recording => recording.channelId === channelId);
  }

  async deleteRecording(recordingId: string): Promise<void> {
    try {
      const recording = this.activeRecordings.get(recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      // Delete from S3
      if (recording.url) {
        const deleteInput: DeleteObjectCommandInput = {
          Bucket: process.env.AWS_RECORDINGS_BUCKET,
          Key: `processed/${recording.channelId}/${recording.id}/output.${recording.format.toLowerCase()}`
        };

        const deleteCommand = new DeleteObjectCommand(deleteInput);
        await this.s3.send(deleteCommand);
      }

      // Delete container if it exists
      if (recording.containerArn) {
        const containerInput: DeleteContainerCommandInput = {
          ChannelId: recording.containerArn.split('/').pop() // Extract the channel ID from the ARN
        };

        const containerCommand = new DeleteContainerCommand(containerInput);
        await this.mediaStore.send(containerCommand);
      }

      this.activeRecordings.delete(recordingId);
      await this.logMetric('RecordingDeleted', 1, recording.channelId);
    } catch (error) {
      console.error('Error deleting recording:', error);
      throw new Error('Failed to delete recording');
    }
  }

  private async processRecording(recordingId: string): Promise<void> {
    try {
      const recording = this.activeRecordings.get(recordingId);
      if (!recording) {
        throw new Error('Recording not found');
      }

      if (!process.env.MEDIACONVERT_ROLE_ARN || !process.env.AWS_RECORDINGS_BUCKET) {
        throw new Error('Required environment variables for MediaConvert are missing');
      }

      const jobInput: CreateJobCommandInput = {
        Role: process.env.MEDIACONVERT_ROLE_ARN,
        Settings: {
          Inputs: [{
            FileInput: `s3://${process.env.AWS_RECORDINGS_BUCKET}/raw/${recording.channelId}/${recording.id}`
          }],
          OutputGroups: [{
            Name: 'File Group',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: {
                Destination: `s3://${process.env.AWS_RECORDINGS_BUCKET}/processed/${recording.channelId}/${recording.id}`
              }
            },
            Outputs: [{
              ContainerSettings: {
                Container: recording.format === 'MP4' ? 'MP4' : 'M3U8'
              },
              VideoDescription: {
                CodecSettings: {
                  Codec: 'H_264'
                }
              },
              AudioDescriptions: [{
                CodecSettings: {
                  Codec: 'AAC'
                }
              }]
            }]
          }]
        }
      };

      const jobCommand = new CreateJobCommand(jobInput);
      const job = await this.mediaConvert.send(jobCommand);

      if (!job.Job?.Id) {
        throw new Error('MediaConvert job creation failed: No job ID returned');
      }

      recording.status = 'processing';
      this.activeRecordings.set(recordingId, recording);

      await this.waitForJobCompletion(job.Job.Id);

      recording.status = 'completed';
      recording.url = `https://${process.env.AWS_RECORDINGS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/processed/${recording.channelId}/${recording.id}/output.${recording.format.toLowerCase()}`;
      this.activeRecordings.set(recordingId, recording);

      await this.logMetric('RecordingProcessed', 1, recording.channelId);
    } catch (error) {
      console.error('Error processing recording:', error);
      const recording = this.activeRecordings.get(recordingId);
      if (recording) {
        recording.status = 'failed';
        this.activeRecordings.set(recordingId, recording);
        await this.logMetric('RecordingProcessingFailed', 1, recording.channelId);
      }
      throw new Error('Failed to process recording');
    }
  }

  private async waitForJobCompletion(jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const jobInput: GetJobCommandInput = {
            Id: jobId
          };

          const jobCommand = new GetJobCommand(jobInput);
          const response = await this.mediaConvert.send(jobCommand);
          const job = response.Job;

          if (!job) {
            throw new Error('MediaConvert job not found');
          }

          switch (job.Status) {
            case 'COMPLETE':
              resolve();
              break;
            case 'ERROR':
              reject(new Error('MediaConvert job failed'));
              break;
            case 'CANCELED':
              reject(new Error('MediaConvert job was canceled'));
              break;
            default:
              setTimeout(checkStatus, 5000); // Check every 5 seconds
          }
        } catch (error) {
          reject(error);
        }
      };
      checkStatus();
    });
  }

  private async logMetric(metricName: string, value: number, channelId: string): Promise<void> {
    try {
      const input: PutMetricDataCommandInput = {
        Namespace: 'CrafterV/Recording',
        MetricData: [{
          MetricName: metricName,
          Value: value,
          Unit: 'Count',
          Dimensions: [{
            Name: 'ChannelId',
            Value: channelId
          }],
          Timestamp: new Date()
        }]
      };

      const command = new PutMetricDataCommand(input);
      await this.cloudWatch.send(command);
    } catch (error) {
      console.error('Error logging metric:', error);
      // Don't throw error for metrics logging failures
    }
  }
}
