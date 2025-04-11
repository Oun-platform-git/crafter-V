import React from 'react';

export default function Timeline({ tracks, currentTime, duration, onTimeUpdate }) {
  const timelineRef = React.useRef(null);

  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onTimeUpdate(percentage * duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      {/* Timeline Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="space-x-2">
          <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">
            <span className="text-sm">Zoom In</span>
          </button>
          <button className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">
            <span className="text-sm">Zoom Out</span>
          </button>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 bg-gray-800 rounded mb-2 relative" ref={timelineRef} onClick={handleTimelineClick}>
        <div
          className="absolute top-0 bottom-0 bg-blue-600 opacity-50"
          style={{ left: 0, width: `${(currentTime / duration) * 100}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Tracks */}
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <div key={index} className="h-16 bg-gray-800 rounded relative">
            {track.clips.map((clip, clipIndex) => (
              <div
                key={clipIndex}
                className="absolute top-0 bottom-0 bg-gray-700 rounded cursor-move"
                style={{
                  left: `${(clip.start / duration) * 100}%`,
                  width: `${((clip.end - clip.start) / duration) * 100}%`,
                }}
              >
                <div className="p-2 text-xs truncate">{clip.name}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
