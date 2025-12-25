import prisma from "../config/prisma.js";

export default async function enforceTenant(req, res, next) {
  // Super admin has no tenant
  if (req.user?.role === "super_admin") {
    req.tenant = null;
    return next();
  }

  const host = req.headers.host; // tenant1.localhost:3000
  const subdomain = host.split(".")[0];

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain }
  });

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found"
    });
  }

  req.tenant = tenant;
  next();
}
