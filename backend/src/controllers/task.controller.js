// import pool  from '../config/db.js';
// import { successResponse, errorResponse } from '../utils/response.util.js';
// import { v4 as uuidv4 } from 'uuid';

// /**
//  * CREATE TASK (tenant_admin only)
//  */
// export const createTask = async (req, res) => {
//   try {
//     const { projectId, title, description, priority, assignedTo, dueDate } = req.body;
//     const tenantId = req.tenantId;

//     if (!projectId || !title) {
//       return errorResponse(res, 'Project ID and title are required', 400);
//     }

//     // Verify project belongs to tenant
//     const projectCheck = await pool.query(
//       'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
//       [projectId, tenantId]
//     );

//     if (projectCheck.rows.length === 0) {
//       return errorResponse(res, 'Invalid project', 404);
//     }

//     // Verify assigned user belongs to same tenant
//     if (assignedTo) {
//       const userCheck = await pool.query(
//         'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
//         [assignedTo, tenantId]
//       );

//       if (userCheck.rows.length === 0) {
//         return errorResponse(res, 'Invalid assignee', 400);
//       }
//     }

//     await pool.query(
//       `INSERT INTO tasks
//        (id, project_id, tenant_id, title, description, priority, assigned_to, due_date)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
//       [
//         uuidv4(),
//         projectId,
//         tenantId,
//         title,
//         description || null,
//         priority || 'medium',
//         assignedTo || null,
//         dueDate || null,
//       ]
//     );

//     return successResponse(res, 'Task created successfully');
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to create task', 500);
//   }
// };

// /**
//  * LIST TASKS (by project)
//  */
// export const listTasks = async (req, res) => {
//   try {
//     const { projectId } = req.pool.query;
//     const tenantId = req.tenantId;

//     if (!projectId) {
//       return errorResponse(res, 'Project ID is required', 400);
//     }

//     const result = await pool.query(
//       `SELECT id, title, status, priority, assigned_to, due_date, created_at
//        FROM tasks
//        WHERE project_id = $1 AND tenant_id = $2
//        ORDER BY created_at DESC`,
//       [projectId, tenantId]
//     );

//     return successResponse(res, 'Tasks fetched successfully', result.rows);
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to fetch tasks', 500);
//   }
// };

// /**
//  * UPDATE TASK STATUS
//  */
// export const updateTaskStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const tenantId = req.tenantId;
//     const userId = req.user.userId;

//     if (!['todo', 'in_progress', 'completed'].includes(status)) {
//       return errorResponse(res, 'Invalid task status', 400);
//     }

//     // Check task access
//     const taskCheck = await pool.query(
//       `SELECT assigned_to FROM tasks
//        WHERE id = $1 AND tenant_id = $2`,
//       [id, tenantId]
//     );

//     if (taskCheck.rows.length === 0) {
//       return errorResponse(res, 'Task not found', 404);
//     }

//     const assignedTo = taskCheck.rows[0].assigned_to;

//     if (req.user.role !== 'tenant_admin' && assignedTo !== userId) {
//       return errorResponse(res, 'Forbidden', 403);
//     }

//     await pool.query(
//       `UPDATE tasks
//        SET status = $1
//        WHERE id = $2 AND tenant_id = $3`,
//       [status, id, tenantId]
//     );

//     return successResponse(res, 'Task status updated');
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to update task', 500);
//   }
// };
const { pool } = require('../config/db');

// 1. Get All Tasks (Point #10)
exports.getTasks = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE tenant_id = $1', 
            [req.user.tenant_id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Get Single Task (Point #11)
exports.getTaskById = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND tenant_id = $2', 
            [req.params.id, req.user.tenant_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Create Task (Point #12)
exports.createTask = async (req, res) => {
    const { title, description, status, project_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, description, status, project_id, tenant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, status || 'todo', project_id, req.user.tenant_id]
        );
        res.status(201).json({ success: true, message: 'Task created', data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 4. Update Task (Point #13)
exports.updateTask = async (req, res) => {
    const { title, description, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 AND tenant_id = $5 RETURNING *',
            [title, description, status, req.params.id, req.user.tenant_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
        res.json({ success: true, message: 'Task updated', data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 5. Delete Task (Point #14)
exports.deleteTask = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING *', [req.params.id, req.user.tenant_id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
        res.json({ success: true, message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};