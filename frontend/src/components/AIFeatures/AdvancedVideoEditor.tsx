import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Slider,
  IconButton,
  Tooltip,
  Chip,
  Stack
} from '@mui/material';
import {
  AutoFix,
  Colorize,
  Tune,
  AudioTrack,
  Speed,
  Style,
  Animation,
  Transform
} from '@mui/icons-material';
import { useAIService } from '../../hooks/useAIService';
import { VideoTimeline } from './VideoTimeline';
import { EffectPanel } from './EffectPanel';
import { AIStyleTransfer } from './AIStyleTransfer';
import { AudioEnhancer } from './AudioEnhancer';

interface AdvancedVideoEditorProps {
  videoUrl: string;
  onSave: (url: string) => void;
}

export const AdvancedVideoEditor: React.FC<AdvancedVideoEditorProps> = ({
  videoUrl,
  onSave
}) => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    enhanceVideo,
    generateAudio,
    analyzeContent,
    detectHighlights
  } = useAIService();

  const effects = [
    {
      id: 'autoEnhance',
      name: 'Auto Enhance',
      icon: <AutoFix />,
      description: 'AI-powered automatic enhancement'
    },
    {
      id: 'styleTransfer',
      name: 'Style Transfer',
      icon: <Style />,
      description: 'Apply artistic styles'
    },
    {
      id: 'colorGrading',
      name: 'Color Grading',
      icon: <Colorize />,
      description: 'Smart color correction'
    },
    {
      id: 'audioEnhance',
      name: 'Audio Enhance',
      icon: <AudioTrack />,
      description: 'AI audio enhancement'
    },
    {
      id: 'motion',
      name: 'Motion Effects',
      icon: <Animation />,
      description: 'Smart motion effects'
    },
    {
      id: 'stabilize',
      name: 'Stabilize',
      icon: <Transform />,
      description: 'AI video stabilization'
    }
  ];

  const handleEffectClick = useCallback(async (effectId: string) => {
    setActiveEffect(effectId);
    setProcessing(true);

    try {
      let enhancedUrl;
      switch (effectId) {
        case 'autoEnhance':
          enhancedUrl = await enhanceVideo(videoUrl, {
            type: 'quality',
            params: { level: 'high' }
          });
          break;
        case 'styleTransfer':
          // Style transfer will be handled by AIStyleTransfer component
          break;
        case 'colorGrading':
          enhancedUrl = await enhanceVideo(videoUrl, {
            type: 'color',
            params: { mode: 'cinematic' }
          });
          break;
        case 'audioEnhance':
          // Audio enhancement will be handled by AudioEnhancer component
          break;
        case 'motion':
          enhancedUrl = await enhanceVideo(videoUrl, {
            type: 'motion',
            params: { effect: 'smooth' }
          });
          break;
        case 'stabilize':
          enhancedUrl = await enhanceVideo(videoUrl, {
            type: 'stabilization'
          });
          break;
      }

      if (enhancedUrl) {
        onSave(enhancedUrl);
      }
    } catch (error) {
      console.error('Effect application failed:', error);
    } finally {
      setProcessing(false);
    }
  }, [videoUrl, enhanceVideo, onSave]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 3, my: 2 }}>
      <Typography variant="h5" gutterBottom>
        AI Video Editor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              bgcolor: 'black',
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              controls
            />
          </Box>

          <VideoTimeline
            currentTime={currentTime}
            duration={duration}
            onSeek={(time) => {
              if (videoRef.current) {
                videoRef.current.currentTime = time;
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Typography variant="h6">AI Effects</Typography>
            
            {effects.map((effect) => (
              <Tooltip key={effect.id} title={effect.description}>
                <Chip
                  icon={effect.icon}
                  label={effect.name}
                  onClick={() => handleEffectClick(effect.id)}
                  color={activeEffect === effect.id ? 'primary' : 'default'}
                  disabled={processing}
                  sx={{ width: '100%', justifyContent: 'flex-start' }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Grid>

        {activeEffect === 'styleTransfer' && (
          <Grid item xs={12}>
            <AIStyleTransfer
              videoUrl={videoUrl}
              onApply={onSave}
              onClose={() => setActiveEffect(null)}
            />
          </Grid>
        )}

        {activeEffect === 'audioEnhance' && (
          <Grid item xs={12}>
            <AudioEnhancer
              videoUrl={videoUrl}
              onApply={onSave}
              onClose={() => setActiveEffect(null)}
            />
          </Grid>
        )}

        {activeEffect && (
          <Grid item xs={12}>
            <EffectPanel
              effectId={activeEffect}
              processing={processing}
              onClose={() => setActiveEffect(null)}
            />
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
