import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, Chip, Tooltip, Grid } from '@mui/material';
import {
  EmojiEmotions,
  Timer,
  FilterVintage,
  AutoAwesome,
  Favorite,
  SentimentVerySatisfied,
  SentimentVeryDissatisfied,
  Pets,
  LocalActivity
} from '@mui/icons-material';
import styled from '@emotion/styled';

interface MiniVlogToolboxProps {
  onMoodSelect: (mood: string) => void;
  onFilterSelect: (filter: string) => void;
  onQuickClipStart: (duration: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const ToolboxContainer = styled(Paper)`
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: white;
  position: absolute;
  right: 16px;
  top: 16px;
  width: 300px;
  z-index: 10;
`;

const FilterPreview = styled.div<{ active: boolean }>`
  border: 2px solid ${props => props.active ? '#f50057' : 'transparent'};
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const QuickClipButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.1);
  margin: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const moodEmojis: Record<string, JSX.Element> = {
  happy: <SentimentVerySatisfied />,
  sad: <SentimentVeryDissatisfied />,
  excited: <LocalActivity />,
  relaxed: <Pets />,
  romantic: <Favorite />
};

const filterPresets = [
  { id: 'vintage', name: 'Vintage', icon: <FilterVintage />, class: 'sepia' },
  { id: 'bright', name: 'Bright', icon: <AutoAwesome />, class: 'brightness' },
  { id: 'moody', name: 'Moody', icon: <EmojiEmotions />, class: 'contrast' },
  { id: 'warm', name: 'Warm', icon: <Favorite />, class: 'saturate' }
];

const quickClipDurations = [3, 5, 10, 15];

export const MiniVlogToolbox: React.FC<MiniVlogToolboxProps> = ({
  onMoodSelect,
  onFilterSelect,
  onQuickClipStart,
  videoRef
}) => {
  const [detectedMood, setDetectedMood] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect mood from video stream
  useEffect(() => {
    let moodDetectionInterval: NodeJS.Timeout;
    
    const detectMood = async () => {
      if (!videoRef.current || !videoRef.current.srcObject) return;
      
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');

        const response = await fetch('/api/analyze/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });

        if (response.ok) {
          const { mood } = await response.json();
          setDetectedMood(mood);
          onMoodSelect(mood);
        }
      } catch (error) {
        console.error('Error detecting mood:', error);
      }
    };

    if (videoRef.current && videoRef.current.srcObject) {
      moodDetectionInterval = setInterval(detectMood, 2000); // Detect mood every 2 seconds
    }

    return () => {
      if (moodDetectionInterval) {
        clearInterval(moodDetectionInterval);
      }
    };
  }, [videoRef, onMoodSelect]);

  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterSelect(filterId);
  };

  const handleQuickClipStart = (duration: number) => {
    setIsProcessing(true);
    onQuickClipStart(duration);
    setTimeout(() => setIsProcessing(false), duration * 1000);
  };

  return (
    <ToolboxContainer elevation={3}>
      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          Detected Mood
        </Typography>
        <Chip
          icon={moodEmojis[detectedMood] || <EmojiEmotions />}
          label={detectedMood || 'Detecting...'}
          color="secondary"
          variant="outlined"
        />
      </Box>

      <Box mb={2}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Clips
        </Typography>
        <Grid container spacing={1}>
          {quickClipDurations.map(duration => (
            <Grid item key={duration}>
              <Tooltip title={`${duration}s clip`}>
                <QuickClipButton
                  color="primary"
                  disabled={isProcessing}
                  onClick={() => handleQuickClipStart(duration)}
                >
                  <Timer />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {duration}s
                  </Typography>
                </QuickClipButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Filter Presets
        </Typography>
        <Grid container spacing={1}>
          {filterPresets.map(filter => (
            <Grid item xs={6} key={filter.id}>
              <FilterPreview
                active={activeFilter === filter.id}
                onClick={() => handleFilterSelect(filter.id)}
              >
                <Box display="flex" alignItems="center">
                  {filter.icon}
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {filter.name}
                  </Typography>
                </Box>
              </FilterPreview>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ToolboxContainer>
  );
};

export default MiniVlogToolbox;
