import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { SupplierCreateSchema, SupplierUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', auth, SupplierController.getAll);
router.get('/:id', auth, SupplierController.getById);

router.post(
  '/',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(SupplierCreateSchema),
  SupplierController.create
);

router.put(
  '/:id',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(SupplierUpdateSchema),
  SupplierController.update
);

export default router;
