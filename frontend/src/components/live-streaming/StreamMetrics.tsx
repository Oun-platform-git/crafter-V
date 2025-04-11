import React, { useMemo } from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Text,
  Flex,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  FaUsers,
  FaChartLine,
  FaClock,
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ViewerHistoryPoint {
  timestamp: number;
  count: number;
}

interface StreamMetricsData {
  viewers: number;
  viewersTrend: number;
  bitrate: number;
  health: 'good' | 'fair' | 'poor';
  buffering: number;
  latency: number;
  duration: number;
  viewerHistory: ViewerHistoryPoint[];
}

interface StreamMetricsProps {
  metrics: StreamMetricsData | null;
}

interface ChartDataPoint {
  timestamp: string;
  count: number;
}

export const StreamMetrics: React.FC<StreamMetricsProps> = ({ metrics }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const chartBorderColor = useColorModeValue('rgb(75, 192, 192)', 'rgb(72, 187, 120)');
  const chartBgColor = useColorModeValue('rgba(75, 192, 192, 0.2)', 'rgba(72, 187, 120, 0.2)');

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'good':
        return 'green';
      case 'fair':
        return 'yellow';
      case 'poor':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDuration = (seconds: number): string => {
    try {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting duration:', error);
      return '00:00:00';
    }
  };

  const formatBitrate = (bits: number): string => {
    try {
      const mbps = bits / 1000000;
      return `${mbps.toFixed(2)} Mbps`;
    } catch (error) {
      console.error('Error formatting bitrate:', error);
      return '0.00 Mbps';
    }
  };

  const processChartData = (data: ViewerHistoryPoint[]): ChartDataPoint[] => {
    try {
      return data.map(point => ({
        timestamp: new Date(point.timestamp).toLocaleTimeString(),
        count: point.count
      }));
    } catch (error) {
      console.error('Error processing chart data:', error);
      return [];
    }
  };

  const { viewerChartData, chartOptions } = useMemo(() => {
    const chartData: ChartDataPoint[] = metrics?.viewerHistory 
      ? processChartData(metrics.viewerHistory)
      : [];

    return {
      viewerChartData: {
        labels: chartData.map(point => point.timestamp),
        datasets: [
          {
            label: 'Viewers',
            data: chartData.map(point => point.count),
            fill: true,
            backgroundColor: chartBgColor,
            borderColor: chartBorderColor,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      } as ChartData<'line'>,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: bgColor,
            titleColor: useColorModeValue('black', 'white'),
            bodyColor: useColorModeValue('black', 'white'),
            borderColor: borderColor,
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: borderColor
            },
            ticks: {
              color: useColorModeValue('black', 'white')
            }
          },
          x: {
            grid: {
              color: borderColor
            },
            ticks: {
              color: useColorModeValue('black', 'white'),
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      } as ChartOptions<'line'>
    };
  }, [metrics?.viewerHistory, bgColor, borderColor, chartBgColor, chartBorderColor]);

  if (!metrics) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="xl" mb={4} />
        <Text color="gray.500">Loading metrics...</Text>
      </Box>
    );
  }

  if (!metrics.viewerHistory || metrics.viewerHistory.length === 0) {
    return (
      <Alert
        status="info"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          No Data Available
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Stream metrics will appear here once data starts flowing.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
        {/* Viewers */}
        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="center" mb={2}>
            <Icon as={FaUsers} mr={2} />
            <StatLabel>Current Viewers</StatLabel>
          </Flex>
          <StatNumber>{metrics.viewers.toLocaleString()}</StatNumber>
          <StatHelpText>
            <StatArrow
              type={metrics.viewersTrend >= 0 ? 'increase' : 'decrease'}
            />
            {Math.abs(metrics.viewersTrend)}%
          </StatHelpText>
        </Stat>

        {/* Bitrate */}
        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="center" mb={2}>
            <Icon as={FaChartLine} mr={2} />
            <StatLabel>Bitrate</StatLabel>
          </Flex>
          <StatNumber>{formatBitrate(metrics.bitrate)}</StatNumber>
          <Progress
            value={(metrics.bitrate / 6000000) * 100}
            size="sm"
            colorScheme="blue"
            borderRadius="full"
          />
        </Stat>

        {/* Health */}
        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="center" mb={2}>
            <Icon
              as={metrics.health === 'good' ? FaCheck : FaExclamationTriangle}
              mr={2}
              color={getHealthColor(metrics.health)}
            />
            <StatLabel>Stream Health</StatLabel>
          </Flex>
          <StatNumber color={getHealthColor(metrics.health)}>
            {metrics.health.charAt(0).toUpperCase() + metrics.health.slice(1)}
          </StatNumber>
          <StatHelpText>
            {metrics.buffering}% buffering
          </StatHelpText>
        </Stat>

        {/* Duration */}
        <Stat
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <Flex align="center" mb={2}>
            <Icon as={FaClock} mr={2} />
            <StatLabel>Stream Duration</StatLabel>
          </Flex>
          <StatNumber>{formatDuration(metrics.duration)}</StatNumber>
          <StatHelpText>
            Latency: {metrics.latency.toFixed(2)}s
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Viewer Trend Chart */}
      <Box
        p={4}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Viewer Trend
        </Text>
        <Box h="300px">
          <Line data={viewerChartData} options={chartOptions} />
        </Box>
      </Box>
    </Box>
  );
};
