import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Box,
  Button,
  IconButton,
  Text,
  Input,
  Textarea,
  Select,
  useColorModeValue,
  Badge,
  Tooltip,
  Grid,
  GridItem,
  Switch,
  FormControl,
  FormLabel,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import {
  FaGraduationCap,
  FaBook,
  FaQuestion,
  FaLightbulb,
  FaCheck,
  FaTimes,
  FaRegClock,
  FaRegComments,
  FaRegFileAlt,
  FaRegImage,
  FaRegPlayCircle,
  FaRegStar,
  FaChartLine,
  FaMagic,
  FaGlobe,
  FaRandom,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLanguage
} from 'react-icons/fa';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Fact {
  id: string;
  content: string;
  source?: string;
  tags: string[];
}

interface EducationalBitesToolboxProps {
  onTemplateSelect?: (template: string) => void;
  onQuizCreate?: (quiz: Quiz) => void;
  onFactAdd?: (fact: Fact) => void;
  onEffectApply?: (effect: string, params: any) => void;
  onLanguageChange?: (language: string) => void;
}

export const EducationalBitesToolbox: React.FC<EducationalBitesToolboxProps> = ({
  onTemplateSelect,
  onQuizCreate,
  onFactAdd,
  onEffectApply,
  onLanguageChange
}) => {
  // State management
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [currentFact, setCurrentFact] = useState<Fact | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [visualStyle, setVisualStyle] = useState('modern');
  const [factTags, setFactTags] = useState<string[]>([]);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Predefined settings
  const templates = [
    { id: 'didYouKnow', name: 'Did You Know?', icon: FaLightbulb },
    { id: 'quickFacts', name: 'Quick Facts', icon: FaRegFileAlt },
    { id: 'quizMe', name: 'Quiz Me', icon: FaQuestion },
    { id: 'explainer', name: 'Explainer', icon: FaBook }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' }
  ];

  const visualStyles = [
    { id: 'modern', name: 'Modern Clean' },
    { id: 'playful', name: 'Playful' },
    { id: 'academic', name: 'Academic' },
    { id: 'minimal', name: 'Minimal' }
  ];

  useEffect(() => {
    // Load sample facts
    const sampleFacts: Fact[] = [
      {
        id: '1',
        content: 'The human brain can process images in as little as 13 milliseconds.',
        source: 'MIT Research',
        tags: ['science', 'brain', 'psychology']
      },
      {
        id: '2',
        content: 'A day on Venus is longer than its year.',
        source: 'NASA',
        tags: ['space', 'astronomy', 'planets']
      }
    ];
    setFacts(sampleFacts);
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect?.(templateId);

    // Generate sample content based on template
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Template Applied',
        description: 'Content structure generated',
        status: 'success',
        duration: 2000
      });
    }, 1000);
  };

  const createQuiz = () => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      question: 'What is your question?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: 0,
      explanation: 'Explain the correct answer here'
    };
    setCurrentQuiz(newQuiz);
  };

  const addFact = () => {
    const newFact: Fact = {
      id: Date.now().toString(),
      content: '',
      tags: []
    };
    setCurrentFact(newFact);
  };

  const saveFact = () => {
    if (currentFact) {
      if (currentFact.content.trim()) {
        const updatedFacts = facts.find(f => f.id === currentFact.id)
          ? facts.map(f => f.id === currentFact.id ? currentFact : f)
          : [...facts, currentFact];
        setFacts(updatedFacts);
        onFactAdd?.(currentFact);
        setCurrentFact(null);
      } else {
        toast({
          title: 'Error',
          description: 'Fact content cannot be empty',
          status: 'error',
          duration: 2000
        });
      }
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    onLanguageChange?.(lang);

    if (autoTranslate) {
      setIsGenerating(true);
      // Simulate translation
      setTimeout(() => {
        setIsGenerating(false);
        toast({
          title: 'Content Translated',
          description: `Translated to ${languages.find(l => l.code === lang)?.name}`,
          status: 'success',
          duration: 2000
        });
      }, 1500);
    }
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
      {/* Template Selection */}
      <FormControl>
        <FormLabel>Educational Template</FormLabel>
        <Select
          value={selectedTemplate}
          onChange={(e) => handleTemplateSelect(e.target.value)}
          icon={<FaGraduationCap />}
        >
          <option value="">Select a template</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Visual Style */}
      <FormControl>
        <FormLabel>Visual Style</FormLabel>
        <Select
          value={visualStyle}
          onChange={(e) => setVisualStyle(e.target.value)}
        >
          {visualStyles.map(style => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Quiz Creation */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">Quiz</Text>
          <Button
            size="sm"
            leftIcon={<FaPlus />}
            onClick={createQuiz}
          >
            Add Quiz
          </Button>
        </HStack>
        {currentQuiz && (
          <VStack spacing={3} align="stretch">
            <Input
              placeholder="Enter your question"
              value={currentQuiz.question}
              onChange={(e) => setCurrentQuiz({
                ...currentQuiz,
                question: e.target.value
              })}
            />
            {currentQuiz.options.map((option, index) => (
              <HStack key={index}>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...currentQuiz.options];
                    newOptions[index] = e.target.value;
                    setCurrentQuiz({
                      ...currentQuiz,
                      options: newOptions
                    });
                  }}
                  placeholder={`Option ${index + 1}`}
                />
                <IconButton
                  aria-label="Set as correct"
                  icon={index === currentQuiz.correctAnswer ? <FaCheck /> : <FaTimes />}
                  onClick={() => setCurrentQuiz({
                    ...currentQuiz,
                    correctAnswer: index
                  })}
                  colorScheme={index === currentQuiz.correctAnswer ? 'green' : 'gray'}
                />
              </HStack>
            ))}
            <Textarea
              placeholder="Explanation for the correct answer"
              value={currentQuiz.explanation}
              onChange={(e) => setCurrentQuiz({
                ...currentQuiz,
                explanation: e.target.value
              })}
            />
            <Button
              colorScheme="blue"
              onClick={() => onQuizCreate?.(currentQuiz)}
            >
              Save Quiz
            </Button>
          </VStack>
        )}
      </Box>

      {/* Facts Management */}
      <Box w="100%">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold">Facts</Text>
          <Button
            size="sm"
            leftIcon={<FaPlus />}
            onClick={addFact}
          >
            Add Fact
          </Button>
        </HStack>
        {currentFact && (
          <VStack spacing={3} align="stretch" mb={4}>
            <Textarea
              placeholder="Enter your fact"
              value={currentFact.content}
              onChange={(e) => setCurrentFact({
                ...currentFact,
                content: e.target.value
              })}
            />
            <Input
              placeholder="Source (optional)"
              value={currentFact.source || ''}
              onChange={(e) => setCurrentFact({
                ...currentFact,
                source: e.target.value
              })}
            />
            <Input
              placeholder="Add tags (comma-separated)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const newTag = e.currentTarget.value.trim();
                  if (newTag && !currentFact.tags.includes(newTag)) {
                    setCurrentFact({
                      ...currentFact,
                      tags: [...currentFact.tags, newTag]
                    });
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            <Wrap>
              {currentFact.tags.map(tag => (
                <WrapItem key={tag}>
                  <Tag
                    size="md"
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="blue"
                  >
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton
                      onClick={() => setCurrentFact({
                        ...currentFact,
                        tags: currentFact.tags.filter(t => t !== tag)
                      })}
                    />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
            <Button onClick={saveFact}>Save Fact</Button>
          </VStack>
        )}
        <Accordion allowMultiple>
          {facts.map(fact => (
            <AccordionItem key={fact.id}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text noOfLines={1}>{fact.content}</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack align="stretch" spacing={2}>
                  <Text>{fact.content}</Text>
                  {fact.source && (
                    <Text fontSize="sm" color="gray.500">
                      Source: {fact.source}
                    </Text>
                  )}
                  <Wrap>
                    {fact.tags.map(tag => (
                      <Tag key={tag} size="sm">
                        {tag}
                      </Tag>
                    ))}
                  </Wrap>
                  <HStack>
                    <IconButton
                      aria-label="Edit fact"
                      icon={<FaEdit />}
                      size="sm"
                      onClick={() => setCurrentFact(fact)}
                    />
                    <IconButton
                      aria-label="Delete fact"
                      icon={<FaTrash />}
                      size="sm"
                      onClick={() => setFacts(facts.filter(f => f.id !== fact.id))}
                    />
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>

      {/* Language Settings */}
      <Box w="100%">
        <FormControl>
          <FormLabel>Language</FormLabel>
          <Select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            icon={<FaLanguage />}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <HStack justify="space-between" mt={2}>
          <Text>Auto-Translate</Text>
          <Switch
            isChecked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
            colorScheme="blue"
          />
        </HStack>
      </Box>

      {/* Quick Actions */}
      <HStack w="100%" spacing={2}>
        <Tooltip label="Generate Facts">
          <IconButton
            aria-label="Generate Facts"
            icon={<FaMagic />}
            onClick={() => onEffectApply?.('generateFacts', {})}
          />
        </Tooltip>
        <Tooltip label="Random Template">
          <IconButton
            aria-label="Random Template"
            icon={<FaRandom />}
            onClick={() => handleTemplateSelect(templates[Math.floor(Math.random() * templates.length)].id)}
          />
        </Tooltip>
        <Tooltip label="Global Facts">
          <IconButton
            aria-label="Global Facts"
            icon={<FaGlobe />}
            onClick={() => onEffectApply?.('globalFacts', {})}
          />
        </Tooltip>
        <Tooltip label="Trending Topics">
          <IconButton
            aria-label="Trending Topics"
            icon={<FaChartLine />}
            onClick={() => onEffectApply?.('trendingTopics', {})}
          />
        </Tooltip>
      </HStack>

      {isGenerating && (
        <Progress size="xs" isIndeterminate w="100%" />
      )}
    </VStack>
  );
};
