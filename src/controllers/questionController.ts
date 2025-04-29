import { Request, Response, NextFunction } from "express";
import { QuestionObjectService } from "../services/questionService";
import Controller from "./controller";
import { v4 as uuidv4 } from "uuid";

export class QuestionObjectController extends Controller {
  private service = new QuestionObjectService();

  addQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.setLocale(req);
      const { surveyId } = req.params;
      const question = { ...req.body, qid: uuidv4() };

      const updatedSurvey = await this.service.addQuestion(surveyId, question);

      res.status(201).json(
        this.sendResponse(true, "Question added successfully", updatedSurvey)
      );
    } catch (e) {
      next(e);
    }
  };

  getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.setLocale(req);
      const { surveyId } = req.params;

      const questions = await this.service.getQuestions(surveyId);

      res.json(
        this.sendResponse(true, "Questions retrieved successfully", questions)
      );
    } catch (e) {
      next(e);
    }
  };

  updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.setLocale(req);
      const { surveyId, qid } = req.params;

      const updatedSurvey = await this.service.updateQuestion(surveyId, qid, req.body);

      res.json(
        this.sendResponse(true, "Question updated successfully", updatedSurvey)
      );
    } catch (e) {
      next(e);
    }
  };

  deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.setLocale(req);
      const { surveyId, qid } = req.params;

      const updatedSurvey = await this.service.deleteQuestion(surveyId, qid);

      res.json(
        this.sendResponse(true, "Question deleted successfully", updatedSurvey)
      );
    } catch (e) {
      next(e);
    }
  };
}