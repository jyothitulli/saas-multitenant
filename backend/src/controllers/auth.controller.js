// src/controllers/auth.controller.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js'; // make sure db.js is ES module

import { successResponse, errorResponse } from '../utils/response.util.js';

// Register user & tenant
export const registerTenant = async (req, res) => {
  const { tenant_name, full_name, email, password } = req.body;

  if (!email || !password || !tenant_name || !full_name) {
    return errorResponse(res, "All fields are required", 400);
  }
  if (!email.includes('@')) {
    return errorResponse(res, "Invalid email format", 400);
  }
  if (password.length < 6) {
    return errorResponse(res, "Password must be at least 6 characters", 400);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create tenant
    const tenant = await db.query(
      'INSERT INTO tenants (name) VALUES ($1) RETURNING id',
      [tenant_name]
    );
    const tenantId = tenant.rows[0].id;

    // Create user
    const user = await db.query(
      'INSERT INTO users (tenant_id, full_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [tenantId, full_name, email, passwordHash, 'tenant_admin']
    );
    const userId = user.rows[0].id;

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [tenantId, userId, 'USER_REGISTERED', 'users', userId, JSON.stringify({ email, tenant_name })]
    );

    successResponse(res, null, "User and Tenant registered successfully", 201);
  } catch (err) {
    console.error("Registration Error:", err.message);
    if (err.code === '23505') {
      return errorResponse(res, "Email already exists", 400);
    }
    errorResponse(res, "Server error during registration", 500);
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return errorResponse(res, "Email and password are required", 400);

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return errorResponse(res, "Invalid credentials", 401);

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return errorResponse(res, "Invalid credentials", 401);

    const token = jwt.sign(
      { id: user.id, tenant_id: user.tenant_id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_123',
      { expiresIn: '24h' }
    );

    await db.query(
      'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
      [user.tenant_id, user.id, 'USER_LOGIN', 'users', user.id]
    );

    successResponse(res, { token, user: { id: user.id, full_name: user.full_name, role: user.role } });
  } catch (err) {
    console.error("Login Error:", err.message);
    errorResponse(res, "Server error during login", 500);
  }
};

// Get user profile
export const me = async (req, res) => {
  try {
    const user = await db.query(
      'SELECT id, full_name, email, role, tenant_id FROM users WHERE id = $1',
      [req.user.id]
    );
    if (user.rows.length === 0) return errorResponse(res, "User not found", 404);

    successResponse(res, user.rows[0]);
  } catch (err) {
    console.error("Profile Error:", err.message);
    errorResponse(res, "Error fetching profile", 500);
  }
};
