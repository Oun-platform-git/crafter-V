import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, Badge, IconButton } from '@mui/material';
import { Share, Chat, VideoCall, PersonAdd } from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import { config } from '../../config/api';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  role: 'editor' | 'viewer';
}

interface CollaborationSystemProps {
  projectId: string;
  userId: string;
  onCollaboratorJoin: (collaborator: Collaborator) => void;
  onCollaboratorLeave: (collaboratorId: string) => void;
}

export const CollaborationSystem: React.FC<CollaborationSystemProps> = ({
  projectId,
  userId,
  onCollaboratorJoin,
  onCollaboratorLeave,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io(config.WEBSOCKET_URL, {
      query: { projectId, userId },
    });

    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
    });

    newSocket.on('collaborator:join', (collaborator: Collaborator) => {
      setCollaborators(prev => [...prev, collaborator]);
      onCollaboratorJoin(collaborator);
    });

    newSocket.on('collaborator:leave', (collaboratorId: string) => {
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      onCollaboratorLeave(collaboratorId);
    });

    newSocket.on('chat:message', (message: any) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('project:update', (update: any) => {
      // Handle project updates
      console.log('Project update:', update);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [projectId, userId, onCollaboratorJoin, onCollaboratorLeave]);

  const inviteCollaborator = async (email: string, role: 'editor' | 'viewer') => {
    try {
      const response = await fetch(`${config.API_URL}/api/projects/${projectId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite collaborator');
      }

      const { inviteLink } = await response.json();
      return inviteLink;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      throw error;
    }
  };

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('chat:message', {
        content,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const initiateVideoCall = () => {
    if (socket) {
      socket.emit('call:initiate', {
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Collaboration</Typography>
        <Box>
          <IconButton onClick={() => inviteCollaborator('', 'editor')}>
            <PersonAdd />
          </IconButton>
          <IconButton onClick={initiateVideoCall}>
            <VideoCall />
          </IconButton>
          <IconButton>
            <Share />
          </IconButton>
        </Box>
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        Active Collaborators
      </Typography>
      <List>
        {collaborators.map(collaborator => (
          <ListItem key={collaborator.id}>
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color={collaborator.status === 'online' ? 'success' : 'error'}
              >
                <Avatar src={collaborator.avatar} alt={collaborator.name} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={collaborator.name}
              secondary={collaborator.role}
            />
          </ListItem>
        ))}
      </List>

      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Chat
        </Typography>
        <Box
          sx={{
            height: 200,
            overflowY: 'auto',
            bgcolor: 'background.default',
            p: 1,
            borderRadius: 1,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                mb: 1,
                p: 1,
                bgcolor: message.userId === userId ? 'primary.light' : 'grey.100',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" display="block" color="text.secondary">
                {message.sender}
              </Typography>
              <Typography variant="body2">{message.content}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CollaborationSystem;
