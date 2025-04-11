import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  Dialog
} from '@mui/material';
import {
  VideoCall,
  ScreenShare,
  Chat,
  Edit,
  Timeline,
  Notifications,
  Poll,
  Assignment,
  Draw
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import { LiveCanvas } from './LiveCanvas';
import { TaskBoard } from './TaskBoard';
import { TimelineView } from './TimelineView';
import { SharedNotes } from './SharedNotes';
import { PollCreator } from './PollCreator';
import { useAuth } from '../../hooks/useAuth';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'away' | 'busy';
  activity?: string;
}

export const AdvancedCollaboration: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const canvasRef = useRef<any>(null);
  
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('collaborator:update', (updatedCollaborators: Collaborator[]) => {
      setCollaborators(updatedCollaborators);
    });

    socket.on('notification', (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      socket.off('collaborator:update');
      socket.off('notification');
    };
  }, [socket]);

  const features = [
    { icon: <VideoCall />, name: 'Video Call', id: 'video' },
    { icon: <ScreenShare />, name: 'Screen Share', id: 'screen' },
    { icon: <Chat />, name: 'Chat', id: 'chat' },
    { icon: <Draw />, name: 'Whiteboard', id: 'canvas' },
    { icon: <Assignment />, name: 'Tasks', id: 'tasks' },
    { icon: <Timeline />, name: 'Timeline', id: 'timeline' },
    { icon: <Edit />, name: 'Notes', id: 'notes' },
    { icon: <Poll />, name: 'Polls', id: 'polls' }
  ];

  const handleFeatureClick = (featureId: string) => {
    setActiveFeature(featureId);
  };

  const handleCanvasUpdate = (data: any) => {
    if (socket) {
      socket.emit('canvas:update', data);
    }
  };

  const handleTaskUpdate = (task: any) => {
    if (socket) {
      socket.emit('task:update', task);
    }
  };

  const handleNoteUpdate = (note: any) => {
    if (socket) {
      socket.emit('note:update', note);
    }
  };

  const handlePollCreate = (poll: any) => {
    if (socket) {
      socket.emit('poll:create', poll);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Collaborators Bar */}
      <Paper sx={{ p: 1, mb: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="subtitle1">Active Collaborators</Typography>
          </Grid>
          <Grid item xs>
            <Box display="flex" gap={1}>
              {collaborators.map((collaborator) => (
                <Tooltip
                  key={collaborator.id}
                  title={`${collaborator.name} (${collaborator.status})`}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={
                      collaborator.status === 'online'
                        ? 'success'
                        : collaborator.status === 'away'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    <Avatar
                      alt={collaborator.name}
                      src={collaborator.avatar}
                      sx={{ width: 40, height: 40 }}
                    />
                  </Badge>
                </Tooltip>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {activeFeature === 'canvas' && (
          <LiveCanvas
            ref={canvasRef}
            onUpdate={handleCanvasUpdate}
            collaborators={collaborators}
          />
        )}

        {activeFeature === 'tasks' && (
          <TaskBoard
            onTaskUpdate={handleTaskUpdate}
            collaborators={collaborators}
          />
        )}

        {activeFeature === 'timeline' && (
          <TimelineView collaborators={collaborators} />
        )}

        {activeFeature === 'notes' && (
          <SharedNotes
            onNoteUpdate={handleNoteUpdate}
            collaborators={collaborators}
          />
        )}

        {activeFeature === 'polls' && (
          <PollCreator
            onPollCreate={handlePollCreate}
            collaborators={collaborators}
          />
        )}

        {/* Feature Speed Dial */}
        <SpeedDial
          ariaLabel="Collaboration Features"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          icon={<Notifications />}
          open={Boolean(activeFeature)}
          onOpen={() => setActiveFeature('')}
          onClose={() => setActiveFeature(null)}
        >
          {features.map((feature) => (
            <SpeedDialAction
              key={feature.id}
              icon={feature.icon}
              tooltipTitle={feature.name}
              onClick={() => handleFeatureClick(feature.id)}
            />
          ))}
        </SpeedDial>
      </Box>

      {/* Feature Dialogs */}
      <Dialog
        open={activeFeature === 'video'}
        onClose={() => setActiveFeature(null)}
        maxWidth="md"
        fullWidth
      >
        {/* Video Call Component */}
      </Dialog>

      <Dialog
        open={activeFeature === 'screen'}
        onClose={() => setActiveFeature(null)}
        maxWidth="md"
        fullWidth
      >
        {/* Screen Share Component */}
      </Dialog>

      <Dialog
        open={activeFeature === 'chat'}
        onClose={() => setActiveFeature(null)}
        maxWidth="sm"
        fullWidth
      >
        {/* Chat Component */}
      </Dialog>
    </Box>
  );
};
