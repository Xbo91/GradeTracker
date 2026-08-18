#!/usr/bin/env node
/**
 * GradeTracker CLI Entry Point
 */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { addCourseCommand } from './commands/add-course.js';
import { calcGPACommand } from './commands/calc-gpa.js';
import { exportCommand } from './commands/export.js';
import { listCommand } from './commands/list.js';
import { projectCommand } from './commands/project.js';
import { setGradeCommand } from './commands/set-grade.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const version: string = pkg.version || '0.1.0';

export function createProgram(): Command {
  const prog = new Command();

  prog
    .name('gradetracker')
    .description('CLI + Web Dashboard for BICT students to track grades and GPA')
    .version(version)
    .helpOption('-h, --help', 'Show help');

  prog.addCommand(addCourseCommand);
  prog.addCommand(setGradeCommand);
  prog.addCommand(calcGPACommand);
  prog.addCommand(projectCommand);
  prog.addCommand(exportCommand);
  prog.addCommand(listCommand);

  return prog;
}

export const program = createProgram();

function isRunningDirectly(): boolean {
  if (typeof process === 'undefined' || !process.argv || !process.argv[1]) {
    return false;
  }
  // Check if vitest or other test runner is executing
  if (process.env.VITEST || process.argv.some((arg) => arg.includes('vitest'))) {
    return false;
  }
  try {
    const currentFile = fileURLToPath(import.meta.url);
    return (
      process.argv[1] === currentFile ||
      process.argv[1].endsWith('/gradetracker') ||
      process.argv[1].endsWith('/dist/index.js') ||
      process.argv[1].endsWith('/src/index.ts')
    );
  } catch {
    return false;
  }
}

if (isRunningDirectly()) {
  program.parse();
}
