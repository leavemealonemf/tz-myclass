export interface Student {
  id: number;
  name: string;
  visit: boolean;
}

export interface Teacher {
  id: number;
  name: string;
}

export class Lesson {
  constructor(
    public readonly id: number,
    public readonly date: string,
    public readonly title: string,
    public readonly status: number,
    public readonly visitCount: number,
    public readonly students: Student[],
    public readonly teachers: Teacher[]
  ) {}

  static fromDatabase(data: any): Lesson {
    return new Lesson(
      data.id,
      data.date,
      data.title,
      data.status,
      data.visitCount,
      data.students || [],
      data.teachers || []
    );
  }
}