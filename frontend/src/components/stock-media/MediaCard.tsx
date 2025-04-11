import React from 'react';
import {
  Box,
  Image,
  Text,
  IconButton,
  Flex,
  Badge,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaDownload,
  FaMusic,
  FaVideo,
  FaImage,
  FaVolumeUp
} from 'react-icons/fa';
import { MediaItem } from '../../hooks/useStockMedia';

interface MediaCardProps {
  media: MediaItem;
  onSelect: (media: MediaItem) => void;
  onFavorite: (id: string) => void;
  onDownload: (id: string) => void;
  isPlaying?: boolean;
  onPlayToggle?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onSelect,
  onFavorite,
  onDownload,
  isPlaying,
  onPlayToggle
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getTypeIcon = () => {
    switch (media.type) {
      case 'music':
        return FaMusic;
      case 'sfx':
        return FaVolumeUp;
      case 'video':
        return FaVideo;
      case 'image':
        return FaImage;
      default:
        return FaMusic;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
        cursor: 'pointer'
      }}
      onClick={() => onSelect(media)}
    >
      <Box position="relative">
        {media.thumbnail ? (
          <Image
            src={media.thumbnail}
            alt={media.title}
            width="100%"
            height="150px"
            objectFit="cover"
            fallback={
              <Flex
                width="100%"
                height="150px"
                bg="gray.100"
                align="center"
                justify="center"
              >
                <Box as={getTypeIcon()} size="40px" color="gray.400" />
              </Flex>
            }
          />
        ) : (
          <Flex
            width="100%"
            height="150px"
            bg="gray.100"
            align="center"
            justify="center"
          >
            <Box as={getTypeIcon()} size="40px" color="gray.400" />
          </Flex>
        )}

        {(media.type === 'music' || media.type === 'sfx') && onPlayToggle && (
          <IconButton
            aria-label={isPlaying ? 'Pause' : 'Play'}
            icon={isPlaying ? <FaPause /> : <FaPlay />}
            position="absolute"
            bottom="2"
            right="2"
            colorScheme="blue"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPlayToggle();
            }}
          />
        )}
      </Box>

      <Box p={4}>
        <Text fontWeight="bold" noOfLines={1} mb={2}>
          {media.title}
        </Text>

        <Flex mb={2} flexWrap="wrap" gap={1}>
          {media.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} colorScheme="blue" variant="subtle">
              {tag}
            </Badge>
          ))}
        </Flex>

        <Flex justify="space-between" align="center" mb={2}>
          {media.duration && (
            <Text fontSize="sm" color="gray.500">
              {formatDuration(media.duration)}
            </Text>
          )}
          {media.bpm && (
            <Text fontSize="sm" color="gray.500">
              {media.bpm} BPM
            </Text>
          )}
        </Flex>

        <Text fontSize="xs" color="gray.500" mb={2}>
          {media.license}
        </Text>

        <Flex justify="space-between" mt={2}>
          <Tooltip label="Add to favorites">
            <IconButton
              aria-label="Add to favorites"
              icon={<FaHeart />}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(media.id);
              }}
            />
          </Tooltip>

          <Tooltip label="Download">
            <IconButton
              aria-label="Download"
              icon={<FaDownload />}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(media.id);
              }}
            />
          </Tooltip>
        </Flex>
      </Box>
    </Box>
  );
};
