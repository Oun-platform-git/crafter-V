import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react';
import {
  FaDownload,
  FaThumbsUp,
  FaComments,
  FaShare
} from 'react-icons/fa';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface StreamRecordingAnalyticsProps {
  recordingId: string; // recordingId is used for future API calls and debugging
  analytics: {
    views: number;
    uniqueViewers: number;
    averageWatchTime: number;
    peakViewers: number;
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
    viewerRetention: {
      time: number;
      viewers: number;
    }[];
    demographics: {
      label: string;
      value: number;
    }[];
    deviceStats: {
      label: string;
      value: number;
    }[];
    locationData: {
      country: string;
      viewers: number;
      percentage: number;
    }[];
  };
}

export const StreamRecordingAnalytics: React.FC<StreamRecordingAnalyticsProps> = ({
  // recordingId,
  analytics
}) => {
  const [timeRange, setTimeRange] = React.useState('24h');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  return (
    <VStack spacing={6} w="100%">
      {/* Header Controls */}
      <HStack w="100%" justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Recording Analytics
        </Text>
        <HStack>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            w="150px"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </Select>
          <Button leftIcon={<FaDownload />}>Export Data</Button>
        </HStack>
      </HStack>

      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} w="100%">
        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Total Views</StatLabel>
          <StatNumber>{formatNumber(analytics.views)}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>

        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Unique Viewers</StatLabel>
          <StatNumber>{formatNumber(analytics.uniqueViewers)}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            12.5%
          </StatHelpText>
        </Stat>

        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Average Watch Time</StatLabel>
          <StatNumber>{formatDuration(analytics.averageWatchTime)}</StatNumber>
          <StatHelpText>
            <StatArrow type="decrease" />
            5.5%
          </StatHelpText>
        </Stat>

        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <StatLabel>Peak Viewers</StatLabel>
          <StatNumber>{formatNumber(analytics.peakViewers)}</StatNumber>
          <StatHelpText>At 14:35 GMT</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Viewer Retention Graph */}
      <Box
        w="100%"
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Viewer Retention
        </Text>
        <Box h="300px">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.viewerRetention}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => formatDuration(value)}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatNumber(value)}
                labelFormatter={(label) => formatDuration(label as number)}
              />
              <Area
                type="monotone"
                dataKey="viewers"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Engagement Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%">
        {/* Demographics */}
        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Viewer Demographics
          </Text>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.demographics}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.demographics.map((data, index) => (
                    <Cell
                      key={`demographics-${data.label}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Device Distribution */}
        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Device Distribution
          </Text>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.deviceStats}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.deviceStats.map((data, index) => (
                    <Cell
                      key={`deviceStats-${data.label}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Engagement Stats */}
      <Box
        w="100%"
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Engagement Overview
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <VStack
            p={4}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
            align="center"
          >
            <Icon as={FaThumbsUp} color="red.500" boxSize={6} />
            <Text fontWeight="bold">{formatNumber(analytics.engagement.likes)}</Text>
            <Text color={textColor}>Likes</Text>
          </VStack>

          <VStack
            p={4}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
            align="center"
          >
            <Icon as={FaComments} color="blue.500" boxSize={6} />
            <Text fontWeight="bold">
              {formatNumber(analytics.engagement.comments)}
            </Text>
            <Text color={textColor}>Comments</Text>
          </VStack>

          <VStack
            p={4}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
            align="center"
          >
            <Icon as={FaShare} color="green.500" boxSize={6} />
            <Text fontWeight="bold">{formatNumber(analytics.engagement.shares)}</Text>
            <Text color={textColor}>Shares</Text>
          </VStack>
        </SimpleGrid>
      </Box>

      {/* Geographic Distribution */}
      <Box
        w="100%"
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Geographic Distribution
        </Text>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Country</Th>
              <Th isNumeric>Viewers</Th>
              <Th isNumeric>Percentage</Th>
            </Tr>
          </Thead>
          <Tbody>
            {analytics.locationData.map((data) => (
              <Tr key={data.country}>
                <Td>{data.country}</Td>
                <Td isNumeric>{formatNumber(data.viewers)}</Td>
                <Td isNumeric>{data.percentage.toFixed(1)}%</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
};
