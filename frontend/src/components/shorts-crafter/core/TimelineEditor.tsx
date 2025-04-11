import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  useColorModeValue,
  Tooltip,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider
} from '@chakra-ui/react';
import {
  FaCut,
  FaPlus,
  FaTrash,
  FaMusic,
  FaFont,
  FaImage,
  FaLayerGroup,
  FaCopy,
  FaPaste,
  FaLock,
  FaLockOpen,
  FaEye,
  FaEyeSlash,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';

interface TimelineClip {
  id: string;
  type: 'video' | 'audio' | 'text' | 'effect';
  startTime: number;
  duration: number;
  layer: number;
  src?: string;
  text?: string;
  isLocked?: boolean;
  isVisible?: boolean;
}

interface TimelineEditorProps {
  duration?: number;
  onClipUpdate?: (clips: TimelineClip[]) => void;
  onTimeUpdate?: (time: number) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  duration = 60,
  onClipUpdate,
  onTimeUpdate
}) => {
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [clipboard, setClipboard] = useState<TimelineClip | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const trackBg = useColorModeValue('gray.100', 'gray.700');
  const clipBg = useColorModeValue('blue.500', 'blue.400');

  useEffect(() => {
    onClipUpdate?.(clips);
  }, [clips]);

  const pixelsPerSecond = 100 * zoom;

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / pixelsPerSecond);

    if (newTime >= 0 && newTime <= duration) {
      setCurrentTime(newTime);
      onTimeUpdate?.(newTime);
    }
  };

  const handleClipMouseDown = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    setSelectedClip(clipId);
    setIsDragging(true);
    setDragStartX(e.clientX);
    
    const clip = clips.find(c => c.id === clipId);
    if (clip) {
      setDragStartTime(clip.startTime);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedClip) return;

    const deltaX = e.clientX - dragStartX;
    const deltaTime = deltaX / pixelsPerSecond;

    setClips(prevClips =>
      prevClips.map(clip => {
        if (clip.id === selectedClip) {
          const newStartTime = Math.max(0, dragStartTime + deltaTime);
          return {
            ...clip,
            startTime: newStartTime
          };
        }
        return clip;
      })
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addClip = (type: 'video' | 'audio' | 'text' | 'effect') => {
    const newClip: TimelineClip = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      startTime: currentTime,
      duration: 5,
      layer: clips.length,
      isLocked: false,
      isVisible: true
    };

    setClips([...clips, newClip]);
  };

  const deleteClip = (clipId: string) => {
    setClips(clips.filter(clip => clip.id !== clipId));
    setSelectedClip(null);
  };

  const splitClip = (clipId: string) => {
    const clipIndex = clips.findIndex(clip => clip.id === clipId);
    if (clipIndex === -1) return;

    const clip = clips[clipIndex];
    const splitPoint = currentTime - clip.startTime;

    if (splitPoint <= 0 || splitPoint >= clip.duration) return;

    const firstHalf: TimelineClip = {
      ...clip,
      duration: splitPoint
    };

    const secondHalf: TimelineClip = {
      ...clip,
      id: Math.random().toString(36).substr(2, 9),
      startTime: currentTime,
      duration: clip.duration - splitPoint
    };

    const newClips = [...clips];
    newClips.splice(clipIndex, 1, firstHalf, secondHalf);
    setClips(newClips);
  };

  const copyClip = (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (clip) {
      setClipboard({ ...clip });
    }
  };

  const pasteClip = () => {
    if (clipboard) {
      const newClip: TimelineClip = {
        ...clipboard,
        id: Math.random().toString(36).substr(2, 9),
        startTime: currentTime
      };
      setClips([...clips, newClip]);
    }
  };

  const toggleClipLock = (clipId: string) => {
    setClips(clips.map(clip =>
      clip.id === clipId
        ? { ...clip, isLocked: !clip.isLocked }
        : clip
    ));
  };

  const toggleClipVisibility = (clipId: string) => {
    setClips(clips.map(clip =>
      clip.id === clipId
        ? { ...clip, isVisible: !clip.isVisible }
        : clip
    ));
  };

  const moveClipLayer = (clipId: string, direction: 'up' | 'down') => {
    const clipIndex = clips.findIndex(clip => clip.id === clipId);
    if (clipIndex === -1) return;

    const newClips = [...clips];
    const clip = newClips[clipIndex];

    if (direction === 'up' && clipIndex > 0) {
      newClips[clipIndex] = newClips[clipIndex - 1];
      newClips[clipIndex - 1] = clip;
    } else if (direction === 'down' && clipIndex < clips.length - 1) {
      newClips[clipIndex] = newClips[clipIndex + 1];
      newClips[clipIndex + 1] = clip;
    }

    setClips(newClips);
  };

  return (
    <VStack
      spacing={2}
      w="100%"
      h="100%"
      bg={bgColor}
      borderRadius="lg"
      p={4}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Timeline controls */}
      <HStack w="100%" justify="space-between">
        <HStack>
          <Menu>
            <MenuButton as={Button} size="sm" leftIcon={<FaPlus />}>
              Add
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FaLayerGroup />} onClick={() => addClip('video')}>
                Video
              </MenuItem>
              <MenuItem icon={<FaMusic />} onClick={() => addClip('audio')}>
                Audio
              </MenuItem>
              <MenuItem icon={<FaFont />} onClick={() => addClip('text')}>
                Text
              </MenuItem>
              <MenuItem icon={<FaImage />} onClick={() => addClip('effect')}>
                Effect
              </MenuItem>
            </MenuList>
          </Menu>
          <IconButton
            aria-label="Split clip"
            icon={<FaCut />}
            size="sm"
            onClick={() => selectedClip && splitClip(selectedClip)}
            isDisabled={!selectedClip}
          />
          <IconButton
            aria-label="Delete clip"
            icon={<FaTrash />}
            size="sm"
            onClick={() => selectedClip && deleteClip(selectedClip)}
            isDisabled={!selectedClip}
          />
        </HStack>

        <HStack>
          <Text fontSize="sm">
            {currentTime.toFixed(2)}s / {duration}s
          </Text>
          <Slider
            value={zoom}
            min={0.1}
            max={2}
            step={0.1}
            w="100px"
            onChange={setZoom}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </HStack>
      </HStack>

      {/* Timeline */}
      <Box
        ref={timelineRef}
        position="relative"
        w="100%"
        h="100%"
        overflowX="auto"
        overflowY="hidden"
        bg={trackBg}
        borderRadius="md"
        onClick={handleTimelineClick}
      >
        {/* Time markers */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="20px"
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
            <Box
              key={i}
              position="absolute"
              left={`${(i * pixelsPerSecond)}px`}
              h="100%"
              w="1px"
              bg={borderColor}
            >
              <Text
                position="absolute"
                top="2px"
                left="4px"
                fontSize="xs"
              >
                {i}s
              </Text>
            </Box>
          ))}
        </Box>

        {/* Clips */}
        {clips.map(clip => (
          <Box
            key={clip.id}
            position="absolute"
            left={`${clip.startTime * pixelsPerSecond}px`}
            top={`${(clip.layer * 40) + 30}px`}
            w={`${clip.duration * pixelsPerSecond}px`}
            h="30px"
            bg={clipBg}
            opacity={clip.isVisible ? 1 : 0.5}
            borderRadius="md"
            cursor={clip.isLocked ? 'not-allowed' : 'move'}
            onMouseDown={(e) => !clip.isLocked && handleClipMouseDown(e, clip.id)}
            _hover={{ opacity: 0.8 }}
          >
            <HStack
              h="100%"
              px={2}
              justify="space-between"
              color="white"
              fontSize="xs"
            >
              <Text>{clip.type}</Text>
              <HStack spacing={1}>
                <IconButton
                  aria-label={clip.isLocked ? 'Unlock' : 'Lock'}
                  icon={clip.isLocked ? <FaLock /> : <FaLockOpen />}
                  size="xs"
                  variant="ghost"
                  onClick={() => toggleClipLock(clip.id)}
                />
                <IconButton
                  aria-label={clip.isVisible ? 'Hide' : 'Show'}
                  icon={clip.isVisible ? <FaEye /> : <FaEyeSlash />}
                  size="xs"
                  variant="ghost"
                  onClick={() => toggleClipVisibility(clip.id)}
                />
              </HStack>
            </HStack>
          </Box>
        ))}

        {/* Playhead */}
        <Box
          ref={playheadRef}
          position="absolute"
          top={0}
          left={`${currentTime * pixelsPerSecond}px`}
          w="2px"
          h="100%"
          bg="red.500"
          zIndex={1}
        />
      </Box>
    </VStack>
  );
};
