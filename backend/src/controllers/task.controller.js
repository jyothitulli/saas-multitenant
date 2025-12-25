import { query } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * CREATE TASK (tenant_admin only)
 */
export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, priority, assignedTo, dueDate } = req.body;
    const tenantId = req.tenantId;

    if (!projectId || !title) {
      return errorResponse(res, 'Project ID and title are required', 400);
    }

    // Verify project belongs to tenant
    const projectCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectCheck.rows.length === 0) {
      return errorResponse(res, 'Invalid project', 404);
    }

    // Verify assigned user belongs to same tenant
    if (assignedTo) {
      const userCheck = await query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );

      if (userCheck.rows.length === 0) {
        return errorResponse(res, 'Invalid assignee', 400);
      }
    }

    await query(
      `INSERT INTO tasks
       (id, project_id, tenant_id, title, description, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        uuidv4(),
        projectId,
        tenantId,
        title,
        description || null,
        priority || 'medium',
        assignedTo || null,
        dueDate || null,
      ]
    );

    return successResponse(res, 'Task created successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to create task', 500);
  }
};

/**
 * LIST TASKS (by project)
 */
export const listTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const tenantId = req.tenantId;

    if (!projectId) {
      return errorResponse(res, 'Project ID is required', 400);
    }

    const result = await query(
      `SELECT id, title, status, priority, assigned_to, due_date, created_at
       FROM tasks
       WHERE project_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC`,
      [projectId, tenantId]
    );

    return successResponse(res, 'Tasks fetched successfully', result.rows);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to fetch tasks', 500);
  }
};

/**
 * UPDATE TASK STATUS
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user.userId;

    if (!['todo', 'in_progress', 'completed'].includes(status)) {
      return errorResponse(res, 'Invalid task status', 400);
    }

    // Check task access
    const taskCheck = await query(
      `SELECT assigned_to FROM tasks
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    if (taskCheck.rows.length === 0) {
      return errorResponse(res, 'Task not found', 404);
    }

    const assignedTo = taskCheck.rows[0].assigned_to;

    if (req.user.role !== 'tenant_admin' && assignedTo !== userId) {
      return errorResponse(res, 'Forbidden', 403);
    }

    await query(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2 AND tenant_id = $3`,
      [status, id, tenantId]
    );

    return successResponse(res, 'Task status updated');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to update task', 500);
  }
};