"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../prisma"));
const enums_1 = require("../../constants/enums");
const logger_1 = __importDefault(require("../logger"));
node_cron_1.default.schedule('*/30 * * * *', async () => {
    logger_1.default.info('Running survey deadline checker cron job...');
    try {
        const now = new Date();
        const surveys = await prisma_1.default.survey.findMany({
            where: {
                deadline: {
                    not: null,
                    lt: now
                },
                status: { not: enums_1.SurveyStatus.Closed }
            }
        });
        for (const survey of surveys) {
            await prisma_1.default.survey.update({
                where: { id: survey.id },
                data: { status: enums_1.SurveyStatus.Closed }
            });
        }
        logger_1.default.info(`${surveys.length} surveys updated to Closed.`);
    }
    catch (error) {
        logger_1.default.error('Error in survey cron job:', error);
    }
});
