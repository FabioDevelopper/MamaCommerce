import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { OrderCreateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', auth, OrderController.getAll);
router.get('/:id', auth, OrderController.getById);

router.post(
  '/',
  auth,
  requireRole('ADMIN', 'MANAGER', 'STAFF'),
  validate(OrderCreateSchema),
  OrderController.create
);

router.post(
  '/:id/cancel',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  OrderController.cancel
);

export default router;
