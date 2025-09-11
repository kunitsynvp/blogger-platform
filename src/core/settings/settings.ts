import { add } from 'date-fns';

export const SETTINGS = {
  MONGO_URL:
    'mongodb+srv://admin:admin@learningcluster.qtjicyx.mongodb.net/?retryWrites=true&w=majority&appName=LearningCluster',
  MONGO_DB_NAME: 'ArticlesApp',
  MONGO_DB_TEST_NAME: 'Test',
  PORT: process.env.PORT || 3000,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'secretkey',
  EXPIRES_TIME_ACCESS_TOKEN: process.env.EXPIRES_TIME_ACCESS_TOKEN || '7m',
  EXPIRES_TIME_REFRESH_TOKEN: process.env.EXPIRES_TIME_REFRESH_TOKEN || '20m',
  EMAIL_CONFIRMATION_EXP_DATE: add(new Date(), { hours: 1 }),
};
