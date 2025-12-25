// backend/src/middleware/auth.middleware.js
import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.util.js';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (err) {
    console.error('JWT Error:', err);
    return errorResponse(res, 'Invalid or expired token', 401);
  }
}
