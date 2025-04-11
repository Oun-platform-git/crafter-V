import { WebSocket } from 'ws';
import {
  MediaLiveClient,
  CreateChannelCommand,
  StartChannelCommand,
  StopChannelCommand,
  DeleteChannelCommand,
  DescribeChannelCommand
} from '@aws-sdk/client-medialive';
import {
  MediaStoreClient,
  CreateContainerCommand,
  DeleteContainerCommand
} from '@aws-sdk/client-mediastore';
import {
  IVSClient,
  CreateChannelCommand as IVSCreateChannelCommand,
  GetStreamCommand,
  StopStreamCommand
} from '@aws-sdk/client-ivs';
import {
  CloudWatchClient,
  GetMetricDataCommand
} from '@aws-sdk/client-cloudwatch';

interface StreamMetrics {
  viewers: number;
  bitrate: number;
  health: 'good' | 'fair' | 'poor';
  buffering: number;
  latency: number;
}

interface StreamConfig {
  resolution: string;
  bitrate: number;
  fps: number;
  codec: string;
}

export class LiveStreamingService {
  private mediaLive: MediaLiveClient;
  private mediaStore: MediaStoreClient;
  private ivs: IVSClient;
  private cloudWatch: CloudWatchClient;
  private activeStreams: Map<string, {
    channelId: string;
    websocket: WebSocket;
    metrics: StreamMetrics;
  }>;

  constructor() {
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    };

    this.mediaLive = new MediaLiveClient(config);
    this.mediaStore = new MediaStoreClient(config);
    this.ivs = new IVSClient(config);
    this.cloudWatch = new CloudWatchClient(config);
    this.activeStreams = new Map();
  }

  async createStreamChannel(userId: string, config: StreamConfig): Promise<{
    channelId: string;
    streamKey: string;
    ingestEndpoint: string;
    playbackUrl: string;
  }> {
    try {
      // Create IVS channel with low latency configuration
      const channel = await this.ivs.send(new IVSCreateChannelCommand({
        name: `user-${userId}-${Date.now()}`,
        latencyMode: 'LOW',
        type: 'STANDARD',
        recordingConfigurationArn: process.env.IVS_RECORDING_CONFIG_ARN,
        tags: {
          userId: userId
        }
      }));

      // Create stream key
      const streamKey = await this.ivs.send(new GetStreamCommand({
        channelArn: channel.channel?.arn!
      }));

      return {
        channelId: channel.channel?.arn!,
        streamKey: streamKey.stream?.key,
        ingestEndpoint: channel.channel?.ingestEndpoint!,
        playbackUrl: channel.channel?.playbackUrl!
      };
    } catch (error) {
      console.error('Error creating stream channel:', error);
      throw new Error('Failed to create stream channel');
    }
  }

  async startStream(channelId: string): Promise<void> {
    try {
      await this.ivs.send(new StopStreamCommand({
        channelArn: channelId
      }));

      // Initialize metrics monitoring
      this.initializeMetricsMonitoring(channelId);
    } catch (error) {
      console.error('Error starting stream:', error);
      throw new Error('Failed to start stream');
    }
  }

  async stopStream(channelId: string): Promise<void> {
    try {
      await this.ivs.send(new StopStreamCommand({
        channelArn: channelId
      }));

      // Clean up monitoring
      this.cleanupMetricsMonitoring(channelId);
    } catch (error) {
      console.error('Error stopping stream:', error);
      throw new Error('Failed to stop stream');
    }
  }

  async getStreamMetrics(channelId: string): Promise<StreamMetrics> {
    const stream = this.activeStreams.get(channelId);
    if (!stream) {
      throw new Error('Stream not found');
    }
    return stream.metrics;
  }

  async createClip(channelId: string, startTime: number, duration: number): Promise<{
    clipId: string;
    url: string;
  }> {
    try {
      // Create clip from live stream
      const clip = await this.ivs.send(new GetStreamCommand({
        channelArn: channelId,
        startTime,
        endTime: startTime + duration
      }));

      return {
        clipId: clip.stream?.id,
        url: clip.stream?.url
      };
    } catch (error) {
      console.error('Error creating clip:', error);
      throw new Error('Failed to create clip');
    }
  }

  async enableRecording(channelId: string, options: {
    format: 'MP4' | 'HLS';
    quality: 'HIGH' | 'STANDARD';
  }): Promise<void> {
    try {
      await this.ivs.send(new StopStreamCommand({
        arn: channelId,
        recordingConfigurationArn: process.env.IVS_RECORDING_CONFIG_ARN,
        type: options.quality
      }));
    } catch (error) {
      console.error('Error enabling recording:', error);
      throw new Error('Failed to enable recording');
    }
  }

  async getStreamHealth(channelId: string): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const metrics = await this.cloudWatch.send(new GetMetricDataCommand({
        MetricDataQueries: [
          {
            Id: 'health',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/IVS',
                MetricName: 'HealthScore',
                Dimensions: [
                  {
                    Name: 'Channel',
                    Value: channelId
                  }
                ]
              },
              Period: 60,
              Stat: 'Average'
            }
          }
        ],
        StartTime: new Date(Date.now() - 300000), // Last 5 minutes
        EndTime: new Date()
      }));

      // Analyze metrics and generate recommendations
      return this.analyzeStreamHealth(metrics);
    } catch (error) {
      console.error('Error getting stream health:', error);
      throw new Error('Failed to get stream health');
    }
  }

  private initializeMetricsMonitoring(channelId: string): void {
    // Set up WebSocket connection for real-time metrics
    const ws = new WebSocket(process.env.IVS_METRICS_ENDPOINT!);
    
    ws.on('message', (data: string) => {
      const metrics = JSON.parse(data);
      this.updateStreamMetrics(channelId, metrics);
    });

    this.activeStreams.set(channelId, {
      channelId,
      websocket: ws,
      metrics: {
        viewers: 0,
        bitrate: 0,
        health: 'good',
        buffering: 0,
        latency: 0
      }
    });
  }

  private cleanupMetricsMonitoring(channelId: string): void {
    const stream = this.activeStreams.get(channelId);
    if (stream) {
      stream.websocket.close();
      this.activeStreams.delete(channelId);
    }
  }

  private updateStreamMetrics(channelId: string, metrics: any): void {
    const stream = this.activeStreams.get(channelId);
    if (stream) {
      stream.metrics = {
        ...stream.metrics,
        ...metrics
      };
    }
  }

  private analyzeStreamHealth(metrics: any): {
    status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
    issues: string[];
    recommendations: string[];
  } {
    // Implementation for analyzing metrics and providing recommendations
    return {
      status: 'HEALTHY',
      issues: [],
      recommendations: []
    };
  }
}
