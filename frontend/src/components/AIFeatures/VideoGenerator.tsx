import React, { useState, useCallback } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid } from '@mui/material';
import { useAIService } from '../../hooks/useAIService';
import { PromptBuilder } from './PromptBuilder';
import { StyleSelector } from './StyleSelector';
import { GenerationProgress } from './GenerationProgress';
import { VideoPreview } from '../shared/VideoPreview';

interface VideoGeneratorProps {
  onVideoGenerated: (url: string) => void;
}

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onVideoGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const { generateVideo, enhanceVideo } = useAIService();

  const handleGenerate = useCallback(async () => {
    try {
      setGenerating(true);
      const generationId = await generateVideo({ prompt, style });
      
      // Poll for progress
      const interval = setInterval(async () => {
        const status = await fetch(`/api/ai/status/${generationId}`);
        const data = await status.json();
        
        setProgress(data.progress);
        
        if (data.status === 'completed') {
          clearInterval(interval);
          setPreviewUrl(data.url);
          onVideoGenerated(data.url);
          setGenerating(false);
        }
      }, 1000);
    } catch (error) {
      console.error('Video generation failed:', error);
      setGenerating(false);
    }
  }, [prompt, style, onVideoGenerated]);

  const handleEnhance = useCallback(async () => {
    if (!previewUrl) return;
    
    try {
      setGenerating(true);
      const enhancedUrl = await enhanceVideo(previewUrl);
      setPreviewUrl(enhancedUrl);
      onVideoGenerated(enhancedUrl);
    } catch (error) {
      console.error('Video enhancement failed:', error);
    } finally {
      setGenerating(false);
    }
  }, [previewUrl, onVideoGenerated]);

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h5" gutterBottom>
        AI Video Generator
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PromptBuilder
            value={prompt}
            onChange={setPrompt}
            suggestions={[
              'Create a dynamic product showcase',
              'Generate an animated explainer video',
              'Create a social media story'
            ]}
          />
        </Grid>
        
        <Grid item xs={12}>
          <StyleSelector
            value={style}
            onChange={setStyle}
            styles={[
              { id: 'modern', name: 'Modern & Clean' },
              { id: 'vintage', name: 'Vintage Look' },
              { id: 'cinematic', name: 'Cinematic' },
              { id: 'cartoon', name: 'Cartoon Style' }
            ]}
          />
        </Grid>

        {generating && (
          <Grid item xs={12}>
            <GenerationProgress progress={progress} />
          </Grid>
        )}

        {previewUrl && (
          <Grid item xs={12}>
            <Box mb={2}>
              <VideoPreview url={previewUrl} />
            </Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleEnhance}
              disabled={generating}
            >
              Enhance Video
            </Button>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            disabled={!prompt || !style || generating}
            fullWidth
          >
            Generate Video
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};
