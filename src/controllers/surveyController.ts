import {SurveyService} from "../services/surveyService";
import { Request, Response, NextFunction } from 'express'
import i18n from '../config/i18n'
import { User } from "@prisma/client";


export class SurveyController {
    constructor() {
        this.create = this.create.bind(this);
        this.getAllByUser = this.getAllByUser.bind(this);
        this.getSurvey = this.getSurvey.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }
    private surveyService = new SurveyService();
    
    private setLocale(req: Request) {
        const lang = req.headers['accept-language'] || 'ar';
        i18n.setLocale(lang as string);
        return lang;
    }

    public async getAllByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = req.user as User;
            if (!user) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const userId = user.id as string;
            const lang = this.setLocale(req);
            const surveys = await this.surveyService.findAllByUser(req.query, userId, lang);
            res.status(200).json(surveys);
        } catch (error) {
            next(error);
        }
    }
    

    public async getSurvey(req: Request, res: Response, next: NextFunction) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.getSurvey(req.params.id, lang);
            res.status(200).json(survey);
        } catch (error) {
            next(error);
        }
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.createSurvey(req.body, lang);
            res.status(201).json({ message: i18n.__('Survey created successfully'), data: survey });
        } catch (error) {
            next(error);
        }
    }

    public async update(req: Request, res: Response, next: NextFunction) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.updateSurvey(req.params.id, lang,req.body);
            res.status(200).json(i18n.__('Survey updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const lang = this.setLocale(req);
            const survey = await this.surveyService.deleteSurvey(req.params.id, lang);
            res.status(200).json(i18n.__('Survey deleted successfully'));
        } catch (error) {
            next(error);
        }
    }
}
