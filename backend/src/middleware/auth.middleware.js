// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.util.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'No token, authorization denied', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Error:', err);
    return errorResponse(res, 'Token is not valid', 401);
  }
};

export default authMiddleware;
