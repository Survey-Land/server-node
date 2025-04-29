export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}
export type QuestionObject = {
  qid: string;
  questionText: string;
  type: "mcq" | "textarea";
  choices: string[];
  isRequired?: boolean; 
};
