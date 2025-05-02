import { parseInclude, processFilters } from "../utils/query-parser";
import prisma from "../lib/prisma";
import { handlePrismaError } from "../utils/prisma-error";
import { Prisma } from "@prisma/client";
import i18n from "../config/i18n";
import { sendNotificationEmail } from "../lib/emailService";
export default class ResponseService {
  async findById(id: string) {
    try {
      const response = await prisma.response.findUnique({
        where: { id },
      });
      return response;
    } catch (e) {
      handlePrismaError(e, i18n.__("Response"));
    }
  }

  async findAll(query: any) {
    try {
      let { page, pageSize, include, orderBy, ...filters } = query;
      if (include) include = parseInclude(include);
      if (orderBy) orderBy = parseInclude(orderBy);
      filters = processFilters(filters);
      const options: any = { where: filters, include, orderBy };
      if (page && pageSize) {
        const skip = (+page - 1) * +pageSize;
        const take = +pageSize;
        const [data, total] = await Promise.all([
          prisma.response.findMany({ ...options, skip, take }),
          prisma.response.count({ where: filters }),
        ]);
        return { data, total, page: +page, pageSize: +pageSize };
      }

      return prisma.response.findMany(options);
    } catch (e) {
      handlePrismaError(e, i18n.__("Response"));
    }
  }

  async create(data: Prisma.ResponseCreateInput) {
    try {
      return await prisma.response.create({ data });
    } catch (e) {
      handlePrismaError(e, i18n.__("Response"));
    }
  }

  async update(id: string, data: Prisma.ResponseCreateInput) {
    try {
      return await prisma.response.update({
        where: {
          id,
        },
        data,
      });
    } catch (e) {
      handlePrismaError(e, i18n.__("Response"));
    }
  }

  async deleteById(id: string) {
    try {
      return prisma.response.delete({
        where: { id },
      });
    } catch (e) {
      handlePrismaError(e, i18n.__("Response"));
    }
  }

  async deleteMany(ids: string[]) {
    try {
      return prisma.response.deleteMany({
        where: {
          id: { in: ids },
        },
      });
    } catch (e) {
      handlePrismaError(e, i18n.__("Response"));
    }
  }

  async checkSurveyMilestone(id: string) {
    try {
      const responseCount = await prisma.response.count({where: {surveyId: id }});
      if(responseCount % 10 !== 0) return;
      const survey = await prisma.survey.findUnique({where: {id}});
      if (!survey) return;
      const userId  = survey?.userId;
      const user = await prisma.user.findUnique({where: {id: userId}});
      if (!user) return;
      const subject = "Survey Responses Notification";
      await sendNotificationEmail(user.email, subject, user.name || 'User', survey.title, responseCount);
    } catch (e) {
      handlePrismaError(e, i18n.__("Response"));
    }
  }
}

