export interface FailureDescription {
  title: string;
  message: string;
}

const GENERIC: FailureDescription = {
  title: 'Something went wrong',
  message: 'The reply could not be completed. Please try again.',
};

const TABLE: { test: RegExp; out: FailureDescription }[] = [
  {
    test: /(abort|cancell?ed)/i,
    out: { title: 'Stopped', message: 'The reply was stopped before it finished.' },
  },
  {
    test: /\b(429|rate.?limit(ed)?|too many requests|quota)\b/i,
    out: {
      title: 'Too many requests',
      message: 'The service is busy right now. Wait a moment and try again.',
    },
  },
  {
    test: /\b(401|403|unauthori[sz]ed|forbidden|expired token|invalid token)\b/i,
    out: {
      title: 'Not signed in',
      message: 'Your session may have expired. Sign in again and retry.',
    },
  },
  {
    test: /(timeout|timed out|etimedout|deadline)/i,
    out: {
      title: 'Took too long',
      message: 'The service did not answer in time. Please try again.',
    },
  },
  {
    test: /\b(offline|network|failed to fetch|econn\w*|enotfound|socket|dns|load failed)\b/i,
    out: { title: 'Connection problem', message: 'Check your connection and try again.' },
  },
  {
    test: /\b(5\d\d|bad gateway|service unavailable|internal server error|overloaded)\b/i,
    out: {
      title: 'Service unavailable',
      message: 'The service is having trouble. Please try again shortly.',
    },
  },
];

function haystack(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const e = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
    return [e.name, e.code, e.status, e.message]
      .filter((p) => typeof p === 'string' || typeof p === 'number')
      .join(' ');
  }
  return '';
}

/**
 * Turn an infrastructure error (network, timeout, rate limit, auth, server, abort) into a plain `{ title, message }` for people.
 * Pure. It only classifies: the raw error text, stack and codes are never returned, and anything unrecognised gets a generic message.
 */
export function describeFailure(error: unknown): FailureDescription {
  const text = haystack(error);
  const hit = TABLE.find((row) => row.test.test(text));
  return { ...(hit ? hit.out : GENERIC) };
}
