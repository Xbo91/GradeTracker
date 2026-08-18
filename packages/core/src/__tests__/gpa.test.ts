import { describe, expect, it } from 'vitest';
import {
  type Course,
  GRADE_SCALE,
  calculateCumulativeGPA,
  calculateSemesterGPA,
  getGradeDistribution,
  getGradePoint,
  projectFinalGPA,
} from '../index.js';

describe('GPA Scale & Points', () => {
  it('should return correct points for each Sri Lankan 4.0 grade', () => {
    expect(getGradePoint('A+')).toBe(4.0);
    expect(getGradePoint('A')).toBe(4.0);
    expect(getGradePoint('A-')).toBe(3.7);
    expect(getGradePoint('B+')).toBe(3.3);
    expect(getGradePoint('B')).toBe(3.0);
    expect(getGradePoint('B-')).toBe(2.7);
    expect(getGradePoint('C+')).toBe(2.3);
    expect(getGradePoint('C')).toBe(2.0);
    expect(getGradePoint('C-')).toBe(1.7);
    expect(getGradePoint('D+')).toBe(1.3);
    expect(getGradePoint('D')).toBe(1.0);
    expect(getGradePoint('E')).toBe(0.0);
    expect(getGradePoint('F')).toBe(0.0);
  });

  it('should have 13 grade entries in GRADE_SCALE', () => {
    expect(GRADE_SCALE.length).toBe(13);
  });
});

describe('calculateSemesterGPA', () => {
  const sampleCourses: Course[] = [
    {
      id: '1',
      code: 'ICT111',
      name: 'Programming I',
      credits: 3,
      grade: 'A',
      semester: 1,
      year: 2025,
      isCompleted: true,
    },
    {
      id: '2',
      code: 'ICT112',
      name: 'Math for IT',
      credits: 3,
      grade: 'B+',
      semester: 1,
      year: 2025,
      isCompleted: true,
    },
    {
      id: '3',
      code: 'ICT113',
      name: 'Database Systems',
      credits: 4,
      grade: 'A-',
      semester: 1,
      year: 2025,
      isCompleted: true,
    },
    {
      id: '4',
      code: 'ICT114',
      name: 'Physics',
      credits: 2,
      grade: 'F',
      semester: 1,
      year: 2025,
      isCompleted: true,
    },
    {
      id: '5',
      code: 'ICT115',
      name: 'Communication',
      credits: 2,
      semester: 1,
      year: 2025,
      isCompleted: false,
    },
    {
      id: '6',
      code: 'ICT121',
      name: 'Data Structures',
      credits: 3,
      grade: 'A',
      semester: 2,
      year: 2025,
      isCompleted: true,
    },
  ];

  it('should calculate semester GPA correctly for completed courses', () => {
    const result = calculateSemesterGPA(sampleCourses, 1, 2025);
    // Completed courses:
    // ICT111: 3 * 4.0 = 12
    // ICT112: 3 * 3.3 = 9.9
    // ICT113: 4 * 3.7 = 14.8
    // ICT114: 2 * 0.0 = 0
    // Total points = 36.7
    // Total completed credits = 12
    // Earned credits (points > 0) = 10 (Physics F does not earn credit)
    // GPA = 36.7 / 12 = 3.058333... -> 3.06
    expect(result.semester).toBe(1);
    expect(result.year).toBe(2025);
    expect(result.totalCredits).toBe(12);
    expect(result.earnedCredits).toBe(10);
    expect(result.gpa).toBe(3.06);
    expect(result.courses.length).toBe(5); // all 5 courses in sem 1
  });

  it('should return 0 GPA when no courses are completed in semester', () => {
    const pendingCourses: Course[] = [
      {
        id: '1',
        code: 'ICT111',
        name: 'Programming I',
        credits: 3,
        semester: 1,
        year: 2025,
        isCompleted: false,
      },
    ];
    const result = calculateSemesterGPA(pendingCourses, 1, 2025);
    expect(result.gpa).toBe(0);
    expect(result.totalCredits).toBe(0);
    expect(result.earnedCredits).toBe(0);
  });
});

describe('calculateCumulativeGPA', () => {
  const sampleCourses: Course[] = [
    // Year 1, Sem 1: 10 credits, 38 points -> GPA 3.8
    {
      id: '1',
      code: 'ICT111',
      name: 'Course 1',
      credits: 4,
      grade: 'A',
      semester: 1,
      year: 2024,
      isCompleted: true,
    },
    {
      id: '2',
      code: 'ICT112',
      name: 'Course 2',
      credits: 3,
      grade: 'A',
      semester: 1,
      year: 2024,
      isCompleted: true,
    },
    {
      id: '3',
      code: 'ICT113',
      name: 'Course 3',
      credits: 3,
      grade: 'A-',
      semester: 1,
      year: 2024,
      isCompleted: true,
    },
    // Year 1, Sem 2: 10 credits, 30 points -> GPA 3.0
    {
      id: '4',
      code: 'ICT121',
      name: 'Course 4',
      credits: 4,
      grade: 'B',
      semester: 2,
      year: 2024,
      isCompleted: true,
    },
    {
      id: '5',
      code: 'ICT122',
      name: 'Course 5',
      credits: 3,
      grade: 'B',
      semester: 2,
      year: 2024,
      isCompleted: true,
    },
    {
      id: '6',
      code: 'ICT123',
      name: 'Course 6',
      credits: 3,
      grade: 'B',
      semester: 2,
      year: 2024,
      isCompleted: true,
    },
  ];

  it('should calculate cumulative GPA and sort semesters chronologically', () => {
    const result = calculateCumulativeGPA(sampleCourses);
    expect(result.semesters.length).toBe(2);
    expect(result.semesters[0].year).toBe(2024);
    expect(result.semesters[0].semester).toBe(1);
    expect(result.semesters[1].year).toBe(2024);
    expect(result.semesters[1].semester).toBe(2);
    // Total credits: 20
    // Total points: (4*4 + 3*4 + 3*3.7) + (4*3 + 3*3 + 3*3) = 39.1 + 30 = 69.1
    // CGPA = 69.1 / 20 = 3.455 -> 3.46
    expect(result.totalCredits).toBe(20);
    expect(result.earnedCredits).toBe(20);
    expect(result.cgpa).toBe(3.46);
  });

  it('should return 0 CGPA when no completed courses exist', () => {
    const result = calculateCumulativeGPA([]);
    expect(result.cgpa).toBe(0);
    expect(result.totalCredits).toBe(0);
    expect(result.earnedCredits).toBe(0);
    expect(result.semesters).toEqual([]);
  });
});

describe('projectFinalGPA', () => {
  const sampleCourses: Course[] = [
    {
      id: '1',
      code: 'ICT111',
      name: 'Course 1',
      credits: 30,
      grade: 'A',
      semester: 1,
      year: 2024,
      isCompleted: true,
    },
  ]; // Current CGPA = 4.0, Credits = 30, Points = 120

  it('should accurately project required average for achievable target', () => {
    // Current: 30 credits @ 4.0 = 120 points. Target: 3.5 on 60 total credits (30 remaining)
    // Total needed: 3.5 * 60 = 210 points. Remaining needed: 210 - 120 = 90 points.
    // Required average: 90 / 30 = 3.0
    const projection = projectFinalGPA(sampleCourses, 3.5, 30);
    expect(projection.currentCGPA).toBe(4.0);
    expect(projection.currentCredits).toBe(30);
    expect(projection.remainingCredits).toBe(30);
    expect(projection.targetCGPA).toBe(3.5);
    expect(projection.requiredAverage).toBe(3.0);
    expect(projection.isAchievable).toBe(true);
  });

  it('should mark projection unachievable if required average > 4.0', () => {
    const lowCourses: Course[] = [
      {
        id: '1',
        code: 'ICT111',
        name: 'Course 1',
        credits: 90,
        grade: 'C',
        semester: 1,
        year: 2024,
        isCompleted: true,
      },
    ]; // Current: 90 credits @ 2.0 = 180 points. Target: 3.8 on 100 total credits (10 remaining)
    // Needed: 3.8 * 100 = 380 points. Remaining needed: 380 - 180 = 200 points.
    // Required avg: 200 / 10 = 20.0 (impossible)
    const projection = projectFinalGPA(lowCourses, 3.8, 10);
    expect(projection.requiredAverage).toBe(20.0);
    expect(projection.isAchievable).toBe(false);
  });

  it('should handle target already achieved or exceeded', () => {
    // Current: 30 credits @ 4.0 = 120 points. Target: 2.0 on 60 credits (30 remaining)
    // Total needed: 2.0 * 60 = 120 points. Remaining needed: 0 points.
    const projection = projectFinalGPA(sampleCourses, 2.0, 30);
    expect(projection.requiredAverage).toBe(0.0);
    expect(projection.isAchievable).toBe(true);
  });
});

describe('getGradeDistribution', () => {
  it('should count frequencies of each letter grade', () => {
    const sampleCourses: Course[] = [
      {
        id: '1',
        code: 'C1',
        name: 'C1',
        credits: 3,
        grade: 'A',
        semester: 1,
        year: 2024,
        isCompleted: true,
      },
      {
        id: '2',
        code: 'C2',
        name: 'C2',
        credits: 3,
        grade: 'A',
        semester: 1,
        year: 2024,
        isCompleted: true,
      },
      {
        id: '3',
        code: 'C3',
        name: 'C3',
        credits: 3,
        grade: 'B+',
        semester: 1,
        year: 2024,
        isCompleted: true,
      },
      { id: '4', code: 'C4', name: 'C4', credits: 3, semester: 1, year: 2024, isCompleted: false },
    ];
    const dist = getGradeDistribution(sampleCourses);
    expect(dist).toEqual({
      A: 2,
      'B+': 1,
    });
  });
});
