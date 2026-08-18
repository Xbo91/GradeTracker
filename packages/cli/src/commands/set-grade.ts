/**
 * Set Grade Command
 */

import { getCourses, updateCourse } from '@gradetracker/core';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const setGradeCommand = new Command('set-grade')
  .description('Set grade for a course')
  .argument('<course-code>', 'Course code (e.g., ICT143)')
  .argument('<grade>', 'Grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, E, F)')
  .action(async (courseCode, grade) => {
    const spinner = ora('Setting grade...').start();

    try {
      const courses = getCourses();
      const course = courses.find((c) => c.code.toLowerCase() === courseCode.toLowerCase());

      if (!course) {
        spinner.fail(chalk.red(`Course not found: ${courseCode}`));
        process.exit(1);
      }

      const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'E', 'F'];
      if (!validGrades.includes(grade.toUpperCase())) {
        spinner.fail(chalk.red(`Invalid grade: ${grade}`));
        process.exit(1);
      }

      const success = updateCourse(course.id, {
        grade: grade.toUpperCase() as any,
        isCompleted: true,
      });

      if (!success) {
        spinner.fail(chalk.red('Failed to update course'));
        process.exit(1);
      }

      spinner.succeed(chalk.green(`Grade set: ${course.code} = ${grade.toUpperCase()}`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to set grade'));
      console.error(error);
      process.exit(1);
    }
  });
