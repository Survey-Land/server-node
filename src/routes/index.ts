import { Router } from "express";

import authRouter from "./authRoutes";
import responseRouter from "./responseRoute";

const router = Router();

// Register all routes
router.use("/auth", authRouter);
router.use("/responses", responseRouter);

export default router;
