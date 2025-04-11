import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class YouTubeService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );
  }

  async authorize(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  async createBroadcast(title: string, description: string) {
    const youtube = google.youtube('v3');
    
    // Create broadcast
    const broadcast = await youtube.liveBroadcasts.insert({
      auth: this.oauth2Client,
      part: ['snippet', 'contentDetails', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          scheduledStartTime: new Date().toISOString()
        },
        contentDetails: {
          enableDvr: true,
          enableContentEncryption: true,
          enableEmbed: true,
          recordFromStart: true,
          startWithSlate: false
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      }
    });

    // Create stream
    const stream = await youtube.liveStreams.insert({
      auth: this.oauth2Client,
      part: ['snippet', 'cdn', 'contentDetails'],
      requestBody: {
        snippet: {
          title,
          description
        },
        cdn: {
          frameRate: '60fps',
          ingestionType: 'rtmp',
          resolution: '1080p'
        },
        contentDetails: {
          isReusable: true
        }
      }
    });

    // Bind broadcast and stream
    await youtube.liveBroadcasts.bind({
      auth: this.oauth2Client,
      id: broadcast.data.id!,
      part: ['id', 'contentDetails'],
      streamId: stream.data.id!
    });

    return {
      broadcastId: broadcast.data.id,
      streamId: stream.data.id,
      streamKey: stream.data.cdn?.ingestionInfo?.streamName,
      streamUrl: stream.data.cdn?.ingestionInfo?.ingestionAddress
    };
  }

  async startBroadcast(broadcastId: string) {
    const youtube = google.youtube('v3');
    await youtube.liveBroadcasts.transition({
      auth: this.oauth2Client,
      broadcastStatus: 'live',
      id: broadcastId,
      part: ['id', 'status']
    });
  }

  async stopBroadcast(broadcastId: string) {
    const youtube = google.youtube('v3');
    await youtube.liveBroadcasts.transition({
      auth: this.oauth2Client,
      broadcastStatus: 'complete',
      id: broadcastId,
      part: ['id', 'status']
    });
  }

  async getBroadcastMetrics(broadcastId: string) {
    const youtube = google.youtube('v3');
    const metrics = await youtube.videos.list({
      auth: this.oauth2Client,
      id: [broadcastId],
      part: ['liveStreamingDetails', 'statistics']
    });

    return {
      viewers: metrics.data.items?.[0].statistics?.viewCount,
      likes: metrics.data.items?.[0].statistics?.likeCount,
      chatEnabled: metrics.data.items?.[0].liveStreamingDetails?.activeLiveChatId ? true : false
    };
  }

  async getChatMessages(liveChatId: string) {
    const youtube = google.youtube('v3');
    const messages = await youtube.liveChatMessages.list({
      auth: this.oauth2Client,
      liveChatId,
      part: ['snippet', 'authorDetails']
    });

    return messages.data.items?.map(item => ({
      id: item.id,
      message: item.snippet?.displayMessage,
      author: item.authorDetails?.displayName,
      timestamp: item.snippet?.publishedAt
    }));
  }
}
