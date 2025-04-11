import React, { useState, useRef, useEffect } from 'react';
import { Box, Slider, IconButton, Select, MenuItem, Typography, Paper } from '@mui/material';
import { ContentCut, PlayArrow, Pause } from '@mui/icons-material';
import styled from '@emotion/styled';

interface VideoSegment {
  blob: Blob;
  startTime: number;
  duration: number;
}

interface VideoEditorProps {
  segments: VideoSegment[];
  onSave: (editedSegments: VideoSegment[]) => void;
  availableTransitions: string[];
}

const EditorContainer = styled(Paper)`
  padding: 20px;
  margin: 20px 0;
`;

const Timeline = styled.div`
  position: relative;
  height: 100px;
  background: #2a2a2a;
  margin: 20px 0;
  border-radius: 4px;
  overflow: hidden;
`;

const TimelineSegment = styled.div<{ width: number }>`
  position: relative;
  height: 100%;
  width: ${props => props.width}%;
  background: #4a4a4a;
  border-right: 2px solid #666;
  display: inline-block;
`;

const TransitionOverlay = styled.div`
  position: absolute;
  right: -10px;
  top: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, #f50057, transparent);
  cursor: pointer;
  z-index: 2;
`;

const VideoPreview = styled.video`
  width: 100%;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const VideoEditor: React.FC<VideoEditorProps> = ({
  segments,
  onSave,
  availableTransitions
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
  const [selectedTransitions, setSelectedTransitions] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const totalDuration = segments.reduce((acc, seg) => acc + seg.duration, 0);

  useEffect(() => {
    if (segments.length > 0) {
      const urls = segments.map(seg => URL.createObjectURL(seg.blob));
      if (videoRef.current) {
        videoRef.current.src = urls[0]; // Start with first segment
      }
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    }
  }, [segments]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const timeline = e.currentTarget;
    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * totalDuration;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime / 1000;
    }
  };

  const handleTrimChange = (_: Event, newValue: number | number[]) => {
    setTrimRange(newValue as [number, number]);
  };

  const handleTransitionChange = (index: number, transition: string) => {
    const newTransitions = [...selectedTransitions];
    newTransitions[index] = transition;
    setSelectedTransitions(newTransitions);
  };

  const handleSplitAtCurrentTime = () => {
    const splitPoint = currentTime;
    const segmentIndex = segments.findIndex(seg => {
      const segmentEnd = seg.startTime + seg.duration;
      return splitPoint >= seg.startTime && splitPoint < segmentEnd;
    });

    if (segmentIndex === -1) return;

    const segment = segments[segmentIndex];
    const splitTime = splitPoint - segment.startTime;

    // Create two new blobs from the split point
    const mediaSource = new MediaSource();
    const video = document.createElement('video');
    video.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', async () => {
      const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,opus"');
      const arrayBuffer = await segment.blob.arrayBuffer();
      sourceBuffer.appendBuffer(arrayBuffer);

      sourceBuffer.addEventListener('updateend', () => {
        const firstPart = new Blob([arrayBuffer.slice(0, splitTime)], { type: 'video/webm' });
        const secondPart = new Blob([arrayBuffer.slice(splitTime)], { type: 'video/webm' });

        const newSegments = [
          ...segments.slice(0, segmentIndex),
          {
            blob: firstPart,
            startTime: segment.startTime,
            duration: splitTime
          },
          {
            blob: secondPart,
            startTime: segment.startTime + splitTime,
            duration: segment.duration - splitTime
          },
          ...segments.slice(segmentIndex + 1)
        ];

        onSave(newSegments);
      });
    });
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <EditorContainer>
      <VideoPreview ref={videoRef} controls />

      <Box display="flex" alignItems="center" gap={2}>
        <IconButton onClick={handlePlayPause}>
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton onClick={handleSplitAtCurrentTime}>
          <ContentCut />
        </IconButton>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle2">Trim Range</Typography>
        <Slider
          value={trimRange}
          onChange={handleTrimChange}
          valueLabelDisplay="auto"
          min={0}
          max={100}
        />
      </Box>

      <Timeline onClick={handleTimelineClick}>
        {segments.map((segment, index) => {
          const width = (segment.duration / totalDuration) * 100;
          return (
            <TimelineSegment key={index} width={width}>
              {index < segments.length - 1 && (
                <>
                  <TransitionOverlay />
                  <Select
                    size="small"
                    value={selectedTransitions[index] || ''}
                    onChange={(e) => handleTransitionChange(index, e.target.value)}
                    sx={{ position: 'absolute', right: -50, top: '50%', transform: 'translateY(-50%)' }}
                  >
                    {availableTransitions.map(transition => (
                      <MenuItem key={transition} value={transition}>
                        {transition}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            </TimelineSegment>
          );
        })}
      </Timeline>

      <Typography variant="caption" color="textSecondary">
        Click on timeline to seek. Use slider to trim. Click cut icon to split at current position.
      </Typography>
    </EditorContainer>
  );
};

export default VideoEditor;
