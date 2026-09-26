import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { CustomerCreateSchema, CustomerUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', auth, CustomerController.getAll);
router.get('/:id', auth, CustomerController.getById);

router.post(
  '/',
  auth,
  requireRole('ADMIN', 'MANAGER', 'STAFF'),
  validate(CustomerCreateSchema),
  CustomerController.create
);

router.put(
  '/:id',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(CustomerUpdateSchema),
  CustomerController.update
);

export default router;
