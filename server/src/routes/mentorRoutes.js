import { Router } from 'express';
import { explainExperiment, chatWithMentor, analyzeExperiment } from '../controllers/mentorController.js';
import { mentorRateLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(mentorRateLimiter);
router.post('/explain', explainExperiment);
router.post('/chat', chatWithMentor);
router.post('/analyze', analyzeExperiment);

export default router;
