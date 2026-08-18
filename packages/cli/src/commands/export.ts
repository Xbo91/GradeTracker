/**
 * Export Data Command
 */

import * as fs from 'node:fs';
import { calculateCumulativeGPA, getCourses } from '@gradetracker/core';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const exportCommand = new Command('export')
  .description('Export data to JSON or CSV')
  .option('-f, --format <format>', 'Export format: json or csv', 'json')
  .option('-o, --output <path>', 'Output file path')
  .action(async (options) => {
    const spinner = ora('Exporting data...').start();

    try {
      const courses = getCourses();
      const cgpa = calculateCumulativeGPA(courses);

      const data = {
        exportedAt: new Date().toISOString(),
        cgpa: cgpa.cgpa,
        totalCredits: cgpa.totalCredits,
        earnedCredits: cgpa.earnedCredits,
        courses,
      };

      let output: string;
      const format = options.format.toLowerCase();

      if (format === 'csv') {
        const headers = ['Code', 'Name', 'Credits', 'Grade', 'Semester', 'Year', 'Completed'];
        const rows = courses.map((c) => [
          c.code,
          c.name,
          c.credits.toString(),
          c.grade || '',
          c.semester.toString(),
          c.year.toString(),
          c.isCompleted.toString(),
        ]);
        output = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      } else {
        output = JSON.stringify(data, null, 2);
      }

      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
        spinner.succeed(chalk.green(`Exported to ${options.output}`));
      } else {
        spinner.succeed(chalk.green('Export complete'));
        console.log(output);
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to export'));
      console.error(error);
      process.exit(1);
    }
  });
