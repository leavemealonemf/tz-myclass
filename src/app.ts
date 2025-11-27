import express, { Express } from 'express';
import db from './database/database.js';
import { LessonAdapter } from './lessons/infrastructure/lessons.adapter.js';
import { GetLessonsUseCase } from './lessons/infrastructure/use-cases/get-lessons-use-case.js';
import { LessonsController } from './lessons/presentation/lessons.controller.js';
import { createLessonsRouter } from './lessons/presentation/lessons.router.js';
import { errorHandler } from './libs/shared/error-handler.js';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());

  const lessonRepository = new LessonAdapter(db);
  const getLessonsUseCase = new GetLessonsUseCase(lessonRepository);
  const lessonsController = new LessonsController(getLessonsUseCase);
  const lessonsRouter = createLessonsRouter(lessonsController);

  app.use('/lessons', lessonsRouter);

  app.use(errorHandler);

  return app;
};

export { db };