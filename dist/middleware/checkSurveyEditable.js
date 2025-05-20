"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSurveyEditable = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const i18n_1 = __importDefault(require("../config/i18n"));
const checkSurveyEditable = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const survey = await prisma_1.default.survey.findUnique({
            where: { id },
            include: {
                responses: {
                    select: { id: true },
                },
            },
        });
        if (!survey) {
            throw new Error("SURVEY_NOT_FOUND");
        }
        if (user?.role !== client_1.Role.ADMIN) {
            throw new Error("FORBIDDEN_EDIT");
        }
        if (survey.responses.length > 0) {
            throw new Error("SURVEY_HAS_RESPONSES");
        }
        next();
    }
    catch (error) {
        const err = error.message;
        switch (err) {
            case "SURVEY_NOT_FOUND":
                res.status(404).json({ message: i18n_1.default.__("Survey not found") });
                break;
            case "FORBIDDEN_EDIT":
                res.status(403).json({
                    message: i18n_1.default.__("only admin can edit"),
                });
                break;
            case "SURVEY_HAS_RESPONSES":
                res.status(400).json({
                    message: i18n_1.default.__("survey has responses"),
                });
                break;
            default:
                console.error("Unexpected error:", error);
                res.status(500).json({
                    message: i18n_1.default.__("unexpected server error"),
                });
        }
    }
};
exports.checkSurveyEditable = checkSurveyEditable;
