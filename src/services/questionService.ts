import prisma from "../lib/prisma";
import { QuestionObject } from "../types/global";

export class QuestionObjectService {
  async addQuestion(surveyId: string, question: QuestionObject) {
    return prisma.survey.update({
      where: { id: surveyId },
      data: {
        questions: { push: question },
      },
    });
  }

  async getQuestions(surveyId: string) {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: { questions: true },
    });
    return survey?.questions || [];
  }

  async updateQuestion(surveyId: string, qid: string, updatedQuestion: QuestionObject) {
    const survey = await prisma.survey.findUnique({ where: { id: surveyId } });

    if (!survey) throw new Error("Survey not found");

    const updatedQuestions = survey.questions.map((q:QuestionObject) =>
      q.qid === qid ? updatedQuestion : q
    );

    return prisma.survey.update({
      where: { id: surveyId },
      data: { questions: updatedQuestions },
    });
  }

  async deleteQuestion(surveyId: string, qid: string) {
    const survey = await prisma.survey.findUnique({ where: { id: surveyId } });

    if (!survey) throw new Error("Survey not found");

    const updatedQuestions = survey.questions.filter((q:QuestionObject) => q.qid !== qid);

    return prisma.survey.update({
      where: { id: surveyId },
      data: { questions: updatedQuestions },
    });
  }
}