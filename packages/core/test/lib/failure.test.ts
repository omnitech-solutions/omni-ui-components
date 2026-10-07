import { describeFailure } from '@oc-tech/omni-ui-components';

describe('describeFailure', () => {
  const cases: [string, unknown, string][] = [
    ['fetch failure', new TypeError('Failed to fetch'), 'Connection problem'],
    ['node econnreset', Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' }), 'Connection problem'],
    ['timeout', new Error('Request timed out after 30000ms'), 'Took too long'],
    ['timeout name', { name: 'TimeoutError', message: 'x' }, 'Took too long'],
    ['429 status', { status: 429, message: 'nope' }, 'Too many requests'],
    ['rate limit text', 'rate_limit exceeded', 'Too many requests'],
    ['401', { status: 401 }, 'Not signed in'],
    ['403 text', new Error('403 Forbidden'), 'Not signed in'],
    ['500', { status: 500, message: 'Internal Server Error' }, 'Service unavailable'],
    ['503 text', 'Service Unavailable', 'Service unavailable'],
    ['abort', new DOMException('The operation was aborted.', 'AbortError'), 'Stopped'],
    ['unknown error', new Error('boom'), 'Something went wrong'],
    ['null', null, 'Something went wrong'],
    ['undefined', undefined, 'Something went wrong'],
    ['number', 42, 'Something went wrong'],
    ['empty object', {}, 'Something went wrong'],
  ];

  it.each(cases)('%s', (_name, error, title) => {
    const out = describeFailure(error);
    expect(out.title).toBe(title);
    expect(out.message.length).toBeGreaterThan(0);
    expect(Object.keys(out).sort()).toEqual(['message', 'title']);
  });

  it('never returns the raw error text, stack or codes', () => {
    const secret = new Error('ECONNRESET at https://internal.example/api?key=sk-secret-123');
    secret.stack = 'Error: sk-secret-123\n    at internal/file.js:1:1';
    const out = describeFailure(secret);
    const flat = JSON.stringify(out);
    expect(flat).not.toContain('sk-secret-123');
    expect(flat).not.toContain('internal');
    expect(flat).not.toContain('ECONNRESET');
    const unknown = JSON.stringify(describeFailure(new Error('db password=hunter2 at row 9')));
    expect(unknown).not.toContain('hunter2');
  });

  it('returns a fresh object each call', () => {
    const a = describeFailure(null);
    a.title = 'mutated';
    expect(describeFailure(null).title).toBe('Something went wrong');
  });
});
