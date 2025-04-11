import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Icon,
  Button,
  Badge,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  GridItem,
  Progress,
  Tooltip,
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaTwitter,
  FaChartLine,
  FaClock,
  FaHashtag,
  FaMusic,
  FaVideo,
  FaMagic,
  FaLightbulb,
  FaFire,
  FaRegClock
} from 'react-icons/fa';

interface Trend {
  id: string;
  platform: string;
  title: string;
  type: 'challenge' | 'sound' | 'hashtag' | 'effect';
  popularity: number;
  growth: number;
  duration: string;
  tags: string[];
  description: string;
  examples: string[];
  aiSuggestions: string[];
}

interface TrendPulseProps {
  onTrendSelect?: (trend: Trend) => void;
  onSuggestionApply?: (suggestion: string) => void;
}

export const TrendPulse: React.FC<TrendPulseProps> = ({
  onTrendSelect,
  onSuggestionApply
}) => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: FaYoutube },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook },
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok },
    { id: 'twitter', name: 'Twitter', icon: FaTwitter }
  ];

  // Simulated trend data - in real implementation, this would come from an API
  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoading(true);
      try {
        // Simulated API call
        const mockTrends: Trend[] = [
          {
            id: '1',
            platform: 'youtube',
            title: 'Day in My Life Challenge',
            type: 'challenge',
            popularity: 89,
            growth: 15,
            duration: '30-60s',
            tags: ['dayinmylife', 'routine', 'lifestyle'],
            description: 'Share your daily routine in a creative way',
            examples: ['Morning routine', 'Work day', 'Weekend vibes'],
            aiSuggestions: [
              'Start with a sunrise timelapse',
              'Include 3-5 main activities',
              'End with a reflection moment'
            ]
          },
          {
            id: '2',
            platform: 'tiktok',
            title: 'Transition Magic',
            type: 'effect',
            popularity: 95,
            growth: 25,
            duration: '15-30s',
            tags: ['transition', 'magic', 'editing'],
            description: 'Smooth transitions between scenes using creative effects',
            examples: ['Outfit change', 'Location swap', 'Time shift'],
            aiSuggestions: [
              'Use matching movements',
              'Sync with beat drops',
              'Add color transitions'
            ]
          }
        ];

        setTrends(mockTrends);
        
        // Simulate AI analysis
        const mockAnalysis = {
          recommendations: [
            'Focus on vertical format (9:16)',
            'Keep videos under 60 seconds',
            'Use trending music',
            'Add captions for accessibility'
          ],
          performance: {
            engagement: 85,
            reach: 72,
            virality: 68
          },
          optimization: {
            timing: 'Post between 6-8 PM',
            hashtags: ['#trending', '#viral', '#creative'],
            duration: '45 seconds optimal'
          }
        };
        
        setAiAnalysis(mockAnalysis);
      } catch (error) {
        toast({
          title: 'Error fetching trends',
          status: 'error',
          duration: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [selectedPlatform]);

  const handleTrendSelect = (trend: Trend) => {
    setSelectedTrend(trend);
    onTrendSelect?.(trend);
  };

  const handleSuggestionApply = (suggestion: string) => {
    onSuggestionApply?.(suggestion);
    toast({
      title: 'Suggestion Applied',
      description: suggestion,
      status: 'success',
      duration: 2000
    });
  };

  const renderTrendCard = (trend: Trend) => (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      cursor="pointer"
      onClick={() => handleTrendSelect(trend)}
      _hover={{ shadow: 'md' }}
      bg={selectedTrend?.id === trend.id ? 'blue.50' : bgColor}
    >
      <HStack justify="space-between" mb={2}>
        <HStack>
          <Icon
            as={platforms.find(p => p.id === trend.platform)?.icon}
            color={trend.platform === 'youtube' ? 'red.500' : 'blue.500'}
          />
          <Text fontWeight="bold">{trend.title}</Text>
        </HStack>
        <Badge
          colorScheme={trend.growth > 20 ? 'red' : 'green'}
          variant="solid"
        >
          {trend.growth}% ↑
        </Badge>
      </HStack>

      <Wrap spacing={2} mb={2}>
        {trend.tags.map(tag => (
          <WrapItem key={tag}>
            <Tag size="sm" variant="subtle">
              <TagLeftIcon as={FaHashtag} />
              <TagLabel>{tag}</TagLabel>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      <Text fontSize="sm" color="gray.500" mb={2}>
        {trend.description}
      </Text>

      <HStack justify="space-between">
        <Tag size="sm" variant="outline">
          <TagLeftIcon as={FaRegClock} />
          <TagLabel>{trend.duration}</TagLabel>
        </Tag>
        <Progress
          value={trend.popularity}
          size="sm"
          w="100px"
          colorScheme="blue"
        />
      </HStack>
    </Box>
  );

  const renderAIInsights = () => (
    <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">
          AI Insights
        </Text>

        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <GridItem>
            <Stat bg={statBg} p={4} borderRadius="md">
              <StatLabel>Engagement</StatLabel>
              <StatNumber>{aiAnalysis.performance.engagement}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                23%
              </StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat bg={statBg} p={4} borderRadius="md">
              <StatLabel>Reach</StatLabel>
              <StatNumber>{aiAnalysis.performance.reach}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                15%
              </StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat bg={statBg} p={4} borderRadius="md">
              <StatLabel>Virality</StatLabel>
              <StatNumber>{aiAnalysis.performance.virality}%</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                12%
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        <Box>
          <Text fontWeight="bold" mb={2}>
            Recommendations
          </Text>
          <VStack align="stretch" spacing={2}>
            {aiAnalysis.recommendations.map((rec: string, index: number) => (
              <HStack key={index} justify="space-between">
                <HStack>
                  <Icon as={FaLightbulb} color="yellow.500" />
                  <Text fontSize="sm">{rec}</Text>
                </HStack>
                <Button
                  size="xs"
                  colorScheme="blue"
                  onClick={() => handleSuggestionApply(rec)}
                >
                  Apply
                </Button>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>
            Optimization Tips
          </Text>
          <VStack align="stretch" spacing={2}>
            <HStack>
              <Icon as={FaClock} />
              <Text fontSize="sm">{aiAnalysis.optimization.timing}</Text>
            </HStack>
            <Wrap>
              {aiAnalysis.optimization.hashtags.map((tag: string) => (
                <WrapItem key={tag}>
                  <Tag size="sm">
                    <TagLeftIcon as={FaHashtag} />
                    <TagLabel>{tag}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );

  return (
    <VStack spacing={4} w="100%">
      <HStack w="100%" overflowX="auto" spacing={2} p={2}>
        <Button
          size="sm"
          variant={selectedPlatform === 'all' ? 'solid' : 'outline'}
          onClick={() => setSelectedPlatform('all')}
        >
          All
        </Button>
        {platforms.map(platform => (
          <Button
            key={platform.id}
            size="sm"
            leftIcon={<Icon as={platform.icon} />}
            variant={selectedPlatform === platform.id ? 'solid' : 'outline'}
            onClick={() => setSelectedPlatform(platform.id)}
          >
            {platform.name}
          </Button>
        ))}
      </HStack>

      <Tabs isFitted w="100%">
        <TabList>
          <Tab>Trending</Tab>
          <Tab>AI Insights</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={4}>
              {isLoading ? (
                <Progress size="xs" isIndeterminate w="100%" />
              ) : (
                trends
                  .filter(
                    trend =>
                      selectedPlatform === 'all' ||
                      trend.platform === selectedPlatform
                  )
                  .map(trend => (
                    <Box key={trend.id} w="100%">
                      {renderTrendCard(trend)}
                    </Box>
                  ))
              )}
            </VStack>
          </TabPanel>

          <TabPanel>
            {aiAnalysis && renderAIInsights()}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
