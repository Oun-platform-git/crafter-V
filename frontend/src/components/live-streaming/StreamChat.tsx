import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  Icon,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  IconButton,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import {
  FaPaperPlane,
  FaBan,
  FaClock,
  FaTrash,
  FaCrown,
  FaSmile,
  FaSlash
} from 'react-icons/fa';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useAuth } from '../../hooks/useAuth';
import { useStreamChat } from '../../hooks/useStreamChat';

interface StreamChatProps {
  channelId: string;
  isStreaming: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  metadata?: {
    color?: string;
    badges?: string[];
    isHighlighted?: boolean;
  };
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

interface ChatUser {
  id: string;
  roles: UserRole[];
}

export const StreamChat: React.FC<StreamChatProps> = ({
  channelId,
  isStreaming
}) => {
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSlowMode, setIsSlowMode] = useState(false);
  const [slowModeDelay, setSlowModeDelay] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const { user } = useAuth();
  const {
    messages,
    sendMessage,
    banUser,
    timeoutUser,
    deleteMessage,
    enableSlowMode,
    disableSlowMode
  } = useStreamChat(channelId);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const messageColor = useColorModeValue('gray.700', 'gray.300');

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Close emoji picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    // Check slow mode
    if (isSlowMode) {
      const timeSinceLastMessage = Date.now() - lastMessageTime;
      if (timeSinceLastMessage < slowModeDelay * 1000) {
        const timeLeft = Math.ceil((slowModeDelay * 1000 - timeSinceLastMessage) / 1000);
        toast({
          title: 'Slow mode active',
          description: `Please wait ${timeLeft} seconds before sending another message`,
          status: 'warning',
          duration: 3000
        });
        return;
      }
    }

    setIsSending(true);
    try {
      await sendMessage(message);
      setMessage('');
      setLastMessageTime(Date.now());
    } catch (error: unknown) {
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const formatTimestamp = (timestamp: number): string => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid time';
    }
  };

  const handleEnableSlowMode = async (delay: number) => {
    try {
      await enableSlowMode(delay);
      setIsSlowMode(true);
      setSlowModeDelay(delay);
      toast({
        title: 'Slow mode enabled',
        description: `Messages limited to one every ${delay} seconds`,
        status: 'info',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to enable slow mode',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleDisableSlowMode = async () => {
    try {
      await disableSlowMode();
      setIsSlowMode(false);
      setSlowModeDelay(0);
      toast({
        title: 'Slow mode disabled',
        status: 'info',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: 'Failed to disable slow mode',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    }
  };

  const handleModAction = async (action: 'ban' | 'timeout' | 'delete', userId?: string, messageId?: string) => {
    try {
      switch (action) {
        case 'ban':
          if (userId) await banUser(userId);
          break;
        case 'timeout':
          if (userId) await timeoutUser(userId);
          break;
        case 'delete':
          if (messageId) await deleteMessage(messageId);
          break;
      }
      toast({
        title: `User ${action}ed successfully`,
        status: 'success',
        duration: 3000
      });
    } catch (error: unknown) {
      toast({
        title: `Failed to ${action} user`,
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000
      });
    }
  };

  const isModerator = user?.roles?.some(role => 
    role.name === 'moderator' && role.permissions.includes('moderate_chat')
  );

  return (
    <Box
      h="100%"
      maxH="600px"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
    >
      <Flex direction="column" h="100%">
        {/* Chat Header */}
        <Flex
          p={3}
          borderBottomWidth="1px"
          borderColor={borderColor}
          justify="space-between"
          align="center"
        >
          <Text fontWeight="bold">Live Chat</Text>
          {isModerator && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaCrown />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem onClick={() => handleEnableSlowMode(30)}>
                  Enable Slow Mode (30s)
                </MenuItem>
                <MenuItem onClick={handleDisableSlowMode}>
                  Disable Slow Mode
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>

        {/* Chat Messages */}
        <Box
          ref={chatBoxRef}
          flex="1"
          overflowY="auto"
          p={3}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: borderColor,
              borderRadius: '24px',
            },
          }}
        >
          <VStack spacing={2} align="stretch">
            {messages.map((msg: ChatMessage) => (
              <Box
                key={msg.id}
                p={2}
                borderRadius="md"
                bg={msg.metadata?.isHighlighted ? 'blue.50' : 'transparent'}
              >
                <Flex align="start" gap={2}>
                  <Avatar size="xs" name={msg.username} />
                  <Box flex="1">
                    <Flex align="center" gap={1} mb={1}>
                      <Text
                        fontWeight="bold"
                        color={msg.metadata?.color || 'inherit'}
                      >
                        {msg.username}
                      </Text>
                      {msg.metadata?.badges?.map(badge => (
                        <Badge key={badge} colorScheme="purple" variant="solid">
                          {badge}
                        </Badge>
                      ))}
                      <Text fontSize="xs" color="gray.500">
                        {formatTimestamp(msg.timestamp)}
                      </Text>
                    </Flex>
                    <Text color={messageColor}>{msg.content}</Text>
                  </Box>
                  {isModerator && (
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaSlash />}
                        variant="ghost"
                        size="xs"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<FaBan />}
                          onClick={() => handleModAction('ban', msg.userId)}
                        >
                          Ban User
                        </MenuItem>
                        <MenuItem
                          icon={<FaClock />}
                          onClick={() => handleModAction('timeout', msg.userId)}
                        >
                          Timeout (5m)
                        </MenuItem>
                        <MenuItem
                          icon={<FaTrash />}
                          onClick={() => handleModAction('delete', undefined, msg.id)}
                        >
                          Delete Message
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Chat Input */}
        <Box p={3} borderTopWidth="1px" borderColor={borderColor}>
          <Flex gap={2}>
            <Box flex="1" position="relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isSlowMode ? `Slow mode: ${slowModeDelay}s between messages` : "Type a message..."}
                pr="2.5rem"
                isDisabled={!isStreaming}
              />
              <Tooltip label="Add emoji">
                <IconButton
                  aria-label="Add emoji"
                  icon={<FaSmile />}
                  size="sm"
                  position="absolute"
                  right="2"
                  top="50%"
                  transform="translateY(-50%)"
                  variant="ghost"
                  onClick={() => setShowEmoji(!showEmoji)}
                  isDisabled={!isStreaming}
                />
              </Tooltip>
              {showEmoji && (
                <Box
                  ref={emojiPickerRef}
                  position="absolute"
                  bottom="100%"
                  right="0"
                  zIndex="dropdown"
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Box>
              )}
            </Box>
            <IconButton
              aria-label="Send message"
              icon={<FaPaperPlane />}
              onClick={handleSendMessage}
              isDisabled={!isStreaming || !message.trim() || isSending}
              isLoading={isSending}
            />
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};
