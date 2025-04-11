import { Request, Response } from 'express';
import { StreamChatService } from '../services/stream-chat.service';

const chatService = new StreamChatService();

interface JoinChatRequest {
  channelId: string;
  username: string;
}

interface SendMessageRequest {
  channelId: string;
  content: string;
  metadata?: {
    color?: string;
    emotes?: string[];
  };
}

interface ModerateUserRequest {
  channelId: string;
  userId: string;
  action: 'timeout' | 'ban' | 'unban';
  duration?: number;
}

interface UpdateChatSettingsRequest {
  slowMode?: boolean;
  slowModeInterval?: number;
  followerOnly?: boolean;
  subscriberOnly?: boolean;
  emoteOnly?: boolean;
}

export const joinChat = async (
  req: Request<{}, {}, JoinChatRequest>,
  res: Response
) => {
  try {
    const { channelId } = req.body;
    const userId = req.user._id;

    await chatService.joinChat(channelId, userId);
    res.json({ message: 'Joined chat successfully' });
  } catch (error) {
    console.error('Error joining chat:', error);
    res.status(500).json({ error: 'Failed to join chat' });
  }
};

export const leaveChat = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    await chatService.leaveChat(channelId, userId);
    res.json({ message: 'Left chat successfully' });
  } catch (error) {
    console.error('Error leaving chat:', error);
    res.status(500).json({ error: 'Failed to leave chat' });
  }
};

export const sendMessage = async (
  req: Request<{}, {}, SendMessageRequest>,
  res: Response
) => {
  try {
    const { channelId, content, metadata } = req.body;
    const userId = req.user._id;

    await chatService.sendMessage(channelId, userId, content, metadata);
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getChatHistory = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await chatService.getChatHistory(channelId, limit);
    res.json(messages);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

export const moderateUser = async (
  req: Request<{}, {}, ModerateUserRequest>,
  res: Response
) => {
  try {
    const { channelId, userId, action, duration } = req.body;
    const moderatorId = req.user._id;

    await chatService.moderateUser(channelId, moderatorId, userId, action, duration);
    res.json({ message: `User ${action} successful` });
  } catch (error) {
    console.error('Error moderating user:', error);
    res.status(500).json({ error: 'Failed to moderate user' });
  }
};

export const getChatSettings = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    const settings = await chatService.getChatSettings(channelId);
    res.json(settings);
  } catch (error) {
    console.error('Error getting chat settings:', error);
    res.status(500).json({ error: 'Failed to get chat settings' });
  }
};

export const updateChatSettings = async (
  req: Request<{ channelId: string }, {}, UpdateChatSettingsRequest>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    const settings = req.body;
    const userId = req.user._id;

    await chatService.updateChatSettings(channelId, userId, settings);
    res.json({ message: 'Chat settings updated successfully' });
  } catch (error) {
    console.error('Error updating chat settings:', error);
    res.status(500).json({ error: 'Failed to update chat settings' });
  }
};
