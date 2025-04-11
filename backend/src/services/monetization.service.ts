import OpenAI from 'openai';
import { VideoAnalyzer } from '../utils/video-analyzer';
import { ContentChecker } from '../utils/content-checker';
import { AffiliateManager } from '../utils/affiliate-manager';

export class MonetizationService {
  private openai: OpenAI;
  private videoAnalyzer: VideoAnalyzer;
  private contentChecker: ContentChecker;
  private affiliateManager: AffiliateManager;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: false // Ensure server-side only usage
    });
    this.videoAnalyzer = new VideoAnalyzer();
    this.contentChecker = new ContentChecker();
    this.affiliateManager = new AffiliateManager();
  }

  async optimizeAdPlacement(videoBuffer: Buffer, duration: number): Promise<{
    adBreaks: Array<{
      timestamp: number;
      type: 'pre-roll' | 'mid-roll' | 'post-roll';
      score: number;
      reason: string;
    }>;
  }> {
    try {
      // Analyze video for natural break points
      const sceneChanges = await this.videoAnalyzer.detectSceneChanges(videoBuffer);
      const contentEngagement = await this.videoAnalyzer.analyzeEngagement(videoBuffer);
      
      const adBreaks = [];

      // Always add pre-roll if video is longer than 1 minute
      if (duration > 60) {
        adBreaks.push({
          timestamp: 0,
          type: 'pre-roll',
          score: 1,
          reason: 'Standard pre-roll placement'
        });
      }

      // Add mid-rolls at natural breaks
      if (duration > 480) { // 8 minutes or longer
        const potentialBreaks = sceneChanges.map(change => ({
          timestamp: change.timestamp,
          engagement: contentEngagement.find(e => 
            Math.abs(e.timestamp - change.timestamp) < 5
          )?.score || 0
        }));

        // Sort by engagement score and pick best spots
        const midRolls = potentialBreaks
          .sort((a, b) => b.engagement - a.engagement)
          .slice(0, Math.floor(duration / 480)) // One mid-roll per 8 minutes
          .map(break_ => ({
            timestamp: break_.timestamp,
            type: 'mid-roll' as const,
            score: break_.engagement,
            reason: 'Natural content break with high engagement'
          }));

        adBreaks.push(...midRolls);
      }

      // Add post-roll for videos over 3 minutes
      if (duration > 180) {
        adBreaks.push({
          timestamp: duration,
          type: 'post-roll',
          score: 1,
          reason: 'Standard post-roll placement'
        });
      }

      return { adBreaks: adBreaks.sort((a, b) => a.timestamp - b.timestamp) };
    } catch (error) {
      console.error('Error optimizing ad placement:', error);
      throw new Error('Failed to optimize ad placement');
    }
  }

  async checkMonetizationEligibility(videoBuffer: Buffer): Promise<{
    eligible: boolean;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      timestamp: number;
      description: string;
      suggestion: string;
    }>;
    overallScore: number;
  }> {
    try {
      const issues = [];
      let overallScore = 100;

      // Check for copyrighted content
      const copyrightIssues = await this.contentChecker.detectCopyrightedContent(videoBuffer);
      issues.push(...copyrightIssues.map(issue => ({
        type: 'copyright',
        severity: 'high',
        timestamp: issue.timestamp,
        description: `Detected copyrighted content: ${issue.content}`,
        suggestion: 'Replace or obtain proper licensing for copyrighted material'
      })));

      // Check for inappropriate content
      const inappropriateContent = await this.contentChecker.detectInappropriateContent(videoBuffer);
      issues.push(...inappropriateContent.map(issue => ({
        type: 'inappropriate',
        severity: issue.severity,
        timestamp: issue.timestamp,
        description: `Detected ${issue.type} content`,
        suggestion: issue.recommendation
      })));

      // Calculate overall score
      issues.forEach(issue => {
        switch (issue.severity) {
          case 'high':
            overallScore -= 30;
            break;
          case 'medium':
            overallScore -= 15;
            break;
          case 'low':
            overallScore -= 5;
            break;
        }
      });

      overallScore = Math.max(0, overallScore);

      return {
        eligible: overallScore >= 70 && !issues.some(i => i.severity === 'high'),
        issues,
        overallScore
      };
    } catch (error) {
      console.error('Error checking monetization eligibility:', error);
      throw new Error('Failed to check monetization eligibility');
    }
  }

  async generateAffiliateLinks(productMentions: Array<{
    timestamp: number;
    product: string;
    context: string;
  }>): Promise<Array<{
    timestamp: number;
    product: string;
    affiliateUrl: string;
    revenue: {
      percentage: number;
      estimatedValue: number;
    };
  }>> {
    try {
      return await Promise.all(
        productMentions.map(async mention => {
          const affiliateData = await this.affiliateManager.generateAffiliateLink(
            mention.product,
            mention.context
          );

          return {
            timestamp: mention.timestamp,
            product: mention.product,
            affiliateUrl: affiliateData.url,
            revenue: {
              percentage: affiliateData.commission,
              estimatedValue: affiliateData.estimatedValue
            }
          };
        })
      );
    } catch (error) {
      console.error('Error generating affiliate links:', error);
      throw new Error('Failed to generate affiliate links');
    }
  }

  async suggestTrendingKeywords(niche: string, region: string): Promise<{
    keywords: Array<{
      keyword: string;
      score: number;
      cpm: number;
      competition: number;
    }>;
    categories: Array<{
      name: string;
      averageCpm: number;
    }>;
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a YouTube SEO and monetization expert. Suggest trending keywords with high CPM rates."
          },
          {
            role: "user",
            content: `Suggest trending monetizable keywords for ${niche} content in ${region}. Return in JSON format with 'keywords' array and 'categories' array.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const suggestions = JSON.parse(completion.choices[0].message.content || '{"keywords":[],"categories":[]}');
      
      if (!suggestions.keywords || !suggestions.categories) {
        throw new Error('Invalid response format from OpenAI');
      }

      // Enhance suggestions with real CPM data
      const enhancedKeywords = await Promise.all(
        suggestions.keywords.map(async (kw: string) => {
          try {
            const metrics = await this.affiliateManager.getKeywordMetrics(kw, region);
            return {
              keyword: kw,
              ...metrics
            };
          } catch (error) {
            console.error(`Error getting metrics for keyword ${kw}:`, error);
            return {
              keyword: kw,
              score: 0,
              cpm: 0,
              competition: 0
            };
          }
        })
      );

      return {
        keywords: enhancedKeywords,
        categories: suggestions.categories
      };
    } catch (error) {
      console.error('Error suggesting trending keywords:', error);
      throw new Error('Failed to suggest trending keywords: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async generateSponsorshipPitch(videoMetrics: {
    views: number;
    engagement: number;
    demographics: any;
  }): Promise<{
    pitch: string;
    suggestedRate: number;
    targetBrands: string[];
  }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an influencer marketing expert. Generate compelling sponsorship pitches."
          },
          {
            role: "user",
            content: `Generate a sponsorship pitch based on these metrics: ${JSON.stringify(videoMetrics)}. Return in JSON format with 'pitch', 'suggestedRate', and 'targetBrands' fields.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      if (!result.pitch || !result.suggestedRate || !result.targetBrands) {
        throw new Error('Invalid response format from OpenAI');
      }

      return {
        pitch: result.pitch,
        suggestedRate: Number(result.suggestedRate),
        targetBrands: Array.isArray(result.targetBrands) ? result.targetBrands : []
      };
    } catch (error) {
      console.error('Error generating sponsorship pitch:', error);
      throw new Error('Failed to generate sponsorship pitch: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}
