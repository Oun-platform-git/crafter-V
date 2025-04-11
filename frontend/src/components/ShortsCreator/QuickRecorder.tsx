import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Typography,
  LinearProgress,
  Grid,
  Chip,
  Stack
} from '@mui/material';
import {
  Close,
  FiberManualRecord,
  Stop,
  Replay,
  CloudUpload,
  Mood,
  Timer,
  FilterVintage
} from '@mui/icons-material';
import { useAIService } from '../../hooks/useAIService';
import { MoodDetector } from './MoodDetector';
import { FilterSelector } from './FilterSelector';
import { AudioEnhancer } from '../AIFeatures/AudioEnhancer';

interface QuickRecorderProps {
  onClose: () => void;
  onAnalyze: (videoUrl: string) => Promise<any>;
}

export const QuickRecorder: React.FC<QuickRecorderProps> = ({
  onClose,
  onAnalyze
}) => {
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [mood, setMood] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  
  const { enhanceVideo, generateAudio } = useAIService();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 9/16,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordedChunks(chunks);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);

      // Start duration timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setDuration(seconds);
        if (seconds >= 60) {
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, [recording]);

  const analyzeVideo = useCallback(async () => {
    if (!recordedUrl) return;

    try {
      setAnalyzing(true);
      const analysis = await onAnalyze(recordedUrl);
      setMood(analysis.mood);
      
      // Auto-enhance based on mood
      if (analysis.mood) {
        const enhanced = await enhanceVideo(recordedUrl, {
          type: 'mood',
          params: { mood: analysis.mood }
        });
        setRecordedUrl(enhanced);
      }
    } catch (error) {
      console.error('Error analyzing video:', error);
    } finally {
      setAnalyzing(false);
    }
  }, [recordedUrl, onAnalyze, enhanceVideo]);

  const handleSave = useCallback(async () => {
    if (!recordedUrl) return;

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob);
      formData.append('mood', mood || 'neutral');
      formData.append('duration', duration.toString());

      // Upload to server
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving video:', error);
    }
  }, [recordedChunks, mood, duration, onClose]);

  return (
    <Dialog
      open
      maxWidth="md"
      fullWidth
      onClose={onClose}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Quick Clip Recorder</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '177.78%', // 9:16 aspect ratio
                bgcolor: 'black',
                borderRadius: 1,
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
              
              {duration > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  {duration}s / 60s
                </Box>
              )}

              <LinearProgress
                variant="determinate"
                value={(duration / 60) * 100}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0
                }}
              />
            </Box>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
                  color="primary"
                  startIcon={<FiberManualRecord />}
                  onClick={startRecording}
                  disabled={Boolean(recordedUrl)}
                >
                  Start Recording
                </Button>
              )}

              {recordedUrl && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Replay />}
                    onClick={() => {
                      setRecordedUrl(null);
                      setRecordedChunks([]);
                      setDuration(0);
                      setMood(null);
                    }}
                  >
                    Record Again
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CloudUpload />}
                    onClick={handleSave}
                  >
                    Save & Upload
                  </Button>
                </>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            {recordedUrl && (
              <Stack spacing={2}>
                <Typography variant="h6">
                  Enhancements
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<Mood />}
                  onClick={analyzeVideo}
                  disabled={analyzing}
                >
                  Analyze Mood
                </Button>

                {mood && (
                  <Chip
                    icon={<Mood />}
                    label={`Detected Mood: ${mood}`}
                    color="primary"
                  />
                )}

                <FilterSelector
                  onApply={(filter) => {
                    // Apply selected filter
                  }}
                />

                <AudioEnhancer
                  videoUrl={recordedUrl}
                  onEnhance={async (enhancedUrl) => {
                    setRecordedUrl(enhancedUrl);
                  }}
                />
              </Stack>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
