import React, { useState } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Button,
  useColorModeValue,
  Text,
  HStack,
  Tooltip,
  Icon,
  Divider,
  FormErrorMessage,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import {
  FaSave,
  FaInfoCircle,
  FaGlobe,
  FaLock,
  FaHashtag
} from 'react-icons/fa';

interface StreamSettingsProps {
  onSave: (settings: IStreamSettings) => Promise<void>;
  initialSettings?: IStreamSettings;
  isStreaming: boolean;
}

export type { StreamSettingsProps };

export interface IStreamSettings {
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'private' | 'unlisted';
  maxViewers: number;
  enableChat: boolean;
  chatDelay: number;
  tags: string[];
  ageRestriction: boolean;
  language: string;
}

const StreamSettings: React.FC<StreamSettingsProps> = ({
  onSave,
  initialSettings,
  isStreaming
}) => {
  const [settings, setSettings] = useState<IStreamSettings>(
    initialSettings || {
      title: '',
      description: '',
      category: 'gaming',
      visibility: 'public',
      maxViewers: 0,
      enableChat: true,
      chatDelay: 0,
      tags: [],
      ageRestriction: false,
      language: 'en'
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof IStreamSettings, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  const validateSettings = (): boolean => {
    const newErrors: Partial<Record<keyof IStreamSettings, string>> = {};

    if (!settings.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (settings.chatDelay < 0 || settings.chatDelay > 300) {
      newErrors.chatDelay = 'Chat delay must be between 0 and 300 seconds';
    }

    if (settings.maxViewers < 0) {
      newErrors.maxViewers = 'Max viewers cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    field: keyof IStreamSettings,
    value: string | number | boolean | string[]
  ) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleNumberChange = (field: 'chatDelay' | 'maxViewers', value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      handleChange(field, num);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (settings.tags.length >= 20) {
        toast({
          title: 'Maximum tags reached',
          description: 'You can only add up to 20 tags',
          status: 'warning',
          duration: 3000
        });
        return;
      }
      if (!settings.tags.includes(newTag.trim())) {
        handleChange('tags', [...settings.tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleChange('tags', settings.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        status: 'error',
        duration: 3000
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(settings);
      toast({
        title: 'Settings Saved',
        status: 'success',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: 'Error Saving Settings',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        {/* Basic Settings */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Basic Settings
          </Text>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Stream Title</FormLabel>
              <Input
                value={settings.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="Enter your stream title"
                isDisabled={isStreaming}
              />
              {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                value={settings.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Describe your stream"
                isDisabled={isStreaming}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Category</FormLabel>
              <Select
                value={settings.category}
                onChange={e => handleChange('category', e.target.value)}
                isDisabled={isStreaming}
              >
                <option value="gaming">Gaming</option>
                <option value="irl">IRL</option>
                <option value="music">Music</option>
                <option value="creative">Creative</option>
                <option value="esports">Esports</option>
                <option value="education">Education</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Tags</FormLabel>
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyPress={handleAddTag}
                placeholder="Add tags (press Enter)"
                isDisabled={isStreaming}
              />
              <Wrap mt={2} spacing={2}>
                {settings.tags.map(tag => (
                  <WrapItem key={tag}>
                    <Tag size="md" variant="subtle" colorScheme="blue">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton
                        onClick={() => handleRemoveTag(tag)}
                        isDisabled={isStreaming}
                      />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Privacy Settings */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Privacy Settings
          </Text>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Visibility</FormLabel>
              <HStack>
                <Select
                  value={settings.visibility}
                  onChange={e =>
                    handleChange('visibility', e.target.value as 'public' | 'private' | 'unlisted')
                  }
                  isDisabled={isStreaming}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </Select>
                <Tooltip
                  label={
                    settings.visibility === 'public'
                      ? 'Anyone can watch your stream'
                      : settings.visibility === 'unlisted'
                      ? 'Only people with the link can watch'
                      : 'Only you can watch'
                  }
                >
                  <Box>
                    <Icon
                      as={
                        settings.visibility === 'public'
                          ? FaGlobe
                          : settings.visibility === 'unlisted'
                          ? FaHashtag
                          : FaLock
                      }
                    />
                  </Box>
                </Tooltip>
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Age Restriction</FormLabel>
              <Switch
                isChecked={settings.ageRestriction}
                onChange={e => handleChange('ageRestriction', e.target.checked)}
                isDisabled={isStreaming}
              />
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Chat Settings */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Chat Settings
          </Text>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Enable Chat</FormLabel>
              <Switch
                isChecked={settings.enableChat}
                onChange={e => handleChange('enableChat', e.target.checked)}
              />
            </FormControl>

            <FormControl isInvalid={!!errors.chatDelay}>
              <FormLabel>Chat Delay (seconds)</FormLabel>
              <Input
                type="number"
                value={settings.chatDelay}
                onChange={e => handleNumberChange('chatDelay', e.target.value)}
                min={0}
                max={300}
              />
              {errors.chatDelay && (
                <FormErrorMessage>{errors.chatDelay}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.maxViewers}>
              <FormLabel>Max Viewers</FormLabel>
              <HStack>
                <Input
                  type="number"
                  value={settings.maxViewers}
                  onChange={e => handleNumberChange('maxViewers', e.target.value)}
                  min={0}
                  isDisabled={isStreaming}
                />
                <Tooltip label="0 means unlimited viewers">
                  <Box>
                    <Icon as={FaInfoCircle} />
                  </Box>
                </Tooltip>
              </HStack>
              {errors.maxViewers && (
                <FormErrorMessage>{errors.maxViewers}</FormErrorMessage>
              )}
            </FormControl>
          </VStack>
        </Box>

        <Button
          leftIcon={<FaSave />}
          colorScheme="blue"
          onClick={handleSave}
          isDisabled={isStreaming || isSaving}
          isLoading={isSaving}
          loadingText="Saving..."
        >
          Save Settings
        </Button>
      </VStack>
    </Box>
  );
};

export default StreamSettings;
