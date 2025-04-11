import { WebcastPushConnection } from 'tiktok-live-connector';
import axios from 'axios';

interface TikTokGift {
  id: string;
  name: string;
  diamondCost: number;
  description: string;
  icon: string;
}

interface TikTokUser {
  id: string;
  nickname: string;
  profilePicture: string;
  followRole: number;
  userBadges: string[];
}

export class TikTokService {
  private connection: WebcastPushConnection | null = null;
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = '';
  }

  async authenticate(code: string) {
    try {
      const response = await axios.post('https://open-api.tiktok.com/oauth/access_token/', {
        client_key: this.apiKey,
        client_secret: this.apiSecret,
        code,
        grant_type: 'authorization_code'
      });

      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      console.error('Error authenticating with TikTok:', error);
      throw error;
    }
  }

  async startLiveStream(uniqueId: string) {
    try {
      // Connect to TikTok Live
      this.connection = new WebcastPushConnection(uniqueId);

      // Handle connection
      await this.connection.connect();

      // Set up event handlers
      this.setupEventHandlers();

      return {
        status: 'connected',
        roomId: this.connection.roomId
      };
    } catch (error) {
      console.error('Error starting TikTok live stream:', error);
      throw error;
    }
  }

  async stopLiveStream() {
    if (!this.connection) {
      throw new Error('No active connection found');
    }

    try {
      await this.connection.disconnect();
      this.connection = null;
    } catch (error) {
      console.error('Error stopping TikTok live stream:', error);
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Chat messages
    this.connection.on('chat', data => {
      this.handleChatMessage(data);
    });

    // Gifts
    this.connection.on('gift', data => {
      this.handleGift(data);
    });

    // Likes
    this.connection.on('like', data => {
      this.handleLike(data);
    });

    // Follows
    this.connection.on('follow', data => {
      this.handleFollow(data);
    });

    // Share
    this.connection.on('share', data => {
      this.handleShare(data);
    });

    // Questions
    this.connection.on('questionNew', data => {
      this.handleQuestion(data);
    });

    // Connection issues
    this.connection.on('streamEnd', () => {
      console.log('Stream ended');
    });

    this.connection.on('error', err => {
      console.error('Connection error:', err);
    });
  }

  private handleChatMessage(data: any) {
    const message = {
      id: data.msgId,
      text: data.comment,
      user: this.formatUser(data.user),
      timestamp: Date.now()
    };

    this.emit('chatMessage', message);
  }

  private handleGift(data: any) {
    const gift = {
      id: data.giftId,
      name: data.giftName,
      sender: this.formatUser(data.user),
      amount: data.diamondCount,
      repeatCount: data.repeatCount,
      timestamp: Date.now()
    };

    this.emit('gift', gift);
  }

  private handleLike(data: any) {
    const like = {
      user: this.formatUser(data.user),
      likeCount: data.likeCount,
      totalLikeCount: data.totalLikeCount,
      timestamp: Date.now()
    };

    this.emit('like', like);
  }

  private handleFollow(data: any) {
    const follow = {
      user: this.formatUser(data.user),
      timestamp: Date.now()
    };

    this.emit('follow', follow);
  }

  private handleShare(data: any) {
    const share = {
      user: this.formatUser(data.user),
      timestamp: Date.now()
    };

    this.emit('share', share);
  }

  private handleQuestion(data: any) {
    const question = {
      id: data.questionId,
      text: data.questionText,
      user: this.formatUser(data.user),
      timestamp: Date.now()
    };

    this.emit('question', question);
  }

  private formatUser(userData: any): TikTokUser {
    return {
      id: userData.userId,
      nickname: userData.nickname,
      profilePicture: userData.profilePicture,
      followRole: userData.followRole,
      userBadges: userData.userBadges || []
    };
  }

  private emit(event: string, data: any) {
    // Implement your event emitting logic here
    // This could be WebSocket, EventEmitter, or any other event system
    console.log(event, data);
  }

  async getLiveStreamInfo() {
    if (!this.connection) {
      throw new Error('No active connection found');
    }

    try {
      return {
        roomId: this.connection.roomId,
        viewerCount: this.connection.viewerCount,
        totalLikes: this.connection.likeCount,
        giftCount: this.connection.giftCount,
        topGifters: this.connection.topGifters
      };
    } catch (error) {
      console.error('Error getting TikTok stream info:', error);
      throw error;
    }
  }

  async getAvailableGifts(): Promise<TikTokGift[]> {
    try {
      const response = await axios.get('https://open-api.tiktok.com/gift/list/', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.data.gifts.map((gift: any) => ({
        id: gift.id,
        name: gift.name,
        diamondCost: gift.diamond_count,
        description: gift.description,
        icon: gift.icon_url
      }));
    } catch (error) {
      console.error('Error getting TikTok gifts:', error);
      throw error;
    }
  }

  async getLiveStreamStats() {
    try {
      const response = await axios.get('https://open-api.tiktok.com/live/stats/', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        viewCount: response.data.stats.view_count,
        likeCount: response.data.stats.like_count,
        diamondCount: response.data.stats.diamond_count,
        shareCount: response.data.stats.share_count,
        commentCount: response.data.stats.comment_count,
        averageWatchTime: response.data.stats.average_watch_time
      };
    } catch (error) {
      console.error('Error getting TikTok stats:', error);
      throw error;
    }
  }

  async banUser(userId: string) {
    if (!this.connection) {
      throw new Error('No active connection found');
    }

    try {
      await this.connection.blockUser(userId);
    } catch (error) {
      console.error('Error banning TikTok user:', error);
      throw error;
    }
  }

  async unbanUser(userId: string) {
    if (!this.connection) {
      throw new Error('No active connection found');
    }

    try {
      await this.connection.unblockUser(userId);
    } catch (error) {
      console.error('Error unbanning TikTok user:', error);
      throw error;
    }
  }

  async enableComments() {
    if (!this.connection) {
      throw new Error('No active connection found');
    }

    try {
      await this.connection.enableComments();
    } catch (error) {
      console.error('Error enabling TikTok comments:', error);
      throw error;
    }
  }

  async disableComments() {
    if (!this.connection) {
      throw new Error('No active connection found');
    }

    try {
      await this.connection.disableComments();
    } catch (error) {
      console.error('Error disabling TikTok comments:', error);
      throw error;
    }
  }
}
