/**
 * Middleware to ensure data isolation.
 * It extracts the tenantId from the authenticated user (JWT) 
 * and attaches it to the request object.
 */
const tenantIsolation = (req, res, next) => {
  // req.user is populated by your authentication (JWT) middleware
  const tenantId = req.user?.tenantId; 
  const role = req.user?.role;

  // Bypass isolation ONLY if the user is a system-wide Super Admin
  if (role === 'super_admin') {
    return next();
  }

  // If not a super_admin and no tenantId is found, deny access
  if (!tenantId) {
    return res.status(403).json({ 
      success: false, 
      message: "Access Denied: No tenant context found." 
    });
  }

  // Attach tenantId to req for use in controllers/services
  req.tenantId = tenantId;
  next();
};

module.exports = tenantIsolation;