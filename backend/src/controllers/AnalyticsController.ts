import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getDashboardData = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const data = await this.analyticsService.getDashboardData(userId);
      res.json(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  };

  getVideoStats = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { startDate, endDate } = req.query;
      const stats = await this.analyticsService.getVideoStats(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(stats);
    } catch (error) {
      console.error('Error fetching video stats:', error);
      res.status(500).json({ error: 'Failed to fetch video stats' });
    }
  };

  getVideoPerformance = async (req: Request, res: Response) => {
    try {
      const { videoId } = req.params;
      const performance = await this.analyticsService.getVideoPerformance(videoId);
      res.json(performance);
    } catch (error) {
      console.error('Error fetching video performance:', error);
      res.status(500).json({ error: 'Failed to fetch video performance' });
    }
  };

  getPopularCategories = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { period } = req.query;
      const categories = await this.analyticsService.getPopularCategories(
        userId,
        period as string
      );
      res.json(categories);
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      res.status(500).json({ error: 'Failed to fetch popular categories' });
    }
  };

  getAIPerformance = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const performance = await this.analyticsService.getAIPerformance(userId);
      res.json(performance);
    } catch (error) {
      console.error('Error fetching AI performance:', error);
      res.status(500).json({ error: 'Failed to fetch AI performance' });
    }
  };

  getPopularPrompts = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { limit } = req.query;
      const prompts = await this.analyticsService.getPopularPrompts(
        userId,
        Number(limit) || 10
      );
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching popular prompts:', error);
      res.status(500).json({ error: 'Failed to fetch popular prompts' });
    }
  };

  getEngagementOverview = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { period } = req.query;
      const overview = await this.analyticsService.getEngagementOverview(
        userId,
        period as string
      );
      res.json(overview);
    } catch (error) {
      console.error('Error fetching engagement overview:', error);
      res.status(500).json({ error: 'Failed to fetch engagement overview' });
    }
  };

  getRetentionData = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { videoId } = req.query;
      const retention = await this.analyticsService.getRetentionData(
        userId,
        videoId as string
      );
      res.json(retention);
    } catch (error) {
      console.error('Error fetching retention data:', error);
      res.status(500).json({ error: 'Failed to fetch retention data' });
    }
  };

  exportAnalytics = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { format, startDate, endDate } = req.query;
      const exportData = await this.analyticsService.exportAnalytics(
        userId,
        format as string,
        startDate as string,
        endDate as string
      );
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-export.${format}`);
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      res.status(500).json({ error: 'Failed to export analytics' });
    }
  };
}
