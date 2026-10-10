/**
 * @fileoverview
 * The code formatter, in its own chunk: loaded by `import()` the first time a code panel is opened or copied.
 */
import * as estree from 'prettier/plugins/estree';
import * as typescript from 'prettier/plugins/typescript';
import { format } from 'prettier/standalone';

/**
 * The snippet as the repository's formatter writes it. A snippet that is one JSX element (what Storybook prints for a
 * story's args) is already laid out and would only gain a semicolon; one that does not parse is returned as it is.
 */
export const formatCode = (code: string): Promise<string> =>
  /^\s*</.test(code)
    ? Promise.resolve(code.trim())
    : format(code, {
        parser: 'typescript',
        plugins: [typescript, estree],
        printWidth: 100,
        singleQuote: true,
      })
        .then((formatted) => formatted.trimEnd())
        .catch(() => code);
