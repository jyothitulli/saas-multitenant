// import bcrypt from 'bcrypt';
// import  pool  from '../config/db.js';
// import prisma from '../config/prisma.js';
// import { successResponse, errorResponse } from '../utils/response.util.js';
// import { v4 as uuidv4 } from 'uuid';

// /**
//  * CREATE USER (Tenant Admin only)
//  */
// export const createUser = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const tenantId = req.tenantId;

//     if (!email || !password || !role) {
//       return errorResponse(res, 'Email, password and role are required', 400);
//     }

//     if (!['user', 'tenant_admin'].includes(role)) {
//       return errorResponse(res, 'Invalid role', 400);
//     }

//     // Check user limit
//     const countResult = await pool.query(
//       'SELECT COUNT(*) FROM users WHERE tenant_id = $1',
//       [tenantId]
//     );

//     const userCount = parseInt(countResult.rows[0].count, 10);

//     const limitResult = await pool.query(
//       'SELECT max_users FROM tenants WHERE id = $1',
//       [tenantId]
//     );

//     if (userCount >= limitResult.rows[0].max_users) {
//       return errorResponse(res, 'User limit exceeded for subscription plan', 403);
//     }

//     // Check email uniqueness per tenant
//     const existingUser = await pool.query(
//       'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
//       [email, tenantId]
//     );

//     if (existingUser.rows.length > 0) {
//       return errorResponse(res, 'User already exists', 409);
//     }

//     const passwordHash = await bcrypt.hash(password, 10);

//     await pool.query(
//       `INSERT INTO users (id, tenant_id, email, password_hash, role)
//        VALUES ($1, $2, $3, $4, $5)`,
//       [uuidv4(), tenantId, email, passwordHash, role]
//     );

//     return successResponse(res, 'User created successfully');
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to create user', 500);
//   }
// };

// /**
//  * LIST USERS (Tenant scoped)
//  */
// export const listUsers = async (req, res) => {
//   try {
//     const tenantId = req.tenantId;

//     const result = await pool.query(
//       `SELECT id, email, role, is_active, created_at
//        FROM users
//        WHERE tenant_id = $1
//        ORDER BY created_at DESC`,
//       [tenantId]
//     );

//     return successResponse(res, 'Users fetched successfully', result.rows);
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to fetch users', 500);
//   }
// };

// /**
//  * ACTIVATE / DEACTIVATE USER
//  */
// export const updateUserStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { is_active } = req.body;
//     const tenantId = req.tenantId;

//     await pool.query(
//       `UPDATE users
//        SET is_active = $1
//        WHERE id = $2 AND tenant_id = $3`,
//       [is_active, id, tenantId]
//     );

//     return successResponse(res, 'User status updated');
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, 'Failed to update user', 500);
//   }
// };

const { pool } = require('../config/db');

// Get all users for the tenant
exports.getUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role FROM users WHERE tenant_id = $1', [req.user.tenant_id]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single user
exports.getUserById = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1 AND tenant_id = $2', [req.params.id, req.user.tenant_id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    const { name, role } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, role = $2 WHERE id = $3 AND tenant_id = $4 RETURNING id, name, email, role',
            [name, role, req.params.id, req.user.tenant_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User updated', data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete user (The missing function!)
exports.deleteUser = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING *', [req.params.id, req.user.tenant_id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
