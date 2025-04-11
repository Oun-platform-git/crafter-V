import React, { useRef, useState, useEffect } from 'react';
import { Button, IconButton, Typography, Box } from '@mui/material';
import { PlayArrow, Stop, Pause, FiberManualRecord } from '@mui/icons-material';
import styled from '@emotion/styled';

interface VideoSegment {
  blob: Blob;
  startTime: number;
  duration: number;
}

interface VideoRecorderProps {
  onRecordingComplete: (segments: VideoSegment[]) => void;
  maxDuration?: number;
  countdownDuration?: number;
}

const RecorderContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
`;

const VideoPreview = styled.video`
  width: 100%;
  border-radius: 8px;
  background-color: #000;
`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`;

const CountdownOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 48px;
  font-weight: bold;
`;

const ProgressBar = styled.div<{ progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: ${props => props.progress}%;
  background-color: #f50057;
  transition: width 0.1s linear;
`;

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 60,
  countdownDuration = 3
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [currentSegmentStartTime, setCurrentSegmentStartTime] = useState(0);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startCountdown = () => {
    setCountdown(countdownDuration);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const duration = Date.now() - currentSegmentStartTime;
      
      setSegments(prev => [...prev, {
        blob,
        startTime: currentSegmentStartTime,
        duration
      }]);
    };

    setCurrentSegmentStartTime(Date.now());
    mediaRecorder.start();
    setIsRecording(true);
    setIsPaused(false);

    // Start recording time counter
    const interval = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= maxDuration) {
          clearInterval(interval);
          stopRecording();
          return maxDuration;
        }
        return prev + 0.1;
      });
    }, 100);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    startRecording();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      onRecordingComplete(segments);
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  const progress = (recordingTime / maxDuration) * 100;

  return (
    <RecorderContainer>
      <VideoPreview ref={videoRef} autoPlay muted playsInline />
      <ProgressBar progress={progress} />
      
      {countdown > 0 && (
        <CountdownOverlay>
          {countdown}
        </CountdownOverlay>
      )}

      <Controls>
        {!isRecording && !isPaused && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<FiberManualRecord />}
            onClick={startCountdown}
          >
            Start Recording
          </Button>
        )}

        {isRecording && !isPaused && (
          <>
            <IconButton color="primary" onClick={pauseRecording}>
              <Pause />
            </IconButton>
            <IconButton color="secondary" onClick={stopRecording}>
              <Stop />
            </IconButton>
          </>
        )}

        {isPaused && (
          <>
            <IconButton color="primary" onClick={resumeRecording}>
              <PlayArrow />
            </IconButton>
            <IconButton color="secondary" onClick={stopRecording}>
              <Stop />
            </IconButton>
          </>
        )}
      </Controls>

      <Box mt={2} textAlign="center">
        <Typography variant="body2">
          Recording Time: {recordingTime.toFixed(1)}s / {maxDuration}s
        </Typography>
        <Typography variant="body2">
          Segments: {segments.length}
        </Typography>
      </Box>
    </RecorderContainer>
  );
};

export default VideoRecorder;
