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
  async addQuestions(surveyId: string, questions: QuestionObject[]) {
    return prisma.survey.update({
      where: { id: surveyId },
      data: {
        questions: {
          push: questions,
        },
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

    const updatedQuestions = survey.questions.map((q) => {
      const question: QuestionObject = {
        qid: q.qid,
        questionText: q.questionText,
        type: q.type as QuestionObject["type"],
        choices: q.choices,
        isRequired: q.isRequired,
      };
      return question.qid === qid ? updatedQuestion : question;
    });

    return prisma.survey.update({
      where: { id: surveyId },
      data: { questions: updatedQuestions },
    });
  }

  async deleteQuestion(surveyId: string, qid: string) {
    const survey = await prisma.survey.findUnique({ where: { id: surveyId } });

    if (!survey) throw new Error("Survey not found");

    const updatedQuestions = survey.questions
      .map((q) => ({
        qid: q.qid,
        questionText: q.questionText,
        type: q.type as QuestionObject["type"],
        choices: q.choices,
        isRequired: q.isRequired,
      }))
      .filter((q: QuestionObject) => q.qid !== qid);

    return prisma.survey.update({
      where: { id: surveyId },
      data: { questions: updatedQuestions },
    });
  }
}