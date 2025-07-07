import { Router } from "express";
import { SurveyController } from "../controllers/surveyController";
import {
  createSurveySchema,
  updateSurveySchema,
} from "../validation/surveyValidation";
import { validate } from "../middleware/validateMiddleware";
import { authenticateJWT } from "../middleware/authMiddleware";
import uploadFiles from "../middleware/uploadFiles";

const router = Router();
const controller = new SurveyController();

router.get("/", authenticateJWT, controller.getAllByUser);
router.get("/:id", authenticateJWT, controller.getSurvey);

router.post(
  "/",
  authenticateJWT,
  uploadFiles.upload.fields([{ name: "file", maxCount: 10 }]),
  uploadFiles.uploadFilesToS3("moajem"),
  validate(createSurveySchema),
  controller.create
);

router.put(
  "/:id",
  authenticateJWT,
  
  validate(updateSurveySchema),
  controller.update
);
router.delete("/:id", authenticateJWT, controller.delete);

router.patch("/:surveyId/link", controller.createLink);
router.get("/survey/:link", controller.getSurveyByLink);
router.post("/survey/:link/response", controller.submitResponse);

export default router;
