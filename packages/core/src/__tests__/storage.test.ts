import { beforeEach, describe, expect, it } from 'vitest';
import {
  type Course,
  DEFAULT_STORAGE,
  MemoryStorageAdapter,
  addCourse,
  clearAll,
  deleteCourse,
  getCourses,
  getCoursesBySemester,
  loadStorage,
  saveStorage,
  setStorageAdapter,
  updateCourse,
} from '../index.js';

describe('Storage Operations', () => {
  let memoryAdapter: MemoryStorageAdapter;

  beforeEach(() => {
    memoryAdapter = new MemoryStorageAdapter();
    setStorageAdapter(memoryAdapter);
  });

  it('should initialize with default storage', () => {
    const data = loadStorage();
    expect(data.version).toBe(1);
    expect(data.courses).toEqual([]);
    expect(data.settings.gradeScale).toBe('SL-4.0');
  });

  it('should add courses and retrieve them', () => {
    const course: Course = {
      id: 'c-1',
      code: 'ICT101',
      name: 'Intro to IT',
      credits: 3,
      semester: 1,
      year: 2025,
      isCompleted: false,
    };
    addCourse(course);
    const courses = getCourses();
    expect(courses.length).toBe(1);
    expect(courses[0].code).toBe('ICT101');
  });

  it('should update course details', () => {
    const course: Course = {
      id: 'c-1',
      code: 'ICT101',
      name: 'Intro to IT',
      credits: 3,
      semester: 1,
      year: 2025,
      isCompleted: false,
    };
    addCourse(course);
    const success = updateCourse('c-1', { grade: 'A', isCompleted: true });
    expect(success).toBe(true);

    const courses = getCourses();
    expect(courses[0].grade).toBe('A');
    expect(courses[0].isCompleted).toBe(true);

    const fail = updateCourse('non-existent', { grade: 'B' });
    expect(fail).toBe(false);
  });

  it('should delete courses', () => {
    const course: Course = {
      id: 'c-1',
      code: 'ICT101',
      name: 'Intro to IT',
      credits: 3,
      semester: 1,
      year: 2025,
      isCompleted: false,
    };
    addCourse(course);
    expect(deleteCourse('c-1')).toBe(true);
    expect(getCourses().length).toBe(0);
    expect(deleteCourse('c-1')).toBe(false);
  });

  it('should filter courses by semester', () => {
    addCourse({
      id: '1',
      code: 'S1Y1',
      name: 'N1',
      credits: 3,
      semester: 1,
      year: 2025,
      isCompleted: false,
    });
    addCourse({
      id: '2',
      code: 'S2Y1',
      name: 'N2',
      credits: 3,
      semester: 2,
      year: 2025,
      isCompleted: false,
    });
    addCourse({
      id: '3',
      code: 'S1Y2',
      name: 'N3',
      credits: 3,
      semester: 1,
      year: 2026,
      isCompleted: false,
    });

    const sem1Year2025 = getCoursesBySemester(1, 2025);
    expect(sem1Year2025.length).toBe(1);
    expect(sem1Year2025[0].code).toBe('S1Y1');
  });

  it('should clear all courses and reset storage', () => {
    addCourse({
      id: '1',
      code: 'S1Y1',
      name: 'N1',
      credits: 3,
      semester: 1,
      year: 2025,
      isCompleted: false,
    });
    expect(getCourses().length).toBe(1);
    clearAll();
    expect(getCourses().length).toBe(0);
  });
});
