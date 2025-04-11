import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createClip,
  getClip,
  updateClip,
  listClips,
  deleteClip
} from '../controllers/stream-clips.controller';

const router = Router();

// All routes require authentication
router.use(auth);

// Clip management
router.route('/clips')
  .post(createClip);

router.route('/clips/:clipId')
  .get(getClip)
  .put(updateClip)
  .delete(deleteClip);

// List clips for a channel
router.route('/channels/:channelId/clips')
  .get(listClips);

export default router;
