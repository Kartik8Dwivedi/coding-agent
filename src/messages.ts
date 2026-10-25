import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from 'langchain';

/** OpenAI style object for user input. */
export function userInput(text: string): { role: 'user'; content: string } {
  return { role: 'user', content: text };
}

/** Text of the most recent AI reply, skipping AI messages that only call tools. */
export function lastAiText(messages: BaseMessage[]): string {
  for (const message of [...messages].reverse()) {
    if (!AIMessage.isInstance(message)) {
      continue;
    }
    if (message.tool_calls?.length) {
      continue;
    }
    const content = message.content;
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      const parts = content
        .filter((block) => block.type === 'text')
        .map((block) => (typeof block.text === 'string' ? block.text : ''));
      return parts.filter((part) => part).join('\n');
    }
  }
  return '';
}

/**
 * Returns the content of the most recent tool result - useful when the model skips a chat reply.
 */
export function lastToolText(messages: BaseMessage[]): string {
  for (const message of [...messages].reverse()) {
    if (ToolMessage.isInstance(message)) {
      const content = message.content;
      return typeof content === 'string' ? content : JSON.stringify(content);
    }
  }
  return '';
}

/** Useful for logging and debugging. */
export function describeMessage(message: BaseMessage): string {
  const role = message.type;
  const content = message.content;
  let preview = typeof content === 'string' ? content : JSON.stringify(content);
  preview = preview.replaceAll('\n', ' ');
  let extra = '';

  if (AIMessage.isInstance(message) && message.tool_calls?.length) {
    const names = message.tool_calls.map((call) => call.name ?? '?').join(', ');
    extra = ` tools=[${names}]`;
  }
  if (ToolMessage.isInstance(message)) {
    extra = ` tool_call_id=${message.tool_call_id}`;
  }
  if (SystemMessage.isInstance(message)) {
    extra = ' (system)';
  }
  if (HumanMessage.isInstance(message)) {
    extra = ' (human)';
  }
  return `${role}${extra}: ${preview}`;
}
