"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const responseRoute_1 = __importDefault(require("./responseRoute"));
const surveyRoutes_1 = __importDefault(require("./surveyRoutes"));
const questionRoute_1 = __importDefault(require("./questionRoute"));
const router = (0, express_1.Router)();
// Register all routes
router.use("/auth", authRoutes_1.default);
router.use("/responses", responseRoute_1.default);
router.use("/survey", surveyRoutes_1.default);
router.use("/questions", questionRoute_1.default);
exports.default = router;
