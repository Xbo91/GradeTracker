/**
 * Calculate GPA Command
 */

import { calculateCumulativeGPA, calculateSemesterGPA, getCourses } from '@gradetracker/core';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import { table } from 'table';

export const calcGPACommand = new Command('calc-gpa')
  .description('Calculate current GPA')
  .option('-s, --semester <semester>', 'Specific semester', (val) => Number.parseInt(val, 10))
  .option('-y, --year <year>', 'Specific year', (val) => Number.parseInt(val, 10))
  .action(async (options) => {
    const spinner = ora('Calculating GPA...').start();

    try {
      const courses = getCourses();

      if (options.semester && options.year) {
        const result = calculateSemesterGPA(courses, options.semester, options.year);
        spinner.succeed(chalk.green(`Semester ${options.semester}, Year ${options.year} GPA`));

        console.log(chalk.bold(`\n  GPA: ${result.gpa.toFixed(2)}`));
        console.log(chalk.gray(`  Credits: ${result.earnedCredits}/${result.totalCredits}`));

        if (result.courses.length > 0) {
          const rows = [
            [chalk.bold('Course'), chalk.bold('Code'), chalk.bold('Credits'), chalk.bold('Grade')],
            ...result.courses.map((c) => [c.name, c.code, c.credits.toString(), c.grade || '-']),
          ];
          console.log(`\n${table(rows)}`);
        }
      } else {
        const result = calculateCumulativeGPA(courses);
        spinner.succeed(chalk.green('Cumulative GPA Calculated'));

        console.log(chalk.bold(`\n  CGPA: ${result.cgpa.toFixed(2)}`));
        console.log(chalk.gray(`  Total Credits: ${result.earnedCredits}/${result.totalCredits}`));

        if (result.semesters.length > 0) {
          console.log(chalk.bold('\n  By Semester:'));
          const rows = [
            [chalk.bold('Semester'), chalk.bold('Year'), chalk.bold('GPA'), chalk.bold('Credits')],
            ...result.semesters.map((s) => [
              s.semester.toString(),
              s.year.toString(),
              s.gpa.toFixed(2),
              `${s.earnedCredits}/${s.totalCredits}`,
            ]),
          ];
          console.log(`\n${table(rows)}`);
        }
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to calculate GPA'));
      console.error(error);
      process.exit(1);
    }
  });
