"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionObjectController = void 0;
const questionService_1 = require("../services/questionService");
const response_1 = require("../utils/response");
const uuid_1 = require("uuid");
class QuestionObjectController {
    constructor() {
        this.service = new questionService_1.QuestionObjectService();
        this.addQuestion = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { surveyId } = req.params;
                const questions = req.body.questions.map((q) => ({
                    ...q,
                    qid: (0, uuid_1.v4)(),
                }));
                const updatedSurvey = await this.service.addQuestions(surveyId, questions);
                res.status(201).json((0, response_1.sendResponse)(true, "Question added successfully", updatedSurvey));
            }
            catch (e) {
                next(e);
            }
        };
        this.getQuestions = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { surveyId } = req.params;
                const questions = await this.service.getQuestions(surveyId);
                res.json((0, response_1.sendResponse)(true, "Questions retrieved successfully", questions));
            }
            catch (e) {
                next(e);
            }
        };
        this.updateQuestion = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { surveyId, qid } = req.params;
                const updatedSurvey = await this.service.updateQuestion(surveyId, qid, req.body);
                res.json((0, response_1.sendResponse)(true, "Question updated successfully", updatedSurvey));
            }
            catch (e) {
                next(e);
            }
        };
        this.deleteQuestion = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { surveyId, qid } = req.params;
                const updatedSurvey = await this.service.deleteQuestion(surveyId, qid);
                res.json((0, response_1.sendResponse)(true, "Question deleted successfully", updatedSurvey));
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.QuestionObjectController = QuestionObjectController;
