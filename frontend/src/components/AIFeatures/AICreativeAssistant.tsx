import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Dialog,
  CircularProgress,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Psychology,
  AutoAwesome,
  Lightbulb,
  TrendingUp,
  Style,
  MusicNote,
  Send,
  Save,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { useAIService } from '../../hooks/useAIService';

interface Suggestion {
  type: string;
  content: string;
  confidence: number;
  tags: string[];
}

interface AIResponse {
  suggestions: Suggestion[];
  analysis: {
    mood: string;
    style: string;
    trends: string[];
  };
  enhancements: {
    visual: string[];
    audio: string[];
    effects: string[];
  };
}

export const AICreativeAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  
  const { generateVideo, analyzeContent, generateAudio } = useAIService();

  const startVoiceInput = useCallback(async () => {
    try {
      setRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks);
        // Convert audio to text using AI
        const response = await fetch('/api/ai/speech-to-text', {
          method: 'POST',
          body: audioBlob
        });
        const { text } = await response.json();
        setPrompt(text);
        setRecording(false);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 10000); // 10s max
    } catch (error) {
      console.error('Error recording audio:', error);
      setRecording(false);
    }
  }, []);

  const generateSuggestions = async () => {
    if (!prompt.trim()) return;

    setProcessing(true);
    try {
      // Get creative suggestions from AI
      const response = await fetch('/api/ai/creative-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data: AIResponse = await response.json();
      setAiResponse(data);
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setProcessing(false);
    }
  };

  const applySuggestion = async (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    try {
      switch (suggestion.type) {
        case 'visual':
          await generateVideo({
            prompt: suggestion.content,
            style: aiResponse?.analysis.style
          });
          break;
        case 'audio':
          await generateAudio(suggestion.content, aiResponse?.analysis.mood || 'neutral');
          break;
        case 'effect':
          // Apply visual effect
          break;
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
    }
  };

  const renderSuggestionCard = (suggestion: Suggestion) => (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' }
      }}
      onClick={() => applySuggestion(suggestion)}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Suggestion
            </Typography>
            <Tooltip title={`${suggestion.confidence}% confidence`}>
              <IconButton>
                <AutoAwesome color={suggestion.confidence > 80 ? 'primary' : 'inherit'} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Typography variant="body1">
            {suggestion.content}
          </Typography>

          <Stack direction="row" spacing={1}>
            {suggestion.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI Creative Assistant
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1">
            Describe your creative vision or challenge
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Create an engaging product showcase with a modern, minimalist style'"
            />
            <Stack spacing={1}>
              <IconButton
                color={recording ? 'error' : 'primary'}
                onClick={startVoiceInput}
              >
                {recording ? <Stop /> : <MusicNote />}
              </IconButton>
              <IconButton
                color="primary"
                onClick={generateSuggestions}
                disabled={!prompt.trim() || processing}
              >
                <Send />
              </IconButton>
            </Stack>
          </Stack>

          {processing && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Stack>
      </Paper>

      {aiResponse && (
        <Grid container spacing={3}>
          {/* Analysis Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Content Analysis
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Psychology color="primary" />
                  <Typography>Mood: {aiResponse.analysis.mood}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Style color="primary" />
                  <Typography>Style: {aiResponse.analysis.style}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUp color="primary" />
                  <Typography>Trending Elements:</Typography>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {aiResponse.analysis.trends.map((trend) => (
                    <Chip
                      key={trend}
                      label={trend}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Suggestions Section */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {suggestions.map((suggestion, index) => (
                <Box key={index}>
                  {renderSuggestionCard(suggestion)}
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={Boolean(selectedSuggestion)}
        onClose={() => setSelectedSuggestion(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedSuggestion && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Applying Suggestion
            </Typography>
            {/* Preview content based on suggestion type */}
          </Box>
        )}
      </Dialog>
    </Box>
  );
};
