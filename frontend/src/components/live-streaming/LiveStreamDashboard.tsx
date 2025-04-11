import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import {
  Box,
  Grid,
  Flex,
  Button,
  Text,
  useToast,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react';
import { FaVideo, FaStop, FaDownload, FaChartLine } from 'react-icons/fa';
import { StreamPreview } from './StreamPreview';
import { StreamControls } from './StreamControls';
import { StreamChat } from './StreamChat';
import { StreamMetrics } from './StreamMetrics';
import StreamSettings, { IStreamSettings } from './StreamSettings';
import { useLiveStreaming } from '../../hooks/useLiveStreaming';

interface ChannelConfig {
  resolution: string;
  bitrate: number;
  fps: number;
  codec: string;
}

interface ClipConfig {
  channelId: string;
  startTime: number;
  duration: number;
}

interface ClipInfo {
  id: string;
  url: string;
  status: 'processing' | 'ready' | 'failed';
}

interface ViewerData {
  timestamp: number;
  count: number;
}

interface StreamMetrics {
  viewers: number;
  viewersTrend: number;
  bitrate: number;
  health: 'good' | 'fair' | 'poor';
  buffering: number;
  latency: number;
  duration: number;
  viewerHistory: ViewerData[];
}

export const LiveStreamDashboard: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [channelId, setChannelId] = useState<string>('');
  const [streamKey, setStreamKey] = useState<string>('');
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const [isCreatingClip, setIsCreatingClip] = useState(false);
  const metricsIntervalRef = useRef<NodeJS.Timeout>();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  const {
    createChannel,
    startStream,
    stopStream,
    getMetrics,
    createClip,
    enableRecording
  } = useLiveStreaming();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const newMetrics = await getMetrics(channelId);
        setMetrics(newMetrics);
      } catch (error: unknown) {
        console.error('Error fetching metrics:', error);
        toast({
          title: 'Error fetching metrics',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          status: 'error',
          duration: 3000
        });
      }
    };

    if (isStreaming && channelId) {
      // Initial fetch
      fetchMetrics();
      // Set up interval
      metricsIntervalRef.current = setInterval(fetchMetrics, 5000);
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = undefined;
      }
    };
  }, [isStreaming, channelId, getMetrics, toast]);

  const handleStartStream = async () => {
    try {
      const channelInfo = await createChannel({
        resolution: '1080p',
        bitrate: 4500000,
        fps: 30,
        codec: 'h264'
      });

      setChannelId(channelInfo.channelId);
      setStreamKey(channelInfo.streamKey);

      await startStream(channelInfo.channelId);
      setIsStreaming(true);

      toast({
        title: 'Stream started',
        status: 'success',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to start stream',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleStopStream = async () => {
    try {
      await stopStream(channelId);
      setIsStreaming(false);
      setMetrics(null);
      toast({
        title: 'Stream stopped',
        status: 'success',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to stop stream',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleCreateClip = async () => {
    if (isCreatingClip) return;

    setIsCreatingClip(true);
    try {
      const clip = await createClip({
        channelId,
        startTime: Date.now() - 30000, // Last 30 seconds
        duration: 30
      });

      toast({
        title: 'Clip created',
        description: 'Your clip is being processed. You will be notified when it\'s ready.',
        status: 'success',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to create clip',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsCreatingClip(false);
    }
  };

  const handleSaveSettings = async (settings: IStreamSettings) => {
    try {
      if (settings.enableRecording) {
        await enableRecording(channelId);
      }
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to save settings',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Box p={4}>
      <Grid templateColumns="3fr 1fr" gap={4}>
        <Box>
          <Box
            bg={bgColor}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="base"
            mb={4}
          >
            <StreamPreview
              isStreaming={isStreaming}
              channelId={channelId}
            />
          </Box>

          <Flex justify="space-between" mb={4}>
            <Button
              leftIcon={isStreaming ? <FaStop /> : <FaVideo />}
              colorScheme={isStreaming ? 'red' : 'green'}
              onClick={isStreaming ? handleStopStream : handleStartStream}
            >
              {isStreaming ? 'Stop Stream' : 'Start Stream'}
            </Button>

            {isStreaming && (
              <>
                <Button
                  leftIcon={<FaDownload />}
                  onClick={handleCreateClip}
                  ml={2}
                  isLoading={isCreatingClip}
                  loadingText="Creating..."
                >
                  Create Clip
                </Button>
                <Badge
                  colorScheme="green"
                  display="flex"
                  alignItems="center"
                  px={3}
                  ml={2}
                >
                  Live
                </Badge>
              </>
            )}
          </Flex>

          <Tabs variant="enclosed">
            <TabList>
              <Tab>Stream Info</Tab>
              <Tab>Settings</Tab>
              <Tab>Analytics</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <StreamControls
                  streamKey={streamKey}
                  channelId={channelId}
                  isStreaming={isStreaming}
                />
              </TabPanel>
              <TabPanel>
                <StreamSettings
                  onSave={handleSaveSettings}
                  isStreaming={isStreaming}
                  initialSettings={{
                    title: '',
                    description: '',
                    category: 'gaming',
                    visibility: 'public',
                    maxViewers: 0,
                    enableChat: true,
                    chatDelay: 0,
                    tags: [],
                    ageRestriction: false,
                    language: 'en',
                    enableRecording: false
                  }}
                />
              </TabPanel>
              <TabPanel>
                <StreamMetrics metrics={metrics} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <Box>
          <StreamChat
            channelId={channelId}
            isStreaming={isStreaming}
          />
        </Box>
      </Grid>
    </Box>
  );
};
