/**
 * GradeTracker Core Types
 * Sri Lankan 4.0 GPA Scale
 */

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade?: GradeLetter;
  semester: number;
  year: number;
  isCompleted: boolean;
}

export type GradeLetter =
  | 'A+'
  | 'A'
  | 'A-'
  | 'B+'
  | 'B'
  | 'B-'
  | 'C+'
  | 'C'
  | 'C-'
  | 'D+'
  | 'D'
  | 'E'
  | 'F';

export interface GradePoint {
  letter: GradeLetter;
  point: number;
  description: string;
}

export const GRADE_SCALE: GradePoint[] = [
  { letter: 'A+', point: 4.0, description: 'Excellent' },
  { letter: 'A', point: 4.0, description: 'Excellent' },
  { letter: 'A-', point: 3.7, description: 'Very Good' },
  { letter: 'B+', point: 3.3, description: 'Good' },
  { letter: 'B', point: 3.0, description: 'Good' },
  { letter: 'B-', point: 2.7, description: 'Satisfactory' },
  { letter: 'C+', point: 2.3, description: 'Satisfactory' },
  { letter: 'C', point: 2.0, description: 'Pass' },
  { letter: 'C-', point: 1.7, description: 'Pass' },
  { letter: 'D+', point: 1.3, description: 'Weak Pass' },
  { letter: 'D', point: 1.0, description: 'Weak Pass' },
  { letter: 'E', point: 0.0, description: 'Fail' },
  { letter: 'F', point: 0.0, description: 'Fail' },
];

export function getGradePoint(grade: GradeLetter): number {
  const gp = GRADE_SCALE.find((g) => g.letter === grade);
  return gp?.point ?? 0;
}

export interface SemesterGPA {
  semester: number;
  year: number;
  totalCredits: number;
  earnedCredits: number;
  gpa: number;
  courses: Course[];
}

export interface CumulativeGPA {
  totalCredits: number;
  earnedCredits: number;
  cgpa: number;
  semesters: SemesterGPA[];
}

export interface GradeProjection {
  currentCGPA: number;
  currentCredits: number;
  remainingCredits: number;
  targetCGPA: number;
  requiredAverage: number;
  isAchievable: boolean;
}

export interface StorageData {
  version: number;
  courses: Course[];
  settings: {
    gradeScale: 'SL-4.0';
    defaultCredits: number;
  };
}

export const STORAGE_VERSION = 1;
export const DEFAULT_STORAGE: StorageData = {
  version: STORAGE_VERSION,
  courses: [],
  settings: {
    gradeScale: 'SL-4.0',
    defaultCredits: 3,
  },
};
