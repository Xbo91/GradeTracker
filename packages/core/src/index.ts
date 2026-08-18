/**
 * GradeTracker Core - Main Export
 */

// Types
export * from './types.js';

// Storage
export {
  type StorageAdapter,
  MemoryStorageAdapter,
  LocalStorageAdapter,
  NodeFileStorageAdapter,
  setStorageAdapter,
  getStorageAdapter,
  getStorageFile,
  loadStorage,
  saveStorage,
  addCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  getCoursesBySemester,
  clearAll,
  STORAGE_FILE,
} from './storage.js';

// GPA Calculations
export {
  round2,
  calculateSemesterGPA,
  calculateCumulativeGPA,
  projectFinalGPA,
  getGradeDistribution,
} from './gpa.js';
