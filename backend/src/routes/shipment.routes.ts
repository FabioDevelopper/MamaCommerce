import { Router } from 'express';
import { ShipmentController } from '../controllers/shipment.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  ShipmentCreateSchema,
  ShipmentStatusUpdateSchema,
} from '../validators/schemas.js';

const router = Router();

router.get('/', auth, ShipmentController.getAll);
router.get('/:id', auth, ShipmentController.getById);

router.post(
  '/',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(ShipmentCreateSchema),
  ShipmentController.create
);

router.patch(
  '/:id/status',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(ShipmentStatusUpdateSchema),
  ShipmentController.updateStatus
);

export default router;
