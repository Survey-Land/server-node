"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseController = void 0;
const responseService_1 = __importDefault(require("../services/responseService"));
const i18n_1 = __importDefault(require("../config/i18n"));
const response_1 = require("../utils/response");
class ResponseController {
    constructor() {
        this.responseService = new responseService_1.default();
        this.findAll = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const responses = await this.responseService.findAll(req.query);
                res.json((0, response_1.sendResponse)(true, i18n_1.default.__("retrieve Responses"), responses));
            }
            catch (e) {
                next(e);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { id } = req.params;
                const isExist = await this.responseService.findById(id);
                if (!isExist) {
                    throw Error(i18n_1.default.__("Response not found"));
                }
                res.json((0, response_1.sendResponse)(true, i18n_1.default.__("Response retrieved successfully"), isExist));
            }
            catch (e) {
                next(e);
            }
        };
        this.create = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { surveyId, ...restData } = req.body;
                const isSurveyIdExisted = await prisma?.survey.findUnique({
                    where: {
                        id: surveyId,
                    },
                });
                if (!isSurveyIdExisted) {
                    throw Error(i18n_1.default.__("Survey not found for response"));
                }
                const newResponse = {
                    ...restData,
                    survey: {
                        connect: { id: surveyId },
                    },
                };
                const createdResponse = await this.responseService.create(newResponse);
                await this.responseService.checkSurveyMilestone(surveyId);
                res
                    .status(201)
                    .json((0, response_1.sendResponse)(true, i18n_1.default.__("Response created successfully"), createdResponse));
            }
            catch (e) {
                next(e);
            }
        };
        this.update = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { id } = req.params;
                const isExist = await this.responseService.findById(id);
                if (!isExist) {
                    throw Error(i18n_1.default.__("Response not found"));
                }
                const { surveyId, ...restData } = req.body;
                const isSurveyIdExisted = await prisma?.survey.findUnique({
                    where: {
                        id: surveyId,
                    },
                });
                if (!isSurveyIdExisted) {
                    throw Error(i18n_1.default.__("Survey not found for response"));
                }
                const newResponse = {
                    ...restData,
                    survey: {
                        connect: { id: surveyId },
                    },
                };
                const updateResponse = await this.responseService.update(id, newResponse);
                res
                    .status(201)
                    .json((0, response_1.sendResponse)(true, i18n_1.default.__("Response updated successfully"), updateResponse));
            }
            catch (e) {
                next(e);
            }
        };
        this.deleteById = async (req, res, next) => {
            try {
                (0, response_1.setLocale)(req);
                const { id } = req.params;
                const isExist = await this.responseService.findById(id);
                if (!isExist) {
                    throw Error(i18n_1.default.__("Response not found"));
                }
                await this.responseService.deleteById(id);
                res
                    .status(201)
                    .json((0, response_1.sendResponse)(true, i18n_1.default.__("Response deleted successfully"), null));
            }
            catch (e) {
                next(e);
            }
        };
    }
}
exports.ResponseController = ResponseController;
