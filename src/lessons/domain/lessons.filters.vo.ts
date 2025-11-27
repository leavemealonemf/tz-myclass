export interface DateRange {
  start?: string;
  end?: string;
}

export interface StudentsCountRange {
  min?: number;
  max?: number;
}

export class LessonFilters {
  constructor(
    public readonly dateRange?: DateRange,
    public readonly status?: number,
    public readonly teacherIds?: number[],
    public readonly studentsCountRange?: StudentsCountRange,
    public readonly page: number = 1,
    public readonly lessonsPerPage: number = 5
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.status !== undefined && ![0, 1].includes(this.status)) {
      throw new Error('Status must be 0 or 1');
    }

    if (this.page < 1) {
      throw new Error('Page must be >= 1');
    }

    if (this.lessonsPerPage < 1) {
      throw new Error('lessonsPerPage must be >= 1');
    }

    if (this.dateRange?.start && !this.isValidDate(this.dateRange.start)) {
      throw new Error('Invalid start date format. Use YYYY-MM-DD');
    }

    if (this.dateRange?.end && !this.isValidDate(this.dateRange.end)) {
      throw new Error('Invalid end date format. Use YYYY-MM-DD');
    }

    if (this.studentsCountRange) {
      const { min, max } = this.studentsCountRange;
      if (min !== undefined && min < 0) {
        throw new Error('Students count must be >= 0');
      }
      if (max !== undefined && max < 0) {
        throw new Error('Students count must be >= 0');
      }
      if (min !== undefined && max !== undefined && min > max) {
        throw new Error('Min students count cannot be greater than max');
      }
    }
  }

  private isValidDate(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const timestamp = Date.parse(date);
    return !isNaN(timestamp);
  }

  getOffset(): number {
    return (this.page - 1) * this.lessonsPerPage;
  }

  getLimit(): number {
    return this.lessonsPerPage;
  }
}