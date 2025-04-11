import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  Button,
  Stack
} from '@mui/material';
import {
  TrendingUp,
  MusicNote,
  PlayArrow,
  GetApp,
  Share,
  Star,
  Favorite
} from '@mui/icons-material';
import { useAIService } from '../../../hooks/useAIService';
import { SoundImporter } from './SoundImporter';
import { TemplateEditor } from './TemplateEditor';

interface Template {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  duration: number;
  popularity: number;
  soundUrl: string;
  tags: string[];
  usageCount: number;
  aiPrompt: string;
}

export const TrendingTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendingAudio, setTrendingAudio] = useState<any[]>([]);
  
  const { generateVideo, analyzeContent } = useAIService();

  useEffect(() => {
    fetchTrendingTemplates();
    fetchTrendingAudio();
  }, []);

  const fetchTrendingTemplates = async () => {
    try {
      const response = await fetch('/api/templates/trending');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingAudio = async () => {
    try {
      const response = await fetch('/api/audio/trending');
      const data = await response.json();
      setTrendingAudio(data);
    } catch (error) {
      console.error('Error fetching audio:', error);
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    // Analyze template for AI suggestions
    const analysis = await analyzeContent(template.thumbnail);
    // Update template with AI suggestions
  };

  const handleGenerateFromTemplate = async (template: Template) => {
    try {
      const generationId = await generateVideo({
        prompt: template.aiPrompt,
        style: template.category,
        duration: template.duration
      });

      // Monitor generation progress
      const interval = setInterval(async () => {
        const status = await fetch(`/api/ai/status/${generationId}`);
        const data = await status.json();
        
        if (data.status === 'completed') {
          clearInterval(interval);
          // Handle completed video
        }
      }, 1000);
    } catch (error) {
      console.error('Error generating video:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Trending Templates
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {/* Trending Categories */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
              {['Dance', 'Comedy', 'Tutorial', 'Transition', 'Story'].map((category) => (
                <Chip
                  key={category}
                  label={category}
                  icon={<TrendingUp />}
                  clickable
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Grid>

          {/* Template Grid */}
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    position: 'relative'
                  }}
                  image={template.thumbnail}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{ color: 'white' }}
                    >
                      <PlayArrow />
                    </IconButton>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      {template.duration}s
                    </Typography>
                  </Box>
                </CardMedia>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.title}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                      size="small"
                      icon={<MusicNote />}
                      label="Original Sound"
                    />
                    <Chip
                      size="small"
                      icon={<Star />}
                      label={`${template.usageCount} uses`}
                    />
                  </Stack>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {template.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Template Editor Dialog */}
      <Dialog
        open={Boolean(selectedTemplate)}
        onClose={() => setSelectedTemplate(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <Box sx={{ p: 3 }}>
            <TemplateEditor
              template={selectedTemplate}
              onGenerate={() => handleGenerateFromTemplate(selectedTemplate)}
              onClose={() => setSelectedTemplate(null)}
            />
          </Box>
        )}
      </Dialog>

      {/* Trending Sounds Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Trending Sounds
        </Typography>
        <Grid container spacing={2}>
          {trendingAudio.map((audio) => (
            <Grid item xs={12} sm={6} md={4} key={audio.id}>
              <SoundImporter
                audio={audio}
                onImport={() => {
                  // Handle audio import
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
