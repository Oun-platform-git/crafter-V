import { Request, Response } from 'express';
import { LiveStreamService } from '../services/live-stream.service';
import { StreamMetricsService } from '../services/stream-metrics.service';

const streamService = new LiveStreamService();
const metricsService = new StreamMetricsService();

interface CreateChannelRequest {
  resolution: string;
  bitrate: number;
  fps: number;
  codec: string;
}

export const createChannel = async (
  req: Request<{}, {}, CreateChannelRequest>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    const channelInfo = await streamService.createChannel(userId, req.body);
    res.json(channelInfo);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
};

export const deleteChannel = async (
  req: Request<{ channelArn: string }>,
  res: Response
): Promise<void> => {
  try {
    const { channelArn } = req.params;
    await streamService.deleteChannel(channelArn);
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
};

export const getStreamStatus = async (
  req: Request<{ channelArn: string }>,
  res: Response
): Promise<void> => {
  try {
    const { channelArn } = req.params;
    const status = await streamService.getStreamStatus(channelArn);
    res.json(status);
  } catch (error) {
    console.error('Error getting stream status:', error);
    res.status(500).json({ error: 'Failed to get stream status' });
  }
};

export const stopStream = async (
  req: Request<{ channelArn: string }>,
  res: Response
): Promise<void> => {
  try {
    const { channelArn } = req.params;
    await streamService.stopStream(channelArn);
    await metricsService.stopStreamTracking(channelArn);
    res.json({ message: 'Stream stopped successfully' });
  } catch (error) {
    console.error('Error stopping stream:', error);
    res.status(500).json({ error: 'Failed to stop stream' });
  }
};

export const getStreamMetrics = async (
  req: Request<{ channelArn: string }>,
  res: Response
): Promise<void> => {
  try {
    const { channelArn } = req.params;
    const metrics = await metricsService.getMetrics(channelArn);
    res.json(metrics);
  } catch (error) {
    console.error('Error getting stream metrics:', error);
    res.status(500).json({ error: 'Failed to get stream metrics' });
  }
};
