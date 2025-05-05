import { Router } from "express";
import { ResponseController } from "../controllers/responseController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { createResponseSchema } from "../validation/responseValidation";

const router = Router();

const responseController = new ResponseController();

router.get("/", authenticateJWT, responseController.findAll);
router.get("/:id", authenticateJWT, responseController.getById);
router.post(
  "/",
  authenticateJWT,
  validate(createResponseSchema),
  responseController.create
);
router.put(
  "/:id",
  authenticateJWT,
  validate(createResponseSchema),
  responseController.update
);
router.delete("/:id", authenticateJWT, responseController.deleteById);

export default router;
