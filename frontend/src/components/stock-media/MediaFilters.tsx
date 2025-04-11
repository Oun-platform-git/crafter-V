import React from 'react';
import {
  Box,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Stack,
  Flex,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  CheckboxGroup,
  Checkbox,
  useColorModeValue
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';

export interface MediaFiltersState {
  mood: string[];
  genre: string;
  duration: { min: number; max: number };
  bpm: { min: number; max: number };
  resolution: string;
}

interface MediaFiltersProps {
  type: 'music' | 'sfx' | 'video' | 'image';
  filters: MediaFiltersState;
  onChange: (filters: MediaFiltersState) => void;
}

const MOODS = [
  'Happy',
  'Sad',
  'Energetic',
  'Calm',
  'Epic',
  'Romantic',
  'Mysterious',
  'Funny'
] as const;

const GENRES = [
  'Pop',
  'Rock',
  'Electronic',
  'Classical',
  'Jazz',
  'Hip Hop',
  'Ambient',
  'Folk'
] as const;

const RESOLUTIONS = [
  '4K (3840x2160)',
  '2K (2560x1440)',
  'Full HD (1920x1080)',
  'HD (1280x720)',
  'SD (854x480)'
] as const;

export const MediaFilters: React.FC<MediaFiltersProps> = ({
  type,
  filters,
  onChange
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleMoodChange = (selectedMoods: string[]) => {
    onChange({ ...filters, mood: selectedMoods });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, genre: e.target.value });
  };

  const handleDurationChange = (values: number[]) => {
    onChange({
      ...filters,
      duration: { min: values[0], max: values[1] }
    });
  };

  const handleBpmChange = (values: number[]) => {
    onChange({
      ...filters,
      bpm: { min: values[0], max: values[1] }
    });
  };

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, resolution: e.target.value });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          leftIcon={<FaFilter />}
          variant="outline"
          size="md"
          aria-label="Open filters"
        >
          Filters {filters.mood.length > 0 && `(${filters.mood.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        width="300px"
        bg={bgColor}
        borderColor={borderColor}
        _focus={{ outline: 'none' }}
      >
        <PopoverArrow />
        <PopoverBody>
          <Stack spacing={4} p={2}>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Mood
              </Text>
              <CheckboxGroup
                value={filters.mood}
                onChange={(value: string[]) => handleMoodChange(value)}
              >
                <Stack spacing={2}>
                  {MOODS.map((mood) => (
                    <Checkbox key={mood} value={mood}>
                      {mood}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </Box>

            {(type === 'music' || type === 'sfx') && (
              <>
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Genre
                  </Text>
                  <Select
                    value={filters.genre}
                    onChange={handleGenreChange}
                    placeholder="All Genres"
                  >
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    Duration
                  </Text>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm">
                      {formatDuration(filters.duration.min)}
                    </Text>
                    <Text fontSize="sm">
                      {formatDuration(filters.duration.max)}
                    </Text>
                  </Flex>
                  <RangeSlider
                    aria-label={['Min duration', 'Max duration']}
                    min={0}
                    max={300}
                    step={5}
                    value={[filters.duration.min, filters.duration.max]}
                    onChange={handleDurationChange}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={2}>
                    BPM
                  </Text>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm">{filters.bpm.min}</Text>
                    <Text fontSize="sm">{filters.bpm.max}</Text>
                  </Flex>
                  <RangeSlider
                    aria-label={['Min BPM', 'Max BPM']}
                    min={60}
                    max={180}
                    step={5}
                    value={[filters.bpm.min, filters.bpm.max]}
                    onChange={handleBpmChange}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                </Box>
              </>
            )}

            {(type === 'video' || type === 'image') && (
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Resolution
                </Text>
                <Select
                  value={filters.resolution}
                  onChange={handleResolutionChange}
                  placeholder="All Resolutions"
                >
                  {RESOLUTIONS.map((resolution) => (
                    <option key={resolution} value={resolution}>
                      {resolution}
                    </option>
                  ))}
                </Select>
              </Box>
            )}
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
