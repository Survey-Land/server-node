import { Router } from 'express';
import { SurveyController } from '../controllers/surveyController';
import { createSurveySchema, updateSurveySchema } from '../validation/surveyValidation';
import { validate } from '../middleware/validateMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const controller = new SurveyController();

router.get('/', authenticateJWT, controller.getAllByUser); 
router.get('/:id',authenticateJWT, controller.getSurvey); 
router.post('/', authenticateJWT,validate(createSurveySchema), controller.create);
router.put('/:id',authenticateJWT,validate(updateSurveySchema), controller.update); 
router.delete('/:id',authenticateJWT, controller.delete);

export default router;
