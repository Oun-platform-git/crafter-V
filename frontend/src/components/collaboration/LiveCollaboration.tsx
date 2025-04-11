import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Avatar,
  Badge,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  Dialog,
  TextField,
  Chip
} from '@mui/material';
import {
  VideoCall,
  ScreenShare,
  Chat,
  Edit,
  Save,
  Undo,
  Redo,
  Add,
  Comment,
  History,
  Lock,
  LockOpen,
  Timeline,
  Brush,
  PanTool
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { VideoEditor } from '../AIFeatures/VideoEditor';
import { SharedTimeline } from './SharedTimeline';
import { CollaborativeCanvas } from './CollaborativeCanvas';
import { ChatPanel } from './ChatPanel';
import { CursorOverlay } from './CursorOverlay';

interface CollaborationAction {
  type: string;
  userId: string;
  data: any;
  timestamp: Date;
}

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  cursor: { x: number; y: number };
  tool: string | null;
  color: string;
  active: boolean;
}

export const LiveCollaboration: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [actions, setActions] = useState<CollaborationAction[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  
  const canvasRef = useRef<any>(null);
  const timelineRef = useRef<any>(null);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    socket.on('collaborator:join', handleCollaboratorJoin);
    socket.on('collaborator:leave', handleCollaboratorLeave);
    socket.on('collaborator:update', handleCollaboratorUpdate);
    socket.on('action:new', handleNewAction);
    socket.on('canvas:update', handleCanvasUpdate);
    socket.on('timeline:update', handleTimelineUpdate);

    return () => {
      socket.off('collaborator:join');
      socket.off('collaborator:leave');
      socket.off('collaborator:update');
      socket.off('action:new');
      socket.off('canvas:update');
      socket.off('timeline:update');
    };
  }, [socket]);

  const handleCollaboratorJoin = (collaborator: Collaborator) => {
    setCollaborators(prev => [...prev, collaborator]);
  };

  const handleCollaboratorLeave = (id: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== id));
  };

  const handleCollaboratorUpdate = (update: Partial<Collaborator>) => {
    setCollaborators(prev =>
      prev.map(c => (c.id === update.id ? { ...c, ...update } : c))
    );
  };

  const handleNewAction = (action: CollaborationAction) => {
    setActions(prev => [...prev, action]);
    applyAction(action);
  };

  const handleCanvasUpdate = (data: any) => {
    if (canvasRef.current) {
      canvasRef.current.update(data);
    }
  };

  const handleTimelineUpdate = (data: any) => {
    if (timelineRef.current) {
      timelineRef.current.update(data);
    }
  };

  const emitAction = (action: Omit<CollaborationAction, 'userId' | 'timestamp'>) => {
    if (socket && !locked) {
      const fullAction = {
        ...action,
        userId: user.id,
        timestamp: new Date()
      };
      socket.emit('action:create', fullAction);
    }
  };

  const applyAction = (action: CollaborationAction) => {
    switch (action.type) {
      case 'canvas':
        if (canvasRef.current) {
          canvasRef.current.applyAction(action.data);
        }
        break;
      case 'timeline':
        if (timelineRef.current) {
          timelineRef.current.applyAction(action.data);
        }
        break;
    }
  };

  const handleCursorMove = (event: React.MouseEvent) => {
    if (socket) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      
      socket.emit('collaborator:cursor', { x, y });
    }
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    if (socket) {
      socket.emit('collaborator:tool', { tool });
    }
  };

  const tools = [
    { icon: <Brush />, name: 'brush', label: 'Brush' },
    { icon: <Edit />, name: 'edit', label: 'Edit' },
    { icon: <Timeline />, name: 'timeline', label: 'Timeline' },
    { icon: <PanTool />, name: 'move', label: 'Move' }
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
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1">
                Active Collaborators
              </Typography>
              <IconButton
                color={locked ? 'error' : 'primary'}
                onClick={() => setLocked(!locked)}
              >
                {locked ? <Lock /> : <LockOpen />}
              </IconButton>
            </Stack>
          </Grid>
          <Grid item xs>
            <Stack direction="row" spacing={1}>
              {collaborators.map((collaborator) => (
                <Tooltip
                  key={collaborator.id}
                  title={`${collaborator.name} - Using: ${collaborator.tool || 'None'}`}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={collaborator.active ? 'success' : 'default'}
                  >
                    <Avatar
                      alt={collaborator.name}
                      src={collaborator.avatar}
                      sx={{
                        width: 40,
                        height: 40,
                        border: `2px solid ${collaborator.color}`
                      }}
                    />
                  </Badge>
                </Tooltip>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Workspace */}
      <Grid container spacing={2} sx={{ flex: 1 }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ position: 'relative', height: '100%' }}>
            <CollaborativeCanvas
              ref={canvasRef}
              onAction={(data) => emitAction({ type: 'canvas', data })}
              tool={selectedTool}
              locked={locked}
            />
            <CursorOverlay
              collaborators={collaborators}
              canvasRef={canvasRef}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Tools */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tools
              </Typography>
              <Stack direction="row" spacing={1}>
                {tools.map((tool) => (
                  <Button
                    key={tool.name}
                    variant={selectedTool === tool.name ? 'contained' : 'outlined'}
                    startIcon={tool.icon}
                    onClick={() => handleToolSelect(tool.name)}
                    disabled={locked}
                  >
                    {tool.label}
                  </Button>
                ))}
              </Stack>
            </Paper>

            {/* Timeline */}
            <Paper sx={{ p: 2, flex: 1 }}>
              <SharedTimeline
                ref={timelineRef}
                onUpdate={(data) => emitAction({ type: 'timeline', data })}
                locked={locked}
              />
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Action Speed Dial */}
      <SpeedDial
        ariaLabel="Collaboration Actions"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<Add />}
      >
        <SpeedDialAction
          icon={<VideoCall />}
          tooltipTitle="Start Video Call"
          onClick={() => {
            // Handle video call
          }}
        />
        <SpeedDialAction
          icon={<ScreenShare />}
          tooltipTitle="Share Screen"
          onClick={() => {
            // Handle screen share
          }}
        />
        <SpeedDialAction
          icon={<Chat />}
          tooltipTitle="Open Chat"
          onClick={() => {
            // Handle chat
          }}
        />
      </SpeedDial>

      {/* History Panel */}
      <Dialog
        open={Boolean(actions.length)}
        onClose={() => setActions([])}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Collaboration History
          </Typography>
          <Stack spacing={1}>
            {actions.map((action, index) => (
              <Paper key={index} sx={{ p: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    src={collaborators.find(c => c.id === action.userId)?.avatar}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography variant="body2">
                    {action.type} at {new Date(action.timestamp).toLocaleTimeString()}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
};
