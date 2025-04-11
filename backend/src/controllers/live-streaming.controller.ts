import { Request, Response } from 'express';
import { LiveStreamingService } from '../services/live-streaming.service';

const liveStreamingService = new LiveStreamingService();

interface CreateStreamRequest {
  resolution: string;
  bitrate: number;
  fps: number;
  codec: string;
}

interface CreateClipRequest {
  channelId: string;
  startTime: number;
  duration: number;
}

interface EnableRecordingRequest {
  channelId: string;
  format: 'MP4' | 'HLS';
  quality: 'HIGH' | 'STANDARD';
}

export const createStreamChannel = async (
  req: Request<{}, {}, CreateStreamRequest>,
  res: Response
) => {
  try {
    const userId = req.user._id;
    const streamConfig = {
      resolution: req.body.resolution,
      bitrate: req.body.bitrate,
      fps: req.body.fps,
      codec: req.body.codec
    };

    const channelInfo = await liveStreamingService.createStreamChannel(
      userId,
      streamConfig
    );

    res.json(channelInfo);
  } catch (error) {
    console.error('Error creating stream channel:', error);
    res.status(500).json({ error: 'Failed to create stream channel' });
  }
};

export const startStream = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    await liveStreamingService.startStream(channelId);
    res.json({ message: 'Stream started successfully' });
  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(500).json({ error: 'Failed to start stream' });
  }
};

export const stopStream = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    await liveStreamingService.stopStream(channelId);
    res.json({ message: 'Stream stopped successfully' });
  } catch (error) {
    console.error('Error stopping stream:', error);
    res.status(500).json({ error: 'Failed to stop stream' });
  }
};

export const getStreamMetrics = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    const metrics = await liveStreamingService.getStreamMetrics(channelId);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting stream metrics:', error);
    res.status(500).json({ error: 'Failed to get stream metrics' });
  }
};

export const createClip = async (
  req: Request<{}, {}, CreateClipRequest>,
  res: Response
) => {
  try {
    const { channelId, startTime, duration } = req.body;
    const clip = await liveStreamingService.createClip(
      channelId,
      startTime,
      duration
    );
    res.json(clip);
  } catch (error) {
    console.error('Error creating clip:', error);
    res.status(500).json({ error: 'Failed to create clip' });
  }
};

export const enableRecording = async (
  req: Request<{}, {}, EnableRecordingRequest>,
  res: Response
) => {
  try {
    const { channelId, format, quality } = req.body;
    await liveStreamingService.enableRecording(channelId, { format, quality });
    res.json({ message: 'Recording enabled successfully' });
  } catch (error) {
    console.error('Error enabling recording:', error);
    res.status(500).json({ error: 'Failed to enable recording' });
  }
};

export const getStreamHealth = async (
  req: Request<{ channelId: string }>,
  res: Response
) => {
  try {
    const { channelId } = req.params;
    const health = await liveStreamingService.getStreamHealth(channelId);
    res.json(health);
  } catch (error) {
    console.error('Error getting stream health:', error);
    res.status(500).json({ error: 'Failed to get stream health' });
  }
};
