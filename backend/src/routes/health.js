import { Router } from "express";
import prisma from "../config/prisma.js";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected"
    });
  } catch {
    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

export default router;
