import { Router } from "express";
import { QuestionObjectController } from "../controllers/questionController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { createQuestionSchema, updateQuestionSchema } from "../validation/questionValidation";

const router = Router();
const controller = new QuestionObjectController();

router.post("/:surveyId", authenticateJWT, validate(createQuestionSchema), controller.addQuestion);
router.get("/:surveyId", authenticateJWT, controller.getQuestions);
router.put("/:surveyId/questions/:qid", authenticateJWT, validate(updateQuestionSchema), controller.updateQuestion);
router.delete("/:surveyId/questions/:qid", authenticateJWT, controller.deleteQuestion);

export default router;