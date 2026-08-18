/**
 * GradeTracker Storage
 * Universal storage: Local JSON file in Node (~/.gradetracker/data.json) & localStorage in Browser
 */

import { type Course, DEFAULT_STORAGE, STORAGE_VERSION, type StorageData } from './types.js';

export interface StorageAdapter {
  load(): StorageData;
  save(data: StorageData): void;
}

function isBrowserEnvironment(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).window !== 'undefined' &&
    typeof (globalThis as any).window?.document !== 'undefined'
  );
}

function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && Boolean(process.versions?.node);
}

let nodeFs: any = null;
let nodePath: any = null;
let nodeOs: any = null;

function loadNodeModules(): boolean {
  if (nodeFs && nodePath && nodeOs) return true;
  if (!isNodeEnvironment()) return false;

  // 1. Try Node 22+ native process.getBuiltinModule
  try {
    if (typeof (process as any).getBuiltinModule === 'function') {
      nodeFs = (process as any).getBuiltinModule('node:fs');
      nodePath = (process as any).getBuiltinModule('node:path');
      nodeOs = (process as any).getBuiltinModule('node:os');
      if (nodeFs && nodePath && nodeOs) return true;
    }
  } catch {}

  // 2. Try dynamic require via Function constructor (undetected by static browser bundlers)
  try {
    const getReq = new Function(
      'try { return typeof require !== "undefined" ? require : undefined; } catch(e) { return undefined; }',
    );
    const req = getReq();
    if (typeof req === 'function') {
      nodeFs = req('node:fs');
      nodePath = req('node:path');
      nodeOs = req('node:os');
      if (nodeFs && nodePath && nodeOs) return true;
    }
  } catch {}

  // 3. Try createRequire dynamically via Function constructor
  try {
    const getCreateRequire = new Function(
      'try { return typeof process !== "undefined" && process.versions?.node ? require("node:module").createRequire : undefined; } catch(e) { return undefined; }',
    );
    const createReq = getCreateRequire();
    if (typeof createReq === 'function' && typeof import.meta !== 'undefined' && import.meta.url) {
      const req = createReq(import.meta.url);
      nodeFs = req('node:fs');
      nodePath = req('node:path');
      nodeOs = req('node:os');
      if (nodeFs && nodePath && nodeOs) return true;
    }
  } catch {}

  return Boolean(nodeFs && nodePath && nodeOs);
}

export class MemoryStorageAdapter implements StorageAdapter {
  private data: StorageData;

  constructor(initialData: StorageData = DEFAULT_STORAGE) {
    this.data = JSON.parse(JSON.stringify(initialData));
  }

  load(): StorageData {
    return JSON.parse(JSON.stringify(this.data));
  }

  save(data: StorageData): void {
    this.data = JSON.parse(JSON.stringify(data));
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  private key: string;

  constructor(key = 'gradetracker_data') {
    this.key = key;
  }

  private getStorage(): any {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage;
      }
    } catch {}
    return null;
  }

  load(): StorageData {
    try {
      const storage = this.getStorage();
      if (!storage) {
        return { ...DEFAULT_STORAGE };
      }
      const raw = storage.getItem(this.key);
      if (!raw) {
        this.save(DEFAULT_STORAGE);
        return { ...DEFAULT_STORAGE };
      }
      const data = JSON.parse(raw) as StorageData;
      if (!data.version || data.version < STORAGE_VERSION) {
        data.version = STORAGE_VERSION;
        this.save(data);
      }
      return data;
    } catch {
      this.save(DEFAULT_STORAGE);
      return { ...DEFAULT_STORAGE };
    }
  }

  save(data: StorageData): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(this.key, JSON.stringify(data, null, 2));
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  }
}

export class NodeFileStorageAdapter implements StorageAdapter {
  private storageDir: string;
  private storageFile: string;

  constructor(customPath?: string) {
    loadNodeModules();
    if (customPath) {
      this.storageFile = customPath;
      this.storageDir = nodePath?.dirname ? nodePath.dirname(customPath) : '';
    } else {
      const home = typeof nodeOs?.homedir === 'function' ? nodeOs.homedir() : '';
      this.storageDir = nodePath?.join ? nodePath.join(home, '.gradetracker') : '';
      this.storageFile = nodePath?.join ? nodePath.join(this.storageDir, 'data.json') : '';
    }
  }

  getFilePath(): string {
    return this.storageFile;
  }

  private ensureStorageDir(): void {
    if (this.storageDir && nodeFs?.existsSync && !nodeFs.existsSync(this.storageDir)) {
      nodeFs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  load(): StorageData {
    if (!this.storageFile || !nodeFs?.existsSync) {
      return { ...DEFAULT_STORAGE };
    }

    this.ensureStorageDir();

    if (!nodeFs.existsSync(this.storageFile)) {
      this.save(DEFAULT_STORAGE);
      return { ...DEFAULT_STORAGE };
    }

    try {
      const raw = nodeFs.readFileSync(this.storageFile, 'utf-8');
      const data = JSON.parse(raw) as StorageData;

      if (!data.version || data.version < STORAGE_VERSION) {
        data.version = STORAGE_VERSION;
        this.save(data);
      }

      return data;
    } catch {
      try {
        const backup = `${this.storageFile}.bak.${Date.now()}`;
        nodeFs.copyFileSync(this.storageFile, backup);
      } catch {}
      this.save(DEFAULT_STORAGE);
      return { ...DEFAULT_STORAGE };
    }
  }

  save(data: StorageData): void {
    if (!this.storageFile || !nodeFs?.writeFileSync) return;

    this.ensureStorageDir();
    const tmp = `${this.storageFile}.tmp`;
    nodeFs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    nodeFs.renameSync(tmp, this.storageFile);
  }
}

function getDefaultAdapter(): StorageAdapter {
  if (isBrowserEnvironment()) {
    return new LocalStorageAdapter();
  }
  if (isNodeEnvironment()) {
    const nodeAdapter = new NodeFileStorageAdapter();
    if (nodeAdapter.getFilePath()) {
      return nodeAdapter;
    }
  }
  return new MemoryStorageAdapter();
}

let activeAdapter: StorageAdapter = getDefaultAdapter();

export function setStorageAdapter(adapter: StorageAdapter): void {
  activeAdapter = adapter;
}

export function getStorageAdapter(): StorageAdapter {
  return activeAdapter;
}

export function getStorageFile(): string {
  if (activeAdapter instanceof NodeFileStorageAdapter) {
    return activeAdapter.getFilePath();
  }
  return '~/.gradetracker/data.json';
}

export const STORAGE_FILE = getStorageFile();

export function loadStorage(): StorageData {
  return activeAdapter.load();
}

export function saveStorage(data: StorageData): void {
  activeAdapter.save(data);
}

export function addCourse(course: Course): void {
  const data = loadStorage();
  data.courses.push(course);
  saveStorage(data);
}

export function updateCourse(id: string, updates: Partial<Course>): boolean {
  const data = loadStorage();
  const idx = data.courses.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  data.courses[idx] = { ...data.courses[idx], ...updates };
  saveStorage(data);
  return true;
}

export function deleteCourse(id: string): boolean {
  const data = loadStorage();
  const len = data.courses.length;
  data.courses = data.courses.filter((c) => c.id !== id);
  if (data.courses.length === len) return false;
  saveStorage(data);
  return true;
}

export function getCourses(): Course[] {
  return loadStorage().courses;
}

export function getCoursesBySemester(semester: number, year: number): Course[] {
  return loadStorage().courses.filter((c) => c.semester === semester && c.year === year);
}

export function clearAll(): void {
  saveStorage({ ...DEFAULT_STORAGE });
}
