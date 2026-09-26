import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import productRoutes from './product.routes.js';
import customerRoutes from './customer.routes.js';
import supplierRoutes from './supplier.routes.js';
import shipmentRoutes from './shipment.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import expenseRoutes from './expense.routes.js';
import reportRoutes from './report.routes.js';
import { prisma } from '../lib/prisma.js';
import { apiSuccess, apiError } from '../utils/response.js';

const router = Router();

// Route Health Check
router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return apiSuccess(res, {
      status: 'healthy',
      database: 'connected (SQLite)',
      service: 'Sokho Viandes API',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return apiError(res, `Erreur base de données: ${err.message}`, 503);
  }
});

// Enregistrement des sous-routeurs
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/expenses', expenseRoutes);
router.use('/reports', reportRoutes);

export default router;
