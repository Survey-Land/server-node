"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const surveyController_1 = require("../controllers/surveyController");
const surveyValidation_1 = require("../validation/surveyValidation");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadFiles_1 = __importDefault(require("../middleware/uploadFiles"));
const router = (0, express_1.Router)();
const controller = new surveyController_1.SurveyController();
router.get("/", authMiddleware_1.authenticateJWT, controller.getAllByUser);
router.get("/:id", authMiddleware_1.authenticateJWT, controller.getSurvey);
router.post(
  "/",
  authMiddleware_1.authenticateJWT,
  uploadFiles_1.default.upload.fields([{ name: "file", maxCount: 10 }]),
  uploadFiles_1.default.uploadFilesToS3("moajem"),
  (0, validateMiddleware_1.validate)(surveyValidation_1.createSurveySchema),
  controller.create
);
router.put(
  "/:id",
  authMiddleware_1.authenticateJWT,
  (0, validateMiddleware_1.validate)(surveyValidation_1.updateSurveySchema),
  controller.update
);
router.delete("/:id", authMiddleware_1.authenticateJWT, controller.delete);
router.patch("/:surveyId/link", controller.createLink);
router.get("/survey/:link", controller.getSurveyByLink);
router.post("/survey/:link/response", controller.submitResponse);
exports.default = router;
