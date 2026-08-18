/**
 * List Courses Command
 */

import { getCourses } from '@gradetracker/core';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import { table } from 'table';

export const listCommand = new Command('list')
  .description('List all courses')
  .option('-s, --semester <semester>', 'Filter by semester', (val) => Number.parseInt(val, 10))
  .option('-y, --year <year>', 'Filter by year', (val) => Number.parseInt(val, 10))
  .option('-c, --completed', 'Show only completed courses')
  .option('-p, --pending', 'Show only pending courses')
  .action(async (options) => {
    const spinner = ora('Loading courses...').start();

    try {
      let courses = getCourses();

      if (options.semester) {
        courses = courses.filter((c) => c.semester === options.semester);
      }
      if (options.year) {
        courses = courses.filter((c) => c.year === options.year);
      }
      if (options.completed) {
        courses = courses.filter((c) => c.isCompleted);
      }
      if (options.pending) {
        courses = courses.filter((c) => !c.isCompleted);
      }

      if (courses.length === 0) {
        spinner.succeed(chalk.yellow('No courses found'));
        return;
      }

      spinner.succeed(chalk.green(`Found ${courses.length} course(s)`));

      const rows = [
        [
          chalk.bold('Code'),
          chalk.bold('Name'),
          chalk.bold('Credits'),
          chalk.bold('Grade'),
          chalk.bold('Sem'),
          chalk.bold('Year'),
          chalk.bold('Status'),
        ],
        ...courses.map((c) => [
          c.code,
          c.name,
          c.credits.toString(),
          c.grade || '-',
          c.semester.toString(),
          c.year.toString(),
          c.isCompleted ? chalk.green('✓') : chalk.yellow('⏳'),
        ]),
      ];

      console.log(`\n${table(rows)}`);
    } catch (error) {
      spinner.fail(chalk.red('Failed to list courses'));
      console.error(error);
      process.exit(1);
    }
  });
