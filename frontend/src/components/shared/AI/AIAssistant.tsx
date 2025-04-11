import { FC, useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Chip,
  Box,
  Paper,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Switch,
  FormControlLabel,
  Autocomplete,
  Collapse,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Psychology as AIIcon,
  Settings as ConfigIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Send as SendIcon
} from '@mui/icons-material';

interface AIConfig {
  creativity: number;
  detailLevel: number;
  stylePreference: string;
  targetPlatform: string;
  useContextualLearning: boolean;
  usePreviousHistory: boolean;
  maxSuggestions: number;
  autoEnhance: boolean;
}

interface AITemplate {
  id: string;
  name: string;
  description: string;
  config: Partial<AIConfig>;
  tags: string[];
}

interface AIAssistantProps {
  onSuggestionApply: (suggestion: string) => void;
  onConfigChange: (config: AIConfig) => void;
  projectContext?: {
    duration: number;
    clipCount: number;
    effects: string[];
    style: string;
  };
}

const defaultConfig: AIConfig = {
  creativity: 0.7,
  detailLevel: 0.5,
  stylePreference: 'balanced',
  targetPlatform: 'youtube',
  useContextualLearning: true,
  usePreviousHistory: true,
  maxSuggestions: 5,
  autoEnhance: false
};

const AIAssistant: FC<AIAssistantProps> = ({
  onSuggestionApply,
  onConfigChange,
  projectContext
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ prompt: string; response: string[]; timestamp: number }>>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);
  
  const [aiConfig, setAIConfig] = useState<AIConfig>(defaultConfig);

  const [templates] = useState<AITemplate[]>([
    {
      id: 'youtube-shorts',
      name: 'YouTube Shorts',
      description: 'Optimized for short-form vertical videos',
      config: {
        creativity: 0.8,
        detailLevel: 0.6,
        stylePreference: 'dynamic',
        targetPlatform: 'youtube-shorts'
      },
      tags: ['short-form', 'vertical', 'trending']
    },
    {
      id: 'tutorial',
      name: 'Tutorial Video',
      description: 'Clear and educational content',
      config: {
        creativity: 0.4,
        detailLevel: 0.9,
        stylePreference: 'professional',
        targetPlatform: 'education'
      },
      tags: ['educational', 'step-by-step', 'professional']
    }
  ]);

  const handlePromptSubmit = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const enhancedPrompt = {
        text: prompt,
        context: {
          currentContent: projectContext,
          previousSuggestions: suggestions,
          userPreferences: aiConfig,
          projectHistory: history
        }
      };
      
      // Simulate AI service call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const results = ['Sample suggestion 1', 'Sample suggestion 2'];
      
      setHistory(prev => [...prev, {
        prompt,
        response: results,
        timestamp: Date.now()
      }]);
      setSuggestions(results);
      setPrompt('');
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, [prompt, projectContext, suggestions, aiConfig, history]);

  const handleConfigChange = useCallback((key: keyof AIConfig, value: number | string | boolean) => {
    const newConfig = { ...aiConfig, [key]: value };
    setAIConfig(newConfig);
    onConfigChange(newConfig);
  }, [aiConfig]);

  const applyTemplate = useCallback((template: AITemplate) => {
    setAIConfig(prev => ({
      ...prev,
      ...template.config
    }));
    setSelectedTemplate(template);
    setShowTemplates(false);
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      applyTemplate(template);
    }
  }, [templates]);

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            AI Assistant
          </Typography>
          <Box>
            <Tooltip title="AI Templates">
              <IconButton onClick={() => setShowTemplates(true)}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="AI Configuration">
              <IconButton onClick={() => setShowConfig(true)}>
                <ConfigIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Collapse in={showConfig}>
          <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
            <Typography variant="h6" gutterBottom>
              AI Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <Typography gutterBottom>Creativity Level</Typography>
                <Slider
                  value={aiConfig.creativity * 100}
                  onChange={(_, value) => handleConfigChange('creativity', value / 100)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  marks
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <Typography gutterBottom>Detail Level</Typography>
                <Slider
                  value={aiConfig.detailLevel * 100}
                  onChange={(_, value) => handleConfigChange('detailLevel', value / 100)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  marks
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <FormControl fullWidth>
                  <InputLabel>Style Preference</InputLabel>
                  <Select
                    value={aiConfig.stylePreference}
                    onChange={(e) => handleConfigChange('stylePreference', e.target.value)}
                    label="Style Preference"
                  >
                    <MenuItem value="balanced">Balanced</MenuItem>
                    <MenuItem value="creative">Creative</MenuItem>
                    <MenuItem value="professional">Professional</MenuItem>
                    <MenuItem value="dynamic">Dynamic</MenuItem>
                    <MenuItem value="minimal">Minimal</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <FormControl fullWidth>
                  <InputLabel>Target Platform</InputLabel>
                  <Select
                    value={aiConfig.targetPlatform}
                    onChange={(e) => handleConfigChange('targetPlatform', e.target.value)}
                    label="Target Platform"
                  >
                    <MenuItem value="youtube">YouTube</MenuItem>
                    <MenuItem value="youtube-shorts">YouTube Shorts</MenuItem>
                    <MenuItem value="tiktok">TikTok</MenuItem>
                    <MenuItem value="instagram">Instagram</MenuItem>
                    <MenuItem value="education">Education</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={aiConfig.useContextualLearning}
                      onChange={(e) => handleConfigChange('useContextualLearning', e.target.checked)}
                    />
                  }
                  label="Use Contextual Learning"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={aiConfig.usePreviousHistory}
                      onChange={(e) => handleConfigChange('usePreviousHistory', e.target.checked)}
                    />
                  }
                  label="Use Previous History"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={aiConfig.autoEnhance}
                      onChange={(e) => handleConfigChange('autoEnhance', e.target.checked)}
                    />
                  }
                  label="Auto-enhance Suggestions"
                />
              </Box>
            </Box>
          </Paper>
        </Collapse>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create..."
            variant="outlined"
            disabled={loading}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedTemplate && (
              <Chip
                label={`Template: ${selectedTemplate.name}`}
                onDelete={() => setSelectedTemplate(null)}
                color="primary"
                size="small"
              />
            )}
            <IconButton
              color="primary"
              onClick={handlePromptSubmit}
              disabled={loading || !prompt.trim()}
              sx={{ alignSelf: 'flex-end' }}
            >
              {loading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>

        {suggestions.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Suggestions
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {suggestions.map((suggestion, index) => (
                  <Box key={index}>
                    <Typography variant="body2">{suggestion}</Typography>
                    <Button
                      size="small"
                      onClick={() => onSuggestionApply(suggestion)}
                      sx={{ mt: 1 }}
                    >
                      Apply
                    </Button>
                    {index < suggestions.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        <Dialog open={showTemplates} onClose={() => setShowTemplates(false)} maxWidth="sm" fullWidth>
          <DialogTitle>AI Templates</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {templates.map((template) => (
                <Box key={template.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => applyTemplate(template)}
                  >
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {template.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTemplates(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon fontSize="small" />
            Recent Templates
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {['YouTube Shorts', 'Tutorial Video', 'Product Review', 'Vlog'].map((template) => (
              <Chip
                key={template}
                label={template}
                onClick={() => handleTemplateSelect(template)}
                variant={selectedTemplate && selectedTemplate.name === template ? 'filled' : 'outlined'}
                color={selectedTemplate && selectedTemplate.name === template ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
