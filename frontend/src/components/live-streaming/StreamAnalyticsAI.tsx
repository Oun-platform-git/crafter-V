import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Button,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Select,
  Badge,
  Icon,
  Flex,
  Tooltip,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  FaBrain,
  FaChartLine,
  FaLightbulb,
  FaUsers,
  FaClock,
  FaHeart,
  FaComment,
  FaShare,
  FaExclamationTriangle,
  FaCheckCircle,
  FaRocket
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  metric: string;
  value: number;
  trend: number;
  recommendation: string;
  confidence: number;
}

interface ContentAnalysis {
  topic: string;
  sentiment: number;
  engagement: number;
  keywords: string[];
}

interface AudienceSegment {
  name: string;
  size: number;
  engagement: number;
  preferences: string[];
  retentionRate: number;
}

export const StreamAnalyticsAI: React.FC<{
  recordingId: string;
}> = ({ recordingId }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis[]>([]);
  const [audienceSegments, setAudienceSegments] = useState<AudienceSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    // Simulate API calls to AI analytics service
    fetchAIAnalytics();
  }, [timeRange]);

  const fetchAIAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock AI insights
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'success',
          title: 'Peak Engagement Time',
          description: 'Optimal streaming time detected',
          metric: 'Viewer Retention',
          value: 85,
          trend: 12,
          recommendation: 'Schedule future streams between 7-9 PM UTC',
          confidence: 92
        },
        {
          id: '2',
          type: 'warning',
          title: 'Content Pacing',
          description: 'Viewer drop-off detected during slow segments',
          metric: 'Viewer Retention',
          value: 65,
          trend: -8,
          recommendation: 'Consider shorter transitions between topics',
          confidence: 85
        },
        {
          id: '3',
          type: 'info',
          title: 'Chat Engagement',
          description: 'High interaction periods identified',
          metric: 'Chat Activity',
          value: 250,
          trend: 15,
          recommendation: 'Increase viewer interaction during gaming segments',
          confidence: 88
        }
      ];

      // Mock content analysis
      const mockContentAnalysis: ContentAnalysis[] = [
        {
          topic: 'Gaming Strategy',
          sentiment: 0.85,
          engagement: 92,
          keywords: ['tutorial', 'tips', 'gameplay', 'strategy']
        },
        {
          topic: 'Community Interaction',
          sentiment: 0.95,
          engagement: 88,
          keywords: ['chat', 'discussion', 'feedback', 'community']
        },
        {
          topic: 'Technical Setup',
          sentiment: 0.75,
          engagement: 78,
          keywords: ['settings', 'hardware', 'setup', 'configuration']
        }
      ];

      // Mock audience segments
      const mockAudienceSegments: AudienceSegment[] = [
        {
          name: 'Core Gamers',
          size: 45,
          engagement: 92,
          preferences: ['Strategy', 'Competitive', 'Tutorial'],
          retentionRate: 0.85
        },
        {
          name: 'Casual Viewers',
          size: 30,
          engagement: 75,
          preferences: ['Entertainment', 'Chat', 'Community'],
          retentionRate: 0.65
        },
        {
          name: 'Technical Enthusiasts',
          size: 25,
          engagement: 88,
          preferences: ['Setup', 'Hardware', 'Configuration'],
          retentionRate: 0.78
        }
      ];

      setInsights(mockInsights);
      setContentAnalysis(mockContentAnalysis);
      setAudienceSegments(mockAudienceSegments);
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInsightAlert = (insight: AIInsight) => (
    <Alert
      key={insight.id}
      status={insight.type}
      variant="left-accent"
      borderRadius="md"
      mb={4}
    >
      <Box flex="1">
        <AlertTitle mb={2}>
          <HStack>
            <Icon
              as={
                insight.type === 'success'
                  ? FaCheckCircle
                  : insight.type === 'warning'
                  ? FaExclamationTriangle
                  : FaLightbulb
              }
            />
            <Text>{insight.title}</Text>
            <Badge colorScheme="purple">
              {insight.confidence}% confidence
            </Badge>
          </HStack>
        </AlertTitle>
        <AlertDescription>
          <VStack align="start" spacing={2}>
            <Text>{insight.description}</Text>
            <HStack>
              <StatArrow
                type={insight.trend >= 0 ? 'increase' : 'decrease'}
              />
              <Text>
                {Math.abs(insight.trend)}% {insight.trend >= 0 ? 'increase' : 'decrease'}
              </Text>
            </HStack>
            <Text fontWeight="bold">
              Recommendation: {insight.recommendation}
            </Text>
          </VStack>
        </AlertDescription>
      </Box>
    </Alert>
  );

  const renderContentAnalysis = () => (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Content Analysis
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Sentiment & Engagement Radar */}
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={90} data={contentAnalysis}>
              <PolarGrid />
              <PolarAngleAxis dataKey="topic" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Sentiment"
                dataKey="sentiment"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Engagement"
                dataKey="engagement"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* Keywords Analysis */}
        <VStack align="stretch" spacing={4}>
          {contentAnalysis.map((content, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              <Text fontWeight="bold" mb={2}>
                {content.topic}
              </Text>
              <Flex wrap="wrap" gap={2}>
                {content.keywords.map((keyword, kIndex) => (
                  <Badge
                    key={kIndex}
                    colorScheme="blue"
                    variant="subtle"
                  >
                    {keyword}
                  </Badge>
                ))}
              </Flex>
              <Progress
                mt={2}
                value={content.engagement}
                colorScheme="green"
                size="sm"
              />
            </Box>
          ))}
        </VStack>
      </SimpleGrid>
    </Box>
  );

  const renderAudienceSegments = () => (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Audience Segments
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {audienceSegments.map((segment, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="bold">{segment.name}</Text>
                <Badge colorScheme="blue">{segment.size}%</Badge>
              </HStack>
              <Progress
                value={segment.engagement}
                colorScheme="green"
                size="sm"
              />
              <Text fontSize="sm">
                Retention Rate: {(segment.retentionRate * 100).toFixed(1)}%
              </Text>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Preferences
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {segment.preferences.map((pref, pIndex) => (
                    <Badge
                      key={pIndex}
                      colorScheme="purple"
                      variant="subtle"
                    >
                      {pref}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );

  return (
    <VStack spacing={6} w="100%">
      {/* Header Controls */}
      <HStack w="100%" justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          AI-Powered Analytics
        </Text>
        <HStack>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            w="150px"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </Select>
          <Button
            leftIcon={<FaBrain />}
            colorScheme="purple"
            onClick={fetchAIAnalytics}
            isLoading={isLoading}
          >
            Analyze
          </Button>
        </HStack>
      </HStack>

      {/* AI Insights */}
      <Box w="100%">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          AI Insights
        </Text>
        {insights.map(renderInsightAlert)}
      </Box>

      {/* Content Analysis */}
      {renderContentAnalysis()}

      {/* Audience Segments */}
      {renderAudienceSegments()}

      {/* Predictive Analytics */}
      <Box
        w="100%"
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Growth Predictions
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { name: 'Current', viewers: 1000 },
                  { name: '1 Month', viewers: 1500 },
                  { name: '3 Months', viewers: 2500 },
                  { name: '6 Months', viewers: 4000 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="viewers"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <VStack align="stretch" spacing={4}>
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>Growth Potential</AlertTitle>
                <AlertDescription>
                  Based on current trends, expect 300% growth in 6 months with
                  consistent content delivery and engagement.
                </AlertDescription>
              </Box>
            </Alert>
            <Alert status="success">
              <AlertIcon />
              <Box>
                <AlertTitle>Optimization Opportunity</AlertTitle>
                <AlertDescription>
                  Implementing AI recommendations could accelerate growth by an
                  additional 50%.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </SimpleGrid>
      </Box>
    </VStack>
  );
};
