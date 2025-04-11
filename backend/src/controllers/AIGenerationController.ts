import { Request, Response } from 'express';
import { AIService } from '../services/AIService';
import { AnalyticsService } from '../services/AnalyticsService';

export class AIGenerationController {
  private aiService: AIService;
  private analyticsService: AnalyticsService;

  constructor() {
    this.aiService = new AIService();
    this.analyticsService = new AnalyticsService();
  }

  generateVideo = async (req: Request, res: Response) => {
    try {
      const { description, style, duration, resolution, audio } = req.body;
      const userId = req.user?.id;

      const generationId = await this.aiService.startVideoGeneration({
        description,
        style,
        duration,
        resolution,
        audio,
        userId
      });

      // Track generation start
      await this.analyticsService.trackAIGeneration({
        userId,
        type: 'video',
        prompt: description,
        style
      });

      res.json({ generationId });
    } catch (error) {
      console.error('Error generating video:', error);
      res.status(500).json({ error: 'Failed to start video generation' });
    }
  };

  checkGenerationStatus = async (req: Request, res: Response) => {
    try {
      const { generationId } = req.params;
      const status = await this.aiService.checkGenerationStatus(generationId);
      res.json(status);
    } catch (error) {
      console.error('Error checking generation status:', error);
      res.status(500).json({ error: 'Failed to check generation status' });
    }
  };

  enhanceVideo = async (req: Request, res: Response) => {
    try {
      const { videoUrl, enhancements } = req.body;
      const userId = req.user?.id;

      const enhancedUrl = await this.aiService.enhanceVideo(videoUrl, enhancements);

      // Track enhancement
      await this.analyticsService.trackVideoEnhancement({
        userId,
        enhancements,
        originalUrl: videoUrl,
        enhancedUrl
      });

      res.json({ enhancedUrl });
    } catch (error) {
      console.error('Error enhancing video:', error);
      res.status(500).json({ error: 'Failed to enhance video' });
    }
  };

  generateAudio = async (req: Request, res: Response) => {
    try {
      const { prompt, type } = req.body;
      const userId = req.user?.id;

      const generationId = await this.aiService.startAudioGeneration({
        prompt,
        type,
        userId
      });

      // Track audio generation
      await this.analyticsService.trackAIGeneration({
        userId,
        type: 'audio',
        prompt
      });

      res.json({ generationId });
    } catch (error) {
      console.error('Error generating audio:', error);
      res.status(500).json({ error: 'Failed to start audio generation' });
    }
  };

  checkAudioStatus = async (req: Request, res: Response) => {
    try {
      const { generationId } = req.params;
      const status = await this.aiService.checkAudioStatus(generationId);
      res.json(status);
    } catch (error) {
      console.error('Error checking audio status:', error);
      res.status(500).json({ error: 'Failed to check audio status' });
    }
  };

  analyzeMood = async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      const mood = await this.aiService.analyzeMood(image);
      res.json({ mood });
    } catch (error) {
      console.error('Error analyzing mood:', error);
      res.status(500).json({ error: 'Failed to analyze mood' });
    }
  };

  analyzePets = async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      const pets = await this.aiService.analyzePets(image);
      res.json({ pets });
    } catch (error) {
      console.error('Error analyzing pets:', error);
      res.status(500).json({ error: 'Failed to analyze pets' });
    }
  };

  analyzeContent = async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      const content = await this.aiService.analyzeContent(image);
      res.json({ content });
    } catch (error) {
      console.error('Error analyzing content:', error);
      res.status(500).json({ error: 'Failed to analyze content' });
    }
  };
}
