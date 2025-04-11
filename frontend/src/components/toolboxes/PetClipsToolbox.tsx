import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, IconButton, Chip, Tooltip, Grid, Slider } from '@mui/material';
import {
  Pets,
  CenterFocusStrong,
  FilterVintage,
  AutoAwesome,
  Favorite,
  PhotoCamera,
  Adjust,
  CameraEnhance
} from '@mui/icons-material';
import styled from '@emotion/styled';

interface PetClipsToolboxProps {
  onPetDetected: (bounds: DOMRect) => void;
  onFilterSelect: (filter: string) => void;
  onFocusPointChange: (x: number, y: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

interface DetectedPet {
  type: string;
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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

const FocusPoint = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #f50057;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  left: ${props => props.x}%;
  top: ${props => props.y}%;
  pointer-events: none;
  z-index: 100;
`;

const petFilters = [
  { id: 'cute', name: 'Cute', icon: <Favorite />, class: 'brightness-warm' },
  { id: 'portrait', name: 'Portrait', icon: <CameraEnhance />, class: 'blur-bg' },
  { id: 'playful', name: 'Playful', icon: <AutoAwesome />, class: 'vibrant' },
  { id: 'vintage', name: 'Vintage', icon: <FilterVintage />, class: 'sepia' }
];

export const PetClipsToolbox: React.FC<PetClipsToolboxProps> = ({
  onPetDetected,
  onFilterSelect,
  onFocusPointChange,
  videoRef
}) => {
  const [detectedPets, setDetectedPets] = useState<DetectedPet[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isTracking, setIsTracking] = useState(false);
  const [focusStrength, setFocusStrength] = useState(50);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackingRef = useRef<{ x: number; y: number } | null>(null);

  // Pet detection using TensorFlow.js
  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;
    
    const detectPets = async () => {
      if (!videoRef.current || !videoRef.current.srcObject || !canvasRef.current) return;
      
      try {
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');

        const response = await fetch('/api/analyze/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
        });

        if (response.ok) {
          const { pets } = await response.json();
          setDetectedPets(pets);
          
          // Update focus point to the largest detected pet
          if (pets.length > 0 && isTracking) {
            const mainPet = pets.reduce((prev, current) => 
              (current.bounds.width * current.bounds.height) > 
              (prev.bounds.width * prev.bounds.height) ? current : prev
            );
            
            const x = (mainPet.bounds.x + mainPet.bounds.width / 2) * 100;
            const y = (mainPet.bounds.y + mainPet.bounds.height / 2) * 100;
            
            setFocusPoint({ x, y });
            onFocusPointChange(x, y);
            trackingRef.current = { x, y };
          }
        }
      } catch (error) {
        console.error('Error detecting pets:', error);
      }
    };

    if (videoRef.current && videoRef.current.srcObject) {
      detectionInterval = setInterval(detectPets, 100); // Detect pets 10 times per second
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [videoRef, isTracking, onFocusPointChange]);

  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId);
    onFilterSelect(filterId);
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking) {
      trackingRef.current = focusPoint;
    }
  };

  const handleFocusStrengthChange = (_: Event, value: number | number[]) => {
    const strength = value as number;
    setFocusStrength(strength);
    // Update blur effect based on focus strength
    if (videoRef.current) {
      const blurAmount = ((100 - strength) / 100) * 10;
      videoRef.current.style.filter = `blur(${blurAmount}px)`;
    }
  };

  return (
    <>
      <ToolboxContainer elevation={3}>
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Detected Pets
          </Typography>
          <Grid container spacing={1}>
            {detectedPets.map((pet, index) => (
              <Grid item key={index}>
                <Chip
                  icon={<Pets />}
                  label={`${pet.type} (${Math.round(pet.confidence * 100)}%)`}
                  color="secondary"
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            Focus Control
          </Typography>
          <Grid container spacing={1} alignItems="center">
            <Grid item>
              <Tooltip title={isTracking ? 'Stop Tracking' : 'Start Tracking'}>
                <IconButton
                  color={isTracking ? 'secondary' : 'default'}
                  onClick={toggleTracking}
                >
                  <CenterFocusStrong />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item xs>
              <Slider
                value={focusStrength}
                onChange={handleFocusStrengthChange}
                aria-labelledby="focus-strength"
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item>
              <Tooltip title="Focus Strength">
                <IconButton>
                  <Adjust />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Pet Filters
          </Typography>
          <Grid container spacing={1}>
            {petFilters.map(filter => (
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

      {/* Focus point indicator */}
      {isTracking && trackingRef.current && (
        <FocusPoint x={focusPoint.x} y={focusPoint.y} />
      )}

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default PetClipsToolbox;
