import { FC, useRef, useEffect, useState } from 'react';
import { AudioClip, AudioEffect, AudioEffectType, AudioEffectParams } from '../../../types/audio';
import {
  Slider,
  IconButton,
  Select,
  MenuItem,
  Typography,
  Switch
} from '@mui/material';
import {
  VolumeUp,
  GraphicEq,
  Speed,
  Tune,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface AudioMixerProps {
  clip: AudioClip;
  audioContext: AudioContext;
  onVolumeChange: (volume: number) => void;
  onPanChange: (pan: number) => void;
  onEffectAdd: (effect: AudioEffect) => void;
  onEffectUpdate: (effectId: string, effect: Partial<AudioEffect>) => void;
  onEffectDelete: (effectId: string) => void;
}

type EffectParamConfig = {
  min: number;
  max: number;
  default: number;
};

type EqualizerParams = {
  lowGain: number;
  midGain: number;
  highGain: number;
  lowFreq: number;
  highFreq: number;
  q: number;
};

type CompressorParams = {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
};

type ReverbParams = {
  roomSize: number;
  dampening: number;
  wetLevel: number;
  dryLevel: number;
};

type DelayParams = {
  delayTime: number;
  feedback: number;
  mix: number;
};

type AudioEffectParamConfigs = {
  [K in keyof AudioEffectParams]: { [P in keyof AudioEffectParams[K]]: EffectParamConfig };
};

const defaultEffectParams: AudioEffectParamConfigs = {
  equalizer: {
    lowGain: { min: -12, max: 12, default: 0 },
    midGain: { min: -12, max: 12, default: 0 },
    highGain: { min: -12, max: 12, default: 0 },
    lowFreq: { min: 20, max: 200, default: 200 },
    highFreq: { min: 2000, max: 20000, default: 2000 },
    q: { min: 0.1, max: 10, default: 1 }
  },
  compressor: {
    threshold: { min: -60, max: 0, default: -24 },
    ratio: { min: 1, max: 20, default: 4 },
    attack: { min: 0, max: 1, default: 0.003 },
    release: { min: 0, max: 1, default: 0.25 },
    knee: { min: 0, max: 40, default: 30 }
  },
  reverb: {
    roomSize: { min: 0, max: 1, default: 0.8 },
    dampening: { min: 100, max: 10000, default: 3000 },
    wetLevel: { min: 0, max: 1, default: 0.3 },
    dryLevel: { min: 0, max: 1, default: 0.7 }
  },
  delay: {
    delayTime: { min: 0, max: 2, default: 0.3 },
    feedback: { min: 0, max: 1, default: 0.5 },
    mix: { min: 0, max: 1, default: 0.3 }
  }
};

const AudioMixer: FC<AudioMixerProps> = ({
  clip,
  audioContext,
  onVolumeChange,
  onPanChange,
  onEffectAdd,
  onEffectUpdate,
  onEffectDelete
}) => {
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    // Set up audio nodes
    const gainNode = audioContext.createGain();
    const panNode = audioContext.createStereoPanner();
    const analyser = audioContext.createAnalyser();

    gainNode.connect(panNode);
    panNode.connect(analyser);
    analyser.connect(audioContext.destination);

    // Set up visualizer
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      gainNode.disconnect();
      panNode.disconnect();
      analyser.disconnect();
    };
  }, [audioContext]);

  const handleAddEffect = (type: AudioEffectType) => {
    const newEffect: AudioEffect = {
      id: `audio-effect-${Date.now()}`,
      type,
      params: {},
      enabled: true
    };

    const defaultParams = defaultEffectParams[type];
    if (defaultParams) {
      const params: Record<string, number> = {};
      Object.entries(defaultParams).forEach(([param, config]) => {
        params[param] = config.default;
      });
      newEffect.params = params;
    }

    onEffectAdd(newEffect);
    setSelectedEffect(newEffect.id);
  };

  const handleParamChange = (
    effectId: string,
    param: string,
    value: number
  ) => {
    const effect = clip.effects?.find(e => e.id === effectId);
    if (!effect) return;

    onEffectUpdate(effectId, {
      params: { ...effect.params, [param]: value }
    });
  };

  const renderEffectParams = (effect: AudioEffect) => {
    switch (effect.type) {
      case 'equalizer':
        return (
          <div className="effect-params">
            <div className="param-row">
              <Typography variant="body2">Low Gain</Typography>
              <Slider
                value={effect.params.lowGain ?? 0}
                min={defaultEffectParams.equalizer.lowGain.min}
                max={defaultEffectParams.equalizer.lowGain.max}
                onChange={(_, value) => handleParamChange(effect.id, 'lowGain', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">Mid Gain</Typography>
              <Slider
                value={effect.params.midGain ?? 0}
                min={defaultEffectParams.equalizer.midGain.min}
                max={defaultEffectParams.equalizer.midGain.max}
                onChange={(_, value) => handleParamChange(effect.id, 'midGain', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">High Gain</Typography>
              <Slider
                value={effect.params.highGain ?? 0}
                min={defaultEffectParams.equalizer.highGain.min}
                max={defaultEffectParams.equalizer.highGain.max}
                onChange={(_, value) => handleParamChange(effect.id, 'highGain', value)}
                valueLabelDisplay="auto"
              />
            </div>
          </div>
        );

      case 'compressor':
        return (
          <div className="effect-params">
            <div className="param-row">
              <Typography variant="body2">Threshold</Typography>
              <Slider
                value={effect.params.threshold ?? -24}
                min={defaultEffectParams.compressor.threshold.min}
                max={defaultEffectParams.compressor.threshold.max}
                onChange={(_, value) => handleParamChange(effect.id, 'threshold', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">Ratio</Typography>
              <Slider
                value={effect.params.ratio ?? 4}
                min={defaultEffectParams.compressor.ratio.min}
                max={defaultEffectParams.compressor.ratio.max}
                onChange={(_, value) => handleParamChange(effect.id, 'ratio', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">Attack</Typography>
              <Slider
                value={effect.params.attack ?? 0.003}
                min={defaultEffectParams.compressor.attack.min}
                max={defaultEffectParams.compressor.attack.max}
                step={0.001}
                onChange={(_, value) => handleParamChange(effect.id, 'attack', value)}
                valueLabelDisplay="auto"
              />
            </div>
          </div>
        );

      case 'reverb':
        return (
          <div className="effect-params">
            <div className="param-row">
              <Typography variant="body2">Room Size</Typography>
              <Slider
                value={effect.params.roomSize ?? 0.8}
                min={defaultEffectParams.reverb.roomSize.min}
                max={defaultEffectParams.reverb.roomSize.max}
                step={0.01}
                onChange={(_, value) => handleParamChange(effect.id, 'roomSize', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">Dampening</Typography>
              <Slider
                value={effect.params.dampening ?? 3000}
                min={defaultEffectParams.reverb.dampening.min}
                max={defaultEffectParams.reverb.dampening.max}
                onChange={(_, value) => handleParamChange(effect.id, 'dampening', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">Mix</Typography>
              <Slider
                value={effect.params.wetLevel ?? 0.3}
                min={defaultEffectParams.reverb.wetLevel.min}
                max={defaultEffectParams.reverb.wetLevel.max}
                step={0.01}
                onChange={(_, value) => handleParamChange(effect.id, 'wetLevel', value)}
                valueLabelDisplay="auto"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="effect-params">
            <div className="param-row">
              <Typography variant="body2">Delay Time</Typography>
              <Slider
                value={effect.params.delayTime ?? 0.3}
                min={defaultEffectParams.delay.delayTime.min}
                max={defaultEffectParams.delay.delayTime.max}
                step={0.01}
                onChange={(_, value) => handleParamChange(effect.id, 'delayTime', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">Feedback</Typography>
              <Slider
                value={effect.params.feedback ?? 0.5}
                min={defaultEffectParams.delay.feedback.min}
                max={defaultEffectParams.delay.feedback.max}
                step={0.01}
                onChange={(_, value) => handleParamChange(effect.id, 'feedback', value)}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="param-row">
              <Typography variant="body2">Mix</Typography>
              <Slider
                value={effect.params.mix ?? 0.3}
                min={defaultEffectParams.delay.mix.min}
                max={defaultEffectParams.delay.mix.max}
                step={0.01}
                onChange={(_, value) => handleParamChange(effect.id, 'mix', value)}
                valueLabelDisplay="auto"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="audio-mixer">
      <div className="mixer-main">
        <div className="volume-section">
          <VolumeUp />
          <Slider
            orientation="vertical"
            value={clip.volume ?? 1}
            min={0}
            max={2}
            step={0.01}
            onChange={(_, value) => onVolumeChange(value as number)}
            valueLabelDisplay="auto"
          />
        </div>

        <div className="pan-section">
          <Typography variant="body2">Pan</Typography>
          <Slider
            value={clip.pan ?? 0}
            min={-1}
            max={1}
            step={0.01}
            onChange={(_, value) => onPanChange(value as number)}
            valueLabelDisplay="auto"
          />
        </div>

        <canvas
          ref={canvasRef}
          className="audio-visualizer"
          width={300}
          height={100}
        />
      </div>

      <div className="effects-section">
        <div className="effects-header">
          <Typography variant="h6">Audio Effects</Typography>
          <Select
            value=""
            onChange={(e) => handleAddEffect(e.target.value as AudioEffectType)}
            displayEmpty
          >
            <MenuItem value="" disabled>Add Effect</MenuItem>
            <MenuItem value="equalizer">Equalizer</MenuItem>
            <MenuItem value="compressor">Compressor</MenuItem>
            <MenuItem value="reverb">Reverb</MenuItem>
            <MenuItem value="delay">Delay</MenuItem>
          </Select>
        </div>

        <div className="effects-list">
          {clip.effects?.map(effect => (
            <div
              key={effect.id}
              className={`effect-item ${selectedEffect === effect.id ? 'selected' : ''}`}
            >
              <div className="effect-header">
                <IconButton>
                  {effect.type === 'equalizer' ? <GraphicEq /> :
                   effect.type === 'compressor' ? <Tune /> :
                   <Speed />}
                </IconButton>
                <Typography>{effect.type}</Typography>
                <Switch
                  checked={effect.enabled}
                  onChange={(e) => onEffectUpdate(effect.id, { enabled: e.target.checked })}
                />
                <IconButton onClick={() => onEffectDelete(effect.id)}>
                  <DeleteIcon />
                </IconButton>
              </div>
              {selectedEffect === effect.id && renderEffectParams(effect)}
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .audio-mixer {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .mixer-main {
            display: flex;
            align-items: center;
            gap: 24px;
          }

          .volume-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 150px;
          }

          .pan-section {
            flex: 1;
          }

          .audio-visualizer {
            border: 1px solid #ccc;
            border-radius: 4px;
          }

          .effects-section {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .effects-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .effects-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .effect-item {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 16px;
          }

          .effect-item.selected {
            border-color: #1976d2;
            background: rgba(25, 118, 210, 0.08);
          }

          .effect-header {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .effect-params {
            margin-top: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .param-row {
            display: flex;
            align-items: center;
            gap: 16px;
          }
        `
      }} />
    </div>
  );
};

export default AudioMixer;
