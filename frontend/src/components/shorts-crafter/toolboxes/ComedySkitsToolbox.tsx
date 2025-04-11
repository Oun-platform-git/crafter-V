import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Button,
  IconButton,
  Text,
  Input,
  Textarea,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  Switch,
  FormControl,
  FormLabel,
  Wrap,
  WrapItem,
  useToast
} from '@chakra-ui/react';
import {
  FaPlay,
  FaStop,
  FaCut,
  FaLayerGroup,
  FaVolumeUp,
  FaMagic,
  FaTheaterMasks,
  FaRandom,
  FaLaugh,
  FaRobot,
  FaImage,
  FaFastForward,
  FaMusic,
  FaUndo,
  FaMeh,
  FaGrin,
  FaSurprise
} from 'react-icons/fa';

interface Take {
  id: string;
  timestamp: number;
  duration: number;
  thumbnail?: string;
  isSelected: boolean;
}

interface ComedySkitsToolboxProps {
  onTakeSelect?: (takeId: string) => void;
  onEffectApply?: (effect: string, params: any) => void;
  onSceneSwitch?: (background: string) => void;
  onSoundEffect?: (sound: string) => void;
}

export const ComedySkitsToolbox: React.FC<ComedySkitsToolboxProps> = ({
  onTakeSelect,
  onEffectApply,
  onSceneSwitch,
  onSoundEffect
}) => {
  // State management
  const [takes, setTakes] = useState<Take[]>([]);
  const [selectedTakes, setSelectedTakes] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentBackground, setCurrentBackground] = useState('none');
  const [voiceEffect, setVoiceEffect] = useState('normal');
  const [speedFactor, setSpeedFactor] = useState(1);
  const [punchlineText, setPunchlineText] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Predefined assets
  const backgrounds = [
    { id: 'none', name: 'None' },
    { id: 'studio', name: 'Comedy Studio' },
    { id: 'stage', name: 'Stage' },
    { id: 'street', name: 'Street' },
    { id: 'custom', name: 'Custom...' }
  ];

  const soundEffects = [
    { id: 'laugh', name: 'Laugh Track', icon: FaLaugh },
    { id: 'applause', name: 'Applause', icon: FaTheaterMasks },
    { id: 'boing', name: 'Boing', icon: FaMagic },
    { id: 'drum', name: 'Drum Roll', icon: FaMusic },
    { id: 'whoosh', name: 'Whoosh', icon: FaRandom }
  ];

  const voiceEffects = [
    { id: 'normal', name: 'Normal' },
    { id: 'robot', name: 'Robot' },
    { id: 'helium', name: 'Helium' },
    { id: 'deep', name: 'Deep Voice' },
    { id: 'echo', name: 'Echo' }
  ];

  useEffect(() => {
    // Simulate loading previous takes
    const loadTakes = async () => {
      const mockTakes: Take[] = [
        { id: '1', timestamp: Date.now() - 5000, duration: 15, isSelected: false },
        { id: '2', timestamp: Date.now() - 3000, duration: 10, isSelected: false },
        { id: '3', timestamp: Date.now() - 1000, duration: 20, isSelected: false }
      ];
      setTakes(mockTakes);
    };

    loadTakes();
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    // Implement recording logic
  };

  const stopRecording = () => {
    setIsRecording(false);
    const newTake: Take = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      duration: 10, // Example duration
      isSelected: false
    };
    setTakes([...takes, newTake]);
  };

  const toggleTakeSelection = (takeId: string) => {
    const updatedTakes = takes.map(take =>
      take.id === takeId ? { ...take, isSelected: !take.isSelected } : take
    );
    setTakes(updatedTakes);
    
    const selectedIds = updatedTakes
      .filter(take => take.isSelected)
      .map(take => take.id);
    setSelectedTakes(selectedIds);
    onTakeSelect?.(takeId);
  };

  const combineTakes = () => {
    if (selectedTakes.length < 2) {
      toast({
        title: 'Selection Required',
        description: 'Please select at least 2 takes to combine',
        status: 'warning',
        duration: 3000
      });
      return;
    }

    onEffectApply?.('combineTakes', { takes: selectedTakes });
  };

  const handleBackgroundChange = (backgroundId: string) => {
    setCurrentBackground(backgroundId);
    onSceneSwitch?.(backgroundId);
  };

  const handleVoiceEffectChange = (effect: string) => {
    setVoiceEffect(effect);
    onEffectApply?.('voiceEffect', { effect });
  };

  const handleSpeedChange = (speed: number) => {
    setSpeedFactor(speed);
    onEffectApply?.('speed', { factor: speed });
  };

  const generateJokeSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    try {
      // Simulate AI joke generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAiSuggestions([
        "Why did the developer go broke? Because he used up all his cache!",
        "What's a programmer's favorite hangout spot? The Foo Bar!",
        "Why do programmers prefer dark mode? Because light attracts bugs!"
      ]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
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
      {/* Recording Controls */}
      <HStack w="100%" justify="space-between">
        <Button
          leftIcon={isRecording ? <FaStop /> : <FaPlay />}
          colorScheme={isRecording ? 'red' : 'blue'}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Take'}
        </Button>
        <Badge colorScheme={isRecording ? 'red' : 'gray'}>
          {isRecording ? 'Recording...' : 'Ready'}
        </Badge>
      </HStack>

      {/* Takes Manager */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Takes ({takes.length})</Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {takes.map(take => (
            <GridItem
              key={take.id}
              p={2}
              borderWidth="1px"
              borderRadius="md"
              borderColor={take.isSelected ? 'blue.500' : borderColor}
              cursor="pointer"
              onClick={() => toggleTakeSelection(take.id)}
              _hover={{ bg: 'gray.50' }}
            >
              <VStack spacing={1}>
                <Text fontSize="sm">Take {take.id}</Text>
                <Text fontSize="xs">{take.duration}s</Text>
              </VStack>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* Multi-take Controls */}
      <HStack w="100%" justify="space-between">
        <Button
          leftIcon={<FaLayerGroup />}
          onClick={combineTakes}
          isDisabled={selectedTakes.length < 2}
        >
          Combine Takes
        </Button>
        <IconButton
          aria-label="Clear Selection"
          icon={<FaUndo />}
          onClick={() => setSelectedTakes([])}
          isDisabled={selectedTakes.length === 0}
        />
      </HStack>

      {/* Green Screen & Backgrounds */}
      <FormControl>
        <FormLabel>Background Scene</FormLabel>
        <Select
          value={currentBackground}
          onChange={(e) => handleBackgroundChange(e.target.value)}
        >
          {backgrounds.map(bg => (
            <option key={bg.id} value={bg.id}>
              {bg.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Sound Effects */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Sound Effects</Text>
        <Wrap spacing={2}>
          {soundEffects.map(effect => (
            <WrapItem key={effect.id}>
              <IconButton
                aria-label={effect.name}
                icon={<effect.icon />}
                onClick={() => onSoundEffect?.(effect.id)}
                size="sm"
              />
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Voice Effects */}
      <FormControl>
        <FormLabel>Voice Effect</FormLabel>
        <Select
          value={voiceEffect}
          onChange={(e) => handleVoiceEffectChange(e.target.value)}
        >
          {voiceEffects.map(effect => (
            <option key={effect.id} value={effect.id}>
              {effect.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Speed Control */}
      <Box w="100%">
        <Text mb={2}>Playback Speed</Text>
        <Slider
          value={speedFactor}
          min={0.5}
          max={2}
          step={0.1}
          onChange={handleSpeedChange}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      {/* Punchline Text */}
      <FormControl>
        <FormLabel>Punchline Text</FormLabel>
        <Input
          value={punchlineText}
          onChange={(e) => setPunchlineText(e.target.value)}
          placeholder="Enter punchline text..."
        />
      </FormControl>

      {/* AI Joke Suggestions */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">AI Joke Suggestions</Text>
          <Button
            leftIcon={<FaRobot />}
            size="sm"
            onClick={generateJokeSuggestions}
            isLoading={isGeneratingSuggestions}
          >
            Generate
          </Button>
        </HStack>
        {aiSuggestions.map((joke, index) => (
          <Box
            key={index}
            p={2}
            bg="gray.50"
            borderRadius="md"
            mb={2}
            cursor="pointer"
            onClick={() => setPunchlineText(joke)}
            _hover={{ bg: 'gray.100' }}
          >
            <Text fontSize="sm">{joke}</Text>
          </Box>
        ))}
      </Box>

      {/* Quick Actions */}
      <HStack w="100%" spacing={2}>
        <Tooltip label="Add Laugh Track">
          <IconButton
            aria-label="Add Laugh Track"
            icon={<FaLaugh />}
            onClick={() => onSoundEffect?.('laugh')}
          />
        </Tooltip>
        <Tooltip label="Speed Up">
          <IconButton
            aria-label="Speed Up"
            icon={<FaFastForward />}
            onClick={() => handleSpeedChange(1.5)}
          />
        </Tooltip>
        <Tooltip label="Add Meme">
          <IconButton
            aria-label="Add Meme"
            icon={<FaImage />}
            onClick={() => onEffectApply?.('memeOverlay', {})}
          />
        </Tooltip>
        <Tooltip label="Scene Flip">
          <IconButton
            aria-label="Scene Flip"
            icon={<FaMagic />}
            onClick={() => onEffectApply?.('sceneFlip', {})}
          />
        </Tooltip>
      </HStack>
    </VStack>
  );
};
