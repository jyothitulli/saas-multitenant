import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import env from '../config/env.js';
import { successResponse, errorResponse } from '../utils/response.util.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * REGISTER TENANT
 * Creates tenant + tenant admin
 */
export const registerTenant = async (req, res) => {
  try {
    const { organizationName, subdomain, email, password } = req.body;

    if (!organizationName || !subdomain || !email || !password) {
      return errorResponse(res, 'All fields are required', 400);
    }

    // Check subdomain uniqueness
    const existingTenant = await query(
      'SELECT id FROM tenants WHERE subdomain = $1',
      [subdomain]
    );
    if (existingTenant.rows.length > 0) {
      return errorResponse(res, 'Subdomain already exists', 409);
    }

    const tenantId = uuidv4();
    const userId = uuidv4();

    // Create tenant
    await query(
      `INSERT INTO tenants (id, name, subdomain)
       VALUES ($1, $2, $3)`,
      [tenantId, organizationName, subdomain]
    );

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create tenant admin
    await query(
      `INSERT INTO users (id, tenant_id, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')`,
      [userId, tenantId, email, passwordHash]
    );

    return successResponse(res, 'Tenant registered successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password required', 400);
    }

    const result = await query(
      `SELECT id, tenant_id, email, password_hash, role
       FROM users WHERE email = $1 AND is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    return successResponse(res, 'Login successful', { token });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * GET CURRENT USER
 */
export const me = async (req, res) => {
  return successResponse(res, 'User details fetched', req.user);
};