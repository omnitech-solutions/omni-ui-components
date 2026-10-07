import {
  conversationHtml,
  copyText,
  download,
  exportFileName,
  initialsOf,
  readableMessages,
  speakable,
  toJson,
  toMarkdown,
} from '@oc-tech/omni-ui-components/lib/chat';

const messages = [
  { role: 'user', text: 'Explain closures' },
  { role: 'tool', text: 'ignored' },
  { role: 'assistant', text: 'A closure keeps its scope.' },
  { role: 'assistant', text: '   ' },
];

describe('export helpers', () => {
  it('keeps user and assistant messages with text', () => {
    expect(readableMessages(messages).map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('writes Markdown with a title and You / Assistant sections, and translates the headings', () => {
    expect(toMarkdown('Closures', messages)).toBe(
      '# Closures\n\n## You\n\nExplain closures\n\n## Assistant\n\nA closure keeps its scope.\n',
    );
    expect(
      toMarkdown(undefined, messages, {
        user: 'Tú',
        assistant: 'Asistente',
        untitled: 'Conversación',
      }),
    ).toContain('# Conversación\n\n## Tú');
  });

  it('writes JSON with the thread and every message', () => {
    expect(JSON.parse(toJson({ id: 't1' }, messages))).toEqual({ thread: { id: 't1' }, messages });
    expect(JSON.parse(toJson(undefined, []))).toEqual({ thread: null, messages: [] });
  });

  it('slugs the file name from the title', () => {
    expect(exportFileName('Plan the launch! (v2)', 'md')).toBe('plan-the-launch-v2.md');
    expect(exportFileName(undefined, 'json')).toBe('conversation.json');
    expect(exportFileName('!!!', 'md')).toBe('conversation.md');
  });

  it('escapes HTML in the printable page', () => {
    const html = conversationHtml('<b>Hi</b>', [{ role: 'user', text: 'a < b & "c"' }]);
    expect(html).toContain('&lt;b&gt;Hi&lt;/b&gt;');
    expect(html).toContain('a &lt; b &amp; &quot;c&quot;');
    expect(html).not.toContain('<b>Hi</b>');
  });

  it('download clicks a temporary link with the file name and removes it', () => {
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const create = jest.fn(() => 'blob:x');
    const revoke = jest.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    download('a.md', '# A', 'text/markdown');
    expect(click).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
    click.mockRestore();
  });
});

describe('clipboard, speech text and initials', () => {
  it('copyText resolves true when written and false when unavailable or refused', async () => {
    const writeText = jest.fn(() => Promise.resolve());
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    expect(await copyText('hi')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hi');
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('no')) },
      configurable: true,
    });
    expect(await copyText('hi')).toBe(false);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });
    expect(await copyText('hi')).toBe(false);
  });

  it('speakable strips code blocks, citations and Markdown punctuation', () => {
    expect(
      speakable('## Title\n\nUse `map` [1].\n\n```ts\nconst a = 1\n```\n\n- **bold** done'),
    ).toBe('Title Use map . (code omitted) bold done');
    expect(speakable('```x```', '(código omitido)')).toBe('(código omitido)');
  });

  it('initialsOf takes up to two initials', () => {
    expect(initialsOf('Ada Lovelace')).toBe('AL');
    expect(initialsOf('ada')).toBe('A');
    expect(initialsOf('Jean Luc Picard')).toBe('JL');
    expect(initialsOf(undefined)).toBe('');
    expect(initialsOf('')).toBe('');
  });
});
