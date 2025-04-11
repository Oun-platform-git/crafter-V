import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  IconButton,
  Text,
  Image,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Grid,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import {
  FaSmile,
  FaCog,
  FaUpload,
  FaStar,
  FaCrown,
  FaGem,
  FaHeart,
  FaBolt,
  FaTrophy,
  FaMedal,
  FaShieldAlt
} from 'react-icons/fa';

interface CustomEmote {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface SubscriberBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  months: number;
}

interface ChatUser {
  id: string;
  username: string;
  badges: SubscriberBadge[];
  subscriptionMonths: number;
  isModerator: boolean;
  isVIP: boolean;
}

interface ChatMessage {
  id: string;
  user: ChatUser;
  text: string;
  timestamp: number;
  emotes: CustomEmote[];
}

export const StreamChatAdvanced: React.FC<{
  channelId: string;
  onSendMessage: (message: string) => void;
}> = ({ channelId, onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customEmotes, setCustomEmotes] = useState<CustomEmote[]>([]);
  const [subscriberBadges, setSubscriberBadges] = useState<SubscriberBadge[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isEmotePickerOpen, setIsEmotePickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const {
    isOpen: isEmoteManagerOpen,
    onOpen: onEmoteManagerOpen,
    onClose: onEmoteManagerClose
  } = useDisclosure();

  const {
    isOpen: isBadgeManagerOpen,
    onOpen: onBadgeManagerOpen,
    onClose: onBadgeManagerClose
  } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Default subscriber badges
  const defaultBadges: SubscriberBadge[] = [
    {
      id: '1month',
      name: 'New Subscriber',
      icon: '⭐',
      color: 'gray.500',
      months: 1
    },
    {
      id: '3months',
      name: 'Regular',
      icon: '🌟',
      color: 'blue.500',
      months: 3
    },
    {
      id: '6months',
      name: 'Dedicated',
      icon: '💫',
      color: 'purple.500',
      months: 6
    },
    {
      id: '12months',
      name: 'Veteran',
      icon: '👑',
      color: 'gold',
      months: 12
    }
  ];

  // Default emote categories
  const emoteCategories = [
    'all',
    'general',
    'memes',
    'custom',
    'animated',
    'subscriber'
  ];

  useEffect(() => {
    // Initialize default badges
    setSubscriberBadges(defaultBadges);

    // Load custom emotes (mock data)
    const mockEmotes: CustomEmote[] = [
      {
        id: '1',
        name: 'PogChamp',
        url: '/emotes/pogchamp.png',
        category: 'general'
      },
      {
        id: '2',
        name: 'KEKW',
        url: '/emotes/kekw.png',
        category: 'memes'
      },
      // Add more mock emotes...
    ];
    setCustomEmotes(mockEmotes);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Process message to replace emote codes with actual emotes
    const processedMessage = processEmotes(newMessage);
    
    onSendMessage(processedMessage);
    setNewMessage('');
  };

  const processEmotes = (text: string): string => {
    let processedText = text;
    customEmotes.forEach(emote => {
      const emoteCode = `:${emote.name}:`;
      const emoteImg = `<img src="${emote.url}" alt="${emote.name}" class="chat-emote" />`;
      processedText = processedText.replace(new RegExp(emoteCode, 'g'), emoteImg);
    });
    return processedText;
  };

  const addEmote = (emote: CustomEmote) => {
    setNewMessage(prev => `${prev} :${emote.name}: `);
  };

  const handleEmoteUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Mock upload - in real implementation, upload to your server/CDN
      const emote: CustomEmote = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name.split('.')[0],
        url: URL.createObjectURL(file),
        category: 'custom'
      };

      setCustomEmotes(prev => [...prev, emote]);
      toast({
        title: 'Emote uploaded',
        description: `${emote.name} has been added to your emotes`,
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload emote',
        status: 'error',
        duration: 3000
      });
    }
  };

  const renderUserBadges = (user: ChatUser) => {
    return user.badges.map(badge => (
      <Tooltip key={badge.id} label={`${badge.name} (${badge.months} months)`}>
        <Tag size="sm" colorScheme={badge.color}>
          <TagLeftIcon as={FaCrown} />
          <TagLabel>{badge.icon}</TagLabel>
        </Tag>
      </Tooltip>
    ));
  };

  const renderMessage = (message: ChatMessage) => {
    return (
      <Box
        key={message.id}
        p={2}
        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      >
        <HStack spacing={2} align="start">
          {renderUserBadges(message.user)}
          <Text>
            <Text as="span" fontWeight="bold" color={message.user.isModerator ? 'green.500' : undefined}>
              {message.user.username}
            </Text>
            <Text as="span" ml={2}>
              {message.text}
            </Text>
          </Text>
        </HStack>
      </Box>
    );
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
    >
      {/* Chat Messages */}
      <VStack
        h="400px"
        overflowY="auto"
        p={4}
        spacing={2}
        align="stretch"
      >
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </VStack>

      {/* Chat Input */}
      <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
        <HStack spacing={2}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <Popover
            isOpen={isEmotePickerOpen}
            onClose={() => setIsEmotePickerOpen(false)}
          >
            <PopoverTrigger>
              <IconButton
                aria-label="Emotes"
                icon={<FaSmile />}
                onClick={() => setIsEmotePickerOpen(!isEmotePickerOpen)}
              />
            </PopoverTrigger>
            <PopoverContent>
              <PopoverBody>
                <VStack spacing={4}>
                  <HStack spacing={2} wrap="wrap">
                    {emoteCategories.map(category => (
                      <Button
                        key={category}
                        size="sm"
                        variant={selectedCategory === category ? 'solid' : 'ghost'}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </HStack>
                  <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                    {customEmotes
                      .filter(
                        emote =>
                          selectedCategory === 'all' ||
                          emote.category === selectedCategory
                      )
                      .map(emote => (
                        <Box
                          key={emote.id}
                          cursor="pointer"
                          onClick={() => addEmote(emote)}
                        >
                          <Image
                            src={emote.url}
                            alt={emote.name}
                            boxSize="32px"
                          />
                        </Box>
                      ))}
                  </Grid>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Chat settings"
              icon={<FaCog />}
            />
            <MenuList>
              <MenuItem onClick={onEmoteManagerOpen}>
                Manage Emotes
              </MenuItem>
              <MenuItem onClick={onBadgeManagerOpen}>
                Manage Badges
              </MenuItem>
            </MenuList>
          </Menu>

          <Button colorScheme="blue" onClick={handleSendMessage}>
            Send
          </Button>
        </HStack>
      </Box>

      {/* Emote Manager Modal */}
      <Modal isOpen={isEmoteManagerOpen} onClose={onEmoteManagerClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Emotes</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Upload New Emote</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleEmoteUpload}
                />
              </FormControl>

              <Box w="100%">
                <Text fontWeight="bold" mb={2}>
                  Current Emotes
                </Text>
                <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                  {customEmotes.map(emote => (
                    <Box
                      key={emote.id}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                    >
                      <Image
                        src={emote.url}
                        alt={emote.name}
                        boxSize="48px"
                        mb={2}
                      />
                      <Text fontSize="sm" textAlign="center">
                        {emote.name}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onEmoteManagerClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Badge Manager Modal */}
      <Modal isOpen={isBadgeManagerOpen} onClose={onBadgeManagerClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Subscriber Badges</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              {subscriberBadges.map(badge => (
                <HStack
                  key={badge.id}
                  w="100%"
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Text fontSize="2xl">{badge.icon}</Text>
                  <Box flex="1">
                    <Text fontWeight="bold">{badge.name}</Text>
                    <Text fontSize="sm">{badge.months} months</Text>
                  </Box>
                  <Switch isChecked defaultChecked />
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onBadgeManagerClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
