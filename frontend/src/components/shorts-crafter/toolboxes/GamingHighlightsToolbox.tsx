import React, { useState, useEffect, useRef } from 'react';
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
  TagLeftIcon,
  TagCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Checkbox,
  CheckboxGroup,
  Stack
} from '@chakra-ui/react';
import {
  FaGamepad,
  FaPlay,
  FaPause,
  FaStop,
  FaFlag,
  FaStar,
  FaCog,
  FaRegClock,
  FaRegComments,
  FaShare,
  FaHashtag,
  FaChartLine,
  FaKeyboard,
  FaMouse,
  FaWindowMaximize,
  FaRobot,
  FaTwitch,
  FaYoutube,
  FaDiscord,
  FaStream,
  FaAward,
  FaChartBar
} from 'react-icons/fa';

interface GamingHighlightsToolboxProps {
  onRecordingStart?: (params: any) => void;
  onRecordingStop?: () => void;
  onHighlightMark?: (timestamp: number) => void;
  onEffectApply?: (effect: string, params: any) => void;
  onAudioMix?: (params: any) => void;
  onStreamConnect?: (platform: string) => void;
  onStatsUpdate?: (stats: any) => void;
  onKeyboardOverlay?: (config: any) => void;
}

export const GamingHighlightsToolbox: React.FC<GamingHighlightsToolboxProps> = ({
  onRecordingStart,
  onRecordingStop,
  onHighlightMark,
  onEffectApply,
  onAudioMix,
  onStreamConnect,
  onStatsUpdate,
  onKeyboardOverlay
}) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [gameType, setGameType] = useState('action');
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState(60);
  const [highlights, setHighlights] = useState<Array<{ id: string; timestamp: number }>>([]);
  const [gameAudioLevel, setGameAudioLevel] = useState(0.7);
  const [micAudioLevel, setMicAudioLevel] = useState(0.5);
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamPlatforms, setStreamPlatforms] = useState<string[]>([]);
  const [gameStats, setGameStats] = useState({
    kills: 0,
    score: 0,
    achievements: []
  });
  const [keyboardConfig, setKeyboardConfig] = useState({
    showKeys: true,
    showMouseClicks: true,
    overlayPosition: 'bottom-left'
  });
  const [aiAssistant, setAiAssistant] = useState({
    enabled: false,
    sensitivity: 0.7,
    autoClip: true
  });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const recordingTimer = useRef<NodeJS.Timeout>();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Predefined settings
  const gameTypes = [
    { id: 'action', name: 'Action/FPS' },
    { id: 'sports', name: 'Sports' },
    { id: 'racing', name: 'Racing' },
    { id: 'rpg', name: 'RPG' },
    { id: 'strategy', name: 'Strategy' }
  ];

  const resolutions = [
    { id: '720p', name: '720p HD' },
    { id: '1080p', name: '1080p Full HD' },
    { id: '1440p', name: '1440p QHD' },
    { id: '4k', name: '4K Ultra HD' }
  ];

  const highlightEffects = [
    { id: 'slowmo', name: 'Slow Motion', icon: FaRegClock },
    { id: 'zoom', name: 'Dynamic Zoom', icon: FaExpand },
    { id: 'replay', name: 'Instant Replay', icon: FaRegStar },
    { id: 'commentary', name: 'AI Commentary', icon: FaRegComments }
  ];

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    onRecordingStart?.({
      gameType,
      resolution,
      fps,
      autoHighlight
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    onRecordingStop?.();
  };

  const markHighlight = () => {
    const newHighlight = {
      id: Date.now().toString(),
      timestamp: recordingTime
    };
    setHighlights([...highlights, newHighlight]);
    onHighlightMark?.(recordingTime);

    toast({
      title: 'Highlight Marked',
      description: `Marked at ${recordingTime}s`,
      status: 'success',
      duration: 2000
    });
  };

  const toggleEffect = (effectId: string) => {
    setSelectedEffects(prev =>
      prev.includes(effectId)
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
  };

  const handleAudioMix = () => {
    onAudioMix?.({
      gameAudio: gameAudioLevel,
      micAudio: micAudioLevel
    });
  };

  const analyzeGameplay = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Analysis Complete',
        description: 'Found 3 potential highlights',
        status: 'success',
        duration: 3000
      });
    } finally {
      setIsAnalyzing(false);
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
          leftIcon={isRecording ? <FaVideo /> : <FaGamepad />}
          colorScheme={isRecording ? 'red' : 'blue'}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        <Badge colorScheme={isRecording ? 'red' : 'gray'}>
          {recordingTime}s
        </Badge>
      </HStack>

      {/* Game Settings */}
      <FormControl>
        <FormLabel>Game Type</FormLabel>
        <Select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          icon={<FaGamepad />}
        >
          {gameTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Recording Quality */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <FormControl>
            <FormLabel>Resolution</FormLabel>
            <Select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            >
              {resolutions.map(res => (
                <option key={res.id} value={res.id}>
                  {res.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>FPS</FormLabel>
            <NumberInput
              value={fps}
              onChange={(_, value) => setFps(value)}
              min={30}
              max={240}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </GridItem>
      </Grid>

      {/* Audio Mixing */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Audio Mix</Text>
        <VStack spacing={3}>
          <FormControl>
            <FormLabel>Game Audio</FormLabel>
            <Slider
              value={gameAudioLevel}
              onChange={setGameAudioLevel}
              onChangeEnd={handleAudioMix}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
          <FormControl>
            <FormLabel>Microphone</FormLabel>
            <Slider
              value={micAudioLevel}
              onChange={setMicAudioLevel}
              onChangeEnd={handleAudioMix}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
        </VStack>
      </Box>

      {/* Highlight Controls */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">Highlights</Text>
          <Button
            leftIcon={<FaTrophy />}
            size="sm"
            onClick={markHighlight}
            isDisabled={!isRecording}
          >
            Mark Highlight
          </Button>
        </HStack>
        <Wrap spacing={2}>
          {highlights.map(highlight => (
            <WrapItem key={highlight.id}>
              <Tag
                size="md"
                borderRadius="full"
                variant="subtle"
                colorScheme="yellow"
              >
                <TagLeftIcon as={FaRegFlag} />
                <TagLabel>{highlight.timestamp}s</TagLabel>
                <TagCloseButton
                  onClick={() => setHighlights(highlights.filter(h => h.id !== highlight.id))}
                />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Highlight Effects */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Effects</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          {highlightEffects.map(effect => (
            <GridItem key={effect.id}>
              <Button
                w="100%"
                leftIcon={<effect.icon />}
                variant={selectedEffects.includes(effect.id) ? 'solid' : 'outline'}
                onClick={() => toggleEffect(effect.id)}
                size="sm"
              >
                {effect.name}
              </Button>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* Auto Highlight */}
      <HStack w="100%" justify="space-between">
        <Text>Auto Highlight Detection</Text>
        <Switch
          isChecked={autoHighlight}
          onChange={(e) => setAutoHighlight(e.target.checked)}
          colorScheme="green"
        />
      </HStack>

      {/* AI Analysis */}
      <Button
        w="100%"
        leftIcon={<FaBolt />}
        onClick={analyzeGameplay}
        isLoading={isAnalyzing}
      >
        Analyze Gameplay
      </Button>

      {/* Quick Actions */}
      <HStack w="100%" spacing={2}>
        <Tooltip label="Toggle Mic">
          <IconButton
            aria-label="Toggle Microphone"
            icon={micAudioLevel > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
            onClick={() => setMicAudioLevel(prev => prev > 0 ? 0 : 0.5)}
          />
        </Tooltip>
        <Tooltip label="Focus Mode">
          <IconButton
            aria-label="Focus Mode"
            icon={<FaCrosshairs />}
            onClick={() => onEffectApply?.('focus', {})}
          />
        </Tooltip>
        <Tooltip label="Add Overlay">
          <IconButton
            aria-label="Add Overlay"
            icon={<FaRegLightbulb />}
            onClick={() => onEffectApply?.('overlay', {})}
          />
        </Tooltip>
        <Tooltip label="Trending Effects">
          <IconButton
            aria-label="Trending Effects"
            icon={<FaChartLine />}
            onClick={() => onEffectApply?.('trending', {})}
          />
        </Tooltip>
      </HStack>

      {/* Stream Integration */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Stream Integration</Text>
        <Wrap spacing={2}>
          {[
            { id: 'twitch', name: 'Twitch', icon: FaTwitch },
            { id: 'youtube', name: 'YouTube', icon: FaYoutube },
            { id: 'discord', name: 'Discord', icon: FaDiscord }
          ].map(platform => (
            <WrapItem key={platform.id}>
              <Button
                leftIcon={<platform.icon />}
                variant={streamPlatforms.includes(platform.id) ? 'solid' : 'outline'}
                onClick={() => {
                  const updated = streamPlatforms.includes(platform.id)
                    ? streamPlatforms.filter(p => p !== platform.id)
                    : [...streamPlatforms, platform.id];
                  setStreamPlatforms(updated);
                  onStreamConnect?.(platform.id);
                }}
                size="sm"
              >
                {platform.name}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Game Stats */}
      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
        <Stat>
          <StatLabel>Kills</StatLabel>
          <StatNumber>{gameStats.kills}</StatNumber>
          <StatHelpText>Last 5 mins</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Score</StatLabel>
          <StatNumber>{gameStats.score}</StatNumber>
          <StatHelpText>Current Game</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Achievements</StatLabel>
          <StatNumber>{gameStats.achievements.length}</StatNumber>
          <StatHelpText>Total</StatHelpText>
        </Stat>
      </Grid>

      {/* AI Assistant */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">AI Assistant</Text>
          <Switch
            isChecked={aiAssistant.enabled}
            onChange={(e) => setAiAssistant({ ...aiAssistant, enabled: e.target.checked })}
            colorScheme="purple"
          />
        </HStack>
        {aiAssistant.enabled && (
          <VStack spacing={2}>
            <FormControl>
              <FormLabel>Detection Sensitivity</FormLabel>
              <Slider
                value={aiAssistant.sensitivity}
                onChange={(v) => setAiAssistant({ ...aiAssistant, sensitivity: v })}
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
            <Checkbox
              isChecked={aiAssistant.autoClip}
              onChange={(e) => setAiAssistant({ ...aiAssistant, autoClip: e.target.checked })}
            >
              Auto-clip epic moments
            </Checkbox>
          </VStack>
        )}
      </Box>

      {/* Advanced Settings Button */}
      <Button
        w="100%"
        leftIcon={<FaCog />}
        onClick={onOpen}
        variant="outline"
      >
        Advanced Settings
      </Button>

      {/* Advanced Settings Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Advanced Settings</DrawerHeader>
          <DrawerBody>
            <Tabs>
              <TabList>
                <Tab>Input Overlay</Tab>
                <Tab>Stats</Tab>
                <Tab>Export</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Checkbox
                      isChecked={keyboardConfig.showKeys}
                      onChange={(e) => setKeyboardConfig({
                        ...keyboardConfig,
                        showKeys: e.target.checked
                      })}
                    >
                      Show Keyboard Inputs
                    </Checkbox>
                    <Checkbox
                      isChecked={keyboardConfig.showMouseClicks}
                      onChange={(e) => setKeyboardConfig({
                        ...keyboardConfig,
                        showMouseClicks: e.target.checked
                      })}
                    >
                      Show Mouse Clicks
                    </Checkbox>
                    <FormControl>
                      <FormLabel>Overlay Position</FormLabel>
                      <Select
                        value={keyboardConfig.overlayPosition}
                        onChange={(e) => setKeyboardConfig({
                          ...keyboardConfig,
                          overlayPosition: e.target.value
                        })}
                      >
                        <option value="top-left">Top Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-right">Bottom Right</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <CheckboxGroup>
                      <Stack>
                        <Checkbox value="kills">Show Kills</Checkbox>
                        <Checkbox value="damage">Show Damage</Checkbox>
                        <Checkbox value="score">Show Score</Checkbox>
                        <Checkbox value="achievements">Show Achievements</Checkbox>
                      </Stack>
                    </CheckboxGroup>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel>Export Format</FormLabel>
                      <Select defaultValue="mp4">
                        <option value="mp4">MP4</option>
                        <option value="webm">WebM</option>
                        <option value="gif">GIF</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Quality Preset</FormLabel>
                      <Select defaultValue="high">
                        <option value="high">High Quality</option>
                        <option value="medium">Medium Quality</option>
                        <option value="low">Low Quality</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {isAnalyzing && (
        <Progress size="xs" isIndeterminate w="100%" />
      )}
    </VStack>
  );
};
