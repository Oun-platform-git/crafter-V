import { Request, Response } from 'express';
import { StreamRecordingService } from '../services/stream-recording.service';

const recordingService = new StreamRecordingService();

interface StartRecordingRequest {
  channelId: string;
  format: 'MP4' | 'HLS';
  quality: 'HIGH' | 'STANDARD';
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

interface UpdateRecordingRequest {
  recordingId: string;
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export const startRecording = async (
  req: Request<{}, {}, StartRecordingRequest>,
  res: Response
) => {
  try {
    const { channelId, format, quality, metadata } = req.body;
    const userId = req.user._id;

    const recording = await recordingService.startRecording(
      channelId,
      userId,
      { format, quality },
      metadata
    );

    res.json(recording);
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({ error: 'Failed to start recording' });
  }
};

export const stopRecording = async (
  req: Request<{ recordingId: string }>,
  res: Response
) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    await recordingService.stopRecording(recordingId, userId);
    res.json({ message: 'Recording stopped successfully' });
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({ error: 'Failed to stop recording' });
  }
};

export const getRecordings = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const recordings = await recordingService.getRecordings(
      channelId,
      userId,
      limit,
      offset
    );

    res.json(recordings);
  } catch (error) {
    console.error('Error getting recordings:', error);
    res.status(500).json({ error: 'Failed to get recordings' });
  }
};

export const getRecordingDetails = async (
  req: Request<{ recordingId: string }>,
  res: Response
) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    const recording = await recordingService.getRecordingDetails(recordingId, userId);
    res.json(recording);
  } catch (error) {
    console.error('Error getting recording details:', error);
    res.status(500).json({ error: 'Failed to get recording details' });
  }
};

export const updateRecording = async (
  req: Request<{}, {}, UpdateRecordingRequest>,
  res: Response
) => {
  try {
    const { recordingId, metadata } = req.body;
    const userId = req.user._id;

    await recordingService.updateRecording(recordingId, userId, metadata);
    res.json({ message: 'Recording updated successfully' });
  } catch (error) {
    console.error('Error updating recording:', error);
    res.status(500).json({ error: 'Failed to update recording' });
  }
};

export const deleteRecording = async (
  req: Request<{ recordingId: string }>,
  res: Response
) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    await recordingService.deleteRecording(recordingId, userId);
    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ error: 'Failed to delete recording' });
  }
};

export const getRecordingPlaybackUrl = async (
  req: Request<{ recordingId: string }>,
  res: Response
) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    const url = await recordingService.getPlaybackUrl(recordingId, userId);
    res.json({ playbackUrl: url });
  } catch (error) {
    console.error('Error getting recording playback URL:', error);
    res.status(500).json({ error: 'Failed to get recording playback URL' });
  }
};

export const getRecordingDownloadUrl = async (
  req: Request<{ recordingId: string }>,
  res: Response
) => {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    const url = await recordingService.getDownloadUrl(recordingId, userId);
    res.json({ downloadUrl: url });
  } catch (error) {
    console.error('Error getting recording download URL:', error);
    res.status(500).json({ error: 'Failed to get recording download URL' });
  }
};
