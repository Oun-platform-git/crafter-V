import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Slider,
  IconButton,
  Button,
  Stack,
  Card,
  CardContent,
  Dialog,
  TextField,
  Chip
} from '@mui/material';
import {
  Transform,
  Timeline,
  Compare,
  Timer,
  Style,
  AutoAwesome,
  AddAPhoto,
  Save,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import { useAIService } from '../../../hooks/useAIService';

interface TransformationStep {
  id: string;
  timestamp: number;
  image: string;
  effects: string[];
  transition: string;
  duration: number;
}

export const TransformationEditor: React.FC = () => {
  const [steps, setSteps] = useState<TransformationStep[]>([]);
  const [recording, setRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const { enhanceVideo, generateTransition } = useAIService();

  const EFFECTS = [
    { name: 'Time Lapse', icon: <Timer /> },
    { name: 'Smooth Transition', icon: <Transform /> },
    { name: 'Style Transfer', icon: <Style /> },
    { name: 'AI Enhancement', icon: <AutoAwesome /> }
  ];

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 9/16,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Add new transformation step
        const newStep: TransformationStep = {
          id: Date.now().toString(),
          timestamp: currentTime,
          image: url,
          effects: [],
          transition: 'fade',
          duration: 2
        };
        
        setSteps(prev => [...prev, newStep]);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [currentTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, [recording]);

  const applyEffect = async (stepId: string, effectName: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    try {
      // Apply AI effect
      const enhanced = await enhanceVideo(step.image, {
        type: effectName.toLowerCase(),
        params: { intensity: 0.8 }
      });

      // Update step with enhanced video
      setSteps(prev =>
        prev.map(s =>
          s.id === stepId
            ? { ...s, effects: [...s.effects, effectName], image: enhanced }
            : s
        )
      );
    } catch (error) {
      console.error('Error applying effect:', error);
    }
  };

  const generateTransformationVideo = async () => {
    try {
      // Generate transitions between steps
      const transitions = await Promise.all(
        steps.slice(1).map((step, index) =>
          generateTransition(
            steps[index].image,
            step.image,
            step.transition
          )
        )
      );

      // Combine all videos with transitions
      const finalVideo = await fetch('/api/video/combine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: steps.map((step, index) => ({
            ...step,
            transition: transitions[index]
          }))
        })
      });

      const { url } = await finalVideo.json();
      setPreview(url);
    } catch (error) {
      console.error('Error generating video:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Transformation Editor
      </Typography>

      <Grid container spacing={3}>
        {/* Camera Preview */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '177.78%', // 9:16 aspect ratio
              bgcolor: 'black',
              overflow: 'hidden'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                display: 'flex',
                justifyContent: 'center',
                gap: 2
              }}
            >
              {recording ? (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Stop />}
                  onClick={stopRecording}
                >
                  Stop Recording
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<AddAPhoto />}
                  onClick={startRecording}
                >
                  Capture Step
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Timeline and Effects */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Effects Panel */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Effects
              </Typography>
              <Grid container spacing={1}>
                {EFFECTS.map((effect) => (
                  <Grid item xs={6} key={effect.name}>
                    <Button
                      variant={selectedEffect === effect.name ? 'contained' : 'outlined'}
                      startIcon={effect.icon}
                      onClick={() => setSelectedEffect(effect.name)}
                      fullWidth
                    >
                      {effect.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Timeline */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Timeline
              </Typography>
              <Stack spacing={2}>
                {steps.map((step, index) => (
                  <Card key={step.id} variant="outlined">
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">
                          Step {index + 1}
                        </Typography>
                        <Box
                          component="img"
                          src={step.image}
                          sx={{
                            width: '100%',
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                        <Stack direction="row" spacing={1}>
                          {step.effects.map((effect) => (
                            <Chip
                              key={effect}
                              label={effect}
                              size="small"
                              onDelete={() => {
                                // Remove effect
                              }}
                            />
                          ))}
                        </Stack>
                        <Button
                          size="small"
                          startIcon={<AutoAwesome />}
                          onClick={() => {
                            if (selectedEffect) {
                              applyEffect(step.id, selectedEffect);
                            }
                          }}
                          disabled={!selectedEffect}
                        >
                          Apply Effect
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>

            {/* Generate Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<Transform />}
              onClick={generateTransformationVideo}
              disabled={steps.length < 2}
              fullWidth
            >
              Generate Transformation
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        maxWidth="md"
        fullWidth
      >
        {preview && (
          <Box sx={{ p: 2 }}>
            <video
              src={preview}
              controls
              style={{ width: '100%' }}
            />
            <Button
              startIcon={<Save />}
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => {
                // Save video
              }}
            >
              Save Transformation
            </Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};
