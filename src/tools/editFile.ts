import fs from 'node:fs/promises';
import path from 'node:path';
import { tool } from 'langchain';
import { z } from 'zod';
import { resolveWorkPath } from './paths.js';
import { prepareFileContent } from './text.js';

export const editFile = tool(
  async ({ path: inputPath, old_str: rawOldStr, new_str: rawNewStr }) => {
    if (!inputPath || rawOldStr === rawNewStr) {
      return 'Error: Invalid input';
    }

    const oldStr = prepareFileContent(inputPath, rawOldStr);
    const newStr = prepareFileContent(inputPath, rawNewStr);

    let filePath: string;
    try {
      // Checks that the path stays inside the working directory (workspace)
      filePath = resolveWorkPath(inputPath);
    } catch (err) {
      return `Error: Path escapes working directory: ${(err as Error).message}`;
    }

    // Empty old_str means "create a new file", same as write_file
    if (oldStr === '') {
      try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, newStr, 'utf-8');
      } catch (err) {
        return `Error: Failed to write file '${inputPath}': ${(err as Error).message}`;
      }
      return `Created new file '${inputPath}'`;
    }

    let oldContent: string;
    try {
      oldContent = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      return `Error: Failed to read file '${inputPath}': ${(err as Error).message}`;
    }

    if (!oldContent.includes(oldStr)) {
      return `Error: '${inputPath}' does not contain ${JSON.stringify(oldStr)}`;
    }

    // A function as the replacement, so "$&" or "$$" inside newStr are inserted as-is
    const newContent = oldContent.replaceAll(oldStr, () => newStr);
    try {
      await fs.writeFile(filePath, newContent, 'utf-8');
    } catch (err) {
      return `Error: Failed to write file '${inputPath}': ${(err as Error).message}`;
    }
    return `Replaced ${JSON.stringify(oldStr)} with ${JSON.stringify(newStr)} in '${inputPath}'`;
  },
  {
    name: 'edit_file',
    description:
      'Replace `old_str` with `new_str` in the file at `path`. ' +
      'Language agnostic: .js, .java, .py and other text files all use exact substring replace. ' +
      'Pass an empty `old_str` to create a new file (same as `write_file`). ' +
      'Both strings must use real newlines, and not the two-character sequence backslash-n.',
    schema: z.object({
      path: z
        .string()
        .describe("Relative path of the file to edit (e.g. 'README.md')"),
      old_str: z
        .string()
        .describe('Exact text to replace. Empty string creates a new file.'),
      new_str: z.string().describe('Exact text to replace with.'),
    }),
  },
);
