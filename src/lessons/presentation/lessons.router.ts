import { Router } from 'express';
import { LessonsController } from './lessons.controller';

export const createLessonsRouter = (controller: LessonsController): Router => {
  const router = Router();

  router.get('/', (req, res, next) => {
    controller.getLessons(req, res).catch(next);
  });

  return router;
};