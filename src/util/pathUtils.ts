import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Turns "~", "~/x", relative or absolute input into a clean absolute path.
export const expandPath = (inputPath: string) => {
  let expandedPath = inputPath;
  if (
    inputPath === '~' ||
    inputPath.startsWith('~/') ||
    inputPath.startsWith('~\\')
  ) {
    expandedPath = path.join(os.homedir(), inputPath.slice(1));
  }
  return path.resolve(expandedPath);
};

export const isExistingDirectory = (inputPath: string) => {
  try {
    return fs.statSync(inputPath).isDirectory();
  } catch {
    return false;
  }
};
