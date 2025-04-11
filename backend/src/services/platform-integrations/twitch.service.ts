import { ApiClient } from '@twurple/api';
import { StaticAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { EventSubWsClient } from '@twurple/eventsub-ws';

export class TwitchService {
  private apiClient: ApiClient;
  private chatClient: ChatClient;
  private eventSubClient: EventSubWsClient;

  constructor() {
    const authProvider = new StaticAuthProvider(
      process.env.TWITCH_CLIENT_ID!,
      process.env.TWITCH_ACCESS_TOKEN!
    );

    this.apiClient = new ApiClient({ authProvider });
    this.chatClient = new ChatClient({ authProvider });
    this.eventSubClient = new EventSubWsClient();
  }

  async connect() {
    await this.chatClient.connect();
  }

  async createStream(title: string, game: string) {
    const user = await this.apiClient.users.getMe();
    await this.apiClient.channels.updateChannelInfo(user.id, {
      title,
      gameId: await this.findGameId(game)
    });

    return {
      streamKey: await this.apiClient.streams.getStreamKey(user.id),
      channelId: user.id
    };
  }

  async startStream() {
    // Twitch doesn't require explicit stream start
    // Stream starts automatically when RTMP input is received
  }

  async stopStream() {
    // Twitch doesn't require explicit stream stop
    // Stream stops automatically when RTMP input is stopped
  }

  async getStreamMetrics(channelId: string) {
    const stream = await this.apiClient.streams.getStreamByUserId(channelId);
    if (!stream) {
      return null;
    }

    return {
      viewers: stream.viewers,
      startedAt: stream.startDate,
      game: stream.gameName,
      title: stream.title
    };
  }

  async getChatMessages(channelName: string) {
    return new Promise((resolve) => {
      const messages: any[] = [];
      
      this.chatClient.onMessage((channel, user, message) => {
        if (channel === channelName) {
          messages.push({
            user,
            message,
            timestamp: new Date()
          });
        }
      });

      // Collect messages for 5 seconds
      setTimeout(() => resolve(messages), 5000);
    });
  }

  async sendChatMessage(channelName: string, message: string) {
    await this.chatClient.say(channelName, message);
  }

  async getBans(channelId: string) {
    return await this.apiClient.moderation.getBannedUsers(channelId);
  }

  async banUser(channelId: string, userId: string, reason?: string) {
    await this.apiClient.moderation.banUser(channelId, {
      user: userId,
      reason
    });
  }

  async unbanUser(channelId: string, userId: string) {
    await this.apiClient.moderation.unbanUser(channelId, userId);
  }

  async createClip(channelId: string) {
    const clip = await this.apiClient.clips.createClip({
      channel: channelId
    });
    return clip;
  }

  async getClips(channelId: string, startDate?: Date, endDate?: Date) {
    return await this.apiClient.clips.getClipsForBroadcaster(channelId, {
      startDate,
      endDate
    });
  }

  async subscribeToEvents(channelId: string, callbacks: {
    onFollow?: (username: string) => void;
    onSubscribe?: (username: string, tier: string) => void;
    onCheer?: (username: string, bits: number) => void;
    onRaid?: (username: string, viewers: number) => void;
  }) {
    this.eventSubClient.onChannelFollow(channelId, () => {
      callbacks.onFollow?.('username');
    });

    this.eventSubClient.onChannelSubscription(channelId, (sub) => {
      callbacks.onSubscribe?.(sub.userName, sub.tier);
    });

    this.eventSubClient.onChannelCheer(channelId, (cheer) => {
      callbacks.onCheer?.(cheer.userName, cheer.bits);
    });

    this.eventSubClient.onChannelRaidTo(channelId, (raid) => {
      callbacks.onRaid?.(raid.raidingBroadcasterName, raid.viewers);
    });
  }

  private async findGameId(gameName: string): Promise<string> {
    const games = await this.apiClient.games.getGameByName(gameName);
    return games?.id || '';
  }
}
