import WebSocket from 'ws';
import { Redis } from 'ioredis';
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  type: 'message' | 'reaction' | 'moderation';
  metadata?: {
    color?: string;
    badges?: string[];
    isHighlighted?: boolean;
  };
}

interface ModerationAction {
  type: 'ban' | 'timeout' | 'delete';
  targetUserId: string;
  duration?: number;
  messageId?: string;
}

interface ChatEvent {
  type: 'chat' | 'reaction' | 'moderation';
  content?: string;
  action?: ModerationAction;
  targetUserId?: string;
  duration?: number;
  messageId?: string;
}

interface ChatSocket extends WebSocket {
  userId?: string;
}

interface ChatSettings {
  slowMode: boolean;
  slowModeInterval: number;
  followerOnly: boolean;
  subscriberOnly: boolean;
  emoteOnly: boolean;
}

export class StreamChatService {
  private redis: Redis;
  private chatRooms: Map<string, Set<ChatSocket>>;
  private moderators: Map<string, Set<string>>;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.chatRooms = new Map();
    this.moderators = new Map();
  }

  async joinChat(channelId: string, userId: string): Promise<void> {
    try {
      // Check if user is banned
      if (await this.isUserBanned(channelId, userId)) {
        throw new Error('You are banned from this chat');
      }

      // Add user to chat room
      if (!this.chatRooms.has(channelId)) {
        this.chatRooms.set(channelId, new Set());
      }
    } catch (error) {
      console.error('Error joining chat:', error);
      throw new Error('Failed to join chat');
    }
  }

  async leaveChat(channelId: string, userId: string): Promise<void> {
    try {
      const room = this.chatRooms.get(channelId);
      if (room) {
        if (room.size === 0) {
          this.chatRooms.delete(channelId);
        }
      }
    } catch (error) {
      console.error('Error leaving chat:', error);
      throw new Error('Failed to leave chat');
    }
  }

  async sendMessage(channelId: string, userId: string, content: string, metadata?: any): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const message: ChatMessage = {
        id: new Types.ObjectId().toString(),
        userId,
        username: user.username,
        content,
        timestamp: Date.now(),
        type: 'message',
        metadata: {
          ...metadata,
          color: user.chatColor,
          badges: user.badges
        }
      };

      // Store message in Redis
      await this.redis.lpush(`chat:${channelId}:messages`, JSON.stringify(message));
      await this.redis.ltrim(`chat:${channelId}:messages`, 0, 999);

      // Broadcast to all users in room
      this.broadcastToRoom(channelId, {
        type: 'message',
        message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async moderateUser(channelId: string, moderatorId: string, userId: string, action: string, duration?: number): Promise<void> {
    try {
      const isModerator = this.moderators.get(channelId)?.has(moderatorId);
      if (!isModerator) {
        throw new Error('Not authorized to moderate');
      }

      switch (action) {
        case 'ban':
          await this.banUser(channelId, userId, duration);
          break;
        case 'timeout':
          await this.banUser(channelId, userId, duration || 300);
          break;
        case 'unban':
          await this.unbanUser(channelId, userId);
          break;
        default:
          throw new Error('Invalid moderation action');
      }
    } catch (error) {
      console.error('Error moderating user:', error);
      throw new Error('Failed to moderate user');
    }
  }

  async getChatSettings(channelId: string): Promise<ChatSettings> {
    try {
      const settings = await this.redis.hgetall(`settings:${channelId}`);
      return {
        slowMode: settings.slowMode === 'true',
        slowModeInterval: parseInt(settings.slowModeInterval || '0'),
        followerOnly: settings.followerOnly === 'true',
        subscriberOnly: settings.subscriberOnly === 'true',
        emoteOnly: settings.emoteOnly === 'true'
      };
    } catch (error) {
      console.error('Error getting chat settings:', error);
      throw new Error('Failed to get chat settings');
    }
  }

  async updateChatSettings(channelId: string, userId: string, settings: Partial<ChatSettings>): Promise<void> {
    try {
      const isModerator = this.moderators.get(channelId)?.has(userId);
      if (!isModerator) {
        throw new Error('Not authorized to update settings');
      }

      await this.redis.hmset(`settings:${channelId}`, {
        ...settings,
        slowMode: settings.slowMode?.toString(),
        slowModeInterval: settings.slowModeInterval?.toString(),
        followerOnly: settings.followerOnly?.toString(),
        subscriberOnly: settings.subscriberOnly?.toString(),
        emoteOnly: settings.emoteOnly?.toString()
      });
    } catch (error) {
      console.error('Error updating chat settings:', error);
      throw new Error('Failed to update chat settings');
    }
  }

  async addModerator(channelId: string, userId: string): Promise<void> {
    try {
      if (!this.moderators.has(channelId)) {
        this.moderators.set(channelId, new Set());
      }
      const mods = this.moderators.get(channelId);
      if (mods) {
        mods.add(userId);
      }

      // Store in Redis for persistence
      await this.redis.sadd(`mods:${channelId}`, userId);
    } catch (error) {
      console.error('Error adding moderator:', error);
      throw new Error('Failed to add moderator');
    }
  }

  async removeModerator(channelId: string, userId: string): Promise<void> {
    try {
      const mods = this.moderators.get(channelId);
      if (mods) {
        mods.delete(userId);
      }

      // Remove from Redis
      await this.redis.srem(`mods:${channelId}`, userId);
    } catch (error) {
      console.error('Error removing moderator:', error);
      throw new Error('Failed to remove moderator');
    }
  }

  async banUser(channelId: string, userId: string, duration?: number): Promise<void> {
    try {
      const key = `banned:${channelId}:${userId}`;
      if (duration) {
        await this.redis.set(key, 'true', 'EX', duration);
      } else {
        await this.redis.set(key, 'true');
      }

      // Disconnect user if they're in the room
      const room = this.chatRooms.get(channelId);
      if (room) {
        room.forEach(socket => {
          if (socket.userId === userId) {
            socket.close();
          }
        });
      }
    } catch (error) {
      console.error('Error banning user:', error);
      throw new Error('Failed to ban user');
    }
  }

  async unbanUser(channelId: string, userId: string): Promise<void> {
    try {
      await this.redis.del(`banned:${channelId}:${userId}`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw new Error('Failed to unban user');
    }
  }

  async isUserBanned(channelId: string, userId: string): Promise<boolean> {
    try {
      const banned = await this.redis.get(`banned:${channelId}:${userId}`);
      return !!banned;
    } catch (error) {
      console.error('Error checking ban status:', error);
      return false;
    }
  }

  async getChatHistory(channelId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const messages = await this.redis.lrange(`chat:${channelId}:messages`, 0, limit - 1);
      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  async enableSlowMode(channelId: string, interval: number): Promise<void> {
    try {
      await this.redis.set(`slowmode:${channelId}`, interval.toString());
    } catch (error) {
      console.error('Error enabling slow mode:', error);
      throw new Error('Failed to enable slow mode');
    }
  }

  async disableSlowMode(channelId: string): Promise<void> {
    try {
      await this.redis.del(`slowmode:${channelId}`);
    } catch (error) {
      console.error('Error disabling slow mode:', error);
      throw new Error('Failed to disable slow mode');
    }
  }

  private broadcastToRoom(channelId: string, data: any): void {
    try {
      const room = this.chatRooms.get(channelId);
      if (!room) return;

      const message = JSON.stringify(data);
      room.forEach(socket => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(message);
        }
      });
    } catch (error) {
      console.error('Error broadcasting to room:', error);
    }
  }

  private async handleMessage(channelId: string, userId: string, event: ChatEvent): Promise<void> {
    try {
      // Check if user is banned
      if (await this.isUserBanned(channelId, userId)) {
        return;
      }

      // Check slow mode
      const slowMode = await this.redis.get(`slowmode:${channelId}`);
      if (slowMode) {
        const lastMessage = await this.redis.get(`lastmsg:${channelId}:${userId}`);
        if (lastMessage && Date.now() - parseInt(lastMessage) < parseInt(slowMode)) {
          return;
        }
        await this.redis.set(`lastmsg:${channelId}:${userId}`, Date.now().toString());
      }

      switch (event.type) {
        case 'chat':
          if (event.content) {
            await this.sendMessage(channelId, userId, event.content);
          }
          break;

        case 'reaction':
          // Handle reactions (future implementation)
          break;

        case 'moderation':
          const isModerator = this.moderators.get(channelId)?.has(userId);
          if (isModerator && event.action) {
            switch (event.action.type) {
              case 'ban':
                if (event.action.targetUserId) {
                  await this.banUser(channelId, event.action.targetUserId, event.action.duration);
                }
                break;

              case 'timeout':
                if (event.action.targetUserId) {
                  await this.banUser(channelId, event.action.targetUserId, 300); // 5 minutes
                }
                break;

              case 'delete':
                if (event.action.messageId) {
                  // Future implementation: Delete message
                }
                break;
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }
}
