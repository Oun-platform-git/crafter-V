import { 
  IvsClient, 
  CreateChannelCommand, 
  DeleteChannelCommand, 
  GetStreamCommand, 
  StopStreamCommand,
  CreateChannelCommandInput,
  GetStreamCommandInput,
  StopStreamCommandInput,
  DeleteChannelCommandInput,
  TranscodePreset
} from '@aws-sdk/client-ivs';

interface StreamSettings {
  resolution: string;
  bitrate: number;
  fps: number;
  codec: string;
}

interface ChannelInfo {
  channelArn: string;
  streamKey: string;
  ingestEndpoint: string;
  playbackUrl: string;
}

interface StreamStatus {
  state: 'LIVE' | 'OFFLINE' | 'CONNECTING' | 'ERROR';
  health: 'HEALTHY' | 'STARVING' | 'UNKNOWN';
  viewerCount: number;
  startTime?: Date;
}

export class LiveStreamService {
  private ivsClient: IvsClient;

  constructor() {
    this.ivsClient = new IvsClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
  }

  async createChannel(userId: string, settings: StreamSettings): Promise<ChannelInfo> {
    try {
      const input: CreateChannelCommandInput = {
        name: `channel-${userId}`,
        latencyMode: 'LOW',
        type: 'STANDARD',
        recordingConfigurationArn: process.env.IVS_RECORDING_CONFIG_ARN,
        tags: {
          userId
        },
        authorized: true,
        insecureIngest: false,
        preset: this.getChannelPreset(settings)
      };

      const command = new CreateChannelCommand(input);
      const response = await this.ivsClient.send(command);

      if (!response.channel?.arn || !response.streamKey?.value || !response.channel.ingestEndpoint || !response.channel.playbackUrl) {
        throw new Error('Invalid response from IVS');
      }

      return {
        channelArn: response.channel.arn,
        streamKey: response.streamKey.value,
        ingestEndpoint: response.channel.ingestEndpoint,
        playbackUrl: response.channel.playbackUrl
      };
    } catch (error) {
      console.error('Error creating channel:', error);
      throw new Error('Failed to create streaming channel');
    }
  }

  private getChannelPreset(settings: StreamSettings): TranscodePreset {
    // Map settings to IVS presets
    const { resolution, bitrate } = settings;
    if (resolution === '1080p' && bitrate >= 8500000) {
      return TranscodePreset.HigherBandwidthTranscodePreset;
    } else if (resolution === '720p' && bitrate >= 3500000) {
      return TranscodePreset.ConstrainedBandwidthTranscodePreset;
    } else {
      return TranscodePreset.ConstrainedBandwidthTranscodePreset;
    }
  }

  async deleteChannel(channelArn: string): Promise<void> {
    try {
      const input: DeleteChannelCommandInput = {
        arn: channelArn
      };
      const command = new DeleteChannelCommand(input);
      await this.ivsClient.send(command);
    } catch (error) {
      console.error('Error deleting channel:', error);
      throw new Error('Failed to delete streaming channel');
    }
  }

  async getStreamStatus(channelArn: string): Promise<StreamStatus> {
    try {
      const input: GetStreamCommandInput = {
        channelArn
      };
      const command = new GetStreamCommand(input);
      const response = await this.ivsClient.send(command);

      return {
        state: (response.stream?.state as StreamStatus['state']) || 'OFFLINE',
        health: (response.stream?.health as StreamStatus['health']) || 'UNKNOWN',
        viewerCount: response.stream?.viewerCount || 0,
        startTime: response.stream?.startTime
      };
    } catch (error) {
      console.error('Error getting stream status:', error);
      return {
        state: 'OFFLINE',
        health: 'UNKNOWN',
        viewerCount: 0
      };
    }
  }

  async stopStream(channelArn: string): Promise<void> {
    try {
      const input: StopStreamCommandInput = {
        channelArn
      };
      const command = new StopStreamCommand(input);
      await this.ivsClient.send(command);
    } catch (error) {
      console.error('Error stopping stream:', error);
      throw new Error('Failed to stop stream');
    }
  }
}
