import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, DashboardController.getMetrics);

export default router;
