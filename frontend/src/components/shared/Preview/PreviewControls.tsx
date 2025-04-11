import { FC } from 'react';
import { IconButton, Slider, Select, MenuItem } from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Speed,
  HighQuality
} from '@mui/icons-material';

interface PreviewControlsProps {
  playing: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  quality: 'low' | 'medium' | 'high';
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  onNextFrame: () => void;
  onPrevFrame: () => void;
}

const PreviewControls: FC<PreviewControlsProps> = ({
  playing,
  currentTime,
  duration,
  playbackSpeed,
  quality,
  onPlay,
  onPause,
  onSeek,
  onSpeedChange,
  onQualityChange,
  onNextFrame,
  onPrevFrame
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="preview-controls">
      <div className="preview-controls-timeline">
        <span className="preview-time">{formatTime(currentTime)}</span>
        <Slider
          value={currentTime}
          min={0}
          max={duration}
          onChange={(_, value) => onSeek(value as number)}
          className="preview-timeline-slider"
        />
        <span className="preview-duration">{formatTime(duration)}</span>
      </div>

      <div className="preview-controls-buttons">
        <IconButton onClick={onPrevFrame}>
          <SkipPrevious />
        </IconButton>

        <IconButton onClick={playing ? onPause : onPlay}>
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>

        <IconButton onClick={onNextFrame}>
          <SkipNext />
        </IconButton>

        <div className="preview-controls-speed">
          <Speed />
          <Select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(e.target.value as number)}
            variant="standard"
          >
            <MenuItem value={0.25}>0.25x</MenuItem>
            <MenuItem value={0.5}>0.5x</MenuItem>
            <MenuItem value={1}>1x</MenuItem>
            <MenuItem value={1.5}>1.5x</MenuItem>
            <MenuItem value={2}>2x</MenuItem>
          </Select>
        </div>

        <div className="preview-controls-quality">
          <HighQuality />
          <Select
            value={quality}
            onChange={(e) => onQualityChange(e.target.value as 'low' | 'medium' | 'high')}
            variant="standard"
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </div>
      </div>

      <style jsx>{`
        .preview-controls {
          padding: 16px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
        }

        .preview-controls-timeline {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .preview-time,
        .preview-duration {
          font-family: monospace;
          min-width: 48px;
        }

        .preview-timeline-slider {
          flex: 1;
        }

        .preview-controls-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .preview-controls-speed,
        .preview-controls-quality {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
};

export default PreviewControls;
