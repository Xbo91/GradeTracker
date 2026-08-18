import { describe, expect, it } from 'vitest';
import { createProgram } from '../index.js';

describe('CLI Commands Registration', () => {
  it('should initialize commander with all required commands', () => {
    const program = createProgram();
    expect(program.name()).toBe('gradetracker');

    const commands = program.commands.map((cmd) => cmd.name());
    expect(commands).toContain('add-course');
    expect(commands).toContain('set-grade');
    expect(commands).toContain('calc-gpa');
    expect(commands).toContain('project');
    expect(commands).toContain('export');
    expect(commands).toContain('list');
  });

  it('should define options for add-course command', () => {
    const program = createProgram();
    const addCourseCmd = program.commands.find((c) => c.name() === 'add-course');
    expect(addCourseCmd).toBeDefined();

    const options = addCourseCmd!.options.map((o) => o.short);
    expect(options).toContain('-c');
    expect(options).toContain('-n');
    expect(options).toContain('-s');
    expect(options).toContain('-y');
    expect(options).toContain('-d');
    expect(options).toContain('-g');
  });

  it('should define arguments for set-grade command', () => {
    const program = createProgram();
    const setGradeCmd = program.commands.find((c) => c.name() === 'set-grade');
    expect(setGradeCmd).toBeDefined();
    expect(setGradeCmd!.registeredArguments.length).toBe(2);
  });
});
