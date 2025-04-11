import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { VideoEffectsService } from '../services/video-effects.service';
import { validateVideoFile } from '../utils/file-validator';

const router = Router();
const videoEffectsService = new VideoEffectsService();

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../temp'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (validateVideoFile(file)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4 and WebM files are allowed.'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Get all available effects
router.get('/effects', async (req: Request, res: Response) => {
  try {
    const effects = await videoEffectsService.getEffects();
    res.json(effects);
  } catch (error) {
    console.error('Error getting effects:', error);
    res.status(500).json({ error: 'Failed to get effects' });
  }
});

// Get effects by category
router.get('/effects/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const effects = await videoEffectsService.getEffectsByCategory(category as any);
    res.json(effects);
  } catch (error) {
    console.error('Error getting effects by category:', error);
    res.status(500).json({ error: 'Failed to get effects' });
  }
});

// Get all available transitions
router.get('/transitions', async (req: Request, res: Response) => {
  try {
    const transitions = await videoEffectsService.getTransitions();
    res.json(transitions);
  } catch (error) {
    console.error('Error getting transitions:', error);
    res.status(500).json({ error: 'Failed to get transitions' });
  }
});

// Get transitions by category
router.get('/transitions/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const transitions = await videoEffectsService.getTransitionsByCategory(category as any);
    res.json(transitions);
  } catch (error) {
    console.error('Error getting transitions by category:', error);
    res.status(500).json({ error: 'Failed to get transitions' });
  }
});

// Apply effect to video
router.post('/apply-effect', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { effectId, options } = req.body;
    if (!effectId) {
      return res.status(400).json({ error: 'Effect ID is required' });
    }

    const processedUrl = await videoEffectsService.applyEffect(req.file.path, effectId, JSON.parse(options || '{}'));
    res.json({ url: processedUrl });
  } catch (error) {
    console.error('Error applying effect:', error);
    res.status(500).json({ error: 'Failed to apply effect' });
  }
});

// Apply batch effects to video
router.post('/apply-batch-effects', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { effects } = req.body;
    if (!effects) {
      return res.status(400).json({ error: 'Effects array is required' });
    }

    const effectsArray = JSON.parse(effects);
    if (!Array.isArray(effectsArray)) {
      return res.status(400).json({ error: 'Effects must be an array' });
    }

    const processedUrl = await videoEffectsService.applyBatchEffects(req.file.path, effectsArray);
    res.json({ url: processedUrl });
  } catch (error) {
    console.error('Error applying batch effects:', error);
    res.status(500).json({ error: 'Failed to apply batch effects' });
  }
});

// Apply transition between two videos
router.post('/apply-transition', upload.fields([
  { name: 'video1', maxCount: 1 },
  { name: 'video2', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.video1?.[0] || !files.video2?.[0]) {
      return res.status(400).json({ error: 'Both video files are required' });
    }

    const { transitionId, duration } = req.body;
    if (!transitionId) {
      return res.status(400).json({ error: 'Transition ID is required' });
    }

    const processedUrl = await videoEffectsService.applyTransition(
      files.video1[0].path,
      files.video2[0].path,
      transitionId,
      parseFloat(duration) || 0.5
    );
    res.json({ url: processedUrl });
  } catch (error) {
    console.error('Error applying transition:', error);
    res.status(500).json({ error: 'Failed to apply transition' });
  }
});

// Generate effect preview
router.post('/generate-preview', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { effectId, options } = req.body;
    if (!effectId) {
      return res.status(400).json({ error: 'Effect ID is required' });
    }

    const previewUrl = await videoEffectsService.generatePreview(req.file.path, effectId, JSON.parse(options || '{}'));
    res.json({ url: previewUrl });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// Cleanup temporary files
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    await videoEffectsService.cleanup();
    res.json({ message: 'Cleanup completed successfully' });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Failed to perform cleanup' });
  }
});

export default router;
