import { query } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * CREATE PROJECT (tenant_admin only)
 */
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const tenantId = req.tenantId;
    const createdBy = req.user.userId;

    if (!name) {
      return errorResponse(res, 'Project name is required', 400);
    }

    // Check project limit for subscription plan
    const countResult = await query(
      'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
      [tenantId]
    );

    const projectCount = parseInt(countResult.rows[0].count, 10);

    const limitResult = await query(
      'SELECT max_projects FROM tenants WHERE id = $1',
      [tenantId]
    );

    if (projectCount >= limitResult.rows[0].max_projects) {
      return errorResponse(res, 'Project limit exceeded for subscription plan', 403);
    }

    await query(
      `INSERT INTO projects (id, tenant_id, name, description, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), tenantId, name, description || null, createdBy]
    );

    return successResponse(res, 'Project created successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to create project', 500);
  }
};

/**
 * LIST PROJECTS (tenant scoped)
 */
export const listProjects = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const result = await query(
      `SELECT id, name, description, status, created_at
       FROM projects
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );

    return successResponse(res, 'Projects fetched successfully', result.rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to fetch projects', 500);
  }
};

/**
 * UPDATE PROJECT STATUS
 */
export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.tenantId;

    if (!['active', 'completed', 'archived'].includes(status)) {
      return errorResponse(res, 'Invalid project status', 400);
    }

    await query(
      `UPDATE projects
       SET status = $1
       WHERE id = $2 AND tenant_id = $3`,
      [status, id, tenantId]
    );

    return successResponse(res, 'Project status updated');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to update project', 500);
  }
};