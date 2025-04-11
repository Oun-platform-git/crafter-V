import React from 'react';

export default function Preview({ videoUrl, currentTime, isPlaying, onPlay, onPause }) {
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  React.useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Video Preview */}
      <div className="aspect-video bg-black relative">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            No video loaded
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
          >
            {isPlaying ? "⏸" : "▶️"}
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
            ⏮
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center">
            ⏭
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
            Cut
          </button>
          <button className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700">
            Split
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
