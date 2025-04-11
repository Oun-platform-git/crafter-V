import React, { useEffect, useState, useRef } from 'react';
import { Box, Drawer, Tab, Tabs, IconButton, Badge, Avatar } from '@mui/material';
import { Chat, People, Comment, VideoCall } from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import { ChatPanel } from './ChatPanel';
import { CollaboratorsList } from './CollaboratorsList';
import { CommentThread } from './CommentThread';
import { VideoCall as VideoCallPanel } from './VideoCall';
import { useAuth } from '../../hooks/useAuth';

interface CollaborationPanelProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  online: boolean;
  lastActivity: Date;
}

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectId,
  open,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadComments, setUnreadComments] = useState(0);
  
  const { user } = useAuth();
  const socket = useSocket();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit('join:project', { projectId });

    socket.on('collaborator:joined', (collaborator: Collaborator) => {
      setCollaborators(prev => [...prev, collaborator]);
    });

    socket.on('collaborator:left', (collaboratorId: string) => {
      setCollaborators(prev => 
        prev.filter(c => c.id !== collaboratorId)
      );
    });

    socket.on('chat:message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      if (activeTab !== 0) {
        setUnreadMessages(prev => prev + 1);
      }
    });

    socket.on('comment:added', (comment: Comment) => {
      setComments(prev => [...prev, comment]);
      if (activeTab !== 2) {
        setUnreadComments(prev => prev + 1);
      }
    });

    return () => {
      socket.emit('leave:project', { projectId });
      socket.off('collaborator:joined');
      socket.off('collaborator:left');
      socket.off('chat:message');
      socket.off('comment:added');
    };
  }, [socket, projectId, activeTab]);

  useEffect(() => {
    if (activeTab === 0) setUnreadMessages(0);
    if (activeTab === 2) setUnreadComments(0);
  }, [activeTab]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSendMessage = (content: string) => {
    if (!socket || !content.trim()) return;

    const message = {
      userId: user.id,
      content,
      timestamp: new Date()
    };

    socket.emit('chat:message', message);
  };

  const handleAddComment = (content: string) => {
    if (!socket || !content.trim()) return;

    const comment = {
      userId: user.id,
      content,
      timestamp: new Date(),
      replies: []
    };

    socket.emit('comment:add', comment);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{ width: 320 }}
    >
      <Box sx={{ width: 320 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={
              <Badge badgeContent={unreadMessages} color="error">
                <Chat />
              </Badge>
            }
            aria-label="chat"
          />
          <Tab
            icon={
              <Badge badgeContent={collaborators.length} color="primary">
                <People />
              </Badge>
            }
            aria-label="collaborators"
          />
          <Tab
            icon={
              <Badge badgeContent={unreadComments} color="error">
                <Comment />
              </Badge>
            }
            aria-label="comments"
          />
          <Tab
            icon={<VideoCall />}
            aria-label="video call"
          />
        </Tabs>

        <Box sx={{ p: 2, height: 'calc(100vh - 48px)', overflow: 'auto' }}>
          {activeTab === 0 && (
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              chatEndRef={chatEndRef}
            />
          )}
          
          {activeTab === 1 && (
            <CollaboratorsList
              collaborators={collaborators}
              currentUserId={user.id}
            />
          )}
          
          {activeTab === 2 && (
            <CommentThread
              comments={comments}
              onAddComment={handleAddComment}
              currentUserId={user.id}
            />
          )}
          
          {activeTab === 3 && (
            <VideoCallPanel
              projectId={projectId}
              participants={collaborators}
              currentUser={user}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};
