import { Model } from 'mongoose';
import { VideoAnalytics, AIGeneration, UserEngagement } from '../models/analytics';

interface VideoStats {
  totalVideos: number;
  totalDuration: number;
  averageDuration: number;
  popularCategories: Array<{ name: string; count: number }>;
}

interface EngagementMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  retention: number;
}

interface AIMetrics {
  generationSuccess: number;
  averageGenerationTime: number;
  popularPrompts: Array<{ prompt: string; count: number }>;
}

export class AnalyticsService {
  private videoAnalytics: Model<any>;
  private aiGeneration: Model<any>;
  private userEngagement: Model<any>;

  constructor() {
    this.videoAnalytics = VideoAnalytics;
    this.aiGeneration = AIGeneration;
    this.userEngagement = UserEngagement;
  }

  async getDashboardData(userId: string) {
    const [videoStats, engagementMetrics, aiMetrics] = await Promise.all([
      this.getVideoStats(userId),
      this.getEngagementOverview(userId, '30d'),
      this.getAIPerformance(userId)
    ]);

    return {
      videoStats,
      engagementMetrics,
      aiMetrics
    };
  }

  async getVideoStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<VideoStats> {
    const query: any = { userId };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await this.videoAnalytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          categories: { $push: '$category' }
        }
      }
    ]);

    const categoryCount = stats[0].categories.reduce((acc: any, cat: string) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return {
      totalVideos: stats[0].totalVideos,
      totalDuration: stats[0].totalDuration,
      averageDuration: stats[0].totalDuration / stats[0].totalVideos,
      popularCategories: Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
    };
  }

  async getVideoPerformance(videoId: string) {
    return this.videoAnalytics.findOne({ videoId }).lean();
  }

  async getPopularCategories(userId: string, period: string) {
    const timeRange = this.getTimeRange(period);
    
    return this.videoAnalytics.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: timeRange.start, $lte: timeRange.end }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  async getAIPerformance(userId: string): Promise<AIMetrics> {
    const generations = await this.aiGeneration.find({ userId }).lean();
    
    const successful = generations.filter(g => g.status === 'completed');
    const totalTime = successful.reduce((sum, g) => sum + g.processingTime, 0);

    const promptCount: { [key: string]: number } = {};
    generations.forEach(g => {
      promptCount[g.prompt] = (promptCount[g.prompt] || 0) + 1;
    });

    return {
      generationSuccess: successful.length,
      averageGenerationTime: totalTime / successful.length,
      popularPrompts: Object.entries(promptCount)
        .map(([prompt, count]) => ({ prompt, count }))
        .sort((a, b) => b.count - a.count)
    };
  }

  async getPopularPrompts(userId: string, limit: number) {
    return this.aiGeneration.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$prompt',
          count: { $sum: 1 },
          successRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
  }

  async getEngagementOverview(
    userId: string,
    period: string
  ): Promise<EngagementMetrics> {
    const timeRange = this.getTimeRange(period);
    
    const metrics = await this.userEngagement.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: timeRange.start, $lte: timeRange.end }
        }
      },
      {
        $group: {
          _id: null,
          views: { $sum: '$views' },
          likes: { $sum: '$likes' },
          shares: { $sum: '$shares' },
          comments: { $sum: '$comments' },
          totalRetention: { $avg: '$retentionRate' }
        }
      }
    ]);

    return {
      views: metrics[0].views,
      likes: metrics[0].likes,
      shares: metrics[0].shares,
      comments: metrics[0].comments,
      retention: metrics[0].totalRetention
    };
  }

  async getRetentionData(userId: string, videoId: string) {
    return this.videoAnalytics.findOne(
      { userId, videoId },
      { retentionGraph: 1 }
    ).lean();
  }

  async exportAnalytics(
    userId: string,
    format: string,
    startDate: string,
    endDate: string
  ) {
    const data = await Promise.all([
      this.getVideoStats(userId, startDate, endDate),
      this.getEngagementOverview(userId, 'custom'),
      this.getAIPerformance(userId)
    ]);

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  async trackAIGeneration(data: {
    userId: string;
    type: string;
    prompt: string;
    style?: string;
  }) {
    return this.aiGeneration.create({
      ...data,
      timestamp: new Date(),
      status: 'started'
    });
  }

  async trackVideoEnhancement(data: {
    userId: string;
    enhancements: string[];
    originalUrl: string;
    enhancedUrl: string;
  }) {
    return this.videoAnalytics.create({
      ...data,
      timestamp: new Date(),
      type: 'enhancement'
    });
  }

  private getTimeRange(period: string) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      default:
        start.setDate(end.getDate() - 30); // Default to 30 days
    }

    return { start, end };
  }

  private convertToCSV(data: any[]) {
    // Implement CSV conversion logic
    return 'csv,data,here';
  }
}
