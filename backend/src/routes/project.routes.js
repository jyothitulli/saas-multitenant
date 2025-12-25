import express from 'express';
import {
  createProject,
  listProjects,
  updateProjectStatus,
} from '../controllers/project.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';
import { allowRoles } from '../middleware/rbac.middleware.js';
import { enforceTenant } from '../middleware/tenant.middleware.js';

const router = express.Router();

/**
 * PROJECT ROUTES
 */
router.post(
  '/',
  authenticate,
  enforceTenant,
  allowRoles('tenant_admin'),
  createProject
);

router.get(
  '/',
  authenticate,
  enforceTenant,
  listProjects
);

router.patch(
  '/:id/status',
  authenticate,
  enforceTenant,
  allowRoles('tenant_admin'),
  updateProjectStatus
);

export default router;