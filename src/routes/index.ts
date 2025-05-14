import { Router } from "express";

import authRouter from "./authRoutes";
import responseRouter from "./responseRoute";
import surveyRoutes from "./surveyRoutes"
import questionRouter from "./questionRoute";
const router = Router();

// Register all routes
router.use("/auth", authRouter);
router.use("/responses", responseRouter);
router.use("/survey", surveyRoutes);
router.use("/questions", questionRouter);
export default router;
