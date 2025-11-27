import { ILessonRepository } from '../../domain/lessons.repository.js';
import { Lesson } from '../../domain/lessons.entity.js';
import { LessonFilters, DateRange, StudentsCountRange } from '../../domain/lessons.filters.vo.js';

export interface GetLessonsInput {
  date?: string;
  status?: string;
  teacherIds?: string;
  studentsCount?: string;
  page?: string;
  lessonsPerPage?: string;
}

export class GetLessonsUseCase {
  constructor(private lessonRepository: ILessonRepository) {}

  async execute(input: GetLessonsInput): Promise<Lesson[]> {
    const filters = this.parseFilters(input);
    return await this.lessonRepository.findByFilters(filters);
  }

  private parseFilters(input: GetLessonsInput): LessonFilters {
    const dateRange = this.parseDateRange(input.date);
    const status = input.status !== undefined ? this.parseStatus(input.status) : undefined;
    const teacherIds = this.parseTeacherIds(input.teacherIds);
    const studentsCountRange = this.parseStudentsCountRange(input.studentsCount);
    const page = input.page ? this.parsePositiveInt(input.page, 'page') : 1; 
    const lessonsPerPage = input.lessonsPerPage ? this.parsePositiveInt(input.lessonsPerPage, 'lessonsPerPage') : 5;  // ⬅️ ИСПРАВЛЕНО

    return new LessonFilters(
      dateRange,
      status,
      teacherIds,
      studentsCountRange,
      page,
      lessonsPerPage
    );
  }

  private parseStatus(statusParam: string): number {
    const status = parseInt(statusParam);
    if (isNaN(status)) {
      throw new Error('Status must be a number');
    }
    return status;
  }

  // ⬅️ НОВЫЙ МЕТОД
  private parsePositiveInt(value: string, fieldName: string): number {
    const parsed = parseInt(value);
    if (isNaN(parsed)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
    return parsed;
  }

  private parseDateRange(dateParam?: string): DateRange | undefined {
    if (!dateParam) return undefined;

    const dates = dateParam.split(',').map(d => d.trim());
    
    if (dates.length === 1) {
      return { start: dates[0], end: dates[0] };
    } else if (dates.length === 2) {
      return { start: dates[0], end: dates[1] };
    }

    throw new Error('Invalid date format');
  }

  private parseTeacherIds(teacherIdsParam?: string): number[] | undefined {
    if (!teacherIdsParam) return undefined;

    const ids = teacherIdsParam.split(',').map(id => {
      const parsed = parseInt(id.trim());
      if (isNaN(parsed)) {
        throw new Error('Invalid teacher ID format');
      }
      return parsed;
    });

    return ids;
  }

  private parseStudentsCountRange(countParam?: string): StudentsCountRange | undefined {
    if (!countParam) return undefined;

    const counts = countParam.split(',').map(c => {
      const parsed = parseInt(c.trim());
      if (isNaN(parsed)) {
        throw new Error('Invalid students count format');
      }
      return parsed;
    });

    if (counts.length === 1) {
      return { min: counts[0], max: counts[0] };
    } else if (counts.length === 2) {
      return { min: counts[0], max: counts[1] };
    }

    throw new Error('Invalid students count format');
  }
}