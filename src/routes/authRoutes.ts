import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { registerSchema, loginSchema } from '../validation/authValidation';
import { validate } from '../middleware/validateMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import uploadFiles from '../middleware/uploadFiles';

const router = Router();
const authController = new AuthController();
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticateJWT, authController.logout);
router.get('/profile', authenticateJWT, authController.profile);
router.get('/users', authenticateJWT, authController.findAll);

router.get("/google", authController.googleLogin);
router.get("/google/callback", authController.googleCallback);

export default router;