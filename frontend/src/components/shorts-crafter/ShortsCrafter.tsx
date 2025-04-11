import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Button,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Badge
} from '@chakra-ui/react';
import {
  FaVideo,
  FaStopCircle,
  FaMagic,
  FaUpload,
  FaShare,
  FaCog,
  FaUndo,
  FaRedo,
  FaMusic,
  FaHashtag,
  FaPalette
} from 'react-icons/fa';

// Import toolbox components
import { MiniVlogToolbox } from './toolboxes/MiniVlogToolbox';
import { ChallengesToolbox } from './toolboxes/ChallengesToolbox';
import { TutorialsToolbox } from './toolboxes/TutorialsToolbox';
import { ComedySkitsToolbox } from './toolboxes/ComedySkitsToolbox';
import { PetClipsToolbox } from './toolboxes/PetClipsToolbox';
import { TransformationsToolbox } from './toolboxes/TransformationsToolbox';
import { GamingHighlightsToolbox } from './toolboxes/GamingHighlightsToolbox';
import { ReactionsToolbox } from './toolboxes/ReactionsToolbox';
import { MusicDanceToolbox } from './toolboxes/MusicDanceToolbox';
import { EducationalBitesToolbox } from './toolboxes/EducationalBitesToolbox';

// Import core components
import { VideoPreview } from './core/VideoPreview';
import { TimelineEditor } from './core/TimelineEditor';
import { PlatformExport } from './core/PlatformExport';
import { TrendPulse } from './core/TrendPulse';
import { EffectsPanel } from './core/EffectsPanel';

interface ShortsCrafterProps {
  onSave: (videoData: any) => Promise<void>;
  onShare: (platform: string, data: any) => Promise<void>;
}

export const ShortsCrafter: React.FC<ShortsCrafterProps> = ({
  onSave,
  onShare
}) => {
  // State management
  const [selectedMode, setSelectedMode] = useState<string>('record');
  const [selectedToolbox, setSelectedToolbox] = useState<string>('mini-vlog');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Hooks
  const toast = useToast();
  const {
    isOpen: isToolboxOpen,
    onOpen: onToolboxOpen,
    onClose: onToolboxClose
  } = useDisclosure();

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Content type configurations
  const contentTypes = [
    { id: 'mini-vlog', name: 'Mini Vlog', icon: FaVideo },
    { id: 'challenges', name: 'Challenges', icon: FaMagic },
    { id: 'tutorials', name: 'Tutorials', icon: FaVideo },
    { id: 'comedy', name: 'Comedy', icon: FaVideo },
    { id: 'pets', name: 'Pets', icon: FaVideo },
    { id: 'transformations', name: 'Transformations', icon: FaVideo },
    { id: 'gaming', name: 'Gaming', icon: FaVideo },
    { id: 'reactions', name: 'Reactions', icon: FaVideo },
    { id: 'music', name: 'Music', icon: FaMusic },
    { id: 'educational', name: 'Educational', icon: FaVideo }
  ];

  // Platform configurations
  const platforms = [
    { id: 'youtube', name: 'YouTube Shorts', ratio: '9:16' },
    { id: 'instagram', name: 'Instagram Reels', ratio: '9:16' },
    { id: 'facebook', name: 'Facebook Reels', ratio: '9:16' }
  ];

  useEffect(() => {
    // Initialize MediaRecorder when component mounts
    setupMediaRecorder();

    return () => {
      // Cleanup MediaRecorder when component unmounts
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const setupMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: 'video/webm'
        });
        setVideoBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: 'Camera Access Error',
        description: 'Please enable camera access to use Shorts Crafter',
        status: 'error',
        duration: 5000
      });
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && !isRecording) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUndo = () => {
    // Implement undo logic
  };

  const handleRedo = () => {
    // Implement redo logic
  };

  const handleExport = async (platform: string) => {
    try {
      if (!videoBlob) {
        throw new Error('No video recorded');
      }

      // Handle platform-specific export
      await onShare(platform, {
        video: videoBlob,
        platform,
        settings: {
          // Add platform-specific settings
        }
      });

      toast({
        title: 'Export Successful',
        description: `Video exported to ${platform}`,
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export video',
        status: 'error',
        duration: 3000
      });
    }
  };

  return (
    <Box
      w="100%"
      h="100vh"
      bg={bgColor}
      p={4}
    >
      <VStack spacing={4} align="stretch">
        {/* Top Bar */}
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Shorts Crafter
          </Text>
          <HStack spacing={2}>
            <IconButton
              aria-label="Undo"
              icon={<FaUndo />}
              onClick={handleUndo}
              isDisabled={undoStack.length === 0}
            />
            <IconButton
              aria-label="Redo"
              icon={<FaRedo />}
              onClick={handleRedo}
              isDisabled={redoStack.length === 0}
            />
            <Button
              leftIcon={<FaShare />}
              colorScheme="blue"
              onClick={onToolboxOpen}
            >
              Share
            </Button>
          </HStack>
        </HStack>

        {/* Main Content */}
        <HStack spacing={4} align="start">
          {/* Video Preview */}
          <Box
            flex="1"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
          >
            <video
              ref={videoRef}
              style={{
                width: '100%',
                aspectRatio: '9/16',
                backgroundColor: 'black'
              }}
              autoPlay
              muted
              playsInline
            />
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
          </Box>

          {/* Toolbox Panel */}
          <VStack
            w="300px"
            spacing={4}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            bg={bgColor}
          >
            <Tabs w="100%" isFitted>
              <TabList>
                <Tab>Mode</Tab>
                <Tab>Effects</Tab>
                <Tab>Export</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={4}>
                    {contentTypes.map((type) => (
                      <Button
                        key={type.id}
                        w="100%"
                        leftIcon={<type.icon />}
                        onClick={() => setSelectedToolbox(type.id)}
                        variant={selectedToolbox === type.id ? 'solid' : 'outline'}
                      >
                        {type.name}
                      </Button>
                    ))}
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <EffectsPanel />
                </TabPanel>
                <TabPanel>
                  <PlatformExport
                    platforms={platforms}
                    onExport={handleExport}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </HStack>

        {/* Timeline */}
        <Box
          w="100%"
          h="150px"
          borderWidth="1px"
          borderRadius="lg"
          p={4}
        >
          <TimelineEditor />
        </Box>
      </VStack>

      {/* Toolbox Drawer */}
      <Drawer
        isOpen={isToolboxOpen}
        placement="right"
        onClose={onToolboxClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit Toolbox</DrawerHeader>
          <DrawerBody>
            {/* Render selected toolbox component */}
            {selectedToolbox === 'mini-vlog' && <MiniVlogToolbox />}
            {selectedToolbox === 'challenges' && <ChallengesToolbox />}
            {selectedToolbox === 'tutorials' && <TutorialsToolbox />}
            {selectedToolbox === 'comedy' && <ComedySkitsToolbox />}
            {selectedToolbox === 'pets' && <PetClipsToolbox />}
            {selectedToolbox === 'transformations' && <TransformationsToolbox />}
            {selectedToolbox === 'gaming' && <GamingHighlightsToolbox />}
            {selectedToolbox === 'reactions' && <ReactionsToolbox />}
            {selectedToolbox === 'music' && <MusicDanceToolbox />}
            {selectedToolbox === 'educational' && <EducationalBitesToolbox />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
