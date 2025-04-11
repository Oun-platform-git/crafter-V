import express, { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  optimizeAdPlacement,
  checkMonetizationEligibility,
  generateAffiliateLinks,
  suggestTrendingKeywords,
  generateSponsorshipPitch
} from '../controllers/monetization.controller';

const router: Router = express.Router();

// All routes require authentication
router.use(auth);

// Monetization routes
router.post('/optimize-ads', optimizeAdPlacement);
router.post('/check-eligibility', checkMonetizationEligibility);
router.post('/affiliate-links', generateAffiliateLinks);
router.post('/trending-keywords', suggestTrendingKeywords);
router.post('/sponsorship-pitch', generateSponsorshipPitch);

export default router;
