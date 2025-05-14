import { QuestionType } from "../constants/enums";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}
export type QuestionObject = {
  qid: string;
  questionText: string;
  type: QuestionType;
  choices: string[];
  isRequired?: boolean; 
};
