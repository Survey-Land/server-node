"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurveyController = void 0;
const surveyService_1 = require("../services/surveyService");
const i18n_1 = __importDefault(require("../config/i18n"));
class SurveyController {
    constructor() {
        this.surveyService = new surveyService_1.SurveyService();
        this.create = this.create.bind(this);
        this.getAllByUser = this.getAllByUser.bind(this);
        this.getSurvey = this.getSurvey.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.createLink = this.createLink.bind(this);
        this.getSurveyByLink = this.getSurveyByLink.bind(this);
        this.submitResponse = this.submitResponse.bind(this);
    }
    setLocale(req) {
        const lang = req.headers["accept-language"] || "ar";
        i18n_1.default.setLocale(lang);
        return lang;
    }
    async getAllByUser(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const userId = user.id;
            const lang = this.setLocale(req);
            const surveys = await this.surveyService.findAllByUser(req.query, userId, lang);
            res.status(200).json(surveys);
        }
        catch (error) {
            next(error);
        }
    }
    async getSurvey(req, res, next) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.getSurvey(req.params.id, lang);
            res.status(200).json(survey);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const userId = user.id;
            const lang = this.setLocale(req);
            const survey = await this.surveyService.createSurvey(req.body, lang, userId);
            res.status(201).json({
                message: i18n_1.default.__("Survey created successfully"),
                data: survey,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.updateSurvey(req.params.id, lang, req.body);
            res.status(200).json(i18n_1.default.__("Survey updated successfully"));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.deleteSurvey(req.params.id, lang);
            res.status(200).json(i18n_1.default.__("Survey deleted successfully"));
        }
        catch (error) {
            next(error);
        }
    }
    async createLink(req, res, next) {
        try {
            const lang = this.setLocale(req);
            const link = await this.surveyService.createLink(req.params.surveyId, lang);
            res.status(200).json({ link });
        }
        catch (error) {
            next(error);
        }
    }
    async getSurveyByLink(req, res, next) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.getSurveyByLink(req.params.link);
            res.status(200).json(survey);
        }
        catch (error) {
            next(error);
        }
    }
    async submitResponse(req, res, next) {
        try {
            const lang = this.setLocale(req);
            const response = await this.surveyService.submitResponse(req.params.link, req.body);
            res.status(201).json({
                message: i18n_1.default.__("Response submitted successfully"),
                data: response,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SurveyController = SurveyController;
