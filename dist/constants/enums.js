"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionType = exports.SurveyStatus = void 0;
var SurveyStatus;
(function (SurveyStatus) {
    SurveyStatus["Draft"] = "draft";
    SurveyStatus["Published"] = "published";
    SurveyStatus["Closed"] = "closed";
})(SurveyStatus || (exports.SurveyStatus = SurveyStatus = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["Mcq"] = "mcq";
    QuestionType["Textarea"] = "textarea";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
