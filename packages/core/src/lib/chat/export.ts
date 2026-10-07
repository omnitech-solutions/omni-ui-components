/** A message as the export helpers read it: who said it and what. Callers drop tool traffic before exporting. */
export interface ExportMessage {
  role: 'user' | 'assistant' | (string & {});
  text: string;
}

/** English defaults of the headings the export writes. */
export interface ExportLabels {
  /** Heading above a user message. Default `You`. */
  user: string;
  /** Heading above an assistant message. Default `Assistant`. */
  assistant: string;
  /** Title used when the conversation has none. Default `Conversation`. */
  untitled: string;
}

export const DEFAULT_EXPORT_LABELS: ExportLabels = {
  user: 'You',
  assistant: 'Assistant',
  untitled: 'Conversation',
};

const heading = (role: string, labels: ExportLabels) =>
  role === 'user' ? labels.user : labels.assistant;

/** Keep what people read: user and assistant messages with text. */
export const readableMessages = <T extends ExportMessage>(messages: readonly T[]): T[] =>
  messages.filter(
    (message) =>
      (message.role === 'user' || message.role === 'assistant') && message.text.trim() !== '',
  );

/** The conversation as Markdown: `# title`, then `## You` and `## Assistant` sections. */
export const toMarkdown = (
  title: string | undefined,
  messages: readonly ExportMessage[],
  labels: Partial<ExportLabels> = {},
): string => {
  const l = { ...DEFAULT_EXPORT_LABELS, ...labels };
  const lines = [`# ${title || l.untitled}`, ''];
  readableMessages(messages).forEach((message) =>
    lines.push(`## ${heading(message.role, l)}`, '', message.text.trim(), ''),
  );
  return `${lines.join('\n').trim()}\n`;
};

/** The conversation as pretty JSON: `{ thread, messages }`. `thread` is whatever the caller passes (or null). */
export const toJson = (thread: unknown, messages: readonly unknown[]): string =>
  `${JSON.stringify({ thread: thread ?? null, messages }, null, 2)}\n`;

/** A file name slugged from the title: `Plan the launch!` is `plan-the-launch.md`. */
export const exportFileName = (
  title: string | undefined,
  extension: string,
  fallback = DEFAULT_EXPORT_LABELS.untitled,
): string =>
  `${
    (title || fallback)
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || fallback.toLowerCase()
  }.${extension}`;

/** Saves text as a file through a temporary link (an object URL where the browser has them, a data URL otherwise). */
export const download = (name: string, body: string, type: string): void => {
  const objectUrl = typeof URL.createObjectURL === 'function';
  const url = objectUrl
    ? URL.createObjectURL(new Blob([body], { type }))
    : `data:${type};charset=utf-8,${encodeURIComponent(body)}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  if (objectUrl) setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c,
  );

/** The printable HTML page of a conversation (exported for tests; `printConversation` writes it into a hidden iframe). */
export const conversationHtml = (
  title: string | undefined,
  messages: readonly ExportMessage[],
  labels: Partial<ExportLabels> = {},
): string => {
  const l = { ...DEFAULT_EXPORT_LABELS, ...labels };
  const body = readableMessages(messages)
    .map(
      (message) =>
        `<section><h2>${escapeHtml(heading(message.role, l))}</h2><pre>${escapeHtml(message.text.trim())}</pre></section>`,
    )
    .join('');
  return `<!doctype html><title>${escapeHtml(title || l.untitled)}</title><style>body{font:14px/1.55 system-ui,sans-serif;margin:32px;color:#111}h1{font-size:20px}h2{font-size:13px;color:#555;margin:20px 0 4px}pre{white-space:pre-wrap;font:inherit;margin:0}</style><h1>${escapeHtml(title || l.untitled)}</h1>${body}`;
};

/** Opens the browser print dialog on a printable page of the conversation (the user saves it as PDF). */
export const printConversation = (
  title: string | undefined,
  messages: readonly ExportMessage[],
  labels: Partial<ExportLabels> = {},
): void => {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0';
  document.body.append(frame);
  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(conversationHtml(title, messages, labels));
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  setTimeout(() => frame.remove(), 60_000);
};
