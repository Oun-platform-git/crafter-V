import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  SimpleGrid,
  Button,
  useColorModeValue
} from '@chakra-ui/react';

interface Effect {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export const EffectsPanel: React.FC = () => {
  const [effects, setEffects] = useState<Effect[]>([
    {
      id: 'brightness',
      name: 'Brightness',
      value: 100,
      min: 0,
      max: 200,
      step: 1
    },
    {
      id: 'contrast',
      name: 'Contrast',
      value: 100,
      min: 0,
      max: 200,
      step: 1
    },
    {
      id: 'saturation',
      name: 'Saturation',
      value: 100,
      min: 0,
      max: 200,
      step: 1
    },
    {
      id: 'blur',
      name: 'Blur',
      value: 0,
      min: 0,
      max: 20,
      step: 0.1
    }
  ]);

  const [presets, setPresets] = useState([
    { id: 'warm', name: 'Warm' },
    { id: 'cool', name: 'Cool' },
    { id: 'vintage', name: 'Vintage' },
    { id: 'dramatic', name: 'Dramatic' },
    { id: 'sharp', name: 'Sharp' },
    { id: 'soft', name: 'Soft' }
  ]);

  const handleEffectChange = (id: string, newValue: number) => {
    setEffects(prev =>
      prev.map(effect =>
        effect.id === id ? { ...effect, value: newValue } : effect
      )
    );
  };

  const handlePresetClick = (presetId: string) => {
    // Apply preset values
    switch (presetId) {
      case 'warm':
        setEffects(prev =>
          prev.map(effect => {
            if (effect.id === 'brightness') return { ...effect, value: 110 };
            if (effect.id === 'saturation') return { ...effect, value: 120 };
            return effect;
          })
        );
        break;
      case 'cool':
        setEffects(prev =>
          prev.map(effect => {
            if (effect.id === 'contrast') return { ...effect, value: 110 };
            if (effect.id === 'saturation') return { ...effect, value: 90 };
            return effect;
          })
        );
        break;
      // Add more preset configurations
    }
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      {/* Presets */}
      <Box mb={6}>
        <Heading size="sm" mb={3}>
          Presets
        </Heading>
        <SimpleGrid columns={3} spacing={2}>
          {presets.map(preset => (
            <Button
              key={preset.id}
              size="sm"
              variant="outline"
              onClick={() => handlePresetClick(preset.id)}
            >
              {preset.name}
            </Button>
          ))}
        </SimpleGrid>
      </Box>

      {/* Effects Controls */}
      <Box>
        <Heading size="sm" mb={3}>
          Adjustments
        </Heading>
        <VStack spacing={4} align="stretch">
          {effects.map(effect => (
            <Box key={effect.id}>
              <Text mb={2}>{effect.name}</Text>
              <Slider
                value={effect.value}
                min={effect.min}
                max={effect.max}
                step={effect.step}
                onChange={value => handleEffectChange(effect.id, value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};
