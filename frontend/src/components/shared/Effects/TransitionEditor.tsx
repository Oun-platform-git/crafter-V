import { FC, useState } from 'react';
import { VideoClip, Transition as VideoTransition } from '../Timeline/Timeline';
import { IconButton, Slider, Select, MenuItem, TextField } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface TransitionEditorProps {
  clip: VideoClip;
  onTransitionAdd: (transition: VideoTransition) => void;
  onTransitionUpdate: (transitionId: string, transition: Partial<VideoTransition>) => void;
  onTransitionDelete: (transitionId: string) => void;
}

const TransitionEditor: FC<TransitionEditorProps> = ({
  clip,
  onTransitionAdd,
  onTransitionUpdate,
  onTransitionDelete
}) => {
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);

  const handleAddTransition = () => {
    const newTransition: VideoTransition = {
      id: `transition-${Date.now()}`,
      type: 'fade',
      duration: 1,
      easing: 'ease-in-out',
      params: {}
    };
    onTransitionAdd(newTransition);
    setSelectedTransition(newTransition.id);
  };

  const renderTransitionParams = (transition: VideoTransition) => {
    switch (transition.type) {
      case 'wipe':
      case 'slide':
        return (
          <Select
            value={transition.params.direction || 'left'}
            onChange={(e) => handleParamChange(transition.id, 'direction', e.target.value)}
            fullWidth
          >
            <MenuItem value="left">Left</MenuItem>
            <MenuItem value="right">Right</MenuItem>
            <MenuItem value="top">Top</MenuItem>
            <MenuItem value="bottom">Bottom</MenuItem>
          </Select>
        );

      case 'blur':
        return (
          <Slider
            value={transition.params.blur || 0}
            min={0}
            max={20}
            step={0.5}
            onChange={(_, value) => handleParamChange(transition.id, 'blur', value)}
            valueLabelDisplay="auto"
          />
        );

      case 'morph':
        return (
          <div className="morph-points">
            {(transition.params.morphPoints || []).map((point, index) => (
              <div key={index} className="morph-point">
                <TextField
                  label="X"
                  type="number"
                  value={point.x}
                  onChange={(e) => handleMorphPointChange(transition.id, index, 'x', parseFloat(e.target.value))}
                />
                <TextField
                  label="Y"
                  type="number"
                  value={point.y}
                  onChange={(e) => handleMorphPointChange(transition.id, index, 'y', parseFloat(e.target.value))}
                />
                <IconButton onClick={() => handleRemoveMorphPoint(transition.id, index)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <IconButton onClick={() => handleAddMorphPoint(transition.id)}>
              <AddIcon />
            </IconButton>
          </div>
        );

      default:
        return null;
    }
  };

  const handleParamChange = (transitionId: string, param: string, value: any) => {
    const transition = clip.transitions?.find((t: VideoTransition) => t.id === transitionId);
    if (!transition) return;

    onTransitionUpdate(transitionId, {
      params: { ...transition.params, [param]: value }
    });
  };

  const handleMorphPointChange = (transitionId: string, index: number, coord: 'x' | 'y', value: number) => {
    const transition = clip.transitions?.find((t: VideoTransition) => t.id === transitionId);
    if (!transition) return;

    const morphPoints = [...(transition.params.morphPoints || [])];
    morphPoints[index] = { ...morphPoints[index], [coord]: value };

    onTransitionUpdate(transitionId, {
      params: { ...transition.params, morphPoints }
    });
  };

  const handleAddMorphPoint = (transitionId: string) => {
    const transition = clip.transitions?.find((t: VideoTransition) => t.id === transitionId);
    if (!transition) return;

    const morphPoints = [...(transition.params.morphPoints || [])];
    morphPoints.push({ x: 0, y: 0 });

    onTransitionUpdate(transitionId, {
      params: { ...transition.params, morphPoints }
    });
  };

  const handleRemoveMorphPoint = (transitionId: string, index: number) => {
    const transition = clip.transitions?.find((t: VideoTransition) => t.id === transitionId);
    if (!transition) return;

    const morphPoints = [...(transition.params.morphPoints || [])];
    morphPoints.splice(index, 1);

    onTransitionUpdate(transitionId, {
      params: { ...transition.params, morphPoints }
    });
  };

  return (
    <div className="transition-editor">
      <div className="transition-list">
        {clip.transitions?.map(transition => (
          <div
            key={transition.id}
            className={`transition-item ${selectedTransition === transition.id ? 'selected' : ''}`}
            onClick={() => setSelectedTransition(transition.id)}
          >
            <div className="transition-header">
              <Select
                value={transition.type}
                onChange={(e) => onTransitionUpdate(transition.id, { type: e.target.value as VideoTransition['type'] })}
              >
                <MenuItem value="fade">Fade</MenuItem>
                <MenuItem value="wipe">Wipe</MenuItem>
                <MenuItem value="slide">Slide</MenuItem>
                <MenuItem value="zoom">Zoom</MenuItem>
                <MenuItem value="dissolve">Dissolve</MenuItem>
                <MenuItem value="blur">Blur</MenuItem>
                <MenuItem value="morph">Morph</MenuItem>
              </Select>
              <IconButton onClick={() => onTransitionDelete(transition.id)}>
                <DeleteIcon />
              </IconButton>
            </div>

            <div className="transition-duration">
              <span>Duration</span>
              <Slider
                value={transition.duration}
                min={0.1}
                max={5}
                step={0.1}
                onChange={(_, value) => onTransitionUpdate(transition.id, { duration: value as number })}
                valueLabelDisplay="auto"
              />
            </div>

            <div className="transition-easing">
              <span>Easing</span>
              <Select
                value={transition.easing}
                onChange={(e) => onTransitionUpdate(transition.id, { easing: e.target.value })}
                fullWidth
              >
                <MenuItem value="linear">Linear</MenuItem>
                <MenuItem value="ease-in">Ease In</MenuItem>
                <MenuItem value="ease-out">Ease Out</MenuItem>
                <MenuItem value="ease-in-out">Ease In Out</MenuItem>
                <MenuItem value="bounce">Bounce</MenuItem>
              </Select>
            </div>

            <div className="transition-params">
              {renderTransitionParams(transition)}
            </div>
          </div>
        ))}

        <IconButton onClick={handleAddTransition} className="add-transition">
          <AddIcon />
          Add Transition
        </IconButton>
      </div>

      <style>
        {`
        .transition-editor {
          padding: 16px;
        }

        .transition-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .transition-item {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 16px;
          cursor: pointer;
        }

        .transition-item.selected {
          border-color: #1976d2;
          background: rgba(25, 118, 210, 0.08);
        }

        .transition-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .transition-duration,
        .transition-easing,
        .transition-params {
          margin-top: 16px;
        }

        .morph-points {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .morph-point {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .add-transition {
          align-self: flex-start;
        }
        `}
      </style>
    </div>
  );
};

export default TransitionEditor;
