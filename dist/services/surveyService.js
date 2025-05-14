"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const normalize_1 = require("../utils/normalize");
const enums_1 = require("../constants/enums");
const custom_error_1 = require("../utils/custom-error");
const prisma_error_1 = require("../utils/prisma-error");
const query_parser_1 = require("../utils/query-parser");
const i18n_1 = __importDefault(require("../config/i18n"));
const hashids_1 = require("../utils/hashids");
class SurveyService {
    // This Function is used to get all surveys for specific user
    async findAllByUser(query, userId, lang) {
        i18n_1.default.setLocale(lang);
        try {
            let { page, pageSize, include, orderBy, ...filters } = query;
            if (include)
                include = (0, query_parser_1.parseInclude)(include);
            if (orderBy)
                orderBy = (0, query_parser_1.parseInclude)(orderBy);
            filters = (0, query_parser_1.processFilters)(filters);
            filters.userId = userId;
            const options = { where: filters, include, orderBy };
            if (page && pageSize) {
                const skip = (Number(page) - 1) * Number(pageSize);
                const take = Number(pageSize);
                const [data, total] = await Promise.all([
                    prisma_1.default.survey.findMany({ ...options, skip, take }),
                    prisma_1.default.survey.count({ where: filters }),
                ]);
                return {
                    data,
                    total,
                    page: Number(page),
                    pageSize: Number(pageSize),
                };
            }
            return await prisma_1.default.survey.findMany(options);
        }
        catch (error) {
            throw (0, prisma_error_1.handlePrismaError)(error, i18n_1.default.__("Survey"));
        }
    }
    // This Function is used to create a new survey
    async createSurvey(data, lang, userId) {
        i18n_1.default.setLocale(lang);
        if (!data.title) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Survey creation failed"), 400);
        }
        try {
            const normalizedStatus = data.status
                ? (0, normalize_1.normalizeSurveyStatus)(data.status)
                : enums_1.SurveyStatus.Draft;
            const payload = {
                title: data.title,
                description: data.description,
                ...(data.image !== undefined ? { cover: data.image } : {}),
                status: normalizedStatus,
                userId,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
            };
            return await prisma_1.default.survey.create({ data: payload });
        }
        catch (error) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Survey creation failed"), 400);
        }
    }
    // This Function is used to get a survey by id
    async getSurvey(id, lang) {
        i18n_1.default.setLocale(lang);
        try {
            const survey = await prisma_1.default.survey.findUnique({ where: { id } });
            if (!survey) {
                throw new custom_error_1.CustomError(i18n_1.default.__("Survey not found"), 404);
            }
            return survey;
        }
        catch (error) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Survey not found"), 404);
        }
    }
    // This Function is used to delete a survey by id
    async deleteSurvey(id, lang) {
        i18n_1.default.setLocale(lang);
        try {
            const existingSurvey = await prisma_1.default.survey.findUnique({
                where: { id },
            });
            if (!existingSurvey) {
                throw new custom_error_1.CustomError(i18n_1.default.__("Survey not found"), 404);
            }
            return await prisma_1.default.survey.delete({ where: { id } });
        }
        catch (error) {
            throw new custom_error_1.CustomError(i18n_1.default.__("Survey not found"), 404);
        }
    }
    // This Function is used to update a survey by id
    async updateSurvey(id, lang, data) {
        i18n_1.default.setLocale(lang);
        try {
            const existingSurvey = await prisma_1.default.survey.findUnique({
                where: { id },
            });
            if (!existingSurvey) {
                throw new custom_error_1.CustomError(i18n_1.default.__("Survey not found"), 404);
            }
            const updatedSurveyData = {
                ...existingSurvey,
                ...data,
            };
            delete updatedSurveyData.id;
            const updatedSurvey = await prisma_1.default.survey.update({
                where: { id },
                data: updatedSurveyData,
            });
            return updatedSurvey;
        }
        catch (error) {
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            else {
                throw new custom_error_1.CustomError(i18n_1.default.__("An error occurred while updating the survey"), 500);
            }
        }
    }
    async createLink(surveyId, lang) {
        i18n_1.default.setLocale(lang);
        try {
            const survey = await prisma_1.default.survey.findUnique({
                where: { id: surveyId },
            });
            if (!survey) {
                throw new custom_error_1.CustomError(i18n_1.default.__("Survey not found"), 404);
            }
            return (0, hashids_1.encodeSurveyId)(survey.id);
        }
        catch (error) {
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            else {
                throw new custom_error_1.CustomError(i18n_1.default.__("An error occurred while creating the survey link"), 500);
            }
        }
    }
    async publishSurvey(surveyId) {
        const survey = await prisma_1.default.survey.update({
            where: { id: surveyId },
            data: { status: "published" },
        });
        return (0, hashids_1.encodeSurveyId)(survey.id);
    }
    async getSurveyByLink(link) {
        const surveyId = (0, hashids_1.decodeSurveyId)(link);
        return await prisma_1.default.survey.findUnique({
            where: { id: surveyId },
            include: {},
        });
    }
    async submitResponse(link, data) {
        const surveyId = (0, hashids_1.decodeSurveyId)(link);
        await prisma_1.default.response.create({
            data: {
                surveyId,
                answers: data.answers,
                respondentEmail: data.respondentEmail,
                respondentName: data.respondentName,
            },
        });
    }
}
exports.SurveyService = SurveyService;
