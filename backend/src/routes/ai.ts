import express from 'express';
import { AIGenerationController } from '../controllers/AIGenerationController';

const router = express.Router();
const aiController = new AIGenerationController();

// Video generation routes
router.post('/generate/video', aiController.generateVideo);
router.get('/generate/status/:generationId', aiController.checkGenerationStatus);
router.post('/enhance/video', aiController.enhanceVideo);

// Audio generation routes
router.post('/generate/audio', aiController.generateAudio);
router.get('/generate/audio/status/:generationId', aiController.checkAudioStatus);

// Analysis routes
router.post('/analyze/mood', aiController.analyzeMood);
router.post('/analyze/pets', aiController.analyzePets);
router.post('/analyze/content', aiController.analyzeContent);

export default router;
