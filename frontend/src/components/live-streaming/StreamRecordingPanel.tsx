import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Icon,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Tooltip,
  Progress,
  IconButton,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  Switch,
  useDisclosure
} from '@chakra-ui/react';
import {
  FaRecordVinyl,
  FaStop,
  FaDownload,
  FaTrash,
  FaCog,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useStreamRecording } from '../../hooks/useStreamRecording';

interface StreamRecordingPanelProps {
  channelId: string;
  isStreaming: boolean;
}

interface RecordingConfig {
  format: 'MP4' | 'HLS';
  quality: 'HIGH' | 'STANDARD';
  retention: number;
  outputSettings?: {
    resolution?: string;
    bitrate?: number;
    codec?: string;
  };
}

export const StreamRecordingPanel: React.FC<StreamRecordingPanelProps> = ({
  channelId,
  isStreaming
}) => {
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [config, setConfig] = useState<RecordingConfig>({
    format: 'MP4',
    quality: 'HIGH',
    retention: 30,
    outputSettings: {
      resolution: '1080p',
      bitrate: 6000000,
      codec: 'H264'
    }
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    startRecording,
    stopRecording,
    getRecordings,
    deleteRecording,
    downloadRecording
  } = useStreamRecording();

  useEffect(() => {
    loadRecordings();
  }, [channelId]);

  const loadRecordings = async () => {
    try {
      const data = await getRecordings(channelId);
      setRecordings(data);
    } catch (error) {
      toast({
        title: 'Error loading recordings',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleStartRecording = async () => {
    try {
      const recording = await startRecording(channelId, config);
      setActiveRecordingId(recording.id);
      toast({
        title: 'Recording started',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Failed to start recording',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleStopRecording = async () => {
    if (!activeRecordingId) return;

    try {
      await stopRecording(activeRecordingId);
      setActiveRecordingId(null);
      loadRecordings();
      toast({
        title: 'Recording stopped',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Failed to stop recording',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDeleteRecording = async (recordingId: string) => {
    try {
      await deleteRecording(recordingId);
      loadRecordings();
      toast({
        title: 'Recording deleted',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Failed to delete recording',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDownload = async (recordingId: string) => {
    try {
      await downloadRecording(recordingId);
      toast({
        title: 'Download started',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Failed to download recording',
        status: 'error',
        duration: 3000
      });
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}:${minutes % 60}:${seconds % 60}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  return (
    <Box>
      {/* Recording Controls */}
      <Box
        p={4}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        mb={4}
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">
              Stream Recording
            </Text>
            <IconButton
              aria-label="Recording settings"
              icon={<FaCog />}
              variant="ghost"
              onClick={onOpen}
            />
          </HStack>

          <HStack>
            {!activeRecordingId ? (
              <Button
                leftIcon={<FaRecordVinyl />}
                colorScheme="red"
                onClick={handleStartRecording}
                isDisabled={!isStreaming}
              >
                Start Recording
              </Button>
            ) : (
              <Button
                leftIcon={<FaStop />}
                onClick={handleStopRecording}
              >
                Stop Recording
              </Button>
            )}
          </HStack>

          {activeRecordingId && (
            <HStack>
              <Icon as={FaRecordVinyl} color="red.500" />
              <Text>Recording in progress...</Text>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Recordings List */}
      <Box
        p={4}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Recorded Sessions
          </Text>

          {recordings.map((recording) => (
            <Box
              key={recording.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontWeight="bold">
                      Recording {recording.id.slice(0, 8)}
                    </Text>
                    <Badge
                      colorScheme={
                        recording.status === 'completed'
                          ? 'green'
                          : recording.status === 'processing'
                          ? 'yellow'
                          : 'red'
                      }
                    >
                      {recording.status}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Duration: {formatDuration(recording.duration || 0)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Size: {formatFileSize(recording.size || 0)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Format: {recording.format}
                  </Text>
                </VStack>

                <HStack>
                  {recording.status === 'completed' && (
                    <Tooltip label="Download">
                      <IconButton
                        aria-label="Download recording"
                        icon={<FaDownload />}
                        onClick={() => handleDownload(recording.id)}
                      />
                    </Tooltip>
                  )}
                  <Tooltip label="Delete">
                    <IconButton
                      aria-label="Delete recording"
                      icon={<FaTrash />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteRecording(recording.id)}
                    />
                  </Tooltip>
                </HStack>
              </HStack>

              {recording.status === 'processing' && (
                <Progress
                  mt={4}
                  size="sm"
                  isIndeterminate
                  colorScheme="blue"
                />
              )}
            </Box>
          ))}

          {recordings.length === 0 && (
            <Text color="gray.500" textAlign="center">
              No recordings available
            </Text>
          )}
        </VStack>
      </Box>

      {/* Settings Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recording Settings</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Format</FormLabel>
                <Select
                  value={config.format}
                  onChange={(e) =>
                    setConfig({ ...config, format: e.target.value as 'MP4' | 'HLS' })
                  }
                >
                  <option value="MP4">MP4</option>
                  <option value="HLS">HLS</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Quality</FormLabel>
                <Select
                  value={config.quality}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      quality: e.target.value as 'HIGH' | 'STANDARD'
                    })
                  }
                >
                  <option value="HIGH">High</option>
                  <option value="STANDARD">Standard</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Resolution</FormLabel>
                <Select
                  value={config.outputSettings?.resolution}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      outputSettings: {
                        ...config.outputSettings,
                        resolution: e.target.value
                      }
                    })
                  }
                >
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Retention Period (days)</FormLabel>
                <Select
                  value={config.retention}
                  onChange={(e) =>
                    setConfig({ ...config, retention: parseInt(e.target.value) })
                  }
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
