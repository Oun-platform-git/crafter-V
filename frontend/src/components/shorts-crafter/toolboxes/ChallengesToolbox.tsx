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
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagCloseButton,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useToast
} from '@chakra-ui/react';
import {
  FaMusic,
  FaHashtag,
  FaUsers,
  FaTachometerAlt,
  FaMagic,
  FaClock,
  FaVolumeUp,
  FaVideo,
  FaChartLine,
  FaShare,
  FaPlus,
  FaRandom,
  FaStar,
  FaCrown
} from 'react-icons/fa';

interface ChallengesToolboxProps {
  onApplyEffect?: (effect: string, params: any) => void;
  onUpdateMetadata?: (metadata: any) => void;
  onTrendSelect?: (trend: any) => void;
}

export const ChallengesToolbox: React.FC<ChallengesToolboxProps> = ({
  onApplyEffect,
  onUpdateMetadata,
  onTrendSelect
}) => {
  // State management
  const [selectedSound, setSelectedSound] = useState<string>('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [speedRamp, setSpeedRamp] = useState<number>(1);
  const [isCollabMode, setIsCollabMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [countdownStyle, setCountdownStyle] = useState<string>('classic');
  const [trendingEffects, setTrendingEffects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Simulated trending data
  const trendingSounds = [
    { id: 'sound1', name: 'Viral Beat 2025', duration: '30s', popularity: 95 },
    { id: 'sound2', name: 'Challenge Mix', duration: '15s', popularity: 88 },
    { id: 'sound3', name: 'Transition Beat', duration: '45s', popularity: 82 }
  ];

  const challengeTemplates = [
    { id: 'dance', name: 'Dance Off', duration: '30s', difficulty: 'Medium' },
    { id: 'transform', name: 'Quick Change', duration: '15s', difficulty: 'Easy' },
    { id: 'comedy', name: 'Try Not To Laugh', duration: '45s', difficulty: 'Hard' }
  ];

  const effectPacks = {
    glitch: ['digitalGlitch', 'colorShift', 'pixelate'],
    sparkle: ['starSparkle', 'glitter', 'shine'],
    vhs: ['vintage', 'scanlines', 'chromatic']
  };

  useEffect(() => {
    // Simulate fetching trending effects
    const fetchTrendingEffects = async () => {
      setIsLoading(true);
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTrendingEffects([
          'Glitch Transition',
          'Sparkle Overlay',
          'VHS Rewind',
          'Neon Glow',
          'Matrix Rain'
        ]);
      } catch (error) {
        console.error('Error fetching trending effects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingEffects();
  }, []);

  const handleSoundSelect = (soundId: string) => {
    setSelectedSound(soundId);
    const sound = trendingSounds.find(s => s.id === soundId);
    if (sound) {
      onUpdateMetadata?.({ sound: sound.name });
      onApplyEffect?.('sound', { soundId, volume: 1 });
    }
  };

  const handleHashtagAdd = () => {
    if (currentHashtag && !hashtags.includes(currentHashtag)) {
      const newHashtags = [...hashtags, currentHashtag];
      setHashtags(newHashtags);
      setCurrentHashtag('');
      onUpdateMetadata?.({ hashtags: newHashtags });
    }
  };

  const handleSpeedRampChange = (value: number) => {
    setSpeedRamp(value);
    onApplyEffect?.('speedRamp', {
      speed: value,
      smoothing: 0.5,
      syncWithBeat: true
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = challengeTemplates.find(t => t.id === templateId);
    if (template) {
      onApplyEffect?.('challengeTemplate', {
        templateId,
        duration: template.duration
      });
    }
  };

  const handleEffectPackApply = (packName: string) => {
    const effects = effectPacks[packName];
    effects.forEach(effect => {
      onApplyEffect?.('viralEffect', {
        effect,
        intensity: 0.7,
        duration: 1
      });
    });

    toast({
      title: 'Effect Pack Applied',
      description: `Applied ${packName} effect pack`,
      status: 'success',
      duration: 2000
    });
  };

  const toggleCollabMode = () => {
    setIsCollabMode(!isCollabMode);
    if (!isCollabMode) {
      onApplyEffect?.('splitScreen', {
        mode: 'horizontal',
        participants: 2
      });
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
      {/* Trending Sounds */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">Trending Sounds</Text>
          <IconButton
            aria-label="Refresh sounds"
            icon={<FaRandom />}
            size="sm"
            onClick={() => handleSoundSelect(trendingSounds[0].id)}
          />
        </HStack>
        <VStack spacing={2} align="stretch">
          {trendingSounds.map(sound => (
            <Button
              key={sound.id}
              size="sm"
              leftIcon={<FaMusic />}
              variant={selectedSound === sound.id ? 'solid' : 'outline'}
              onClick={() => handleSoundSelect(sound.id)}
              justifyContent="space-between"
            >
              <Text>{sound.name}</Text>
              <Badge colorScheme="red">{sound.popularity}%</Badge>
            </Button>
          ))}
        </VStack>
      </Box>

      {/* Challenge Templates */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Challenge Templates</Text>
        <Select
          value={selectedTemplate}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          placeholder="Select a template"
        >
          {challengeTemplates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name} ({template.duration})
            </option>
          ))}
        </Select>
      </Box>

      {/* Collab Mode */}
      <HStack w="100%" justify="space-between">
        <Text>Collab Mode</Text>
        <Button
          leftIcon={<FaUsers />}
          variant={isCollabMode ? 'solid' : 'outline'}
          colorScheme={isCollabMode ? 'green' : 'gray'}
          onClick={toggleCollabMode}
          size="sm"
        >
          {isCollabMode ? 'Active' : 'Start Collab'}
        </Button>
      </HStack>

      {/* Speed Ramping */}
      <Box w="100%">
        <Text mb={2}>Speed Ramp</Text>
        <Slider
          value={speedRamp}
          min={0.5}
          max={2}
          step={0.1}
          onChange={handleSpeedRampChange}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      {/* Viral Effect Packs */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Viral Effects</Text>
        <Wrap spacing={2}>
          {Object.keys(effectPacks).map(pack => (
            <WrapItem key={pack}>
              <Button
                size="sm"
                leftIcon={<FaMagic />}
                onClick={() => handleEffectPackApply(pack)}
              >
                {pack}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Hashtag Generator */}
      <Box w="100%">
        <Text fontWeight="bold" mb={2}>Trending Hashtags</Text>
        <HStack mb={2}>
          <Input
            value={currentHashtag}
            onChange={(e) => setCurrentHashtag(e.target.value)}
            placeholder="Add hashtag"
            onKeyPress={(e) => e.key === 'Enter' && handleHashtagAdd()}
          />
          <IconButton
            aria-label="Add hashtag"
            icon={<FaPlus />}
            onClick={handleHashtagAdd}
          />
        </HStack>
        <Wrap>
          {hashtags.map(tag => (
            <WrapItem key={tag}>
              <Tag
                size="md"
                borderRadius="full"
                variant="subtle"
                colorScheme="blue"
              >
                <TagLeftIcon as={FaHashtag} />
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton
                  onClick={() => setHashtags(hashtags.filter(t => t !== tag))}
                />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Quick Actions */}
      <HStack w="100%" spacing={2}>
        <Tooltip label="Auto-Sync to Beat">
          <IconButton
            aria-label="Sync to Beat"
            icon={<FaMusic />}
            onClick={() => onApplyEffect?.('beatSync', {})}
          />
        </Tooltip>
        <Tooltip label="Add Countdown">
          <IconButton
            aria-label="Add Countdown"
            icon={<FaClock />}
            onClick={() => onApplyEffect?.('countdown', { style: countdownStyle })}
          />
        </Tooltip>
        <Tooltip label="Duet Mode">
          <IconButton
            aria-label="Duet Mode"
            icon={<FaUsers />}
            onClick={() => onApplyEffect?.('duetMode', {})}
          />
        </Tooltip>
        <Tooltip label="Trending Effects">
          <IconButton
            aria-label="Trending Effects"
            icon={<FaStar />}
            onClick={() => handleEffectPackApply('sparkle')}
          />
        </Tooltip>
      </HStack>

      {/* Loading State */}
      {isLoading && (
        <Progress size="xs" isIndeterminate w="100%" />
      )}
    </VStack>
  );
};
