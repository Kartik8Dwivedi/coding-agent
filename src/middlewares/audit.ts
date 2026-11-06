import fs from 'node:fs/promises';
import path from 'node:path';
import { createMiddleware, ToolMessage } from 'langchain';
import AppConfig from '../config/AppConfig.js';

/** Append a JSON record after each tool call (allowed or denied) */
export const auditMiddleware = createMiddleware({
  name: 'AuditMiddleware',
  wrapToolCall: async (request, handler) => {
    const result = await handler(request); // make the tool call first
    let preview = '';
    if (ToolMessage.isInstance(result)) {
      const content = result.content;
      preview = (
        typeof content === 'string' ? content : JSON.stringify(content)
      ).slice(0, 200);
    }
    await writeEntry({
      timestamp: new Date().toISOString(),
      tool: request.toolCall.name,
      result_preview: preview,
      arguments: request.toolCall.args,
    });
    return result;
  },
});

async function writeEntry(entry: Record<string, unknown>): Promise<void> {
  const logPath = path.join(AppConfig.WORKING_DIRECTORY, '.agent_audit.log');
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, JSON.stringify(entry) + '\n', 'utf-8');
}
