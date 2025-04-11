import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Avatar,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  Dialog
} from '@mui/material';
import {
  Edit,
  Chat,
  VideoCall,
  ScreenShare,
  People,
  Timeline,
  Save,
  Undo,
  Redo,
  Add,
  Comment,
  History
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { VideoEditor } from '../AIFeatures/VideoEditor';
import { SharedTimeline } from './SharedTimeline';
import { CollaborativeCanvas } from './CollaborativeCanvas';
import { ChatPanel } from './ChatPanel';
import { VersionHistory } from './VersionHistory';
import { CommentThread } from './CommentThread';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  cursor: { x: number; y: number };
  selection: { start: number; end: number };
  lastActivity: Date;
}

interface Change {
  type: 'edit' | 'comment' | 'timeline';
  userId: string;
  timestamp: Date;
  data: any;
}

export const RealTimeWorkspace: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  
  const canvasRef = useRef<any>(null);
  const timelineRef = useRef<any>(null);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('collaborator:join', (newCollaborator: Collaborator) => {
      setCollaborators(prev => [...prev, newCollaborator]);
    });

    socket.on('collaborator:leave', (id: string) => {
      setCollaborators(prev => prev.filter(c => c.id !== id));
    });

    socket.on('collaborator:update', (update: Partial<Collaborator>) => {
      setCollaborators(prev =>
        prev.map(c => (c.id === update.id ? { ...c, ...update } : c))
      );
    });

    socket.on('change:new', (change: Change) => {
      setChanges(prev => [...prev, change]);
      handleChange(change);
    });

    socket.on('comment:new', (comment: any) => {
      setComments(prev => [...prev, comment]);
    });

    return () => {
      socket.off('collaborator:join');
      socket.off('collaborator:leave');
      socket.off('collaborator:update');
      socket.off('change:new');
      socket.off('comment:new');
    };
  }, [socket]);

  const handleChange = (change: Change) => {
    switch (change.type) {
      case 'edit':
        if (canvasRef.current) {
          canvasRef.current.applyChange(change.data);
        }
        break;
      case 'timeline':
        if (timelineRef.current) {
          timelineRef.current.applyChange(change.data);
        }
        break;
      case 'comment':
        setComments(prev => [...prev, change.data]);
        break;
    }
  };

  const emitChange = (change: Omit<Change, 'userId' | 'timestamp'>) => {
    if (socket) {
      const fullChange = {
        ...change,
        userId: user.id,
        timestamp: new Date()
      };
      socket.emit('change:create', fullChange);
    }
  };

  const handleCursorMove = (event: React.MouseEvent) => {
    if (socket) {
      socket.emit('collaborator:cursor', {
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleSelection = (selection: { start: number; end: number }) => {
    if (socket) {
      socket.emit('collaborator:selection', selection);
    }
  };

  const speedDialActions = [
    { icon: <VideoCall />, name: 'Start Video Call' },
    { icon: <ScreenShare />, name: 'Share Screen' },
    { icon: <Add />, name: 'New Element' }
  ];

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseMove={handleCursorMove}
    >
      {/* Collaborators Bar */}
      <Paper sx={{ p: 1, mb: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="subtitle1">
              Active Collaborators ({collaborators.length})
            </Typography>
          </Grid>
          <Grid item xs>
            <Box display="flex" gap={1}>
              {collaborators.map((collaborator) => (
                <Tooltip
                  key={collaborator.id}
                  title={`${collaborator.name} - Last active: ${new Date(
                    collaborator.lastActivity
                  ).toLocaleTimeString()}`}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
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
          <Grid item>
            <IconButton onClick={() => setShowHistory(true)}>
              <History />
            </IconButton>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Workspace */}
      <Grid container spacing={2} sx={{ flex: 1 }}>
        <Grid item xs={12} md={8}>
          <CollaborativeCanvas
            ref={canvasRef}
            onEdit={(data) => emitChange({ type: 'edit', data })}
            collaborators={collaborators}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SharedTimeline
            ref={timelineRef}
            onChange={(data) => emitChange({ type: 'timeline', data })}
          />
        </Grid>
      </Grid>

      {/* Action Speed Dial */}
      <SpeedDial
        ariaLabel="Workspace Actions"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<Edit />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              // Handle action
            }}
          />
        ))}
      </SpeedDial>

      {/* Side Panels */}
      <Drawer
        anchor="right"
        open={Boolean(activePanel)}
        onClose={() => setActivePanel(null)}
      >
        <Box sx={{ width: 350 }}>
          {activePanel === 'chat' && (
            <ChatPanel
              messages={[]}
              onSend={(message) => {
                if (socket) {
                  socket.emit('chat:message', message);
                }
              }}
            />
          )}
          {activePanel === 'comments' && (
            <CommentThread
              comments={comments}
              onComment={(comment) =>
                emitChange({ type: 'comment', data: comment })
              }
            />
          )}
        </Box>
      </Drawer>

      {/* Version History Dialog */}
      <Dialog
        open={showHistory}
        onClose={() => setShowHistory(false)}
        maxWidth="md"
        fullWidth
      >
        <VersionHistory
          changes={changes}
          onRevert={(change) => {
            // Handle revert
            setShowHistory(false);
          }}
        />
      </Dialog>
    </Box>
  );
};
