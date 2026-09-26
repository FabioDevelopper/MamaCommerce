import { Router } from 'express';
import { ExpenseController } from '../controllers/expense.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { ExpenseCreateSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', auth, ExpenseController.getAll);

router.post(
  '/',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(ExpenseCreateSchema),
  ExpenseController.create
);

router.delete(
  '/:id',
  auth,
  requireRole('ADMIN'),
  ExpenseController.delete
);

export default router;
