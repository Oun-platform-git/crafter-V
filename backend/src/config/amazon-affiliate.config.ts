import { createHmac } from 'crypto';
import axios, { AxiosInstance } from 'axios';

interface AmazonAffiliateConfig {
  affiliateTag: string;
  apiKey: string;
  secretKey: string;
}

export class AmazonAffiliateAPI {
  private readonly config: AmazonAffiliateConfig;
  private readonly client: AxiosInstance;
  private readonly baseUrl = 'https://webservices.amazon.com/paapi5';

  constructor(config: AmazonAffiliateConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async searchProducts(params: {
    keywords: string;
    searchIndex: string;
  }) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp);

    const response = await this.client.post('/searchitems', {
      Keywords: params.keywords,
      SearchIndex: params.searchIndex,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'Images.Primary.Medium'
      ],
      PartnerTag: this.config.affiliateTag,
      PartnerType: 'Associates',
      Timestamp: timestamp,
      Signature: signature
    }, {
      headers: {
        'X-Amz-Date': timestamp,
        'Authorization': `AWS4-HMAC-SHA256 Credential=${this.config.apiKey}`
      }
    });

    return response.data;
  }

  async generateAffiliateUrl(asin: string): Promise<string> {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp);

    const response = await this.client.post('/getitems', {
      ItemIds: [asin],
      Resources: ['ItemInfo.Title', 'Offers.Listings.Price'],
      PartnerTag: this.config.affiliateTag,
      PartnerType: 'Associates',
      Timestamp: timestamp,
      Signature: signature
    }, {
      headers: {
        'X-Amz-Date': timestamp,
        'Authorization': `AWS4-HMAC-SHA256 Credential=${this.config.apiKey}`
      }
    });

    const item = response.data.ItemsResult.Items[0];
    return `https://www.amazon.com/dp/${asin}?tag=${this.config.affiliateTag}`;
  }

  private generateSignature(timestamp: string): string {
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      this.config.apiKey,
      'ProductAdvertisingAPI'
    ].join('\n');

    return createHmac('sha256', this.config.secretKey)
      .update(stringToSign)
      .digest('hex');
  }
}
