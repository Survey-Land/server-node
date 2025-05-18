"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_parser_1 = require("../utils/query-parser");
const prisma_1 = __importDefault(require("../lib/prisma"));
const prisma_error_1 = require("../utils/prisma-error");
const i18n_1 = __importDefault(require("../config/i18n"));
const emailService_1 = require("../lib/emailService");
class ResponseService {
    async findById(id) {
        try {
            const response = await prisma_1.default.response.findUnique({
                where: { id },
            });
            return response;
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("Response"));
        }
    }
    async findAll(query) {
        try {
            let { page, pageSize, include, orderBy, ...filters } = query;
            if (include)
                include = (0, query_parser_1.parseInclude)(include);
            if (orderBy)
                orderBy = (0, query_parser_1.parseInclude)(orderBy);
            filters = (0, query_parser_1.processFilters)(filters);
            const options = { where: filters, include, orderBy };
            if (page && pageSize) {
                const skip = (+page - 1) * +pageSize;
                const take = +pageSize;
                const [data, total] = await Promise.all([
                    prisma_1.default.response.findMany({ ...options, skip, take }),
                    prisma_1.default.response.count({ where: filters }),
                ]);
                return { data, total, page: +page, pageSize: +pageSize };
            }
            return prisma_1.default.response.findMany(options);
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("Response"));
        }
    }
    async create(data) {
        try {
            return await prisma_1.default.response.create({ data });
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("Response"));
        }
    }
    async update(id, data) {
        try {
            return await prisma_1.default.response.update({
                where: {
                    id,
                },
                data,
            });
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("Response"));
        }
    }
    async deleteById(id) {
        try {
            return prisma_1.default.response.delete({
                where: { id },
            });
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("Response"));
        }
    }
    async deleteMany(ids) {
        try {
            return prisma_1.default.response.deleteMany({
                where: {
                    id: { in: ids },
                },
            });
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("Response"));
        }
    }
    async checkSurveyMilestone(id) {
        try {
            const responseCount = await prisma_1.default.response.count({ where: { surveyId: id } });
            if (responseCount % 10 !== 0 || responseCount === 0)
                return;
            const survey = await prisma_1.default.survey.findUnique({ where: { id } });
            if (!survey)
                return;
            if (survey.lastMilestone === responseCount)
                return;
            const userId = survey.userId;
            const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
            if (!user)
                return;
            const subject = "Survey Responses Notification";
            const userLang = user.language || i18n_1.default.getLocale() || "en";
            await (0, emailService_1.sendNotificationEmail)(user.email, subject, user.name || 'User', survey.title, responseCount, userLang);
            await prisma_1.default.survey.update({
                where: { id },
                data: {
                    lastMilestone: responseCount
                },
            });
        }
        catch (e) {
            (0, prisma_error_1.handlePrismaError)(e, i18n_1.default.__("Response"));
        }
    }
}
exports.default = ResponseService;
