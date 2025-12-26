// src/routes/tenant.routes.js
import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/rbac.middleware.js';
import {
  getAllTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant
} from '../controllers/tenant.controller.js';

const router = express.Router();

// Routes (all protected with authMiddleware)
router.get('/', authMiddleware, checkRole(['super_admin']), getAllTenants);
router.post('/', authMiddleware, checkRole(['super_admin']), createTenant);
router.get('/:id', authMiddleware, getTenantById);
router.put('/:id', authMiddleware, checkRole(['super_admin']), updateTenant);
router.delete('/:id', authMiddleware, checkRole(['super_admin']), deleteTenant);

export { router as tenantRouter };
