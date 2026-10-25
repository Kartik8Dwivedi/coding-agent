import fs from 'fs';

export const expandPath = (path: string) => {
  if (path.startsWith('~')) {
    return path.replace('~', process.env.HOME || '');
  }
  return path;
};

export const isExistingDirectory = (path: string) => {
  const expandedPath = expandPath(path);
  try {
    const stats = fs.statSync(expandedPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
};
