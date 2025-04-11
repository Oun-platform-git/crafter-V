import { FC, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  Paper,
  Slider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Effect {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, number | string>;
}

interface EffectParameter {
  name: string;
  type: 'number' | 'string';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number | string;
}

interface EffectType {
  name: string;
  parameters: EffectParameter[];
}

interface EffectsEditorProps {
  effects: Effect[];
  onEffectAdd: (effect: Effect) => void;
  onEffectUpdate: (effectId: string, parameters: Record<string, number | string>) => void;
  onEffectDelete: (effectId: string) => void;
}

const effectTypes: EffectType[] = [
  {
    name: 'Blur',
    parameters: [
      { name: 'radius', type: 'number', min: 0, max: 20, step: 0.5, defaultValue: 5 },
    ],
  },
  {
    name: 'Brightness',
    parameters: [
      { name: 'level', type: 'number', min: 0, max: 200, step: 1, defaultValue: 100 },
    ],
  },
  {
    name: 'Contrast',
    parameters: [
      { name: 'level', type: 'number', min: 0, max: 200, step: 1, defaultValue: 100 },
    ],
  },
  {
    name: 'Saturation',
    parameters: [
      { name: 'level', type: 'number', min: 0, max: 200, step: 1, defaultValue: 100 },
    ],
  },
];

const EffectsEditor: FC<EffectsEditorProps> = ({
  effects,
  onEffectAdd,
  onEffectUpdate,
  onEffectDelete,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  const handleAddEffect = useCallback(() => {
    const effectType = effectTypes.find(type => type.name === selectedType);
    if (!effectType) return;

    const parameters = Object.fromEntries(
      effectType.parameters.map(param => [param.name, param.defaultValue])
    );

    onEffectAdd({
      id: `effect-${Date.now()}`,
      name: selectedType,
      type: selectedType.toLowerCase(),
      parameters,
    });

    setDialogOpen(false);
    setSelectedType('');
  }, [selectedType, onEffectAdd]);

  const handleParameterChange = useCallback(
    (effectId: string, parameter: string, newValue: number | string) => {
      const effect = effects.find(e => e.id === effectId);
      if (effect) {
        onEffectUpdate(effectId, {
          ...effect.parameters,
          [parameter]: newValue,
        });
      }
    },
    [effects, onEffectUpdate]
  );

  const handleEffectDelete = useCallback((effectId: string) => {
    onEffectDelete(effectId);
  }, [onEffectDelete]);

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="div">
            Effects Editor
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Effect
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {effects.map((effect) => (
            <Box key={effect.id} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  width: '100%',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{effect.name}</Typography>
                  <IconButton onClick={() => handleEffectDelete(effect.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {Object.entries(effect.parameters).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Typography gutterBottom>{key}</Typography>
                    {typeof value === 'number' ? (
                      <Slider
                        value={value}
                        onChange={(_, newValue) => handleParameterChange(effect.id, key, newValue)}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                    ) : (
                      <TextField
                        fullWidth
                        value={value}
                        onChange={(e) => handleParameterChange(effect.id, key, e.target.value)}
                      />
                    )}
                  </Box>
                ))}
              </Paper>
            </Box>
          ))}
        </Box>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Add New Effect</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {effectTypes.map(type => (
                <Box key={type.name} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
                  <Button
                    fullWidth
                    variant={selectedType === type.name ? 'contained' : 'outlined'}
                    onClick={() => setSelectedType(type.name)}
                    sx={{ height: '100%' }}
                  >
                    {type.name}
                  </Button>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddEffect}
              variant="contained"
              disabled={!selectedType}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EffectsEditor;
