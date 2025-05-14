import cron from 'node-cron'
import prisma from '../prisma';
import { SurveyStatus } from '../../constants/enums';
import logger from '../logger'

cron.schedule('*/30 * * * *', async () => {
    logger.info('Running survey deadline checker cron job...')
  
    try {
      const now = new Date();  
      const surveys = await prisma.survey.findMany({
        where: {
          deadline: { 
            not:null,
            lt: now 
        },
          status: { not: SurveyStatus.Closed }
        }
      });
  
      for (const survey of surveys) {
        await prisma.survey.update({
          where: { id: survey.id },
          data: { status: SurveyStatus.Closed }
        });
      }
  
      logger.info(`${surveys.length} surveys updated to Closed.`);
    } catch (error) {
      logger.error('Error in survey cron job:', error);
    }
  });

 