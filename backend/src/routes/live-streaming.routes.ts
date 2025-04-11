import express, { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createStreamChannel,
  startStream,
  stopStream,
  getStreamMetrics,
  createClip,
  enableRecording,
  getStreamHealth
} from '../controllers/live-streaming.controller';

const router: Router = express.Router();

// All routes require authentication
router.use(auth);

// Stream management
router.post('/channels', createStreamChannel);
router.post('/channels/:channelId/start', startStream);
router.post('/channels/:channelId/stop', stopStream);
router.get('/channels/:channelId/metrics', getStreamMetrics);
router.get('/channels/:channelId/health', getStreamHealth);

// Clip creation
router.post('/clips', createClip);

// Recording management
router.post('/recording', enableRecording);

export default router;
