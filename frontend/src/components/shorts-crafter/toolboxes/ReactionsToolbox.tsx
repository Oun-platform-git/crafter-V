import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  useToast,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Textarea,
  Checkbox,
  Stack
} from '@chakra-ui/react';
import {
  FaVideo,
  FaStop,
  FaPlay,
  FaPause,
  FaShare as FaShareIcon,
  FaRegSmile,
  FaRegSurprise,
  FaRegAngry,
  FaRegSadTear,
  FaRegWindowMaximize,
  FaRegWindowRestore,
  FaCog
} from 'react-icons/fa';

// Types
interface RecordingParams {
  layout: string;
  audioMix: AudioMixSettings;
  effects: string[];
  emotionDetection: boolean;
}

interface AudioMixSettings {
  reaction: number;
  original: number;
}

interface Comment {
  id: string;
  text: string;
  timestamp: number;
  emotion?: string;
}

interface EmotionData {
  happy: number;
  surprised: number;
  angry: number;
  sad: number;
}

interface Layout {
  id: string;
  name: string;
  icon: React.ComponentType;
}

interface Effect {
  id: string;
  name: string;
  icon: React.ComponentType;
}

interface ReactionsToolboxProps {
  onRecordingStart?: (params: RecordingParams) => Promise<void>;
  onRecordingStop?: () => Promise<void>;
  onLayoutChange?: (layout: string) => void;
  onEffectApply?: (effect: string, params: any) => void;
  onAudioMix?: (params: AudioMixSettings) => void;
  onEmotionDetect?: (emotion: string) => void;
  onHighlightMark?: (timestamp: number) => void;
  onCommentAdd?: (comment: Comment) => Promise<void>;
}

export const ReactionsToolbox: React.FC<ReactionsToolboxProps> = ({
  onRecordingStart,
  onRecordingStop,
  onLayoutChange,
  onEffectApply,
  onAudioMix,
  onEmotionDetect,
  onHighlightMark,
  onCommentAdd
}) => {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState('sideBySide');
  const [audioMix, setAudioMix] = useState<AudioMixSettings>({
    reaction: 0.8,
    original: 0.6
  });
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData>({
    happy: 0,
    surprised: 0,
    angry: 0,
    sad: 0
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentComment, setCurrentComment] = useState('');
  const [autoEmotionDetect, setAutoEmotionDetect] = useState(true);
  const [highlightMarkers, setHighlightMarkers] = useState<number[]>([]);
  const [showEmotionOverlay, setShowEmotionOverlay] = useState(true);
  const [autoZoom, setAutoZoom] = useState(true);
  const [faceTracking, setFaceTracking] = useState(true);
  const [backgroundBlur, setBackgroundBlur] = useState(true);
  const [emotionEffects, setEmotionEffects] = useState(true);

  // Refs
  const recordingTimer = useRef<NodeJS.Timeout>();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hooks
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Predefined settings
  const layouts: Layout[] = [
    { id: 'sideBySide', name: 'Side by Side', icon: FaRegWindowMaximize },
    { id: 'pip', name: 'Picture in Picture', icon: FaRegWindowRestore }
  ];

  const effects: Effect[] = [
    { id: 'happy', name: 'Happy Effect', icon: FaRegSmile },
    { id: 'surprised', name: 'Surprise Effect', icon: FaRegSurprise },
    { id: 'angry', name: 'Angry Effect', icon: FaRegAngry },
    { id: 'sad', name: 'Sad Effect', icon: FaRegSadTear }
  ];

  // Format time utility
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize video stream
  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          handleError(new Error('Failed to access camera and microphone'));
        });
    }
  }, [isRecording]);

  // Enforce 60-second limit
  useEffect(() => {
    if (recordingTime >= 60) {
      toggleRecording();
      toast({
        title: 'Recording stopped',
        description: 'Maximum recording duration (60 seconds) reached',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [recordingTime]);

  // Enforce 9:16 aspect ratio
  useEffect(() => {
    const enforceAspectRatio = () => {
      if (videoRef.current) {
        const width = videoRef.current.offsetWidth;
        videoRef.current.style.height = `${width * (16/9)}px`;
      }
    };

    window.addEventListener('resize', enforceAspectRatio);
    enforceAspectRatio();
    return () => window.removeEventListener('resize', enforceAspectRatio);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        toggleRecording();
      } else if (e.key === 'm' && e.ctrlKey) {
        e.preventDefault();
        onOpen(); // Open audio mix panel
      } else if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        onOpen(); // Open effects panel
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Error handling
  const handleError = (error: Error) => {
    setError(error.message);
    toast({
      title: 'Error',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  // Recording control
  const toggleRecording = async () => {
    try {
      setIsLoading(true);
      if (!isRecording) {
        const params: RecordingParams = {
          layout: selectedLayout,
          audioMix,
          effects: selectedEffects,
          emotionDetection: autoEmotionDetect
        };
        await onRecordingStart?.(params);
        setIsRecording(true);
        recordingTimer.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        if (recordingTimer.current) {
          clearInterval(recordingTimer.current);
        }
        await onRecordingStop?.();
        setIsRecording(false);
        setRecordingTime(0);
      }
    } catch (err) {
      handleError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Audio mixing with debounce
  const handleAudioMixChange = useCallback(
    debounce((type: 'reaction' | 'original', value: number) => {
      const newMix = { ...audioMix, [type]: value };
      setAudioMix(newMix);
      onAudioMix?.(newMix);
    }, 100),
    [audioMix, onAudioMix]
  );

  // Helper function for debouncing
  function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Comment handling with optimistic updates
  const addComment = async () => {
    if (!currentComment.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      text: currentComment,
      timestamp: recordingTime,
      emotion: Object.entries(emotionData)
        .reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    };

    try {
      setComments(prev => [...prev, newComment]);
      setCurrentComment('');
      await onCommentAdd?.(newComment);
    } catch (err) {
      setComments(prev => prev.filter(c => c.id !== newComment.id));
      handleError(err as Error);
    }
  };

  // Emotion detection
  const detectEmotion = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      // Simulate emotion detection
      const newEmotions = {
        happy: Math.random(),
        surprised: Math.random(),
        angry: Math.random(),
        sad: Math.random()
      };
      setEmotionData(newEmotions);
      
      const strongestEmotion = Object.entries(newEmotions).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];
      onEmotionDetect?.(strongestEmotion);
    } catch (err) {
      handleError(err as Error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onEmotionDetect]);

  // Effect handling
  const toggleEffect = (effectId: string) => {
    setSelectedEffects(prev =>
      prev.includes(effectId)
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
    onEffectApply?.(effectId, { enabled: !selectedEffects.includes(effectId) });
  };

  // Platform-specific export options
  const exportPlatforms = [
    { id: 'youtube', name: 'YouTube Shorts', aspectRatio: '9:16', maxDuration: 60 },
    { id: 'instagram', name: 'Instagram Reels', aspectRatio: '9:16', maxDuration: 60 },
    { id: 'facebook', name: 'Facebook Reels', aspectRatio: '9:16', maxDuration: 60 },
    { id: 'tiktok', name: 'TikTok', aspectRatio: '9:16', maxDuration: 60 }
  ];

  const handleExport = async (platform: string) => {
    try {
      setIsLoading(true);
      // Export logic here
      toast({
        title: 'Export started',
        description: `Exporting video for ${platform}...`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      handleError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={4} w="100%" bg={bgColor} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      {/* Timer Display */}
      <HStack justifyContent="space-between" w="100%">
        <Text fontSize="2xl" fontWeight="bold" color={recordingTime >= 55 ? 'red.500' : undefined}>
          {formatTime(recordingTime)} / 01:00
        </Text>
        {error && (
          <Badge colorScheme="red" fontSize="sm">
            {error}
          </Badge>
        )}
      </HStack>

      {/* Video Preview */}
      <Box w="100%" position="relative" bg="black" borderRadius="md" overflow="hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', aspectRatio: '9/16' }}
        />
        {showEmotionOverlay && (
          <Box
            position="absolute"
            top={2}
            right={2}
            bg="blackAlpha.600"
            p={2}
            borderRadius="md"
          >
            <Text color="white" fontSize="sm">
              Current Emotion: {
                Object.entries(emotionData)
                  .reduce((a, b) => a[1] > b[1] ? a : b)[0]
              }
            </Text>
          </Box>
        )}
      </Box>

      {/* Main Controls */}
      <HStack spacing={4} w="100%" justifyContent="center">
        <Button
          size="lg"
          colorScheme={isRecording ? 'red' : 'blue'}
          leftIcon={isRecording ? <FaStop /> : <FaVideo />}
          onClick={toggleRecording}
          isLoading={isLoading}
          isDisabled={error !== null}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        
        <Menu>
          <MenuButton as={Button} rightIcon={<FaShareIcon />}>
            Export
          </MenuButton>
          <MenuList>
            {exportPlatforms.map(platform => (
              <MenuItem
                key={platform.id}
                onClick={() => handleExport(platform.id)}
                icon={<FaShareIcon />}
              >
                {platform.name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </HStack>

      {/* Settings */}
      <Drawer isOpen={isOpen} onClose={onClose} placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Settings</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              {/* Layout Selection */}
              <FormControl>
                <FormLabel>Layout</FormLabel>
                <Select
                  value={selectedLayout}
                  onChange={(e) => {
                    setSelectedLayout(e.target.value);
                    onLayoutChange?.(e.target.value);
                  }}
                >
                  {layouts.map(layout => (
                    <option key={layout.id} value={layout.id}>
                      {layout.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Audio Mix */}
              <FormControl>
                <FormLabel>Reaction Volume</FormLabel>
                <Slider
                  value={audioMix.reaction}
                  onChange={(v) => handleAudioMixChange('reaction', v)}
                  min={0}
                  max={1}
                  step={0.1}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>

              <FormControl>
                <FormLabel>Original Volume</FormLabel>
                <Slider
                  value={audioMix.original}
                  onChange={(v) => handleAudioMixChange('original', v)}
                  min={0}
                  max={1}
                  step={0.1}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>

              {/* Effects */}
              <FormControl>
                <FormLabel>Effects</FormLabel>
                <Wrap spacing={2}>
                  {effects.map(effect => (
                    <WrapItem key={effect.id}>
                      <Button
                        size="sm"
                        variant={selectedEffects.includes(effect.id) ? 'solid' : 'outline'}
                        onClick={() => toggleEffect(effect.id)}
                        leftIcon={<effect.icon />}
                      >
                        {effect.name}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </FormControl>

              {/* Advanced Settings */}
              <Stack spacing={2}>
                <Checkbox
                  isChecked={autoEmotionDetect}
                  onChange={(e) => setAutoEmotionDetect(e.target.checked)}
                >
                  Auto Emotion Detection
                </Checkbox>
                <Checkbox
                  isChecked={showEmotionOverlay}
                  onChange={(e) => setShowEmotionOverlay(e.target.checked)}
                >
                  Show Emotion Overlay
                </Checkbox>
                <Checkbox
                  isChecked={autoZoom}
                  onChange={(e) => setAutoZoom(e.target.checked)}
                >
                  Auto Zoom
                </Checkbox>
                <Checkbox
                  isChecked={faceTracking}
                  onChange={(e) => setFaceTracking(e.target.checked)}
                >
                  Face Tracking
                </Checkbox>
                <Checkbox
                  isChecked={backgroundBlur}
                  onChange={(e) => setBackgroundBlur(e.target.checked)}
                >
                  Background Blur
                </Checkbox>
                <Checkbox
                  isChecked={emotionEffects}
                  onChange={(e) => setEmotionEffects(e.target.checked)}
                >
                  Emotion Effects
                </Checkbox>
              </Stack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Comments */}
      <Box w="100%">
        <HStack mb={2}>
          <Input
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <Button onClick={addComment}>Add</Button>
        </HStack>
        <VStack align="stretch" maxH="200px" overflowY="auto">
          {comments.map(comment => (
            <HStack key={comment.id} justify="space-between">
              <Text fontSize="sm">{comment.text}</Text>
              <HStack spacing={2}>
                <Badge>{formatTime(comment.timestamp)}</Badge>
                {comment.emotion && (
                  <Tag size="sm" colorScheme="blue">
                    {comment.emotion}
                  </Tag>
                )}
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};
