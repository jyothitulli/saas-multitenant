import express from 'express';
import { registerTenant, login, me } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/rbac.middleware.js';
import enforceTenant from '../middleware/tenant.middleware.js';

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
 * RBAC TEST ROUTE (Super Admin only)
 */
router.get(
  '/admin-only',
  authMiddleware, // fixed from 'authenticate' → 'authMiddleware'
  allowRoles('super_admin'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Super admin access granted',
    });
  }
);

/**
 * TENANT ISOLATION TEST ROUTE
 */
router.get(
  '/tenant-test',
  authMiddleware,
  enforceTenant, // removed extra comma
  (req, res) => {
    res.json({
      success: true,
      message: 'Tenant isolation working',
      tenantId: req.tenantId,
    });
  }
);

export default router;
