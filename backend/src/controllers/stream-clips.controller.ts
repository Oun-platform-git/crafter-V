import { Request, Response } from 'express';
import { StreamClipsService } from '../services/stream-clips.service';

const clipsService = new StreamClipsService();

interface CreateClipRequest {
  channelArn: string;
  startTime: number;
  duration: number;
}

interface UpdateClipRequest {
  title?: string;
  description?: string;
}

interface ClipParams {
  clipId: string;
}

interface ChannelParams {
  channelId: string;
}

export const createClip = async (
  req: Request<{}, {}, CreateClipRequest>,
  res: Response
): Promise<void> => {
  try {
    const { channelArn, startTime, duration } = req.body;
    const userId = req.user._id;

    const clip = await clipsService.createClip(channelArn, userId, startTime, duration);
    res.json(clip);
  } catch (error) {
    console.error('Error creating clip:', error);
    res.status(500).json({ error: 'Failed to create clip' });
  }
};

export const getClip = async (
  req: Request<ClipParams>,
  res: Response
): Promise<void> => {
  try {
    const { clipId } = req.params;
    const clip = await clipsService.getClip(clipId);

    if (!clip) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }

    res.json(clip);
  } catch (error) {
    console.error('Error getting clip:', error);
    res.status(500).json({ error: 'Failed to get clip' });
  }
};

export const updateClip = async (
  req: Request<ClipParams, {}, UpdateClipRequest>,
  res: Response
): Promise<void> => {
  try {
    const { clipId } = req.params;
    const userId = req.user._id;

    const clip = await clipsService.getClip(clipId);
    if (!clip) {
      res.status(404).json({ error: 'Clip not found' });
      return;
    }
    if (clip.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const updatedClip = await clipsService.updateClipMetadata(clipId, req.body);
    res.json(updatedClip);
  } catch (error) {
    console.error('Error updating clip:', error);
    res.status(500).json({ error: 'Failed to update clip' });
  }
};

export const listClips = async (
  req: Request<ChannelParams>,
  res: Response
): Promise<void> => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const clips = await clipsService.listClips(channelId, limit, offset);
    res.json(clips);
  } catch (error) {
    console.error('Error listing clips:', error);
    res.status(500).json({ error: 'Failed to list clips' });
  }
};

export const deleteClip = async (
  req: Request<ClipParams>,
  res: Response
): Promise<void> => {
  try {
    const { clipId } = req.params;
    const userId = req.user._id;

    await clipsService.deleteClip(clipId, userId);
    res.json({ message: 'Clip deleted successfully' });
  } catch (error) {
    console.error('Error deleting clip:', error);
    res.status(500).json({ error: 'Failed to delete clip' });
  }
};
