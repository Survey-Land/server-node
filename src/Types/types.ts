export type QuestionObject = {
    qid: string;
    questionText: string;
    type: "mcq" | "textarea";
    choices: string[];
    isRequired?: boolean; 
  };
  