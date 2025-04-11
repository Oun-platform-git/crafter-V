import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createChannel,
  deleteChannel,
  getStreamStatus,
  stopStream,
  getStreamMetrics
} from '../controllers/live-stream.controller';

const router = Router();

// All routes require authentication
router.use(auth);

// Channel management
router.route('/channels')
  .post(createChannel);

router.route('/channels/:channelArn')
  .delete(deleteChannel);

// Stream control
router.route('/channels/:channelArn/status')
  .get(getStreamStatus);

router.route('/channels/:channelArn/stop')
  .post(stopStream);

// Stream metrics
router.route('/channels/:channelArn/metrics')
  .get(getStreamMetrics);

export default router;
