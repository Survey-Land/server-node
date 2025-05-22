import { Request, Response, NextFunction } from "express";
import ResponseService from "../services/responseService";
import i18n from "../config/i18n";
import { Prisma } from "@prisma/client";
import { setLocale, sendResponse } from "../utils/response";

export class ResponseController {
  private responseService = new ResponseService();

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      setLocale(req);

      const responses = await this.responseService.findAll(req.query);
      res.json(
        sendResponse(true, i18n.__("retrieve Responses"), responses)
      );
    } catch (e) {
      next(e);
    }
  };
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      setLocale(req);
      const { id } = req.params;
      const isExist = await this.responseService.findById(id);

      if (!isExist) {
        throw Error(i18n.__("Response not found"));
      }

      res.json(
        sendResponse(
          true,
          i18n.__("Response retrieved successfully"),
          isExist
        )
      );
    } catch (e) {
      next(e);
    }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = setLocale(req);
      const { surveyId, ...restData } = req.body;

      const isSurveyIdExisted = await prisma?.survey.findUnique({
        where: {
          id: surveyId,
        },
      });

      if (!isSurveyIdExisted) {
        throw Error(i18n.__("Survey not found for response"));
      }
      const newResponse: Prisma.ResponseCreateInput = {
        ...restData,
        survey: {
          connect: { id: surveyId },
        },
      };

      const createdResponse = await this.responseService.create(newResponse);
      await this.responseService.checkSurveyMilestone(surveyId,lang);
      res
        .status(201)
        .json(
          sendResponse(
            true,
            i18n.__("Response created successfully"),
            createdResponse
          )
        );
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      setLocale(req);
      const { id } = req.params;

      const isExist = await this.responseService.findById(id);

      if (!isExist) {
        throw Error(i18n.__("Response not found"));
      }

      const { surveyId, ...restData } = req.body;

      const isSurveyIdExisted = await prisma?.survey.findUnique({
        where: {
          id: surveyId,
        },
      });

      if (!isSurveyIdExisted) {
        throw Error(i18n.__("Survey not found for response"));
      }
      const newResponse: Prisma.ResponseCreateInput = {
        ...restData,
        survey: {
          connect: { id: surveyId },
        },
      };

      const updateResponse = await this.responseService.update(id, newResponse);

      res
        .status(201)
        .json(
          sendResponse(
            true,
            i18n.__("Response updated successfully"),
            updateResponse
          )
        );
    } catch (e) {
      next(e);
    }
  };

  deleteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      setLocale(req);
      const { id } = req.params;
      const isExist = await this.responseService.findById(id);

      if (!isExist) {
        throw Error(i18n.__("Response not found"));
      }
      await this.responseService.deleteById(id);

      res
        .status(201)
        .json(
          sendResponse(
            true,
            i18n.__("Response deleted successfully"),
            null
          )
        );
    } catch (e) {
      next(e);
    }
  };

  getResponsesSurveyId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      setLocale(req);
      const { surveyId } = req.params;
      const isExist = await this.responseService.findResponseSurveyId(
        surveyId,
        req.query
      );

      if (!isExist) {
        throw Error(i18n.__("Response not found"));
      }

      res.json(
        sendResponse(
          true,
          i18n.__("Response retrieved successfully"),
          isExist
        )
      );
    } catch (e) {
      next(e);
    }
  };
}
