import prisma from "../lib/prisma";
import { normalizeSurveyStatus } from "../utils/normalize";
import { SurveyStatus } from "../constants/enums";
import { CustomError } from "../utils/custom-error";
import { handlePrismaError } from "../utils/prisma-error";
import {
    processFilters,
    parseInclude,
    parseValue,
} from "../utils/query-parser";
import i18n from "../config/i18n";
import { decodeSurveyId, encodeSurveyId } from "../utils/hashids";

export class SurveyService {
    // This Function is used to get all surveys for specific user
    async findAllByUser(query: any, userId: string, lang: string) {
        i18n.setLocale(lang);
        try {
            let { page, pageSize, include, orderBy, ...filters } = query;

            if (include) include = parseInclude(include);
            if (orderBy) orderBy = parseInclude(orderBy);

            filters = processFilters(filters);
            filters.userId = userId;

            const options: any = { where: filters, include, orderBy };

            if (page && pageSize) {
                const skip = (Number(page) - 1) * Number(pageSize);
                const take = Number(pageSize);

                const [data, total] = await Promise.all([
                    prisma.survey.findMany({ ...options, skip, take }),
                    prisma.survey.count({ where: filters }),
                ]);

                return {
                    data,
                    total,
                    page: Number(page),
                    pageSize: Number(pageSize),
                };
            }

            return await prisma.survey.findMany(options);
        } catch (error) {
            throw handlePrismaError(error, i18n.__("Survey"));
        }
    }

    // This Function is used to create a new survey
    async createSurvey(data: any, lang: string, userId: string) {
        i18n.setLocale(lang);

        if (!data.title) {
            throw new CustomError(i18n.__("Survey creation failed"), 400);
        }

        try {
            const normalizedStatus = data.status
                ? normalizeSurveyStatus(data.status)
                : SurveyStatus.Draft;

            const payload = {
                title: data.title,
                description: data.description,
                ...(data.image !== undefined ? { cover: data.image } : {}),
                status: normalizedStatus,
                userId,
                deadline: data.deadline ? new Date(data.deadline) : undefined,
            };

            return await prisma.survey.create({ data: payload });
        } catch (error) {
            throw new CustomError(i18n.__("Survey creation failed"), 400);
        }
    }

    // This Function is used to get a survey by id
    async getSurvey(id: string, lang: string) {
        i18n.setLocale(lang);
        try {
            const survey = await prisma.survey.findUnique({ where: { id } });
            if (!survey) {
                throw new CustomError(i18n.__("Survey not found"), 404);
            }
            return survey;
        } catch (error) {
            throw new CustomError(i18n.__("Survey not found"), 404);
        }
    }

    // This Function is used to delete a survey by id
    async deleteSurvey(id: string, lang: string) {
        i18n.setLocale(lang);
        try {
            const existingSurvey = await prisma.survey.findUnique({
                where: { id },
            });
            if (!existingSurvey) {
                throw new CustomError(i18n.__("Survey not found"), 404);
            }
            return await prisma.survey.delete({ where: { id } });
        } catch (error) {
            throw new CustomError(i18n.__("Survey not found"), 404);
        }
    }

    // This Function is used to update a survey by id
    async updateSurvey(id: string, lang: string, data: any) {
        i18n.setLocale(lang);
        try {
            const existingSurvey = await prisma.survey.findUnique({
                where: { id },
            });
            if (!existingSurvey) {
                throw new CustomError(i18n.__("Survey not found"), 404);
            }
            const updatedSurveyData: any = {
                ...existingSurvey,
                ...data,
            };
            delete updatedSurveyData.id;
            const updatedSurvey = await prisma.survey.update({
                where: { id },
                data: updatedSurveyData,
            });

            return updatedSurvey;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    i18n.__("An error occurred while updating the survey"),
                    500
                );
            }
        }
    }

    async createLink(surveyId: string, lang: string) {
        i18n.setLocale(lang);
        try {
            const survey = await prisma.survey.findUnique({
                where: { id: surveyId },
            });
            if (!survey) {
                throw new CustomError(i18n.__("Survey not found"), 404);
            }
            return encodeSurveyId(survey.id);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    i18n.__("An error occurred while creating the survey link"),
                    500
                );
            }
        }
    }

    async publishSurvey(surveyId: string) {
        const survey = await prisma.survey.update({
            where: { id: surveyId },
            data: { status: "published" },
        });
        return encodeSurveyId(survey.id);
    }

    async getSurveyByLink(link: string) {
        const surveyId = decodeSurveyId(link);
        const survey = await prisma.survey.findUnique({
            where: { id: surveyId },
            include:{},
        });
        if (!survey) {
            throw new CustomError(i18n.__("Survey not found"), 404);
        }
        if (survey.deadline !== null && survey.deadline < new Date()) {
            throw new CustomError(i18n.__("Survey is expired"), 400);
        }

        return await prisma.survey.findUnique({
            where: { id: surveyId },
            include: {},
        });
    }

    async submitResponse(link: string, data: any) {
        const surveyId = decodeSurveyId(link);
        await prisma.response.create({
            data: {
                surveyId,
                answers:data.answers,
                respondentEmail:data.respondentEmail,
                respondentName:data.respondentName,
            },
        });
    }
}
