import { SurveyStatus } from '../constants/enums';

export function normalizeSurveyStatus(value: string): SurveyStatus {
  const normalized = value.toLowerCase();
  if (!Object.values(SurveyStatus).includes(normalized as SurveyStatus)) {
    throw new Error(`Invalid survey status: ${value}`);
  }
  return normalized as SurveyStatus;
}

