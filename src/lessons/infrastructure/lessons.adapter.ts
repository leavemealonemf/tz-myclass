import { Knex } from 'knex';
import { ILessonRepository } from '../domain/lessons.repository.js';
import { Lesson } from '../domain/lessons.entity.js';
import { LessonFilters } from '../domain/lessons.filters.vo.js';

export class LessonAdapter implements ILessonRepository {
 constructor(private db: Knex) {}

  async findByFilters(filters: LessonFilters): Promise<Lesson[]> {
    let lessonIdsQuery = this.db('lessons as l')
      .select('l.id')
      .distinct();

    if (filters.dateRange) {
      if (filters.dateRange.start && filters.dateRange.end) {
        lessonIdsQuery = lessonIdsQuery.whereBetween('l.date', [
          filters.dateRange.start,
          filters.dateRange.end
        ]);
      } else if (filters.dateRange.start) {
        lessonIdsQuery = lessonIdsQuery.where('l.date', filters.dateRange.start);
      }
    }

    if (filters.status !== undefined) {
      lessonIdsQuery = lessonIdsQuery.where('l.status', filters.status);
    }

    if (filters.teacherIds && filters.teacherIds.length > 0) {
      lessonIdsQuery = lessonIdsQuery
        .join('lesson_teachers as lt', 'l.id', 'lt.lesson_id')
        .whereIn('lt.teacher_id', filters.teacherIds);
    }

    if (filters.studentsCountRange) {
      const { min, max } = filters.studentsCountRange;
      
      const subquery = this.db('lesson_students')
        .select('lesson_id')
        .groupBy('lesson_id');

      if (min !== undefined && max !== undefined) {
        subquery.havingRaw('COUNT(*) BETWEEN ? AND ?', [min, max]);
      } else if (min !== undefined) {
        subquery.havingRaw('COUNT(*) = ?', [min]);
      }

      lessonIdsQuery = lessonIdsQuery.whereIn('l.id', subquery);
    }

    lessonIdsQuery = lessonIdsQuery
      .orderBy('l.id')
      .limit(filters.getLimit())
      .offset(filters.getOffset());

    const lessons = await this.db('lessons as l')
      .select(
        'l.id',
        'l.date',
        'l.title',
        'l.status',
        this.db.raw(`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'visit', ls.visit
              )
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'
          ) as students
        `),
        this.db.raw(`
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', t.id,
                'name', t.name
              )
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'
          ) as teachers
        `),
        this.db.raw(`
          COUNT(CASE WHEN ls.visit = true THEN 1 END) as visit_count
        `)
      )
      .whereIn('l.id', lessonIdsQuery)
      .leftJoin('lesson_students as ls', 'l.id', 'ls.lesson_id')
      .leftJoin('students as s', 'ls.student_id', 's.id')
      .leftJoin('lesson_teachers as lt', 'l.id', 'lt.lesson_id')
      .leftJoin('teachers as t', 'lt.teacher_id', 't.id')
      .groupBy('l.id', 'l.date', 'l.title', 'l.status')
      .orderBy('l.id');

    return lessons.map(lesson => 
      Lesson.fromDatabase({
        id: lesson.id,
        date: lesson.date,
        title: lesson.title,
        status: lesson.status,
        visitCount: parseInt(lesson.visit_count),
        students: lesson.students,
        teachers: lesson.teachers
      })
    );
  }
}