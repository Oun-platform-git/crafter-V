import { FC, ReactNode } from 'react';

interface VideoPreviewProps {
  aspectRatio?: '16/9' | '9/16' | '1/1';
  videoUrl?: string | null;
  overlay?: ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

export const VideoPreview: FC<VideoPreviewProps> = ({
  aspectRatio = '9/16',
  videoUrl,
  overlay,
  emptyState,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className={`aspect-[${aspectRatio}] bg-gray-100 rounded-lg relative`}>
        {videoUrl ? (
          <video 
            src={videoUrl}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : emptyState || (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No video selected</p>
            </div>
          </div>
        )}
        {overlay}
      </div>
    </div>
  );
};

export default VideoPreview;
