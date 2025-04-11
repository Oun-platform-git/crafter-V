import { FC, useState, useCallback } from 'react';
import { VideoClip } from '../Timeline/Timeline';
import PreviewPlayer from './PreviewPlayer';
import PreviewControls from './PreviewControls';

interface PreviewProps {
  clips: VideoClip[];
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
}

const Preview: FC<PreviewProps> = ({
  clips,
  currentTime,
  duration,
  onTimeUpdate
}) => {
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');

  const handlePlay = useCallback(() => {
    setPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setPlaying(false);
  }, []);

  const handleSeek = useCallback((time: number) => {
    onTimeUpdate(time);
  }, [onTimeUpdate]);

  const handleNextFrame = useCallback(() => {
    const frameTime = 1 / 30; // Assuming 30 FPS
    onTimeUpdate(Math.min(currentTime + frameTime, duration));
  }, [currentTime, duration, onTimeUpdate]);

  const handlePrevFrame = useCallback(() => {
    const frameTime = 1 / 30; // Assuming 30 FPS
    onTimeUpdate(Math.max(currentTime - frameTime, 0));
  }, [currentTime, onTimeUpdate]);

  return (
    <div className="preview">
      <div className="preview-player-container">
        <PreviewPlayer
          clips={clips}
          currentTime={currentTime}
          playing={playing}
          onTimeUpdate={onTimeUpdate}
          fps={30 * playbackSpeed}
          quality={quality}
        />
      </div>

      <PreviewControls
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        playbackSpeed={playbackSpeed}
        quality={quality}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onSpeedChange={setPlaybackSpeed}
        onQualityChange={setQuality}
        onNextFrame={handleNextFrame}
        onPrevFrame={handlePrevFrame}
      />

      <style jsx>{`
        .preview {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #000;
        }

        .preview-player-container {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Preview;
