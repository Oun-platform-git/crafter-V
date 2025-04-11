import axios from 'axios';
import { IgApiClient } from 'instagram-private-api';

export class InstagramService {
  private ig: IgApiClient;
  private broadcastId: string | null = null;

  constructor() {
    this.ig = new IgApiClient();
  }

  async login(username: string, password: string) {
    this.ig.state.generateDevice(username);
    await this.ig.account.login(username, password);
  }

  async startLiveStream() {
    try {
      // Create a live broadcast
      const { broadcast_id, upload_url } = await this.ig.live.create({
        previewWidth: 1080,
        previewHeight: 1920,
        broadcastMessage: 'Starting live stream...'
      });

      this.broadcastId = broadcast_id;

      // Start the broadcast
      await this.ig.live.start(broadcast_id);

      return {
        broadcastId: broadcast_id,
        streamUrl: upload_url,
        status: 'started'
      };
    } catch (error) {
      console.error('Error starting Instagram live stream:', error);
      throw error;
    }
  }

  async stopLiveStream() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      await this.ig.live.end(this.broadcastId);
      this.broadcastId = null;
    } catch (error) {
      console.error('Error stopping Instagram live stream:', error);
      throw error;
    }
  }

  async getStreamInfo() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      const info = await this.ig.live.info(this.broadcastId);
      return {
        viewerCount: info.viewer_count,
        status: info.broadcast_status,
        startTime: info.broadcast_started_at,
        totalLikes: info.like_count,
        comments: info.comment_count
      };
    } catch (error) {
      console.error('Error getting Instagram stream info:', error);
      throw error;
    }
  }

  async getComments() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      const comments = await this.ig.live.getComment(this.broadcastId);
      return comments.comments.map(comment => ({
        id: comment.pk,
        text: comment.text,
        userId: comment.user_id,
        username: comment.user.username,
        timestamp: comment.created_at
      }));
    } catch (error) {
      console.error('Error getting Instagram comments:', error);
      throw error;
    }
  }

  async sendComment(text: string) {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      await this.ig.live.comment(this.broadcastId, text);
    } catch (error) {
      console.error('Error sending Instagram comment:', error);
      throw error;
    }
  }

  async pinComment(commentId: string) {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      await this.ig.live.pinComment(this.broadcastId, commentId);
    } catch (error) {
      console.error('Error pinning Instagram comment:', error);
      throw error;
    }
  }

  async unpinComment(commentId: string) {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      await this.ig.live.unpinComment(this.broadcastId, commentId);
    } catch (error) {
      console.error('Error unpinning Instagram comment:', error);
      throw error;
    }
  }

  async enableComments() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      await this.ig.live.enableComments(this.broadcastId);
    } catch (error) {
      console.error('Error enabling Instagram comments:', error);
      throw error;
    }
  }

  async disableComments() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      await this.ig.live.disableComments(this.broadcastId);
    } catch (error) {
      console.error('Error disabling Instagram comments:', error);
      throw error;
    }
  }

  async getViewerList() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      const viewers = await this.ig.live.getViewerList(this.broadcastId);
      return viewers.users.map(user => ({
        id: user.pk,
        username: user.username,
        fullName: user.full_name,
        profilePicture: user.profile_pic_url
      }));
    } catch (error) {
      console.error('Error getting Instagram viewer list:', error);
      throw error;
    }
  }

  async getLiveStreamQuestions() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      const questions = await this.ig.live.getQuestions(this.broadcastId);
      return questions.questions.map(question => ({
        id: question.pk,
        text: question.text,
        userId: question.user_id,
        username: question.user.username,
        timestamp: question.created_at
      }));
    } catch (error) {
      console.error('Error getting Instagram questions:', error);
      throw error;
    }
  }

  async getInsights() {
    if (!this.broadcastId) {
      throw new Error('No active broadcast found');
    }

    try {
      const insights = await this.ig.live.getPostLiveInsights(this.broadcastId);
      return {
        reachCount: insights.reach_count,
        impressionCount: insights.impression_count,
        engagementCount: insights.engagement_count,
        saveCount: insights.save_count,
        shareCount: insights.share_count,
        commentCount: insights.comment_count,
        likeCount: insights.like_count
      };
    } catch (error) {
      console.error('Error getting Instagram insights:', error);
      throw error;
    }
  }
}
