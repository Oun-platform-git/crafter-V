import React, { useState } from 'react';
import {
  Box,
  VStack,
  Button,
  Input,
  Text,
  Progress,
  useColorModeValue,
  IconButton,
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
  HStack,
  CloseButton,
  Badge,
  Flex,
  Tooltip,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FaPoll,
  FaBullhorn,
  FaPlus,
  FaClock,
  FaCheck,
  FaTimes,
  FaChartBar
} from 'react-icons/fa';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  duration: number;
  startTime: number;
  isActive: boolean;
}

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  isPinned: boolean;
}

export const StreamChatEnhancements: React.FC<{
  channelId: string;
  onSendMessage: (message: string) => void;
}> = ({ channelId, onSendMessage }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newPoll, setNewPoll] = useState<{
    question: string;
    options: string[];
    duration: number;
  }>({
    question: '',
    options: ['', ''],
    duration: 60
  });

  const {
    isOpen: isPollModalOpen,
    onOpen: onPollModalOpen,
    onClose: onPollModalClose
  } = useDisclosure();

  const {
    isOpen: isAnnouncementModalOpen,
    onOpen: onAnnouncementModalOpen,
    onClose: onAnnouncementModalClose
  } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleCreatePoll = () => {
    const poll: Poll = {
      id: Math.random().toString(36).substr(2, 9),
      question: newPoll.question,
      options: newPoll.options.map(text => ({
        id: Math.random().toString(36).substr(2, 9),
        text,
        votes: 0
      })),
      duration: newPoll.duration,
      startTime: Date.now(),
      isActive: true
    };

    setPolls(prev => [...prev, poll]);
    onSendMessage(`📊 New Poll: ${poll.question}`);
    onPollModalClose();

    // Reset form
    setNewPoll({
      question: '',
      options: ['', ''],
      duration: 60
    });

    // Auto-close poll after duration
    setTimeout(() => {
      setPolls(prev =>
        prev.map(p =>
          p.id === poll.id ? { ...p, isActive: false } : p
        )
      );
      onSendMessage(`📊 Poll ended: ${poll.question}`);
    }, poll.duration * 1000);
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(prev =>
      prev.map(poll =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map(opt =>
                opt.id === optionId
                  ? { ...opt, votes: opt.votes + 1 }
                  : opt
              )
            }
          : poll
      )
    );
  };

  const handleCreateAnnouncement = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const announcement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now(),
      isPinned: false
    };

    setAnnouncements(prev => [...prev, announcement]);
    onSendMessage(`📢 Announcement: ${message}`);
    onAnnouncementModalClose();
  };

  const handleTogglePinAnnouncement = (id: string) => {
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === id ? { ...ann, isPinned: !ann.isPinned } : ann
      )
    );
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  const getTimeLeft = (startTime: number, duration: number) => {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = duration - elapsed;
    return Math.max(0, Math.floor(remaining));
  };

  return (
    <Box>
      {/* Quick Actions */}
      <HStack mb={4} spacing={2}>
        <Button
          leftIcon={<FaPoll />}
          onClick={onPollModalOpen}
          size="sm"
        >
          Create Poll
        </Button>
        <Button
          leftIcon={<FaBullhorn />}
          onClick={onAnnouncementModalOpen}
          size="sm"
        >
          Announce
        </Button>
      </HStack>

      {/* Active Polls */}
      {polls.filter(poll => poll.isActive).map(poll => (
        <Box
          key={poll.id}
          p={4}
          mb={4}
          bg={bgColor}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text fontWeight="bold">{poll.question}</Text>
              <Badge>
                <FaClock /> {getTimeLeft(poll.startTime, poll.duration)}s
              </Badge>
            </HStack>
            {poll.options.map(option => {
              const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              
              return (
                <VStack key={option.id} align="stretch">
                  <HStack>
                    <Button
                      size="sm"
                      onClick={() => handleVote(poll.id, option.id)}
                      variant="outline"
                      flex="1"
                    >
                      {option.text}
                    </Button>
                    <Text fontSize="sm" minW="60px" textAlign="right">
                      {percentage.toFixed(1)}%
                    </Text>
                  </HStack>
                  <Progress
                    value={percentage}
                    size="sm"
                    colorScheme="blue"
                  />
                </VStack>
              );
            })}
          </VStack>
        </Box>
      ))}

      {/* Announcements */}
      {announcements.filter(ann => ann.isPinned).map(ann => (
        <Alert
          key={ann.id}
          status={ann.type}
          mb={4}
          borderRadius="md"
        >
          <AlertIcon />
          <Flex justify="space-between" flex="1">
            <Text>{ann.message}</Text>
            <HStack>
              <IconButton
                aria-label="Unpin announcement"
                icon={<FaTimes />}
                size="sm"
                variant="ghost"
                onClick={() => handleTogglePinAnnouncement(ann.id)}
              />
              <IconButton
                aria-label="Delete announcement"
                icon={<FaTrash />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={() => handleDeleteAnnouncement(ann.id)}
              />
            </HStack>
          </Flex>
        </Alert>
      ))}

      {/* Create Poll Modal */}
      <Modal isOpen={isPollModalOpen} onClose={onPollModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Poll</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Question</FormLabel>
                <Input
                  value={newPoll.question}
                  onChange={e =>
                    setNewPoll(prev => ({
                      ...prev,
                      question: e.target.value
                    }))
                  }
                  placeholder="Ask your question..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Options</FormLabel>
                <VStack spacing={2}>
                  {newPoll.options.map((option, index) => (
                    <HStack key={index}>
                      <Input
                        value={option}
                        onChange={e => {
                          const newOptions = [...newPoll.options];
                          newOptions[index] = e.target.value;
                          setNewPoll(prev => ({
                            ...prev,
                            options: newOptions
                          }));
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      {index > 1 && (
                        <CloseButton
                          onClick={() =>
                            setNewPoll(prev => ({
                              ...prev,
                              options: prev.options.filter((_, i) => i !== index)
                            }))
                          }
                        />
                      )}
                    </HStack>
                  ))}
                  {newPoll.options.length < 6 && (
                    <Button
                      leftIcon={<FaPlus />}
                      onClick={() =>
                        setNewPoll(prev => ({
                          ...prev,
                          options: [...prev.options, '']
                        }))
                      }
                      size="sm"
                      variant="ghost"
                    >
                      Add Option
                    </Button>
                  )}
                </VStack>
              </FormControl>

              <FormControl>
                <FormLabel>Duration (seconds)</FormLabel>
                <Input
                  type="number"
                  value={newPoll.duration}
                  onChange={e =>
                    setNewPoll(prev => ({
                      ...prev,
                      duration: parseInt(e.target.value)
                    }))
                  }
                  min={10}
                  max={300}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPollModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreatePoll}
              isDisabled={
                !newPoll.question ||
                newPoll.options.some(opt => !opt.trim()) ||
                newPoll.duration < 10
              }
            >
              Create Poll
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={onAnnouncementModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Announcement</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Message</FormLabel>
                <Textarea
                  placeholder="Enter your announcement..."
                  rows={4}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <HStack spacing={4}>
                  {['info', 'success', 'warning', 'error'].map(type => (
                    <Button
                      key={type}
                      onClick={() =>
                        handleCreateAnnouncement(
                          (document.querySelector('textarea') as HTMLTextAreaElement).value,
                          type as any
                        )
                      }
                      colorScheme={
                        type === 'info'
                          ? 'blue'
                          : type === 'success'
                          ? 'green'
                          : type === 'warning'
                          ? 'yellow'
                          : 'red'
                      }
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onAnnouncementModalClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
