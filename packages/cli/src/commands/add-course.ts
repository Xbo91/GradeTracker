/**
 * Add Course Command
 */

import { randomUUID } from 'node:crypto';
import { type Course, type GradeLetter, addCourse } from '@gradetracker/core';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const addCourseCommand = new Command('add-course')
  .description('Add a new course')
  .option('-c, --code <code>', 'Course code (e.g., ICT143)')
  .option('-n, --name <name>', 'Course name')
  .option('-s, --semester <semester>', 'Semester number', (val) => Number.parseInt(val, 10))
  .option('-y, --year <year>', 'Academic year', (val) => Number.parseInt(val, 10))
  .option('-d, --credits <credits>', 'Credits', (val) => Number.parseInt(val, 10), 3)
  .option('-g, --grade <grade>', 'Grade (optional)')
  .action(async (options) => {
    const spinner = ora('Adding course...').start();

    try {
      // Prompt for missing required fields
      const code = options.code;
      const name = options.name;
      const semester = options.semester;
      const year = options.year;

      // In a real CLI, you'd use inquirer here. For now, require all flags.
      if (!code || !name || !semester || !year) {
        spinner.fail('Missing required fields. Use --code, --name, --semester, --year');
        process.exit(1);
      }

      const grade = options.grade as GradeLetter | undefined;
      const credits = options.credits;

      const course: Course = {
        id: randomUUID(),
        code: code.toUpperCase(),
        name,
        credits,
        grade,
        semester,
        year,
        isCompleted: !!grade,
      };

      addCourse(course);

      spinner.succeed(chalk.green(`Course added: ${course.code} - ${course.name}`));
      console.log(chalk.gray(`  Credits: ${credits} | Semester: ${semester} | Year: ${year}`));
      if (grade) console.log(chalk.gray(`  Grade: ${grade}`));
    } catch (error) {
      spinner.fail(chalk.red('Failed to add course'));
      console.error(error);
      process.exit(1);
    }
  });
