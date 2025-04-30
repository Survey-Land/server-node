import { Router } from 'express';
import { SurveyController } from '../controllers/surveyController';
import { createSurveySchema, updateSurveySchema } from '../validation/surveyValidation';
import { validate } from '../middleware/validateMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
const controller = new SurveyController();

router.get('/all/:userId', controller.getAllByUser);
router.get('/:id',controller.getSurvey);
router.post('/create', validate(createSurveySchema), controller.create);
router.put('/update/:id',validate(updateSurveySchema), controller.update); 
router.delete('/delete/:id', controller.delete);

export default router;
