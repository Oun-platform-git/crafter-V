import React from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import {
  AutoAwesome,
  ColorLens,
  Contrast,
  FilterVintage,
  Flare,
  Grain,
  Mood,
  Style,
  Tune,
  WbSunny
} from '@mui/icons-material';

interface QuickEffect {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface QuickEffectsProps {
  onEffectSelect: (effectId: string) => void;
  selectedEffect?: string;
  disabled?: boolean;
}

const QUICK_EFFECTS: QuickEffect[] = [
  {
    id: 'enhance',
    name: 'Auto Enhance',
    icon: <AutoAwesome />,
    description: 'Automatically enhance video quality'
  },
  {
    id: 'colorBoost',
    name: 'Color Boost',
    icon: <ColorLens />,
    description: 'Make colors more vibrant'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: <FilterVintage />,
    description: 'Add retro film effect'
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    icon: <Contrast />,
    description: 'High contrast cinematic look'
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: <WbSunny />,
    description: 'Add warm color temperature'
  },
  {
    id: 'grain',
    name: 'Film Grain',
    icon: <Grain />,
    description: 'Add subtle film grain'
  },
  {
    id: 'glow',
    name: 'Soft Glow',
    icon: <Flare />,
    description: 'Add dreamy soft glow'
  },
  {
    id: 'mood',
    name: 'Mood',
    icon: <Mood />,
    description: 'AI-powered mood enhancement'
  },
  {
    id: 'style',
    name: 'Style Transfer',
    icon: <Style />,
    description: 'Apply artistic style'
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: <Tune />,
    description: 'Create custom effect'
  }
];

export const QuickEffects: React.FC<QuickEffectsProps> = ({
  onEffectSelect,
  selectedEffect,
  disabled = false
}) => {
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Quick Effects
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': {
            height: 6
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.paper'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: 3
          }
        }}
      >
        {QUICK_EFFECTS.map((effect) => (
          <Tooltip key={effect.id} title={effect.description} placement="top">
            <IconButton
              color={selectedEffect === effect.id ? 'primary' : 'default'}
              onClick={() => onEffectSelect(effect.id)}
              disabled={disabled}
              sx={{
                p: 1,
                borderRadius: 1,
                border: 1,
                borderColor: selectedEffect === effect.id ? 'primary.main' : 'divider'
              }}
            >
              {effect.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
};
