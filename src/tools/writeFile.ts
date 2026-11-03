import fs from 'node:fs/promises';
import path from 'node:path';
import { tool } from 'langchain';
import { z } from 'zod';
import { resolveWorkPath } from './paths.js';
import { prepareFileContent } from './text.js';

export const writeFile = tool(
  async ({ path: inputPath, content }) => {
    if (!inputPath) {
      return 'Error: Path is required';
    }

    const prepared = prepareFileContent(inputPath, content);

    let filePath: string;
    try {
      // Checks that the path stays inside the working directory (workspace)
      filePath = resolveWorkPath(inputPath);
    } catch (err) {
      return `Error: Path escapes working directory: ${(err as Error).message}`;
    }

    try {
      // Create missing parent folders first, like Python's mkdir(parents=True, exist_ok=True)
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, prepared, 'utf-8');
    } catch (err) {
      return `Error: Failed to write file '${inputPath}': ${(err as Error).message}`;
    }

    return `File '${inputPath}' written successfully`;
  },
  {
    name: 'write_file',
    description:
      'Create or overwrite a UTF-8 text file in the working directory. ' +
      'Works for any text file (.js, .java, .py etc). ' +
      '`content` is the full file body with real newline characters between lines. ' +
      'Do not wrap it in a markdown fence. ' +
      'Do not encode line breaks as the two-character sequence backslash-n.',
    schema: z.object({
      path: z
        .string()
        .describe(
          "Relative path of the file to create/overwrite (e.g. 'README.md')",
        ),
      content: z
        .string()
        .describe(
          'Full file body with real newlines. No markdown fence. No backslash-n encoding.',
        ),
    }),
  },
);
