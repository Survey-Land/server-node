import { Router } from "express";

import authRouter from "./authRoutes";
import responseRouter from "./responseRoute";
import questionRouter from "./questionRoute";
const router = Router();

// Register all routes
router.use("/auth", authRouter);
router.use("/responses", responseRouter);
router.use("/questions", questionRouter);
export default router;
