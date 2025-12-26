// import  pool from '../config/db.js';
// import { successResponse, errorResponse } from '../utils/response.util.js';
// import { v4 as uuidv4 } from 'uuid';

// /**
//  * CREATE PROJECT (tenant_admin only)
//  */
// export const createProject = async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const tenantId = req.tenantId;
//     const createdBy = req.user.userId;

//     if (!name) {
//       return errorResponse(res, 'Project name is required', 400);
//     }

//     // Check project limit for subscription plan
//     const countResult = await pool.query(
//       'SELECT COUNT(*) FROM projects WHERE tenant_id = $1',
//       [tenantId]
//     );

//     const projectCount = parseInt(countResult.rows[0].count, 10);

//     const limitResult = await pool.query(
//       'SELECT max_projects FROM tenants WHERE id = $1',
//       [tenantId]
//     );

//     if (projectCount >= limitResult.rows[0].max_projects) {
//       return errorResponse(res, 'Project limit exceeded for subscription plan', 403);
//     }

//     await pool.query(
//       `INSERT INTO projects (id, tenant_id, name, description, created_by)
//        VALUES ($1, $2, $3, $4, $5)`,
//       [uuidv4(), tenantId, name, description || null, createdBy]
//     );

//     return successResponse(res, 'Project created successfully');
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to create project', 500);
//   }
// };

// /**
//  * LIST PROJECTS (tenant scoped)
//  */
// export const listProjects = async (req, res) => {
//   try {
//     const tenantId = req.tenantId;

//     const result = await pool.query(
//       `SELECT id, name, description, status, created_at
//        FROM projects
//        WHERE tenant_id = $1
//        ORDER BY created_at DESC`,
//       [tenantId]
//     );

//     return successResponse(res, 'Projects fetched successfully', result.rows);
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to fetch projects', 500);
//   }
// };

// /**
//  * UPDATE PROJECT STATUS
//  */
// export const updateProjectStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const tenantId = req.tenantId;

//     if (!['active', 'completed', 'archived'].includes(status)) {
//       return errorResponse(res, 'Invalid project status', 400);
//     }

//     await pool.query(
//       `UPDATE projects
//        SET status = $1
//        WHERE id = $2 AND tenant_id = $3`,
//       [status, id, tenantId]
//     );

//     return successResponse(res, 'Project status updated');
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to update project', 500);
//   }
// };
const { pool } = require('../config/db');
const auditLogger = require('../utils/auditLogger');

// 1. Get All Projects (Tenant Isolated)
exports.getProjects = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM projects WHERE tenant_id = $1', 
            [req.user.tenant_id]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Get Single Project
exports.getProjectById = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM projects WHERE id = $1 AND tenant_id = $2', 
            [req.params.id, req.user.tenant_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Create Project (With Audit Log)
exports.createProject = async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO projects (name, description, tenant_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, req.user.tenant_id, req.user.id]
        );

        // Security Audit Log Requirement
        await auditLogger.logAction(req.user.tenant_id, req.user.id, 'CREATE_PROJECT', 'project', result.rows[0].id);

        res.status(201).json({ success: true, message: 'Project created', data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 4. Update Project
exports.updateProject = async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND tenant_id = $4 RETURNING *',
            [name, description, req.params.id, req.user.tenant_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
        res.status(200).json({ success: true, message: 'Project updated', data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// 5. Delete Project
exports.deleteProject = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING *', 
            [req.params.id, req.user.tenant_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Project not found' });
        
        await auditLogger.logAction(req.user.tenant_id, req.user.id, 'DELETE_PROJECT', 'project', req.params.id);

        res.status(200).json({ success: true, message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};