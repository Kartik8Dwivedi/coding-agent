import fs from 'node:fs/promises';
import { tool } from 'langchain';
import { z } from 'zod';
import { resolveWorkPath } from './paths.js';

export const readFile = tool(
  async ({ path }) => {
    let filePath: string;
    try {
      // Checks that the path stays inside the working directory (workspace)
      filePath = resolveWorkPath(path);
    } catch (err) {
      return `Path escapes working directory: ${(err as Error).message}`;
    }

    try {
      return await fs.readFile(filePath, 'utf-8'); // go and read the file
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') {
        return `File not found: ${path}`;
      }
      if (code === 'EACCES') {
        return `Permission denied: ${path}`;
      }
      return `Error reading file: ${(err as Error).message}`;
    }
  },
  {
    name: 'read_file',
    description: 'Reads a UTF-8 text file from the working directory.',
    schema: z.object({
      path: z
        .string()
        .describe(
          "Relative path of the file, e.g. 'src/App.js' or 'README.md' or 'data/example.json'",
        ),
    }),
  },
);
