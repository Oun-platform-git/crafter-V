import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { Redis } from 'ioredis';

interface StreamMetrics {
  viewers: number;
  viewersTrend: number;
  bitrate: number;
  health: 'good' | 'fair' | 'poor';
  buffering: number;
  latency: number;
  duration: number;
  viewerHistory: Array<{
    timestamp: number;
    count: number;
  }>;
}

export class StreamMetricsService {
  private cloudWatch: CloudWatchClient;
  private redis: Redis;
  private metricsCache: Map<string, StreamMetrics>;

  constructor() {
    this.cloudWatch = new CloudWatchClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.metricsCache = new Map();
  }

  async getMetrics(channelId: string): Promise<StreamMetrics> {
    try {
      // Check cache first
      const cachedMetrics = await this.redis.get(`metrics:${channelId}`);
      if (cachedMetrics) {
        return JSON.parse(cachedMetrics);
      }

      // Get metrics from CloudWatch
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 300000); // Last 5 minutes

      const command = new GetMetricDataCommand({
        MetricDataQueries: [
          {
            Id: 'viewers',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/IVS',
                MetricName: 'ConcurrentViews',
                Dimensions: [{ Name: 'Channel', Value: channelId }]
              },
              Period: 60,
              Stat: 'Average'
            }
          },
          {
            Id: 'bitrate',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/IVS',
                MetricName: 'IngestBitrate',
                Dimensions: [{ Name: 'Channel', Value: channelId }]
              },
              Period: 60,
              Stat: 'Average'
            }
          },
          {
            Id: 'buffering',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/IVS',
                MetricName: 'BufferingRatio',
                Dimensions: [{ Name: 'Channel', Value: channelId }]
              },
              Period: 60,
              Stat: 'Average'
            }
          },
          {
            Id: 'latency',
            MetricStat: {
              Metric: {
                Namespace: 'AWS/IVS',
                MetricName: 'Latency',
                Dimensions: [{ Name: 'Channel', Value: channelId }]
              },
              Period: 60,
              Stat: 'Average'
            }
          }
        ],
        StartTime: startTime,
        EndTime: endTime
      });

      const response = await this.cloudWatch.send(command);

      // Calculate viewer trend
      const currentViewers = response.MetricDataResults?.[0]?.Values?.[0] || 0;
      const previousViewers = response.MetricDataResults?.[0]?.Values?.[1] || 0;
      const viewersTrend = previousViewers > 0 ? ((currentViewers - previousViewers) / previousViewers) * 100 : 0;

      // Get viewer history from Redis
      const viewerHistory = await this.getViewerHistory(channelId);

      // Determine stream health
      const health = this.calculateStreamHealth(
        response.MetricDataResults?.[1]?.Values?.[0] || 0, // bitrate
        response.MetricDataResults?.[2]?.Values?.[0] || 0, // buffering
        response.MetricDataResults?.[3]?.Values?.[0] || 0  // latency
      );

      const metrics: StreamMetrics = {
        viewers: Math.round(currentViewers),
        viewersTrend,
        bitrate: response.MetricDataResults?.[1]?.Values?.[0] || 0,
        health,
        buffering: response.MetricDataResults?.[2]?.Values?.[0] || 0,
        latency: response.MetricDataResults?.[3]?.Values?.[0] || 0,
        duration: await this.getStreamDuration(channelId),
        viewerHistory
      };

      // Cache metrics for 1 minute
      await this.redis.set(
        `metrics:${channelId}`,
        JSON.stringify(metrics),
        'EX',
        60
      );

      return metrics;
    } catch (error) {
      console.error('Error fetching stream metrics:', error);
      throw new Error('Failed to fetch stream metrics');
    }
  }

  private async getViewerHistory(channelId: string): Promise<Array<{ timestamp: number; count: number }>> {
    try {
      const history = await this.redis.lrange(`viewer_history:${channelId}`, 0, 9);
      return history.map(item => JSON.parse(item));
    } catch (error) {
      console.error('Error getting viewer history:', error);
      return [];
    }
  }

  private async getStreamDuration(channelId: string): Promise<number> {
    try {
      const startTime = await this.redis.get(`stream_start:${channelId}`);
      if (!startTime) return 0;
      return Math.floor((Date.now() - parseInt(startTime)) / 1000);
    } catch (error) {
      console.error('Error getting stream duration:', error);
      return 0;
    }
  }

  private calculateStreamHealth(
    bitrate: number,
    buffering: number,
    latency: number
  ): 'good' | 'fair' | 'poor' {
    // Thresholds
    const GOOD_BITRATE = 2500000; // 2.5 Mbps
    const MIN_BITRATE = 1000000;  // 1 Mbps
    const MAX_BUFFERING = 0.05;   // 5%
    const MAX_LATENCY = 5;        // 5 seconds

    let score = 0;

    // Bitrate scoring
    if (bitrate >= GOOD_BITRATE) score += 3;
    else if (bitrate >= MIN_BITRATE) score += 2;
    else score += 1;

    // Buffering scoring
    if (buffering <= MAX_BUFFERING / 2) score += 3;
    else if (buffering <= MAX_BUFFERING) score += 2;
    else score += 1;

    // Latency scoring
    if (latency <= MAX_LATENCY / 2) score += 3;
    else if (latency <= MAX_LATENCY) score += 2;
    else score += 1;

    // Calculate final health
    if (score >= 8) return 'good';
    if (score >= 6) return 'fair';
    return 'poor';
  }

  async updateViewerCount(channelId: string, count: number): Promise<void> {
    try {
      const timestamp = Date.now();
      
      // Add to history
      await this.redis.lpush(
        `viewer_history:${channelId}`,
        JSON.stringify({ timestamp, count })
      );
      
      // Keep only last 10 entries
      await this.redis.ltrim(`viewer_history:${channelId}`, 0, 9);
      
      // Update current count
      await this.redis.set(`viewers:${channelId}`, count.toString());
    } catch (error) {
      console.error('Error updating viewer count:', error);
    }
  }

  async startStreamTracking(channelId: string): Promise<void> {
    await this.redis.set(`stream_start:${channelId}`, Date.now().toString());
  }

  async stopStreamTracking(channelId: string): Promise<void> {
    await Promise.all([
      this.redis.del(`stream_start:${channelId}`),
      this.redis.del(`viewers:${channelId}`),
      this.redis.del(`viewer_history:${channelId}`),
      this.redis.del(`metrics:${channelId}`)
    ]);
  }
}
