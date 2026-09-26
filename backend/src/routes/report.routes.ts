import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

router.get('/', auth, requireRole('ADMIN', 'MANAGER'), ReportController.getReport);
router.get('/export/csv', auth, requireRole('ADMIN', 'MANAGER'), ReportController.exportCsv);

export default router;
