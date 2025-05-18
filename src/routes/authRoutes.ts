import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { registerSchema, loginSchema, adminCreateSchema, updateRoleSchema } from "../validation/authValidation";
import { validate } from "../middleware/validateMiddleware";
import { authenticateJWT } from "../middleware/authMiddleware";
import passport from "passport";
import { signAccess, signRefresh } from "../utils/jwt.util";
import { isAdmin } from "../middleware/roleMiddleware";

const router = Router();
const authController = new AuthController();

router.post("/refresh", authController.refreshToken);
router.post("/register", validate(registerSchema), authController.registerInit);
router.post("/register/verify", authController.registerVerify);
router.post("/otp/resend", authController.resendOtp);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authenticateJWT, authController.logout);
router.post("/resetPassword", authenticateJWT, authController.resetPassword);
router.get("/profile", authenticateJWT, authController.profile);
router.get("/users", authenticateJWT, authController.findAll);
router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);
router.get("/github", authController.githubLogin);
router.get("/github/callback", authController.githubCallback);

router.get("/twitter", authController.twitterLogin);

router.get("/twitter/callback", authController.twitterCallback);

// Admin only routes
router.post("/admin", authenticateJWT, validate(adminCreateSchema), isAdmin, authController.createAdmin);
router.delete("/users/:id", authenticateJWT, isAdmin, authController.deleteUser);
router.patch("/users/:id/role", authenticateJWT, validate(updateRoleSchema), isAdmin, authController.updateUserRole);

export default router;
