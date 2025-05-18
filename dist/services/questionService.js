"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionObjectService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class QuestionObjectService {
    async addQuestion(surveyId, question) {
        return prisma_1.default.survey.update({
            where: { id: surveyId },
            data: {
                questions: { push: question },
            },
        });
    }
    async getQuestions(surveyId) {
        const survey = await prisma_1.default.survey.findUnique({
            where: { id: surveyId },
            select: { questions: true },
        });
        return survey?.questions || [];
    }
    async updateQuestion(surveyId, qid, updatedQuestion) {
        const survey = await prisma_1.default.survey.findUnique({ where: { id: surveyId } });
        if (!survey)
            throw new Error("Survey not found");
        const updatedQuestions = survey.questions.map((q) => {
            const question = {
                qid: q.qid,
                questionText: q.questionText,
                type: q.type,
                choices: q.choices,
                isRequired: q.isRequired,
            };
            return question.qid === qid ? updatedQuestion : question;
        });
        return prisma_1.default.survey.update({
            where: { id: surveyId },
            data: { questions: updatedQuestions },
        });
    }
    async deleteQuestion(surveyId, qid) {
        const survey = await prisma_1.default.survey.findUnique({ where: { id: surveyId } });
        if (!survey)
            throw new Error("Survey not found");
        const updatedQuestions = survey.questions
            .map((q) => ({
            qid: q.qid,
            questionText: q.questionText,
            type: q.type,
            choices: q.choices,
            isRequired: q.isRequired,
        }))
            .filter((q) => q.qid !== qid);
        return prisma_1.default.survey.update({
            where: { id: surveyId },
            data: { questions: updatedQuestions },
        });
    }
}
exports.QuestionObjectService = QuestionObjectService;
