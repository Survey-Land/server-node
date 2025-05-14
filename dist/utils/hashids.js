"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeSurveyId = exports.encodeSurveyId = void 0;
const hashids_1 = __importDefault(require("hashids"));
const hashids = new hashids_1.default("survey-secret", 10);
const encodeSurveyId = (id) => {
    return hashids.encodeHex(id);
};
exports.encodeSurveyId = encodeSurveyId;
const decodeSurveyId = (slug) => {
    return hashids.decodeHex(slug);
};
exports.decodeSurveyId = decodeSurveyId;
