import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  VStack,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Badge,
  Tooltip,
  Button
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaCompress,
  FaVolumeMute,
  FaVolumeUp,
  FaCrop,
  FaCamera,
  FaMagic
} from 'react-icons/fa';

interface VideoPreviewProps {
  src?: string;
  aspectRatio?: '9:16' | '4:5' | '1:1';
  isRecording?: boolean;
  recordingTime?: number;
  onAspectRatioChange?: (ratio: '9:16' | '4:5' | '1:1') => void;
  onScreenshot?: () => void;
  onApplyEffect?: (effect: string) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  src,
  aspectRatio = '9:16',
  isRecording = false,
  recordingTime = 0,
  onAspectRatioChange,
  onScreenshot,
  onApplyEffect
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bgColor = useColorModeValue('black', 'gray.900');
  const controlsBg = 'rgba(0, 0, 0, 0.7)';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to image and trigger download
    const screenshot = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = screenshot;
    link.download = `screenshot-${Date.now()}.png`;
    link.click();

    if (onScreenshot) {
      onScreenshot();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '9:16':
        return { paddingTop: '177.78%' }; // 16/9 * 100
      case '4:5':
        return { paddingTop: '125%' }; // 5/4 * 100
      case '1:1':
        return { paddingTop: '100%' };
      default:
        return { paddingTop: '177.78%' };
    }
  };

  return (
    <Box
      position="relative"
      width="100%"
      bg={bgColor}
      borderRadius="lg"
      overflow="hidden"
    >
      {/* Aspect ratio container */}
      <Box
        position="relative"
        width="100%"
        {...getAspectRatioStyle()}
      >
        <video
          ref={videoRef}
          src={src}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
          playsInline
        />

        {/* Recording indicator */}
        {isRecording && (
          <Badge
            position="absolute"
            top={4}
            right={4}
            colorScheme="red"
            variant="solid"
          >
            REC {recordingTime}s
          </Badge>
        )}

        {/* Video controls overlay */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={4}
          bg={controlsBg}
          opacity={0}
          transition="opacity 0.2s"
          _hover={{ opacity: 1 }}
        >
          <VStack spacing={2}>
            {/* Seek bar */}
            <Slider
              value={currentTime}
              min={0}
              max={duration}
              onChange={handleSeek}
              size="sm"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>

            {/* Controls */}
            <HStack justify="space-between" width="100%">
              <HStack spacing={2}>
                <IconButton
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  icon={isPlaying ? <FaPause /> : <FaPlay />}
                  onClick={togglePlay}
                  size="sm"
                  variant="ghost"
                  color="white"
                />
                <IconButton
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  color="white"
                />
                <Box width="100px">
                  <Slider
                    value={volume}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={handleVolumeChange}
                    size="sm"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
              </HStack>

              <Text color="white" fontSize="sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>

              <HStack spacing={2}>
                <IconButton
                  aria-label="Take Screenshot"
                  icon={<FaCamera />}
                  onClick={takeScreenshot}
                  size="sm"
                  variant="ghost"
                  color="white"
                />
                <IconButton
                  aria-label="Change Aspect Ratio"
                  icon={<FaCrop />}
                  onClick={() => onAspectRatioChange?.('9:16')}
                  size="sm"
                  variant="ghost"
                  color="white"
                />
                <IconButton
                  aria-label="Toggle Fullscreen"
                  icon={isFullscreen ? <FaCompress /> : <FaExpand />}
                  onClick={toggleFullscreen}
                  size="sm"
                  variant="ghost"
                  color="white"
                />
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Hidden canvas for screenshots */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </Box>
  );
};
