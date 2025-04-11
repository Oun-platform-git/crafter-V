import axios from 'axios';
import { RapidAPI } from '../config/rapid-api.config';
import { AmazonAffiliateAPI } from '../config/amazon-affiliate.config';
import { join } from 'path';
import { tmpdir } from 'os';

export interface AffiliateProduct {
  title: string;
  description: string;
  price: number;
  url: string;
  imageUrl: string;
  platform: string;
  rating?: number;
  reviews?: number;
}

export interface KeywordMetrics {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  trend: number[];
}

export class AffiliateManager {
  private readonly rapidApi: RapidAPI;
  private readonly amazonApi: AmazonAffiliateAPI;

  constructor(config: {
    rapidApiKey: string;
    amazonAffiliateTag: string;
    amazonApiKey: string;
    amazonSecretKey: string;
  }) {
    this.rapidApi = new RapidAPI({
      apiKey: config.rapidApiKey
    });

    this.amazonApi = new AmazonAffiliateAPI({
      affiliateTag: config.amazonAffiliateTag,
      apiKey: config.amazonApiKey,
      secretKey: config.amazonSecretKey
    });
  }

  async generateAffiliateLink(product: string): Promise<AffiliateProduct | null> {
    try {
      // First try Amazon
      const amazonResult = await this.amazonApi.searchProducts({
        keywords: product,
        searchIndex: 'All'
      });

      if (amazonResult.Items && amazonResult.Items.length > 0) {
        const item = amazonResult.Items[0];
        const affiliateUrl = await this.amazonApi.generateAffiliateUrl(item.ASIN);

        return {
          title: item.ItemInfo.Title.DisplayValue,
          description: item.ItemInfo.Features?.DisplayValues?.[0] || '',
          price: item.Offers?.Listings?.[0]?.Price?.Amount || 0,
          url: affiliateUrl,
          imageUrl: item.Images.Primary.Medium.URL,
          platform: 'amazon',
          rating: item.CustomerReviews?.StarRating || undefined,
          reviews: item.CustomerReviews?.Count || undefined
        };
      }

      // Try other affiliate networks via RapidAPI
      const rapidApiResult = await this.rapidApi.searchAffiliateProducts({
        query: product,
        category: 'general'
      });

      if (rapidApiResult && rapidApiResult.length > 0) {
        const item = rapidApiResult[0];
        return {
          title: item.title,
          description: item.description,
          price: item.price,
          url: item.affiliate_url,
          imageUrl: item.image_url,
          platform: item.platform,
          rating: item.rating,
          reviews: item.review_count
        };
      }

      return null;
    } catch (error) {
      console.error('Error generating affiliate link:', error);
      return null;
    }
  }

  async getKeywordMetrics(keyword: string, region: string = 'US'): Promise<KeywordMetrics | null> {
    try {
      const [cpmData, trendsData, competitionData] = await Promise.all([
        this.rapidApi.getYouTubeCPM({ keyword, region }),
        this.rapidApi.getGoogleTrendsData({ keyword, region, timeframe: '12m' }),
        this.rapidApi.getKeywordCompetition({ keyword, region })
      ]);

      return {
        keyword,
        searchVolume: trendsData.search_volume || 0,
        competition: competitionData.competition_score || 0,
        cpc: cpmData.estimated_cpm || 0,
        trend: trendsData.trend_data || []
      };
    } catch (error) {
      console.error('Error fetching keyword metrics:', error);
      return null;
    }
  }
}
