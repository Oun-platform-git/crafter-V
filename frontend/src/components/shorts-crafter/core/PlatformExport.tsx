import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Button,
  Text,
  useToast,
  Box,
  Input,
  Textarea,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Progress,
  useColorModeValue,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaHashtag,
  FaGlobe,
  FaUpload,
  FaCopy,
  FaCheck
} from 'react-icons/fa';

interface Platform {
  id: string;
  name: string;
  ratio: string;
  icon: any;
  maxDuration: number;
  maxFileSize: number;
  supportedFormats: string[];
}

interface PlatformExportProps {
  platforms: Platform[];
  onExport: (platform: string, data: any) => Promise<void>;
}

export const PlatformExport: React.FC<PlatformExportProps> = ({
  platforms,
  onExport
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentHashtag, setCurrentHashtag] = useState('');

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const platformConfig: Record<string, Platform> = {
    youtube: {
      id: 'youtube',
      name: 'YouTube Shorts',
      ratio: '9:16',
      icon: FaYoutube,
      maxDuration: 60,
      maxFileSize: 256, // MB
      supportedFormats: ['mp4', 'mov']
    },
    instagram: {
      id: 'instagram',
      name: 'Instagram Reels',
      ratio: '9:16',
      icon: FaInstagram,
      maxDuration: 60,
      maxFileSize: 100,
      supportedFormats: ['mp4']
    },
    facebook: {
      id: 'facebook',
      name: 'Facebook Reels',
      ratio: '9:16',
      icon: FaFacebook,
      maxDuration: 60,
      maxFileSize: 100,
      supportedFormats: ['mp4']
    },
    tiktok: {
      id: 'tiktok',
      name: 'TikTok',
      ratio: '9:16',
      icon: FaTiktok,
      maxDuration: 60,
      maxFileSize: 100,
      supportedFormats: ['mp4']
    }
  };

  const handleHashtagAdd = () => {
    if (currentHashtag && !hashtags.includes(currentHashtag)) {
      setHashtags([...hashtags, currentHashtag]);
      setCurrentHashtag('');
    }
  };

  const handleHashtagRemove = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleExport = async () => {
    if (!selectedPlatform || !title) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000
      });
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      await onExport(selectedPlatform, {
        title,
        description,
        hashtags,
        isPublic,
        platform: selectedPlatform
      });

      setExportProgress(100);
      clearInterval(progressInterval);

      toast({
        title: 'Export Successful',
        description: `Your video has been exported to ${platformConfig[selectedPlatform].name}`,
        status: 'success',
        duration: 5000
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An error occurred during export',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const copyShareLink = () => {
    // Implement share link copy functionality
    toast({
      title: 'Share Link Copied',
      status: 'success',
      duration: 2000
    });
  };

  return (
    <VStack
      spacing={4}
      w="100%"
      bg={bgColor}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      {/* Platform Selection */}
      <FormControl>
        <FormLabel>Select Platform</FormLabel>
        <HStack spacing={2}>
          {Object.values(platformConfig).map(platform => (
            <Tooltip
              key={platform.id}
              label={platform.name}
              placement="top"
            >
              <Button
                variant={selectedPlatform === platform.id ? 'solid' : 'outline'}
                colorScheme={selectedPlatform === platform.id ? 'blue' : 'gray'}
                onClick={() => setSelectedPlatform(platform.id)}
                size="sm"
              >
                <Icon as={platform.icon} boxSize={5} />
              </Button>
            </Tooltip>
          ))}
        </HStack>
      </FormControl>

      {selectedPlatform && (
        <>
          {/* Title */}
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
            />
          </FormControl>

          {/* Description */}
          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={3}
            />
          </FormControl>

          {/* Hashtags */}
          <FormControl>
            <FormLabel>Hashtags</FormLabel>
            <HStack>
              <Input
                value={currentHashtag}
                onChange={(e) => setCurrentHashtag(e.target.value)}
                placeholder="Add hashtag"
                onKeyPress={(e) => e.key === 'Enter' && handleHashtagAdd()}
              />
              <Button
                onClick={handleHashtagAdd}
                leftIcon={<FaHashtag />}
              >
                Add
              </Button>
            </HStack>
            <Wrap mt={2}>
              {hashtags.map(tag => (
                <WrapItem key={tag}>
                  <Tag
                    size="md"
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="blue"
                  >
                    <TagLabel>#{tag}</TagLabel>
                    <TagCloseButton
                      onClick={() => handleHashtagRemove(tag)}
                    />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </FormControl>

          {/* Privacy Setting */}
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">
              Make video public
            </FormLabel>
            <Switch
              isChecked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
          </FormControl>

          {/* Export Progress */}
          {isExporting && (
            <Box w="100%">
              <Progress
                value={exportProgress}
                size="sm"
                colorScheme="blue"
                hasStripe
                isAnimated
              />
              <Text mt={2} fontSize="sm" textAlign="center">
                Exporting to {platformConfig[selectedPlatform].name}...
              </Text>
            </Box>
          )}

          {/* Export Button */}
          <HStack w="100%" spacing={4}>
            <Button
              leftIcon={<FaUpload />}
              colorScheme="blue"
              onClick={handleExport}
              isLoading={isExporting}
              loadingText="Exporting..."
              flex={1}
            >
              Export to {platformConfig[selectedPlatform].name}
            </Button>
            <Button
              leftIcon={<FaCopy />}
              onClick={copyShareLink}
              variant="outline"
            >
              Share
            </Button>
          </HStack>

          {/* Platform Requirements */}
          <Box
            w="100%"
            p={4}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
            fontSize="sm"
          >
            <Text fontWeight="bold" mb={2}>
              Platform Requirements:
            </Text>
            <VStack align="start" spacing={1}>
              <Text>• Aspect Ratio: {platformConfig[selectedPlatform].ratio}</Text>
              <Text>• Max Duration: {platformConfig[selectedPlatform].maxDuration}s</Text>
              <Text>• Max File Size: {platformConfig[selectedPlatform].maxFileSize}MB</Text>
              <Text>• Supported Formats: {platformConfig[selectedPlatform].supportedFormats.join(', ')}</Text>
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  );
};
