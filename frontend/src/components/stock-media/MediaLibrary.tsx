import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Grid,
  Input,
  Select,
  Slider,
  Button,
  Text,
  Icon,
  useToast
} from '@chakra-ui/react';
import { FaMusic, FaVideo, FaImage, FaVolumeUp } from 'react-icons/fa';
import { MediaCard } from './MediaCard';
import { MediaPlayer } from './MediaPlayer';
import { MediaFilters } from './MediaFilters';
import { useStockMedia, MediaItem } from '../../hooks/useStockMedia';
import useDebounce from '../../hooks/useDebounce';

interface MediaFiltersState {
  mood: string[];
  genre: string;
  duration: { min: number; max: number };
  bpm: { min: number; max: number };
  resolution: string;
}

interface MediaLibraryProps {
  onSelect: (media: MediaItem) => void;
  type?: 'music' | 'sfx' | 'video' | 'image';
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, type = 'music' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MediaFiltersState>({
    mood: [],
    genre: '',
    duration: { min: 0, max: 300 },
    bpm: { min: 60, max: 180 },
    resolution: ''
  });
  const [page, setPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const toast = useToast();

  const {
    media,
    loading,
    error,
    hasMore,
    searchMedia,
    addToFavorites,
    downloadMedia
  } = useStockMedia();

  useEffect(() => {
    let isMounted = true;

    const fetchMedia = async () => {
      try {
        await searchMedia({
          type,
          query: debouncedSearch,
          page,
          ...filters
        });
      } catch (err) {
        if (isMounted) {
          toast({
            title: 'Error loading media',
            description: err instanceof Error ? err.message : 'Unknown error occurred',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    };

    fetchMedia();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, filters, page, type, searchMedia, toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (newFilters: MediaFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media);
    onSelect(media);
  };

  const handleFavorite = async (mediaId: string) => {
    try {
      await addToFavorites(mediaId);
      toast({
        title: 'Added to favorites',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding to favorites',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleDownload = async (mediaId: string) => {
    try {
      const { downloadUrl, license } = await downloadMedia(mediaId);
      
      // Create anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${mediaId}-${type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download started',
        description: 'Your file will be downloaded shortly',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error downloading media',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const getTypeIcon = () => {
    switch (type) {
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

  if (error) {
    return (
      <Box p={4}>
        <Text textAlign="center" color="red.500">
          {error instanceof Error ? error.message : 'Error loading media'}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex mb={4} align="center">
        <Icon as={getTypeIcon()} mr={2} />
        <Text fontSize="xl" fontWeight="bold">
          Stock {type.charAt(0).toUpperCase() + type.slice(1)} Library
        </Text>
      </Flex>

      <Flex mb={4}>
        <Input
          placeholder={`Search ${type}...`}
          value={searchQuery}
          onChange={handleSearch}
          mr={4}
        />
        <MediaFilters
          type={type}
          filters={filters}
          onChange={handleFilterChange}
        />
      </Flex>

      {selectedMedia && (
        <Box mb={4}>
          <MediaPlayer
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
          />
        </Box>
      )}

      <Grid
        templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
        gap={4}
        mb={4}
      >
        {media.map((item: MediaItem) => (
          <MediaCard
            key={item.id}
            media={item}
            onSelect={handleMediaSelect}
            onFavorite={handleFavorite}
            onDownload={handleDownload}
          />
        ))}
      </Grid>

      {loading && (
        <Text textAlign="center">Loading...</Text>
      )}

      {hasMore && !loading && (
        <Button
          onClick={handleLoadMore}
          width="100%"
          mt={4}
        >
          Load More
        </Button>
      )}
    </Box>
  );
};
