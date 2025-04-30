import { SurveyStatus, QuestionType } from '../constants/enums';

export function normalizeSurveyStatus(value: string): SurveyStatus {
  const normalized = value.toLowerCase();
  if (!Object.values(SurveyStatus).includes(normalized as SurveyStatus)) {
    throw new Error(`Invalid survey status: ${value}`);
  }
  return normalized as SurveyStatus;
}

export function normalizeQuestionType(value : String) : QuestionType {
  const normalized = value.toLowerCase();
  if (!Object.values(QuestionType).includes(normalized as QuestionType)) {
    throw new Error(`Invalid question type: ${value}`);
  }
  return normalized as QuestionType;
}