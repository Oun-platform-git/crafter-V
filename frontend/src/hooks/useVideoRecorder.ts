import { useState, useRef, useCallback, useEffect } from 'react';

interface VideoRecorderOptions {
  maxDuration?: number;
  videoConstraints?: MediaTrackConstraints;
  onError?: (error: Error) => void;
  onRecordingComplete?: (blob: Blob) => void;
}

interface VideoRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: Error | null;
}

export const useVideoRecorder = ({
  maxDuration = 60,
  videoConstraints = {
    width: { ideal: 1080 },
    height: { ideal: 1920 },
    frameRate: { ideal: 30 }
  },
  onError,
  onRecordingComplete
}: VideoRecorderOptions = {}) => {
  const [state, setState] = useState<VideoRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    try {
      cleanup();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
        cleanup();
      };

      mediaRecorder.start(1000); // Collect data every second
      setState(prev => ({ ...prev, isRecording: true, duration: 0 }));

      timerRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return prev;
          }
          return { ...prev, duration: newDuration };
        });
      }, 1000);
    } catch (err) {
      const error = err as Error;
      setState(prev => ({ ...prev, error }));
      if (onError) {
        onError(error);
      }
    }
  }, [maxDuration, videoConstraints, cleanup, onError, onRecordingComplete]);

  const stopRecording = useCallback(() => {
    cleanup();
    setState(prev => ({ ...prev, isRecording: false, isPaused: false }));
  }, [cleanup]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return prev;
          }
          return { ...prev, duration: newDuration };
        });
      }, 1000);
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [maxDuration, stopRecording]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};

export default useVideoRecorder;
