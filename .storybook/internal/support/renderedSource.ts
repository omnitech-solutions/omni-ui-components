import { SNIPPET_RENDERED } from 'storybook/internal/docs-tools';
import { addons } from 'storybook/preview-api';
import { recordRenderedSource } from './exampleStore';

let listening = false;

/**
 * Starts recording the JSX Storybook prints for each story from its args (its React renderer emits it on the
 * channel in the story view and on docs pages alike). Safe to call on every render.
 */
export const listenForRenderedSource = () => {
  if (listening) return;
  try {
    addons.getChannel().on(SNIPPET_RENDERED, ({ id, source }: { id?: string; source?: string }) => {
      if (id && typeof source === 'string') recordRenderedSource(id, source);
    });
    listening = true;
  } catch {
    // No channel yet: the next call tries again.
  }
};
