import fs from 'node:fs';
import path from 'node:path';
import { BLOCKED_PATH_PATTERNS } from '../util/pathUtils.js';
import AppConfig from '../config/AppConfig.js';

export function normalizePath(inputPath: string): string {
  /**
   * This function normalizes a given file path by replacing backslashes with forward slashes and removing any leading './' from the path.
   */

  let normalized = inputPath.replace(/\\/g, '/');
  if (normalized.startsWith('./')) {
    normalized = normalized.slice(2);
  }

  return normalized;
}

export function isPathBlocked(inputPath: string): boolean {
    const normalizedPath = normalizePath(inputPath);

    return BLOCKED_PATH_PATTERNS.some((pattern) => {
        const regexStr =
        '^' +
        pattern
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.') +
        '$';

        const regex = new RegExp(regexStr);
        return regex.test(normalizedPath);
    });
}

export function resolveWorkPath(inputPath: string): string {
    const workDir = path.resolve(AppConfig.WORKING_DIRECTORY);

    if (!fs.existsSync(workDir)) {
        fs.mkdirSync(workDir, { recursive: true });
    }
    const normalizedInput = normalizePath(inputPath);
    const candidate = path.resolve(workDir, normalizedInput);

    const relative = path.relative(workDir, candidate);

    const isEscaped = relative.startsWith('..') || path.isAbsolute(relative);

    if (isEscaped) {
        throw new Error('Path escapes working directory');
    }

    return candidate;
}