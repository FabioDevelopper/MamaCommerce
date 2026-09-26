import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  StockAdjustmentSchema,
} from '../validators/schemas.js';

const router = Router();

router.get('/', auth, ProductController.getAll);
router.get('/alerts/low-stock', auth, ProductController.getLowStock);
router.get('/:id', auth, ProductController.getById);

router.post(
  '/',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(ProductCreateSchema),
  ProductController.create
);

router.put(
  '/:id',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(ProductUpdateSchema),
  ProductController.update
);

router.post(
  '/adjust-stock',
  auth,
  requireRole('ADMIN', 'MANAGER'),
  validate(StockAdjustmentSchema),
  ProductController.adjustStock
);

export default router;
