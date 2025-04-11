import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  useClipboard,
  Alert,
  AlertIcon,
  Switch,
  FormControl,
  FormLabel,
  Select,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { FaCopy, FaMicrophone, FaCamera } from 'react-icons/fa';

interface StreamControlsProps {
  streamKey: string;
  channelId: string;
  isStreaming: boolean;
}

interface DeviceState {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
}

export const StreamControls: React.FC<StreamControlsProps> = ({
  streamKey,
  channelId,
  isStreaming
}) => {
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  
  const { onCopy } = useClipboard(streamKey);
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [devices, setDevices] = useState<DeviceState>({
    cameras: [],
    microphones: []
  });

  React.useEffect(() => {
    const getDevices = async () => {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const cameras = allDevices.filter(device => device.kind === 'videoinput');
        const microphones = allDevices.filter(device => device.kind === 'audioinput');
        
        setDevices({ cameras, microphones });
        
        // Set default devices if available
        if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
        if (microphones.length > 0) setSelectedMicrophone(microphones[0].deviceId);
      } catch (error: unknown) {
        console.error('Error enumerating devices:', error);
        toast({
          title: 'Failed to get media devices',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          status: 'error',
          duration: 3000
        });
      }
    };

    getDevices();
  }, [toast]);

  const handleDeviceChange = async (deviceId: string, type: 'audio' | 'video') => {
    try {
      if (type === 'audio') {
        setSelectedMicrophone(deviceId);
      } else {
        setSelectedCamera(deviceId);
      }

      // Update stream constraints
      const constraints: MediaStreamConstraints = {
        audio: type === 'audio' ? { deviceId: { exact: deviceId } } : audioEnabled,
        video: type === 'video' ? { deviceId: { exact: deviceId } } : cameraEnabled
      };

      await navigator.mediaDevices.getUserMedia(constraints);
      
      toast({
        title: `${type === 'audio' ? 'Microphone' : 'Camera'} changed`,
        status: 'success',
        duration: 2000
      });
    } catch (error: unknown) {
      toast({
        title: `Failed to change ${type === 'audio' ? 'microphone' : 'camera'}`,
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 2000
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Stream Key */}
      <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <FormControl>
          <FormLabel>Stream Key</FormLabel>
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type={showStreamKey ? "text" : "password"}
              value={streamKey}
              readOnly
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={onCopy}>
                <FaCopy />
              </Button>
            </InputRightElement>
          </InputGroup>
          <Button
            size="xs"
            mt={2}
            variant="ghost"
            onClick={() => setShowStreamKey(!showStreamKey)}
          >
            {showStreamKey ? "Hide" : "Show"} Stream Key
          </Button>
        </FormControl>
      </Box>

      {/* Device Controls */}
      <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="stretch">
          {/* Camera Selection */}
          <FormControl>
            <FormLabel>Camera</FormLabel>
            <HStack>
              <Select
                value={selectedCamera}
                onChange={(e) => handleDeviceChange(e.target.value, 'video')}
                isDisabled={!cameraEnabled || isStreaming}
              >
                {devices.cameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
              </Select>
              <Switch
                isChecked={cameraEnabled}
                onChange={() => setCameraEnabled(!cameraEnabled)}
                isDisabled={isStreaming}
              />
              <FaCamera />
            </HStack>
          </FormControl>

          {/* Microphone Selection */}
          <FormControl>
            <FormLabel>Microphone</FormLabel>
            <HStack>
              <Select
                value={selectedMicrophone}
                onChange={(e) => handleDeviceChange(e.target.value, 'audio')}
                isDisabled={!audioEnabled || isStreaming}
              >
                {devices.microphones.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
              </Select>
              <Switch
                isChecked={audioEnabled}
                onChange={() => setAudioEnabled(!audioEnabled)}
                isDisabled={isStreaming}
              />
              <FaMicrophone />
            </HStack>
          </FormControl>
        </VStack>
      </Box>

      {/* Stream Settings */}
      <Box p={4} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text>Stream Quality</Text>
            <Select defaultValue="1080p" w="200px">
              <option value="1080p">1080p (High Quality)</option>
              <option value="720p">720p (Balanced)</option>
              <option value="480p">480p (Low Bandwidth)</option>
            </Select>
          </HStack>

          <HStack justify="space-between">
            <Text>Bitrate</Text>
            <Select defaultValue="4500" w="200px">
              <option value="6000">6 Mbps (High)</option>
              <option value="4500">4.5 Mbps (Recommended)</option>
              <option value="3000">3 Mbps (Low)</option>
            </Select>
          </HStack>

          <HStack justify="space-between">
            <Text>FPS</Text>
            <Select defaultValue="30" w="200px">
              <option value="60">60 FPS</option>
              <option value="30">30 FPS</option>
            </Select>
          </HStack>
        </VStack>
      </Box>

      {/* Stream Info */}
      {channelId && (
        <Alert status="info">
          <AlertIcon />
          <Text fontSize="sm">
            Channel ID: {channelId}
          </Text>
        </Alert>
      )}
    </VStack>
  );
};
