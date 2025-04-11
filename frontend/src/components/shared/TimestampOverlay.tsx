import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

interface TimestampOverlayProps {
  currentTime: number;
  duration: number;
  onTimeUpdate?: (time: number) => void;
  disabled?: boolean;
}

export const TimestampOverlay: React.FC<TimestampOverlayProps> = ({
  currentTime,
  duration,
  onTimeUpdate,
  disabled = false
}) => {
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const adjustTime = (delta: number) => {
    if (onTimeUpdate) {
      const newTime = Math.max(0, Math.min(duration, currentTime + delta));
      onTimeUpdate(newTime);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 2,
        p: 1,
        backdropFilter: 'blur(4px)',
        zIndex: 1
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton
          size="small"
          onClick={() => adjustTime(-1)}
          disabled={disabled || currentTime <= 0}
          sx={{ color: 'white' }}
        >
          <Remove />
        </IconButton>
        
        <Typography
          variant="body2"
          sx={{
            color: 'white',
            fontFamily: 'monospace',
            fontWeight: 'medium',
            minWidth: 65,
            textAlign: 'center'
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>

        <IconButton
          size="small"
          onClick={() => adjustTime(1)}
          disabled={disabled || currentTime >= duration}
          sx={{ color: 'white' }}
        >
          <Add />
        </IconButton>
      </Stack>
    </Box>
  );
};
