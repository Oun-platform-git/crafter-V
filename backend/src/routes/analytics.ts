import express from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = express.Router();
const analyticsController = new AnalyticsController();

// Dashboard data
router.get('/dashboard', analyticsController.getDashboardData);

// Video analytics
router.get('/videos/stats', analyticsController.getVideoStats);
router.get('/videos/:videoId/performance', analyticsController.getVideoPerformance);
router.get('/videos/popular-categories', analyticsController.getPopularCategories);

// AI analytics
router.get('/ai/performance', analyticsController.getAIPerformance);
router.get('/ai/popular-prompts', analyticsController.getPopularPrompts);

// Engagement metrics
router.get('/engagement/overview', analyticsController.getEngagementOverview);
router.get('/engagement/retention', analyticsController.getRetentionData);

// Export data
router.get('/export', analyticsController.exportAnalytics);

export default router;
