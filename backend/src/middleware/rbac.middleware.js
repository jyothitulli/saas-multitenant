import { errorResponse } from '../utils/response.util.js';

/**
 * Role-Based Access Control Middleware
 * Usage: allowRoles('super_admin', 'tenant_admin')
 */
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user exists in request
      if (!req.user) {
        return errorResponse(res, 'Unauthorized: user not found', 401);
      }

      // Check if user role exists
      const { role } = req.user;
      if (!role) {
        return errorResponse(res, 'Unauthorized: role not found', 401);
      }

      // Check if user's role is allowed
      if (!allowedRoles.includes(role)) {
        return errorResponse(res, 'Forbidden: insufficient permissions', 403);
      }

      // Authorized
      next();
    } catch (err) {
      console.error('RBAC Middleware Error:', err);
      return errorResponse(res, 'Internal Server Error', 500);
    }
  };
};
