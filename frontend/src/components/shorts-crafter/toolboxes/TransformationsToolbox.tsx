import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Button,
  IconButton,
  Text,
  Input,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Badge,
  Tooltip,
  Grid,
  GridItem,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast
} from '@chakra-ui/react';
import {
  FaClock,
  FaCamera,
  FaMagic,
  FaPlay,
  FaPause,
  FaStopwatch,
  FaImage,
  FaSync,
  FaRandom,
  FaChartLine,
  FaRegClock,
  FaRegImages,
  FaRegSun,
  FaRegMoon,
  FaRegSnowflake,
  FaLeaf
} from 'react-icons/fa';

interface TransformationsToolboxProps {
  onTransformationApply?: (type: string, params: any) => void;
  onTimelapseStart?: (params: any) => void;
  onTimelapseStop?: () => void;
  onBeforeAfterCapture?: (type: 'before' | 'after') => void;
  onEffectApply?: (effect: string, params: any) => void;
}

export const TransformationsToolbox: React.FC<TransformationsToolboxProps> = ({
  onTransformationApply,
  onTimelapseStart,
  onTimelapseStop,
  onBeforeAfterCapture,
  onEffectApply
}) => {
  // State management
  const [transformationType, setTransformationType] = useState('before-after');
  const [timelapseInterval, setTimelapseInterval] = useState(1);
  const [totalDuration, setTotalDuration] = useState(60);
  const [isRecording, setIsRecording] = useState(false);
  const [transitionEffect, setTransitionEffect] = useState('fade');
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [seasonalEffect, setSeasonalEffect] = useState('none');
  const [progress, setProgress] = useState(0);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Predefined settings
  const transformationTypes = [
    { id: 'before-after', name: 'Before & After' },
    { id: 'timelapse', name: 'Time Lapse' },
    { id: 'progression', name: 'Progress Tracker' },
    { id: 'seasonal', name: 'Seasonal Change' }
  ];

  const transitionEffects = [
    { id: 'fade', name: 'Fade' },
    { id: 'slide', name: 'Slide' },
    { id: 'morph', name: 'Morph' },
    { id: 'dissolve', name: 'Dissolve' }
  ];

  const seasonalEffects = [
    { id: 'none', name: 'None', icon: FaRegImages },
    { id: 'summer', name: 'Summer', icon: FaRegSun },
    { id: 'winter', name: 'Winter', icon: FaRegSnowflake },
    { id: 'spring', name: 'Spring', icon: FaLeaf },
    { id: 'autumn', name: 'Autumn', icon: FaLeaf }
  ];

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (totalDuration / timelapseInterval));
          if (newProgress >= 100) {
            stopRecording();
            return 100;
          }
          return newProgress;
        });
      }, timelapseInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [isRecording, timelapseInterval, totalDuration]);

  const startRecording = () => {
    setIsRecording(true);
    setProgress(0);
    onTimelapseStart?.({
      interval: timelapseInterval,
      duration: totalDuration,
      effect: transitionEffect
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    onTimelapseStop?.();
  };

  const captureBeforeAfter = (type: 'before' | 'after') => {
    onBeforeAfterCapture?.(type);
    if (type === 'before') {
      setBeforeImage('captured');
      toast({
        title: 'Before Image Captured',
        status: 'success',
        duration: 2000
      });
    } else {
      setAfterImage('captured');
      toast({
        title: 'After Image Captured',
        status: 'success',
        duration: 2000
      });
    }
  };

  const applySeasonalEffect = (effect: string) => {
    setSeasonalEffect(effect);
    onEffectApply?.('seasonal', { effect });
  };

  return (
    <VStack
      spacing={4}
      w="100%"
      bg={bgColor}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      {/* Transformation Type */}
      <FormControl>
        <FormLabel>Transformation Type</FormLabel>
        <Select
          value={transformationType}
          onChange={(e) => setTransformationType(e.target.value)}
          icon={<FaMagic />}
        >
          {transformationTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Before & After Controls */}
      {transformationType === 'before-after' && (
        <Box w="100%">
          <Text fontWeight="bold" mb={2}>Before & After Capture</Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <Button
                w="100%"
                leftIcon={<FaCamera />}
                onClick={() => captureBeforeAfter('before')}
                colorScheme={beforeImage ? 'green' : 'gray'}
              >
                Before
              </Button>
            </GridItem>
            <GridItem>
              <Button
                w="100%"
                leftIcon={<FaCamera />}
                onClick={() => captureBeforeAfter('after')}
                colorScheme={afterImage ? 'green' : 'gray'}
              >
                After
              </Button>
            </GridItem>
          </Grid>
        </Box>
      )}

      {/* Time Lapse Controls */}
      {transformationType === 'timelapse' && (
        <VStack w="100%" spacing={4}>
          <FormControl>
            <FormLabel>Interval (seconds)</FormLabel>
            <NumberInput
              value={timelapseInterval}
              onChange={(_, value) => setTimelapseInterval(value)}
              min={1}
              max={60}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Total Duration (seconds)</FormLabel>
            <NumberInput
              value={totalDuration}
              onChange={(_, value) => setTotalDuration(value)}
              min={10}
              max={3600}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <Button
            w="100%"
            leftIcon={isRecording ? <FaPause /> : <FaPlay />}
            onClick={isRecording ? stopRecording : startRecording}
            colorScheme={isRecording ? 'red' : 'blue'}
          >
            {isRecording ? 'Stop Recording' : 'Start Time Lapse'}
          </Button>

          {isRecording && (
            <Progress
              value={progress}
              w="100%"
              hasStripe
              isAnimated
              colorScheme="blue"
            />
          )}
        </VStack>
      )}

      {/* Transition Effects */}
      <FormControl>
        <FormLabel>Transition Effect</FormLabel>
        <Select
          value={transitionEffect}
          onChange={(e) => setTransitionEffect(e.target.value)}
        >
          {transitionEffects.map(effect => (
            <option key={effect.id} value={effect.id}>
              {effect.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Seasonal Effects */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Seasonal Effects</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          {seasonalEffects.map(effect => (
            <GridItem key={effect.id}>
              <Button
                w="100%"
                leftIcon={<effect.icon />}
                variant={seasonalEffect === effect.id ? 'solid' : 'outline'}
                onClick={() => applySeasonalEffect(effect.id)}
                size="sm"
              >
                {effect.name}
              </Button>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* Auto Enhancement */}
      <HStack w="100%" justify="space-between">
        <Text>Auto Enhance</Text>
        <Switch
          isChecked={autoEnhance}
          onChange={(e) => setAutoEnhance(e.target.checked)}
          colorScheme="blue"
        />
      </HStack>

      {/* Quick Actions */}
      <HStack w="100%" spacing={2}>
        <Tooltip label="Reset Timeline">
          <IconButton
            aria-label="Reset Timeline"
            icon={<FaSync />}
            onClick={() => onTransformationApply?.('reset', {})}
          />
        </Tooltip>
        <Tooltip label="Random Effect">
          <IconButton
            aria-label="Random Effect"
            icon={<FaRandom />}
            onClick={() => onTransformationApply?.('random', {})}
          />
        </Tooltip>
        <Tooltip label="Add Milestone">
          <IconButton
            aria-label="Add Milestone"
            icon={<FaRegClock />}
            onClick={() => onTransformationApply?.('milestone', {})}
          />
        </Tooltip>
        <Tooltip label="Trending Transitions">
          <IconButton
            aria-label="Trending Transitions"
            icon={<FaChartLine />}
            onClick={() => onTransformationApply?.('trending', {})}
          />
        </Tooltip>
      </HStack>
    </VStack>
  );
};
