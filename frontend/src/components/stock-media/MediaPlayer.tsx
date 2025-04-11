import React, { useEffect } from 'react';
import {
  Box,
  IconButton,
  AspectRatio,
  Image,
  Text,
  Flex,
  CloseButton,
  Progress,
  useToast
} from '@chakra-ui/react';
import { FaPlay, FaPause } from 'react-icons/fa';
import { MediaItem } from '../../hooks/useStockMedia';

interface MediaPlayerProps {
  media: MediaItem;
  onClose: () => void;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ media, onClose }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const toast = useToast();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const handlePlayPause = () => {
    try {
      if (media.type === 'music' || media.type === 'sfx') {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            audioRef.current.play().catch((err) => {
              setError('Failed to play audio');
              toast({
                title: 'Playback Error',
                description: err.message || 'Failed to play audio',
                status: 'error',
                duration: 3000,
                isClosable: true,
              });
            });
          }
          setIsPlaying(!isPlaying);
        }
      } else if (media.type === 'video') {
        if (videoRef.current) {
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            videoRef.current.play().catch((err) => {
              setError('Failed to play video');
              toast({
                title: 'Playback Error',
                description: err.message || 'Failed to play video',
                status: 'error',
                duration: 3000,
                isClosable: true,
              });
            });
          }
          setIsPlaying(!isPlaying);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback error occurred');
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const current = e.currentTarget.currentTime;
    const duration = e.currentTarget.duration;
    setProgress((current / duration) * 100);
  };

  return (
    <Box position="relative" borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex justify="space-between" align="center" p={2} bg="gray.100">
        <Text fontWeight="bold" noOfLines={1}>
          {media.title}
        </Text>
        <CloseButton onClick={onClose} />
      </Flex>

      {error && (
        <Text color="red.500" p={2} textAlign="center">
          {error}
        </Text>
      )}

      {(media.type === 'music' || media.type === 'sfx') && (
        <Box p={4}>
          <audio
            ref={audioRef}
            src={media.url}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onError={() => setError('Error loading audio')}
          />
          <Progress value={progress} size="xs" mb={4} />
          <Flex align="center" justify="center">
            <IconButton
              aria-label={isPlaying ? 'Pause' : 'Play'}
              icon={isPlaying ? <FaPause /> : <FaPlay />}
              onClick={handlePlayPause}
              size="lg"
              colorScheme="blue"
              isDisabled={!!error}
            />
          </Flex>
        </Box>
      )}

      {media.type === 'video' && (
        <Box>
          <AspectRatio ratio={16 / 9}>
            <video
              ref={videoRef}
              src={media.url}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onError={() => setError('Error loading video')}
            />
          </AspectRatio>
          <Progress value={progress} size="xs" />
        </Box>
      )}

      {media.type === 'image' && (
        <AspectRatio ratio={16 / 9}>
          <Image
            src={media.url}
            alt={media.title}
            objectFit="cover"
            onError={() => setError('Error loading image')}
            fallback={
              <Flex
                width="100%"
                height="100%"
                bg="gray.100"
                align="center"
                justify="center"
              >
                <Text color="gray.500">Failed to load image</Text>
              </Flex>
            }
          />
        </AspectRatio>
      )}
    </Box>
  );
};
