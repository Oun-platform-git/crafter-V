import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  HStack,
  VStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Input,
  FormControl,
  FormLabel,
  Switch,
  SimpleGrid,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Progress,
  Badge
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaStop,
  FaUpload,
  FaRegCompass,
  FaShare,
  FaSync,
  FaCog
} from 'react-icons/fa';

// Types
interface DancePreset {
  id: string;
  name: string;
  moves: Array<{
    id: string;
    name: string;
    duration: number;
    intensity: number;
  }>;
  bpm: number;
}

interface DanceEffect {
  id: string;
  name: string;
  type: 'visual' | 'audio';
  intensity: number;
  duration: number;
}

interface DanceMove {
  id: string;
  name: string;
  startBeat: number;
  endBeat: number;
  intensity: number;
  audioEffect?: string;
}

interface AudioEffect {
  id: string;
  name: string;
  value: number;
}

interface MusicTrack {
  id: string;
  name: string;
  bpm: number;
}

interface MusicDanceToolboxProps {
  onBeatSync?: (timestamp: number) => void;
  onEffectApply?: (effectId: string, params: any) => void;
  onMusicUpload?: (file: File) => void;
  onDancePresetApply?: (presetId: string) => void;
  onAudioEffectApply?: (effectId: string, params: { intensity: number }) => void;
  onCollabShare?: (params: any) => void;
}

export const MusicDanceToolbox: React.FC<MusicDanceToolboxProps> = ({
  onBeatSync,
  onEffectApply,
  onMusicUpload,
  onDancePresetApply,
  onAudioEffectApply,
  onCollabShare
}) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [bpm, setBpm] = useState(120);
  const [volume, setVolume] = useState(1);
  const [autoSync, setAutoSync] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<DancePreset | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeEffects, setActiveEffects] = useState<Record<string, boolean>>({});

  // Refs
  const audioContext = useRef<AudioContext | null>(null);
  const audioSource = useRef<AudioBufferSourceNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const waveformCanvas = useRef<HTMLCanvasElement | null>(null);

  // Hooks
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Predefined data
  const musicTracks: MusicTrack[] = [
    { id: 'track1', name: 'Trending Beat 1', bpm: 128 },
    { id: 'track2', name: 'Pop Dance 2', bpm: 130 },
    { id: 'track3', name: 'Hip Hop Flow', bpm: 96 },
    { id: 'track4', name: 'EDM Party', bpm: 140 }
  ];

  const dancePresets: DancePreset[] = [
    {
      id: 'hiphop',
      name: 'Hip Hop Flow',
      moves: [{ id: 'wave', name: 'Wave', duration: 2, intensity: 0.8 }],
      bpm: 128
    },
    {
      id: 'contemporary',
      name: 'Contemporary',
      moves: [{ id: 'flow', name: 'Flow', duration: 3, intensity: 0.7 }],
      bpm: 120
    }
  ];

  const audioEffects: AudioEffect[] = [
    { id: 'reverb', name: 'Reverb', value: 0.3 },
    { id: 'delay', name: 'Delay', value: 0.2 }
  ];

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new AudioContext();
    gainNode.current = audioContext.current.createGain();
    gainNode.current.connect(audioContext.current.destination);

    return () => {
      if (audioContext.current?.state !== 'closed') {
        audioContext.current?.close();
      }
    };
  }, []);

  // Audio file loading
  const loadAudioFile = async (file: File) => {
    if (!audioContext.current) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      if (audioSource.current?.buffer) {
        audioSource.current.stop();
        audioSource.current.disconnect();
      }

      audioSource.current = audioContext.current.createBufferSource();
      audioSource.current.buffer = audioBuffer;
      audioSource.current.connect(gainNode.current!);
      
      setTotalDuration(audioBuffer.duration);
      setSelectedTrack(file.name);

      return audioBuffer;
    } catch (err) {
      console.error('Error loading audio file:', err);
      toast({
        title: 'Error',
        description: 'Failed to load audio file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Playback control
  const togglePlayback = useCallback(() => {
    if (!audioContext.current || !audioSource.current?.buffer) return;

    try {
      if (!isPlaying) {
        audioSource.current = audioContext.current.createBufferSource();
        audioSource.current.buffer = audioSource.current.buffer;
        audioSource.current.connect(gainNode.current!);
        audioSource.current.start(0, currentTime);
        setIsPlaying(true);
      } else {
        audioSource.current?.stop();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
      setIsPlaying(false);
    }
  }, [isPlaying, currentTime]);

  // Volume control
  useEffect(() => {
    if (gainNode.current) {
      gainNode.current.gain.value = volume;
    }
  }, [volume]);

  // Beat detection
  useEffect(() => {
    if (!isPlaying || !autoSync) return;

    const detectBeats = () => {
      const now = audioContext.current?.currentTime || 0;
      const beatInterval = 60 / bpm;
      
      if (now - Math.floor(now / beatInterval) * beatInterval < 0.01) {
        onBeatSync?.(now);
      }
    };

    const intervalId = setInterval(detectBeats, 10);
    return () => clearInterval(intervalId);
  }, [isPlaying, autoSync, bpm, onBeatSync]);

  // File upload handler
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadAudioFile(file).then(() => {
        onMusicUpload?.(file);
        toast({
          title: 'Music Uploaded',
          description: `${file.name} has been loaded`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      });
    }
  }, [onMusicUpload]);

  // Effect handlers
  const handleEffectChange = useCallback((effectId: string, value: number) => {
    onAudioEffectApply?.(effectId, { intensity: value });
  }, [onAudioEffectApply]);

  const handlePresetSelect = useCallback((preset: DancePreset) => {
    setSelectedPreset(preset);
    onDancePresetApply?.(preset.id);
    setBpm(preset.bpm);
  }, [onDancePresetApply]);

  return (
    <VStack spacing={4} w="100%" bg={bgColor} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      {/* Music Selection */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">Music Track</Text>
          <Input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            display="none"
            id="music-upload"
          />
          <Button
            as="label"
            htmlFor="music-upload"
            size="sm"
            leftIcon={<FaUpload />}
          >
            Upload
          </Button>
        </HStack>
        
        {selectedTrack && (
          <Text fontSize="sm" color="gray.600">
            {selectedTrack}
          </Text>
        )}
      </Box>

      {/* BPM Control */}
      <FormControl>
        <FormLabel>BPM</FormLabel>
        <Slider
          value={bpm}
          min={60}
          max={200}
          step={1}
          onChange={setBpm}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Text fontSize="sm" textAlign="right">{bpm} BPM</Text>
      </FormControl>

      {/* Volume Control */}
      <FormControl>
        <FormLabel>Volume</FormLabel>
        <Slider
          value={volume}
          min={0}
          max={1}
          step={0.01}
          onChange={setVolume}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>

      {/* Dance Presets */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Dance Presets</Text>
        <SimpleGrid columns={2} spacing={2}>
          {dancePresets.map(preset => (
            <Button
              key={preset.id}
              size="sm"
              variant="outline"
              onClick={() => handlePresetSelect(preset)}
              leftIcon={<FaRegCompass />}
            >
              {preset.name}
            </Button>
          ))}
        </SimpleGrid>
      </Box>

      {/* Audio Effects */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Audio Effects</Text>
        <SimpleGrid columns={2} spacing={2}>
          {audioEffects.map(effect => (
            <FormControl key={effect.id}>
              <FormLabel>{effect.name}</FormLabel>
              <Slider
                value={effect.value}
                min={0}
                max={1}
                step={0.01}
                onChange={(v) => handleEffectChange(effect.id, v)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
          ))}
        </SimpleGrid>
      </Box>

      {/* Auto Sync */}
      <HStack w="100%" justify="space-between">
        <Text>Auto Beat Sync</Text>
        <Switch
          isChecked={autoSync}
          onChange={(e) => setAutoSync(e.target.checked)}
          colorScheme="green"
        />
      </HStack>

      {/* Playback Controls */}
      <HStack w="100%" spacing={2}>
        <IconButton
          aria-label={isPlaying ? 'Pause' : 'Play'}
          icon={isPlaying ? <FaPause /> : <FaPlay />}
          onClick={togglePlayback}
        />
        <IconButton
          aria-label="Stop"
          icon={<FaStop />}
          onClick={() => {
            audioSource.current?.stop();
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
        <Progress
          flex={1}
          value={(currentTime / totalDuration) * 100}
          size="sm"
          borderRadius="full"
        />
        <Text fontSize="sm">
          {Math.floor(currentTime / 60)}:
          {Math.floor(currentTime % 60).toString().padStart(2, '0')} /
          {Math.floor(totalDuration / 60)}:
          {Math.floor(totalDuration % 60).toString().padStart(2, '0')}
        </Text>
      </HStack>
    </VStack>
  );
};
