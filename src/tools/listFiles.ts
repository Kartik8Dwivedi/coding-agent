import fs from 'node:fs/promises';
import path from 'node:path';
import { tool } from 'langchain';
import { z } from 'zod';
import AppConfig from '../config/AppConfig.js';
import { resolveWorkPath } from './paths.js';

const error = (message: string) => JSON.stringify({ error: message });

export const listFiles = tool(
  async ({ path: inputPath }) => {
    let dirPath: string;
    try {
      // Checks that the path stays inside the working directory (workspace)
      dirPath = resolveWorkPath(inputPath);
    } catch (err) {
      return error(`Path escapes working directory: ${(err as Error).message}`);
    }

    try {
      // Goes into every subfolder, and returns a flat list of all files and directories, relative to the workspace root
      const entries = await fs.readdir(dirPath, {
        recursive: true,
        withFileTypes: true,
      });

      const result = entries.map((entry) => {
        const fullPath = path.join(entry.parentPath, entry.name);
        // Relative to the workspace root, always with "/"
        const relPath = path
          .relative(AppConfig.WORKING_DIRECTORY, fullPath)
          .replaceAll(path.sep, '/');
        return entry.isDirectory() ? `${relPath}/` : relPath;
      });

      return JSON.stringify(result.sort());
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        return error(`Path '${inputPath}' does not exist`);
      }
      if (code === 'ENOTDIR') {
        return error(`Path '${inputPath}' is not a directory`);
      }
      if (code === 'EACCES') {
        return error(`Permission denied: ${inputPath}`);
      }
      return error(`Error listing files: ${(err as Error).message}`);
    }
  },
  {
    name: 'list_files',
    description:
      'List files and directories under a given path in the working directory.',
    schema: z.object({
      path: z
        .string()
        .default('.')
        .describe(
          "Relative directory to list, e.g. '.' or 'src'. Defaults to the working-directory root.",
        ),
    }),
  },
);
