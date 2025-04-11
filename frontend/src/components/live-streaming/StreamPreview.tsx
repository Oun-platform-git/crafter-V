import React, { useEffect, useRef } from 'react';
import {
  Box,
  AspectRatio,
  Text,
  Flex,
  Icon,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { FaVideoSlash } from 'react-icons/fa';
import { create, PlayerEventType, PlayerError, Player } from 'amazon-ivs-player';

interface StreamPreviewProps {
  isStreaming: boolean;
  channelId: string;
}

export const StreamPreview: React.FC<StreamPreviewProps> = ({
  isStreaming,
  channelId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const toast = useToast();

  useEffect(() => {
    let player: Player | null = null;

    const initPlayer = async () => {
      try {
        if (isStreaming && channelId && videoRef.current) {
          // Initialize IVS player
          player = create({
            wasmWorker: '/amazon-ivs-wasmworker.min.js',
            wasmBinary: '/amazon-ivs-wasmworker.min.wasm'
          });
          playerRef.current = player;

          // Attach player to video element
          player.attachHTMLVideoElement(videoRef.current);

          // Load and play stream
          await player.load(`https://ivs.us-east-1.amazonaws.com/v1/${channelId}/channel/stream.m3u8`);
          await player.play();

          // Handle player events
          player.addEventListener(PlayerEventType.ERROR, (err: PlayerError) => {
            console.error('Player error:', err);
            toast({
              title: 'Stream Error',
              description: err.message,
              status: 'error',
              duration: 5000,
              isClosable: true
            });
          });
        }
      } catch (error: unknown) {
        console.error('Error initializing player:', error);
        toast({
          title: 'Stream Error',
          description: error instanceof Error ? error.message : 'Failed to initialize stream',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    };

    initPlayer();

    return () => {
      if (player) {
        try {
          player.removeEventListener(PlayerEventType.ERROR, () => {});
          player.pause();
          player.delete();
          playerRef.current = null;
        } catch (error) {
          console.error('Error cleaning up player:', error);
        }
      }
    };
  }, [isStreaming, channelId, toast]);

  if (!isStreaming) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        bg={bgColor}
        p={8}
        borderRadius="lg"
        minH="400px"
      >
        <Icon as={FaVideoSlash} w={12} h={12} color={textColor} mb={4} />
        <Text color={textColor} fontSize="lg">
          Stream not started
        </Text>
      </Flex>
    );
  }

  return (
    <Box position="relative">
      <AspectRatio ratio={16 / 9}>
        <video
          ref={videoRef}
          playsInline
          controls
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black'
          }}
        />
      </AspectRatio>

      {/* Stream Quality Indicator */}
      <Box
        position="absolute"
        top={2}
        right={2}
        bg="blackAlpha.700"
        color="white"
        px={2}
        py={1}
        borderRadius="md"
        fontSize="sm"
      >
        1080p
      </Box>

      {/* Live Indicator */}
      <Flex
        position="absolute"
        top={2}
        left={2}
        bg="red.500"
        color="white"
        px={2}
        py={1}
        borderRadius="md"
        fontSize="sm"
        align="center"
      >
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg="white"
          mr={2}
          animation="pulse 2s infinite"
        />
        LIVE
      </Flex>

      <style>
        {`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  );
};
