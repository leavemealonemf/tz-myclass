import { Request, Response } from 'express';
import { GetLessonsUseCase } from '../infrastructure/use-cases/get-lessons-use-case';

export class LessonsController {
  constructor(private getLessonsUseCase: GetLessonsUseCase) {}

  async getLessons(req: Request, res: Response): Promise<void> {
    try {
      const lessons = await this.getLessonsUseCase.execute({
        date: req.query.date as string,
        status: req.query.status as string,
        teacherIds: req.query.teacherIds as string,
        studentsCount: req.query.studentsCount as string,
        page: req.query.page as string,
        lessonsPerPage: req.query.lessonsPerPage as string
      });

      res.json(lessons);
    } catch (error) {
      throw error;
    }
  }
}