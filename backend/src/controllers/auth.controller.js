// backend/src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import { errorResponse, successResponse } from '../utils/response.util.js';

/**
 * Register Tenant + Admin User
 */
export const registerTenant = async (req, res) => {
  const { tenant_name, full_name, email, password } = req.body;

  if (!tenant_name || !full_name || !email || !password) {
    return errorResponse(res, 'All fields are required', 400);
  }

  if (!email.includes('@')) {
    return errorResponse(res, 'Invalid email format', 400);
  }

  if (password.length < 6) {
    return errorResponse(res, 'Password must be at least 6 characters', 400);
  }

  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Tenant
    const tenantResult = await db.query(
      'INSERT INTO tenants (name) VALUES ($1) RETURNING id',
      [tenant_name]
    );
    const tenantId = tenantResult.rows[0].id;

    // Create User
    const userResult = await db.query(
      'INSERT INTO users (tenant_id, full_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [tenantId, full_name, email, passwordHash, 'tenant_admin']
    );
    const userId = userResult.rows[0].id;

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [tenantId, userId, 'USER_REGISTERED', 'users', userId, JSON.stringify({ email, tenant_name })]
    );

    return successResponse(res, null, 'User and Tenant registered successfully', 201);
  } catch (err) {
    console.error('Registration Error:', err.message);
    if (err.code === '23505') {
      return errorResponse(res, 'Email already exists', 400);
    }
    return errorResponse(res, 'Server error during registration', 500);
  }
};

/**
 * Login User
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400);
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, tenant_id: user.tenant_id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '24h' }
    );

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
      [user.tenant_id, user.id, 'USER_LOGIN', 'users', user.id]
    );

    return successResponse(res, { token, user: { id: user.id, full_name: user.full_name, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err.message);
    return errorResponse(res, 'Server error during login', 500);
  }
};

/**
 * Get Logged-In User Profile
 */
export const me = async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, full_name, email, role, tenant_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, userResult.rows[0]);
  } catch (err) {
    console.error('Profile Error:', err.message);
    return errorResponse(res, 'Error fetching profile', 500);
  }
};
