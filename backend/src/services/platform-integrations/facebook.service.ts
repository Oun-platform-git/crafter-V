import axios from 'axios';

export class FacebookService {
  private accessToken: string;
  private apiVersion: string = 'v17.0';
  private baseUrl: string = 'https://graph.facebook.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createLiveStream(title: string, description: string) {
    const response = await axios.post(
      `${this.baseUrl}/${this.apiVersion}/me/live_videos`,
      {
        title,
        description,
        status: 'LIVE_NOW'
      },
      {
        params: {
          access_token: this.accessToken
        }
      }
    );

    return {
      streamId: response.data.id,
      streamUrl: response.data.stream_url,
      secureStreamUrl: response.data.secure_stream_url,
      streamKey: response.data.stream_key
    };
  }

  async updateLiveStream(streamId: string, title: string, description: string) {
    await axios.post(
      `${this.baseUrl}/${this.apiVersion}/${streamId}`,
      {
        title,
        description
      },
      {
        params: {
          access_token: this.accessToken
        }
      }
    );
  }

  async endLiveStream(streamId: string) {
    await axios.post(
      `${this.baseUrl}/${this.apiVersion}/${streamId}`,
      {
        end_live_video: true
      },
      {
        params: {
          access_token: this.accessToken
        }
      }
    );
  }

  async getLiveStreamMetrics(streamId: string) {
    const response = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${streamId}`,
      {
        params: {
          fields: 'status,live_views,total_views,reactions.summary(true)',
          access_token: this.accessToken
        }
      }
    );

    return {
      status: response.data.status,
      liveViews: response.data.live_views,
      totalViews: response.data.total_views,
      reactions: response.data.reactions
    };
  }

  async getComments(streamId: string) {
    const response = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${streamId}/comments`,
      {
        params: {
          access_token: this.accessToken
        }
      }
    );

    return response.data.data.map((comment: any) => ({
      id: comment.id,
      message: comment.message,
      from: {
        id: comment.from.id,
        name: comment.from.name
      },
      createdTime: comment.created_time
    }));
  }

  async postComment(streamId: string, message: string) {
    const response = await axios.post(
      `${this.baseUrl}/${this.apiVersion}/${streamId}/comments`,
      {
        message
      },
      {
        params: {
          access_token: this.accessToken
        }
      }
    );

    return response.data;
  }

  async deleteComment(commentId: string) {
    await axios.delete(
      `${this.baseUrl}/${this.apiVersion}/${commentId}`,
      {
        params: {
          access_token: this.accessToken
        }
      }
    );
  }

  async getStreamHealth(streamId: string) {
    const response = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${streamId}/video_status`,
      {
        params: {
          access_token: this.accessToken
        }
      }
    );

    return {
      health: response.data.video_status.health,
      streamState: response.data.video_status.stream_state,
      networkHealth: response.data.video_status.network_health,
      playbackHealth: response.data.video_status.playback_health
    };
  }

  async createPoll(streamId: string, question: string, options: string[], duration: number) {
    const response = await axios.post(
      `${this.baseUrl}/${this.apiVersion}/${streamId}/polls`,
      {
        question,
        options: options.map(option => ({ text: option })),
        duration
      },
      {
        params: {
          access_token: this.accessToken
        }
      }
    );

    return response.data;
  }

  async getPollResults(pollId: string) {
    const response = await axios.get(
      `${this.baseUrl}/${this.apiVersion}/${pollId}`,
      {
        params: {
          fields: 'question,options{text,vote_count}',
          access_token: this.accessToken
        }
      }
    );

    return {
      question: response.data.question,
      options: response.data.options.map((option: any) => ({
        text: option.text,
        votes: option.vote_count
      }))
    };
  }

  async createClip(videoId: string, startTime: number, endTime: number) {
    const response = await axios.post(
      `${this.baseUrl}/${this.apiVersion}/${videoId}/video_clips`,
      {
        start_time: startTime,
        end_time: endTime
      },
      {
        params: {
          access_token: this.accessToken
        }
      }
    );

    return response.data;
  }
}
