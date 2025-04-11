import { useState, useCallback } from 'react';
import axios from 'axios';

interface RecordingConfig {
  format: 'MP4' | 'HLS';
  quality: 'HIGH' | 'STANDARD';
  retention: number;
  outputSettings?: {
    resolution?: string;
    bitrate?: number;
    codec?: string;
  };
}

interface RecordingMetadata {
  id: string;
  channelId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  size?: number;
  format: string;
  quality: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  url?: string;
}

export const useStreamRecording = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async (
    channelId: string,
    config: RecordingConfig
  ): Promise<RecordingMetadata> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/stream/recording/start', {
        channelId,
        config
      });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopRecording = useCallback(async (recordingId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`/api/stream/recording/${recordingId}/stop`);
    } catch (err: any) {
      setError(err.message || 'Failed to stop recording');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecordings = useCallback(async (channelId: string): Promise<RecordingMetadata[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/stream/recording/list/${channelId}`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get recordings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRecording = useCallback(async (recordingId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/stream/recording/${recordingId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete recording');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadRecording = useCallback(async (recordingId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/stream/recording/${recordingId}/download`, {
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recording-${recordingId}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download recording');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getRecordingStatus = useCallback(async (recordingId: string): Promise<RecordingMetadata> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/stream/recording/${recordingId}/status`);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get recording status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    startRecording,
    stopRecording,
    getRecordings,
    deleteRecording,
    downloadRecording,
    getRecordingStatus
  };
};
