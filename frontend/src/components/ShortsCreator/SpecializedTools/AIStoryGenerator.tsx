import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  Dialog
} from '@mui/material';
import {
  AutoStories,
  Movie,
  Brush,
  MusicNote,
  Send,
  Lightbulb,
  Psychology,
  Style
} from '@mui/icons-material';
import { useAIService } from '../../../hooks/useAIService';
import { StoryPreview } from './StoryPreview';
import { StyleSelector } from './StyleSelector';
import { MusicSelector } from './MusicSelector';

interface StorySegment {
  text: string;
  duration: number;
  style: string;
  visualPrompt: string;
  musicMood: string;
}

interface GeneratedScene {
  videoUrl: string;
  audioUrl: string;
  transitions: string[];
}

export const AIStoryGenerator: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [storyIdea, setStoryIdea] = useState('');
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('');
  
  const { generateVideo, generateAudio, analyzeContent } = useAIService();

  const steps = [
    'Story Concept',
    'Scene Planning',
    'Style Selection',
    'Generation',
    'Preview & Edit'
  ];

  const handleStoryIdeaSubmit = async () => {
    try {
      // Use AI to break down story into segments
      const response = await fetch('/api/ai/story/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: storyIdea })
      });

      const suggestedSegments = await response.json();
      setSegments(suggestedSegments);
      setActiveStep(1);
    } catch (error) {
      console.error('Error generating story segments:', error);
    }
  };

  const generateScene = useCallback(async (segment: StorySegment) => {
    try {
      // Generate video for segment
      const videoId = await generateVideo({
        prompt: segment.visualPrompt,
        style: segment.style,
        duration: segment.duration
      });

      // Generate matching audio
      const audioUrl = await generateAudio(segment.text, 'natural', 'en-US');

      // Get AI suggestions for transitions
      const transitions = await analyzeContent(videoId);

      return {
        videoUrl: `/api/videos/${videoId}`,
        audioUrl,
        transitions: transitions.suggestions
      };
    } catch (error) {
      console.error('Error generating scene:', error);
      return null;
    }
  }, [generateVideo, generateAudio, analyzeContent]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const scenes = await Promise.all(
        segments.map(segment => generateScene(segment))
      );
      setGeneratedScenes(scenes.filter(Boolean) as GeneratedScene[]);
      setActiveStep(4);
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI Story Generator
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            What's your story idea?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={storyIdea}
            onChange={(e) => setStoryIdea(e.target.value)}
            placeholder="Describe your story idea... The AI will help break it down into engaging segments"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            endIcon={<Send />}
            onClick={handleStoryIdeaSubmit}
            disabled={!storyIdea.trim()}
          >
            Generate Story Segments
          </Button>
        </Paper>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          {segments.map((segment, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Scene {index + 1}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    value={segment.text}
                    onChange={(e) => {
                      const newSegments = [...segments];
                      newSegments[index].text = e.target.value;
                      setSegments(newSegments);
                    }}
                    sx={{ mb: 2 }}
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Duration (seconds)"
                      type="number"
                      value={segment.duration}
                      onChange={(e) => {
                        const newSegments = [...segments];
                        newSegments[index].duration = Number(e.target.value);
                        setSegments(newSegments);
                      }}
                    />
                    <TextField
                      label="Visual Prompt"
                      value={segment.visualPrompt}
                      onChange={(e) => {
                        const newSegments = [...segments];
                        newSegments[index].visualPrompt = e.target.value;
                        setSegments(newSegments);
                      }}
                      fullWidth
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={() => setActiveStep(2)}
              disabled={segments.length === 0}
            >
              Continue to Style Selection
            </Button>
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Box>
          <StyleSelector
            value={selectedStyle}
            onChange={setSelectedStyle}
            onComplete={() => setActiveStep(3)}
          />
        </Box>
      )}

      {activeStep === 3 && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Generating Your Story
          </Typography>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating}
            startIcon={<Movie />}
          >
            {generating ? 'Generating...' : 'Generate Story'}
          </Button>
        </Box>
      )}

      {activeStep === 4 && generatedScenes.length > 0 && (
        <StoryPreview
          scenes={generatedScenes}
          onSave={() => {
            // Handle save
          }}
          onEdit={(index) => {
            // Handle edit
          }}
        />
      )}
    </Box>
  );
};
