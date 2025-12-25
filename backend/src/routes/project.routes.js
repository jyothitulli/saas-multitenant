import express from 'express';
import {
  createProject,
  listProjects,
  updateProjectStatus,
} from '../controllers/project.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/rbac.middleware.js';
import { enforceTenant } from '../middleware/tenant.middleware.js';

const router = express.Router();

/**
 * PROJECT ROUTES
 */
router.post(
  '/',
  authMiddleware,
  enforceTenant,
  allowRoles('tenant_admin'),
  createProject
);

router.get(
  '/',
  authMiddleware,
  enforceTenant,
  listProjects
);

router.patch(
  '/:id/status',
  authMiddleware,
  enforceTenant,
  allowRoles('tenant_admin'),
  updateProjectStatus
);

export default router;