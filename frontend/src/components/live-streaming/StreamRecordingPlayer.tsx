import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Tooltip,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaExpand,
  FaCompress,
  FaVolumeMute,
  FaVolumeUp,
  FaCut,
  FaSave,
  FaCog,
  FaDownload
} from 'react-icons/fa';

interface StreamRecordingPlayerProps {
  recordingUrl: string;
  onClipCreated: (clip: {
    start: number;
    end: number;
    title: string;
  }) => void;
}

export const StreamRecordingPlayer: React.FC<StreamRecordingPlayerProps> = ({
  recordingUrl,
  onClipCreated
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clipRange, setClipRange] = useState<[number, number]>([0, 0]);
  const [isClipMode, setIsClipMode] = useState(false);
  const [clipTitle, setClipTitle] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setClipRange([0, video.duration]);
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleClipRangeChange = (range: [number, number]) => {
    setClipRange(range);
  };

  const createClip = () => {
    onClipCreated({
      start: clipRange[0],
      end: clipRange[1],
      title: clipTitle
    });
    setIsClipMode(false);
    onClose();
    toast({
      title: 'Clip created',
      description: `Clip "${clipTitle}" has been created`,
      status: 'success',
      duration: 3000
    });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
    >
      <Box position="relative" bg="black">
        <video
          ref={videoRef}
          src={recordingUrl}
          style={{ width: '100%', maxHeight: '70vh' }}
          onClick={togglePlay}
        />

        {/* Video Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.3)"
          opacity={0}
          transition="opacity 0.2s"
          _hover={{ opacity: 1 }}
        >
          <VStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={4}
            spacing={4}
            bg="rgba(0, 0, 0, 0.7)"
          >
            {/* Progress Bar */}
            <Slider
              value={currentTime}
              min={0}
              max={duration}
              onChange={handleSeek}
              w="100%"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>

            {/* Controls */}
            <HStack w="100%" justify="space-between">
              <HStack spacing={2}>
                <IconButton
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  icon={isPlaying ? <FaPause /> : <FaPlay />}
                  onClick={togglePlay}
                />
                <IconButton
                  aria-label="Backward 10s"
                  icon={<FaBackward />}
                  onClick={() => handleSeek(currentTime - 10)}
                />
                <IconButton
                  aria-label="Forward 10s"
                  icon={<FaForward />}
                  onClick={() => handleSeek(currentTime + 10)}
                />
                <IconButton
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  onClick={toggleMute}
                />
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={handleVolumeChange}
                  w="100px"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </HStack>

              <Text color="white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>

              <HStack spacing={2}>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<FaCog />}
                    aria-label="Settings"
                  />
                  <MenuList>
                    <MenuItem onClick={() => setPlaybackSpeed(0.5)}>
                      0.5x Speed
                    </MenuItem>
                    <MenuItem onClick={() => setPlaybackSpeed(1)}>
                      1x Speed
                    </MenuItem>
                    <MenuItem onClick={() => setPlaybackSpeed(1.5)}>
                      1.5x Speed
                    </MenuItem>
                    <MenuItem onClick={() => setPlaybackSpeed(2)}>
                      2x Speed
                    </MenuItem>
                  </MenuList>
                </Menu>
                <IconButton
                  aria-label="Create clip"
                  icon={<FaCut />}
                  onClick={() => {
                    setIsClipMode(true);
                    onOpen();
                  }}
                />
                <IconButton
                  aria-label="Toggle fullscreen"
                  icon={isFullscreen ? <FaCompress /> : <FaExpand />}
                  onClick={toggleFullscreen}
                />
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Clip Creation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Clip</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Clip Title</FormLabel>
                <Input
                  value={clipTitle}
                  onChange={(e) => setClipTitle(e.target.value)}
                  placeholder="Enter clip title..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Time Range</FormLabel>
                <RangeSlider
                  value={clipRange}
                  min={0}
                  max={duration}
                  onChange={handleClipRangeChange}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
                <HStack justify="space-between" mt={2}>
                  <Text>{formatTime(clipRange[0])}</Text>
                  <Text>{formatTime(clipRange[1])}</Text>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={createClip}
              isDisabled={!clipTitle || clipRange[0] === clipRange[1]}
            >
              Create Clip
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
