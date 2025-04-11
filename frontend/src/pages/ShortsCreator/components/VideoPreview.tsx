import { FC, useRef, useEffect } from 'react';

interface VideoPreviewProps {
  src?: string;
  isLooping: boolean;
  onTimeUpdate: (time: number) => void;
}

const VideoPreview: FC<VideoPreviewProps> = ({ src, isLooping, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.loop = isLooping;
  }, [isLooping]);

  return (
    <div className="relative w-full h-full">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <span>9:16 Preview Area</span>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
