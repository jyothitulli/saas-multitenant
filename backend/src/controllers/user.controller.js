import express from 'express';
import { registerTenant, login, me } from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/rbac.middleware.js';

const router = express.Router();

/**
 * PUBLIC ROUTES
 */
router.post('/register-tenant', registerTenant);
router.post('/login', login);

/**
 * AUTHENTICATED ROUTES
 */
router.get('/me', authMiddleware, me);

/**
 * RBAC TEST ROUTE (example)
 */
router.get(
  '/admin-only',
  authMiddleware,
  allowRoles('super_admin'),
  (req, res) => {
    res.json({ success: true, message: 'Super admin access granted' });
  }
);

export default router;
