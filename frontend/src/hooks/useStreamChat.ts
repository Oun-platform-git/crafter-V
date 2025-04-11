import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  metadata?: {
    color?: string;
    badges?: string[];
    isHighlighted?: boolean;
  };
}

export const useStreamChat = (channelId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user } = useAuth();

  // Simulated message generation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newMessage: ChatMessage = {
          id: 'msg_' + Math.random().toString(36).substr(2, 9),
          userId: 'user_' + Math.random().toString(36).substr(2, 9),
          username: 'Viewer_' + Math.floor(Math.random() * 1000),
          content: 'This is a simulated chat message ' + Math.floor(Math.random() * 100),
          timestamp: Date.now(),
          metadata: {
            color: Math.random() > 0.5 ? '#ff0000' : undefined,
            badges: Math.random() > 0.8 ? ['VIP'] : undefined
          }
        };
        setMessages(prev => [...prev, newMessage]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [channelId]);

  const sendMessage = useCallback((content: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      username: user.username,
      content,
      timestamp: Date.now(),
      metadata: {
        badges: user.roles?.map(role => role.toString())
      }
    };

    setMessages(prev => [...prev, newMessage]);
  }, [user]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const banUser = useCallback((userId: string) => {
    setMessages(prev => prev.filter(msg => msg.userId !== userId));
  }, []);

  const timeoutUser = useCallback((userId: string) => {
    // In a real implementation, this would prevent the user from chatting for 5 minutes
    console.log('User timed out:', userId);
  }, []);

  const enableSlowMode = useCallback((seconds: number) => {
    console.log('Slow mode enabled:', seconds);
  }, []);

  const disableSlowMode = useCallback(() => {
    console.log('Slow mode disabled');
  }, []);

  return {
    messages,
    sendMessage,
    deleteMessage,
    banUser,
    timeoutUser,
    enableSlowMode,
    disableSlowMode
  };
};
