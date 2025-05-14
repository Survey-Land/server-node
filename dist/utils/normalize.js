"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSurveyStatus = normalizeSurveyStatus;
const enums_1 = require("../constants/enums");
function normalizeSurveyStatus(value) {
    const normalized = value.toLowerCase();
    if (!Object.values(enums_1.SurveyStatus).includes(normalized)) {
        throw new Error(`Invalid survey status: ${value}`);
    }
    return normalized;
}
