import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router = Router();

// GET /api/healthcheck/get
router.get('/get', getHealth);

export default router;
