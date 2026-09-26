import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { LoginSchema, RegisterSchema } from '../validators/schemas.js';

const router = Router();

router.post('/login', validate(LoginSchema), AuthController.login);
router.post('/register', auth, requireRole('ADMIN'), validate(RegisterSchema), AuthController.register);
router.get('/me', auth, AuthController.getMe);
router.get('/users', auth, requireRole('ADMIN'), AuthController.listUsers);
router.put('/users/:id', auth, requireRole('ADMIN'), AuthController.updateUser);

export default router;
