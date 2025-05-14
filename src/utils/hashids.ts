import Hashids from "hashids";

const hashids = new Hashids("survey-secret", 10);

export const encodeSurveyId = (id: string): string => {
    return hashids.encodeHex(id);
};

export const decodeSurveyId = (slug: string): string => {
    return hashids.decodeHex(slug);
};
