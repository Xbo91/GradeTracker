/**
 * Project Final GPA Command
 */

import { getCourses, projectFinalGPA } from '@gradetracker/core';
import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

export const projectCommand = new Command('project')
  .description('Project final GPA based on remaining credits')
  .argument('<target-gpa>', 'Target CGPA (e.g., 3.5)', (val) => Number.parseFloat(val))
  .argument('<remaining-credits>', 'Remaining credits to complete', (val) =>
    Number.parseInt(val, 10),
  )
  .action(async (targetGPA, remainingCredits) => {
    const spinner = ora('Projecting final GPA...').start();

    try {
      const courses = getCourses();
      const projection = projectFinalGPA(courses, targetGPA, remainingCredits);

      spinner.succeed(chalk.green('GPA Projection Complete'));

      console.log(chalk.bold(`\n  Current CGPA: ${projection.currentCGPA.toFixed(2)}`));
      console.log(chalk.bold(`  Current Credits: ${projection.currentCredits}`));
      console.log(chalk.bold(`  Remaining Credits: ${projection.remainingCredits}`));
      console.log(chalk.bold(`  Target CGPA: ${projection.targetCGPA.toFixed(2)}`));
      console.log(
        chalk.bold(`  Required Average for Remaining: ${projection.requiredAverage.toFixed(2)}`),
      );

      if (projection.isAchievable) {
        console.log(chalk.green('\n  ✓ Target is achievable!'));
      } else {
        console.log(chalk.red('\n  ✗ Target is NOT achievable (requires > 4.0 or < 0.0 average)'));
      }

      if (projection.requiredAverage > 4.0) {
        console.log(
          chalk.yellow(
            `  You would need an average of ${projection.requiredAverage.toFixed(2)} — impossible on 4.0 scale`,
          ),
        );
      } else if (projection.requiredAverage < 0) {
        console.log(chalk.yellow('  You have already exceeded the target CGPA'));
      }
    } catch (error) {
      spinner.fail(chalk.red('Failed to project GPA'));
      console.error(error);
      process.exit(1);
    }
  });
