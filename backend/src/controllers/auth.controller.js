import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt.js";

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId
  });

  res.json({
    success: true,
    message: "Login successful",
    data: { token }
  });
}
