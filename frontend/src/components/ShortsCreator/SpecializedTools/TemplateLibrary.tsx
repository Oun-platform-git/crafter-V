import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Button,
  Dialog,
  Stack,
  TextField,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow,
  Download,
  Favorite,
  TrendingUp,
  Style,
  Category,
  Timer,
  Edit
} from '@mui/icons-material';
import { useAIService } from '../../../hooks/useAIService';

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  duration: number;
  style: string;
  tags: string[];
  popularity: number;
  aiPrompts: string[];
  musicSuggestions: string[];
  transitionEffects: string[];
}

const TEMPLATE_CATEGORIES = [
  {
    name: 'Product Showcase',
    templates: [
      { name: 'Quick Review', style: 'modern' },
      { name: 'Unboxing Experience', style: 'cinematic' },
      { name: 'Feature Highlight', style: 'minimal' }
    ]
  },
  {
    name: 'Tutorial & How-to',
    templates: [
      { name: 'Step-by-Step Guide', style: 'instructional' },
      { name: 'Quick Tips', style: 'casual' },
      { name: 'Expert Advice', style: 'professional' }
    ]
  },
  {
    name: 'Behind the Scenes',
    templates: [
      { name: 'Studio Tour', style: 'documentary' },
      { name: 'Creative Process', style: 'artistic' },
      { name: 'Team Spotlight', style: 'corporate' }
    ]
  },
  {
    name: 'Transformation',
    templates: [
      { name: 'Before & After', style: 'dramatic' },
      { name: 'Progress Timeline', style: 'montage' },
      { name: 'Challenge Results', style: 'energetic' }
    ]
  },
  {
    name: 'Lifestyle & Vlogs',
    templates: [
      { name: 'Daily Routine', style: 'lifestyle' },
      { name: 'Travel Moments', style: 'cinematic' },
      { name: 'Food & Recipe', style: 'appetizing' }
    ]
  }
];

export const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customizing, setCustomizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { generateVideo, analyzeContent } = useAIService();

  useEffect(() => {
    fetchTemplates();
  }, [activeCategory]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    // Get AI suggestions for the template
    const suggestions = await analyzeContent(template.thumbnail);
    // Update template with AI suggestions
  };

  const handleCustomize = async () => {
    if (!selectedTemplate) return;
    setCustomizing(true);
    // Generate AI variations of the template
    try {
      const variations = await generateVideo({
        template: selectedTemplate.id,
        style: selectedTemplate.style,
        variations: 3
      });
      // Show variations to user
    } catch (error) {
      console.error('Error generating variations:', error);
    }
  };

  const renderTemplateCard = (template: Template) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.02)' }
      }}
      onClick={() => handleTemplateSelect(template)}
    >
      <CardMedia
        component="div"
        sx={{
          pt: '56.25%',
          position: 'relative',
          bgcolor: 'grey.200'
        }}
        image={template.thumbnail}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0,0,0,0.6)',
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <IconButton size="small" sx={{ color: 'white' }}>
            <PlayArrow />
          </IconButton>
          <Typography variant="caption" sx={{ color: 'white' }}>
            {template.duration}s
          </Typography>
        </Box>
      </CardMedia>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {template.name}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip
            size="small"
            icon={<Category />}
            label={template.category}
          />
          <Chip
            size="small"
            icon={<Style />}
            label={template.style}
          />
        </Stack>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {template.tags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Chip
            size="small"
            icon={<TrendingUp />}
            label={`${template.popularity}k uses`}
          />
          <IconButton size="small" color="primary">
            <Edit />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Professional Templates
      </Typography>

      <Grid container spacing={3}>
        {/* Search and Filters */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Autocomplete
              options={['all', ...TEMPLATE_CATEGORIES.map(c => c.name)]}
              value={activeCategory}
              onChange={(_, newValue) => setActiveCategory(newValue || 'all')}
              renderInput={(params) => (
                <TextField {...params} label="Category" />
              )}
              sx={{ width: 200 }}
            />
          </Stack>
        </Grid>

        {/* Template Grid */}
        {loading ? (
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Grid>
        ) : (
          templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              {renderTemplateCard(template)}
            </Grid>
          ))
        )}
      </Grid>

      {/* Template Customization Dialog */}
      <Dialog
        open={customizing}
        onClose={() => setCustomizing(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTemplate && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customize Template
            </Typography>
            {/* Template customization options */}
          </Box>
        )}
      </Dialog>
    </Box>
  );
};
