import { Request, Response } from 'express';
import { MonetizationService } from '../services/monetization.service';
import { Project } from '../models/Project';

const monetizationService = new MonetizationService();

interface OptimizeAdPlacementRequest {
  projectId: string;
}

interface GenerateAffiliateLinksRequest {
  projectId: string;
  productMentions: Array<{
    timestamp: number;
    product: string;
    context: string;
  }>;
}

interface KeywordSuggestionsRequest {
  niche: string;
  region: string;
}

interface SponsorshipPitchRequest {
  projectId: string;
}

export const optimizeAdPlacement = async (req: Request<{}, {}, OptimizeAdPlacementRequest>, res: Response) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get video buffer from project
    // This is a placeholder - implement actual video retrieval
    const videoBuffer = Buffer.from('');
    const duration = 0; // Get actual duration

    const optimization = await monetizationService.optimizeAdPlacement(videoBuffer, duration);
    res.json(optimization);
  } catch (error) {
    res.status(500).json({ error: 'Error optimizing ad placement' });
  }
};

export const checkMonetizationEligibility = async (req: Request<{}, {}, OptimizeAdPlacementRequest>, res: Response) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get video buffer from project
    // This is a placeholder - implement actual video retrieval
    const videoBuffer = Buffer.from('');

    const eligibility = await monetizationService.checkMonetizationEligibility(videoBuffer);
    res.json(eligibility);
  } catch (error) {
    res.status(500).json({ error: 'Error checking monetization eligibility' });
  }
};

export const generateAffiliateLinks = async (req: Request<{}, {}, GenerateAffiliateLinksRequest>, res: Response) => {
  try {
    const { projectId, productMentions } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const affiliateLinks = await monetizationService.generateAffiliateLinks(productMentions);
    res.json(affiliateLinks);
  } catch (error) {
    res.status(500).json({ error: 'Error generating affiliate links' });
  }
};

export const suggestTrendingKeywords = async (req: Request<{}, {}, KeywordSuggestionsRequest>, res: Response) => {
  try {
    const { niche, region } = req.body;
    const suggestions = await monetizationService.suggestTrendingKeywords(niche, region);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Error suggesting keywords' });
  }
};

export const generateSponsorshipPitch = async (req: Request<{}, {}, SponsorshipPitchRequest>, res: Response) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get video metrics
    // This is a placeholder - implement actual metrics retrieval
    const videoMetrics = {
      views: 0,
      engagement: 0,
      demographics: {}
    };

    const pitch = await monetizationService.generateSponsorshipPitch(videoMetrics);
    res.json(pitch);
  } catch (error) {
    res.status(500).json({ error: 'Error generating sponsorship pitch' });
  }
};
