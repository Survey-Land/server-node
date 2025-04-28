import { Router } from "express";

import authRouter from "./authRoutes";

const router = Router();

// Register all routes
router.use("/auth", authRouter);

export default router;
