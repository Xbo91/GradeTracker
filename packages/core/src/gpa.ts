/**
 * GradeTracker GPA Calculation Logic
 * Sri Lankan 4.0 Scale
 */

import {
  type Course,
  type CumulativeGPA,
  type GradeProjection,
  type SemesterGPA,
  getGradePoint,
} from './types.js';

/**
 * Rounds a number to 2 decimal places accurately avoiding JS floating point truncation
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateSemesterGPA(
  courses: Course[],
  semester: number,
  year: number,
): SemesterGPA {
  const semCourses = courses.filter((c) => c.semester === semester && c.year === year);
  const completed = semCourses.filter((c) => c.isCompleted && c.grade);

  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  for (const course of completed) {
    const points = getGradePoint(course.grade!);
    totalPoints += points * course.credits;
    totalCredits += course.credits;
    if (points > 0) earnedCredits += course.credits;
  }

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    semester,
    year,
    totalCredits,
    earnedCredits,
    gpa: round2(gpa),
    courses: semCourses,
  };
}

export function calculateCumulativeGPA(courses: Course[]): CumulativeGPA {
  const completed = courses.filter((c) => c.isCompleted && c.grade);

  // Group by semester/year
  const semesterMap = new Map<string, Course[]>();
  for (const course of completed) {
    const key = `${course.year}-${course.semester}`;
    if (!semesterMap.has(key)) semesterMap.set(key, []);
    semesterMap.get(key)!.push(course);
  }

  const semesters: SemesterGPA[] = [];
  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  for (const [key, semCourses] of semesterMap) {
    const [yearStr, semStr] = key.split('-');
    const year = Number.parseInt(yearStr, 10);
    const semester = Number.parseInt(semStr, 10);

    let semPoints = 0;
    let semCredits = 0;
    let semEarned = 0;

    for (const course of semCourses) {
      const points = getGradePoint(course.grade!);
      semPoints += points * course.credits;
      semCredits += course.credits;
      if (points > 0) semEarned += course.credits;
    }

    const gpa = semCredits > 0 ? semPoints / semCredits : 0;

    semesters.push({
      semester,
      year,
      totalCredits: semCredits,
      earnedCredits: semEarned,
      gpa: round2(gpa),
      courses: semCourses,
    });

    totalPoints += semPoints;
    totalCredits += semCredits;
    earnedCredits += semEarned;
  }

  // Sort semesters chronologically
  semesters.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.semester - b.semester;
  });

  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return {
    totalCredits,
    earnedCredits,
    cgpa: round2(cgpa),
    semesters,
  };
}

export function projectFinalGPA(
  courses: Course[],
  targetCGPA: number,
  remainingCredits: number,
): GradeProjection {
  const completed = courses.filter((c) => c.isCompleted && c.grade);
  let currentPoints = 0;
  let currentCredits = 0;

  for (const course of completed) {
    const points = getGradePoint(course.grade!);
    currentPoints += points * course.credits;
    currentCredits += course.credits;
  }

  const currentCGPA = currentCredits > 0 ? currentPoints / currentCredits : 0;

  let requiredAverage = 0;
  let isAchievable = false;

  if (remainingCredits <= 0) {
    requiredAverage = 0;
    isAchievable = currentCGPA >= targetCGPA;
  } else {
    const totalPointsNeeded = targetCGPA * (currentCredits + remainingCredits);
    const remainingPointsNeeded = totalPointsNeeded - currentPoints;
    requiredAverage = remainingPointsNeeded / remainingCredits;
    isAchievable = requiredAverage <= 4.0;
  }

  return {
    currentCGPA: round2(currentCGPA),
    currentCredits,
    remainingCredits,
    targetCGPA,
    requiredAverage: round2(requiredAverage),
    isAchievable,
  };
}

export function getGradeDistribution(courses: Course[]): Record<string, number> {
  const completed = courses.filter((c) => c.isCompleted && c.grade);
  const dist: Record<string, number> = {};
  for (const course of completed) {
    dist[course.grade!] = (dist[course.grade!] || 0) + 1;
  }
  return dist;
}
