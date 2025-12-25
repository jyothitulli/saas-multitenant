import express from 'express';
import {
  createUser,
  listUsers,
  updateUserStatus,
} from '../controllers/user.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/rbac.middleware.js';
import { enforceTenant } from '../middleware/tenant.middleware.js';

const router = express.Router();

/**
 * USER MANAGEMENT ROUTES
 */
router.post(
  '/',
  authenticate,
  enforceTenant,
  allowRoles('tenant_admin'),
  createUser
);

router.get(
  '/',
  authenticate,
  enforceTenant,
  allowRoles('tenant_admin'),
  listUsers
);

router.patch(
  '/:id/status',
  authenticate,
  enforceTenant,
  allowRoles('tenant_admin'),
  updateUserStatus
);

export default router;