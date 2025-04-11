import axios, { AxiosInstance } from 'axios';

interface RapidAPIConfig {
  apiKey: string;
}

export class RapidAPI {
  private client: AxiosInstance;

  constructor(config: RapidAPIConfig) {
    this.client = axios.create({
      headers: {
        'X-RapidAPI-Key': config.apiKey,
        'X-RapidAPI-Host': 'multi-content-api.p.rapidapi.com'
      }
    });
  }

  async searchAffiliateProducts(params: {
    query: string;
    category: string;
  }) {
    const response = await this.client.get('/affiliate/search', {
      params: {
        query: params.query,
        category: params.category
      }
    });
    return response.data.products;
  }

  async getYouTubeCPM(params: {
    keyword: string;
    region: string;
  }) {
    const response = await this.client.get('/youtube/analytics', {
      params: {
        keyword: params.keyword,
        region: params.region
      }
    });
    return response.data.cpm;
  }

  async getGoogleTrendsData(params: {
    keyword: string;
    region: string;
    timeframe: string;
  }) {
    const response = await this.client.get('/trends/timeline', {
      params: {
        keyword: params.keyword,
        region: params.region,
        timeframe: params.timeframe
      }
    });
    return response.data;
  }

  async getKeywordCompetition(params: {
    keyword: string;
    region: string;
  }) {
    const response = await this.client.get('/keywords/competition', {
      params: {
        keyword: params.keyword,
        region: params.region
      }
    });
    return response.data;
  }
}
