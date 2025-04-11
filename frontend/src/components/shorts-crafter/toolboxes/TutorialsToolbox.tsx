import React, { useState, useEffect, useRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Button,
  IconButton,
  Text,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Badge,
  Tooltip,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  List,
  ListItem,
  ListIcon,
  Collapse,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Grid,
  GridItem
} from '@chakra-ui/react';
import {
  FaMicrophone,
  FaFont,
  FaRegPlayCircle,
  FaRegPauseCircle,
  FaArrowRight,
  FaPlus,
  FaMinus,
  FaSearch,
  FaCog,
  FaLink,
  FaClock,
  FaCheckCircle,
  FaPencilAlt,
  FaHandPointer,
  FaList,
  FaShare,
  FaLanguage
} from 'react-icons/fa';

interface Step {
  id: string;
  title: string;
  description: string;
  duration: number;
  voiceOver?: string;
  callouts: Array<{
    id: string;
    text: string;
    position: { x: number; y: number };
    style: string;
  }>;
}

interface TutorialsToolboxProps {
  onStepAdd?: (step: Step) => void;
  onStepUpdate?: (step: Step) => void;
  onStepRemove?: (stepId: string) => void;
  onApplyEffect?: (effect: string, params: any) => void;
}

export const TutorialsToolbox: React.FC<TutorialsToolboxProps> = ({
  onStepAdd,
  onStepUpdate,
  onStepRemove,
  onApplyEffect
}) => {
  // State management
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [showProgress, setShowProgress] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedCallout, setSelectedCallout] = useState<string | null>(null);
  const [handTracking, setHandTracking] = useState(false);
  const [autoSubtitles, setAutoSubtitles] = useState(true);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Supported languages for subtitles
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  // Callout styles
  const calloutStyles = [
    { id: 'arrow', name: 'Arrow', icon: FaArrowRight },
    { id: 'highlight', name: 'Highlight', icon: FaSearch },
    { id: 'circle', name: 'Circle', icon: FaCheckCircle },
    { id: 'text', name: 'Text', icon: FaFont }
  ];

  useEffect(() => {
    // Initialize MediaRecorder for voice recording
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Simulate voice-to-text transcription
          await simulateTranscription(audioUrl);
          
          audioChunksRef.current = [];
        };

        mediaRecorderRef.current = mediaRecorder;
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    initializeMediaRecorder();
  }, []);

  const simulateTranscription = async (audioUrl: string) => {
    // Simulate AI transcription service
    await new Promise(resolve => setTimeout(resolve, 1000));
    const fakeTranscription = "This is a simulated transcription of the recorded audio.";
    setTranscription(fakeTranscription);
    
    if (currentStep) {
      updateStep({
        ...currentStep,
        voiceOver: fakeTranscription
      });
    }
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && !isRecording) {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: `Step ${steps.length + 1}`,
      description: '',
      duration: 5,
      callouts: []
    };

    setSteps([...steps, newStep]);
    setCurrentStep(newStep);
    onStepAdd?.(newStep);
  };

  const updateStep = (updatedStep: Step) => {
    const updatedSteps = steps.map(step =>
      step.id === updatedStep.id ? updatedStep : step
    );
    setSteps(updatedSteps);
    setCurrentStep(updatedStep);
    onStepUpdate?.(updatedStep);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    if (currentStep?.id === stepId) {
      setCurrentStep(null);
    }
    onStepRemove?.(stepId);
  };

  const addCallout = () => {
    if (!currentStep) return;

    const newCallout = {
      id: Date.now().toString(),
      text: 'New Callout',
      position: { x: 50, y: 50 },
      style: 'arrow'
    };

    updateStep({
      ...currentStep,
      callouts: [...currentStep.callouts, newCallout]
    });
  };

  const toggleHandTracking = () => {
    setHandTracking(!handTracking);
    onApplyEffect?.('handTracking', { enabled: !handTracking });
  };

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
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
      {/* Steps List */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">Tutorial Steps</Text>
          <Button
            leftIcon={<FaPlus />}
            size="sm"
            onClick={addStep}
          >
            Add Step
          </Button>
        </HStack>
        
        <List spacing={2}>
          {steps.map(step => (
            <ListItem
              key={step.id}
              p={2}
              bg={currentStep?.id === step.id ? 'blue.50' : 'transparent'}
              borderRadius="md"
              cursor="pointer"
              onClick={() => setCurrentStep(step)}
            >
              <HStack justify="space-between">
                <HStack>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  <Text>{step.title}</Text>
                </HStack>
                <IconButton
                  aria-label="Remove step"
                  icon={<FaMinus />}
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStep(step.id);
                  }}
                />
              </HStack>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Step Editor */}
      {currentStep && (
        <VStack spacing={4} w="100%">
          <FormControl>
            <FormLabel>Step Title</FormLabel>
            <Input
              value={currentStep.title}
              onChange={(e) => updateStep({
                ...currentStep,
                title: e.target.value
              })}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={currentStep.description}
              onChange={(e) => updateStep({
                ...currentStep,
                description: e.target.value
              })}
              rows={3}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Duration (seconds)</FormLabel>
            <NumberInput
              value={currentStep.duration}
              onChange={(_, value) => updateStep({
                ...currentStep,
                duration: value
              })}
              min={1}
              max={60}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          {/* Voice Recording */}
          <HStack w="100%" justify="space-between">
            <Text>Voice Recording</Text>
            <HStack>
              <IconButton
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                icon={isRecording ? <FaRegPauseCircle /> : <FaRegPlayCircle />}
                colorScheme={isRecording ? 'red' : 'blue'}
                onClick={isRecording ? stopRecording : startRecording}
              />
              {transcription && (
                <Badge colorScheme="green">Transcribed</Badge>
              )}
            </HStack>
          </HStack>

          {/* Callouts */}
          <Box w="100%">
            <HStack justify="space-between" mb={2}>
              <Text>Callouts</Text>
              <Button
                leftIcon={<FaPlus />}
                size="sm"
                onClick={addCallout}
              >
                Add Callout
              </Button>
            </HStack>
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {calloutStyles.map(style => (
                <GridItem key={style.id}>
                  <Button
                    w="100%"
                    leftIcon={<style.icon />}
                    size="sm"
                    variant={selectedCallout === style.id ? 'solid' : 'outline'}
                    onClick={() => setSelectedCallout(style.id)}
                  >
                    {style.name}
                  </Button>
                </GridItem>
              ))}
            </Grid>
          </Box>
        </VStack>
      )}

      {/* Advanced Features */}
      <VStack w="100%" spacing={4}>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">
            Hand Tracking
          </FormLabel>
          <Switch
            isChecked={handTracking}
            onChange={toggleHandTracking}
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">
            Auto-Subtitles
          </FormLabel>
          <Switch
            isChecked={autoSubtitles}
            onChange={(e) => setAutoSubtitles(e.target.checked)}
          />
        </FormControl>

        {/* Language Selection */}
        <Box w="100%">
          <Text mb={2}>Subtitle Languages</Text>
          <Wrap>
            {languages.map(lang => (
              <Button
                key={lang.code}
                size="sm"
                variant={selectedLanguages.includes(lang.code) ? 'solid' : 'outline'}
                onClick={() => handleLanguageToggle(lang.code)}
              >
                {lang.name}
              </Button>
            ))}
          </Wrap>
        </Box>

        {/* Quick Actions */}
        <HStack w="100%" spacing={2}>
          <Tooltip label="Generate Steps from Voice">
            <IconButton
              aria-label="Generate Steps"
              icon={<FaMicrophone />}
              onClick={() => onApplyEffect?.('generateSteps', {})}
            />
          </Tooltip>
          <Tooltip label="Auto-Pause Between Steps">
            <IconButton
              aria-label="Auto-Pause"
              icon={<FaClock />}
              onClick={() => onApplyEffect?.('autoPause', {})}
            />
          </Tooltip>
          <Tooltip label="Generate Tutorial Link">
            <IconButton
              aria-label="Tutorial Link"
              icon={<FaLink />}
              onClick={() => onApplyEffect?.('generateLink', {})}
            />
          </Tooltip>
        </HStack>
      </VStack>
    </VStack>
  );
};
