import path from 'node:path';

const ESCAPE_MAP: [string, string][] = [
  ['\\n', '\n'], 
  ['\\t', '\t'],
  ['\\r', '\r'],
  ['\\b', '\b'],
  ['\\f', '\f'],
];

const HTML_ENTITIES: [string, string][] = [
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&amp;', '&'],
  ['&quot;', '"'],
  ['&apos;', "'"],
  ['&nbsp;', ' '],
  ['&copy;', '©'],
  ['&reg;', '®'],
  ['&trade;', '™'],
]; 

const MARKDOWN_SUFFIXES = new Set(['.md', '.markdown', '.mdx']);
const MARKUP_SUFFIXES = new Set(['.html', '.xml', '.xhtml', '.svg']);

/** True when the payload is one logical line stuffed with \\n sequences. */
export function looksLikeEscapedSource(text: string): boolean {
  if (!text.includes('\\n')) {
    return false;
  }

  return text.split('\n').length - 1 <= 1;
}

/** Turn double escaped newlines/tabs into real ones. */
export function normalizeSourceText(text: string): string {
  if (!looksLikeEscapedSource(text)) {
    return text;
  }

  let normalized = text;
  for (const [escaped, raw] of ESCAPE_MAP) {
    normalized = normalized.replaceAll(escaped, raw);
  }
  return normalized;
}

/** Undo HTML entities as some weaker models emit those instead of raw <, > & */
export function unescapeHtmlEntities(text: string): string {
  if (!text.includes('&')) {
    return text;
  }
  let unescaped = text;
  for (const [entity, raw] of HTML_ENTITIES) {
    unescaped = unescaped.replaceAll(entity, raw);
  }
  return unescaped;
}

/** Drop a wrapping ```lang .... ``` fence */
export function stripMarkdownFence(text: string): string {
  if (!text.includes('```')) {
    return text;
  }

  let lines = text.split('\n');
  if (lines[0]?.trimStart().startsWith('```')) {
    lines = lines.slice(1);
  }
  if (lines.at(-1)?.trim().endsWith('```')) {
    lines = lines.slice(0, -1);
  }
  return lines.join('\n');
}

/**
 * Normalize a tool payload text into file bytes, independent of language
 *
 * 1. Normalize newlines/tabs
 * 2. Drop markdown fences
 * 3. Unescape HTML entities
 */
export function prepareFileContent(filePath: string, text: string): string {
  const suffix = path.extname(filePath).toLowerCase();
  let prepared = normalizeSourceText(text);
  if (!MARKDOWN_SUFFIXES.has(suffix)) {
    prepared = stripMarkdownFence(prepared);
  }
  if (!MARKUP_SUFFIXES.has(suffix)) {
    prepared = unescapeHtmlEntities(prepared);
  }
  return prepared;
}
