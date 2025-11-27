import { Lesson } from './lessons.entity.js';
import { LessonFilters } from './lessons.filters.vo.js';

export interface ILessonRepository {
  findByFilters(filters: LessonFilters): Promise<Lesson[]>;
}