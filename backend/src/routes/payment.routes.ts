import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { PaymentCreateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', auth, PaymentController.getAll);
router.get('/:id', auth, PaymentController.getById);

router.post(
  '/',
  auth,
  requireRole('ADMIN', 'MANAGER', 'STAFF'),
  validate(PaymentCreateSchema),
  PaymentController.create
);

export default router;
