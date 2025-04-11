import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Chip,
  Stack
} from '@mui/material';
import {
  Videocam,
  Pets,
  SportsEsports,
  School,
  MusicNote,
  Transform,
  TrendingUp,
  LiveTv,
  Timer,
  Lightbulb
} from '@mui/icons-material';
import { useAIService } from '../../hooks/useAIService';
import { QuickRecorder } from './QuickRecorder';
import { EffectBank } from './EffectBank';
import { TemplateSelector } from './TemplateSelector';
import { PlatformOptimizer } from './PlatformOptimizer';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  category: string;
}

export const ContentToolbox: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const { analyzeContent, generateAudio } = useAIService();

  const tools: Tool[] = [
    {
      id: 'miniVlogs',
      name: 'Mini Vlogs',
      icon: <Videocam />,
      description: 'Quick clip recorder with mood-based editing',
      features: ['Quick Recording', 'Mood Detection', 'Auto Enhancement'],
      category: 'recording'
    },
    {
      id: 'petClips',
      name: 'Pet & Animal',
      icon: <Pets />,
      description: 'Pet-focused video creation with special effects',
      features: ['Pet Detection', 'Auto Focus', 'Cute Effects'],
      category: 'specialized'
    },
    {
      id: 'gaming',
      name: 'Gaming Highlights',
      icon: <SportsEsports />,
      description: 'Screen recording with highlight detection',
      features: ['Screen Capture', 'Auto Highlights', 'Game Overlay'],
      category: 'gaming'
    },
    {
      id: 'educational',
      name: 'Educational',
      icon: <School />,
      description: 'Create engaging educational content',
      features: ['Fact Templates', 'Quiz Generator', 'Learning Tools'],
      category: 'education'
    },
    {
      id: 'musicDance',
      name: 'Music & Dance',
      icon: <MusicNote />,
      description: 'Create rhythm-synced dance videos',
      features: ['Beat Detection', 'Dance Effects', 'Music Overlay'],
      category: 'entertainment'
    },
    {
      id: 'transformation',
      name: 'Transformations',
      icon: <Transform />,
      description: 'Before/after videos with time-lapse',
      features: ['Time-lapse', 'Transition Effects', 'Split View'],
      category: 'specialized'
    },
    {
      id: 'trends',
      name: 'Trends & Challenges',
      icon: <TrendingUp />,
      description: 'Stay current with trending templates',
      features: ['Trend Templates', 'Sound Import', 'Auto Sync'],
      category: 'social'
    },
    {
      id: 'reactions',
      name: 'Reactions',
      icon: <LiveTv />,
      description: 'Create reaction videos with PiP',
      features: ['PiP Recording', 'Dual Audio', 'Expression Detection'],
      category: 'entertainment'
    }
  ];

  const renderToolCard = (tool: Tool) => (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}
      onClick={() => setSelectedTool(tool.id)}
    >
      <CardMedia
        sx={{
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main'
        }}
      >
        <IconButton
          sx={{
            color: 'white',
            transform: 'scale(1.5)'
          }}
        >
          {tool.icon}
        </IconButton>
      </CardMedia>
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {tool.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {tool.description}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {tool.features.map((feature) => (
            <Chip
              key={feature}
              label={feature}
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Content Creation Tools
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Choose a tool to start creating your short-form video content.
          All tools are optimized for vertical video and include AI-powered features.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={tool.id}>
            {renderToolCard(tool)}
          </Grid>
        ))}
      </Grid>

      {/* Tool-specific components */}
      {selectedTool === 'miniVlogs' && (
        <QuickRecorder
          onClose={() => setSelectedTool(null)}
          onAnalyze={analyzeContent}
        />
      )}

      {selectedTool === 'petClips' && (
        <EffectBank
          category="pet"
          onClose={() => setSelectedTool(null)}
        />
      )}

      {selectedTool === 'gaming' && (
        <Box>
          {/* Gaming-specific components */}
        </Box>
      )}

      {/* Platform optimization footer */}
      <Paper sx={{ mt: 4, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Timer />
          </Grid>
          <Grid item xs>
            <Typography variant="body2">
              All videos are automatically optimized for 60-second duration
              and platform-specific requirements.
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title="AI-powered optimization">
              <IconButton>
                <Lightbulb />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
