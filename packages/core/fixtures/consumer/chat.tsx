import { createRoot } from 'react-dom/client';
import { Composer, DiffReview, Markdown, Transcript } from '@oc-tech/omni-ui-components/chat';
import { highlightLines } from '@oc-tech/omni-ui-components/highlight';

// The chat entry stays lean: highlighting is opt-in through `highlight`, fed from the `./highlight` entry.
createRoot(document.body).render(
  <>
    <Transcript entries={[]} />
    <Markdown text="# Hello" highlight={highlightLines} />
    <Composer />
    <DiffReview changes={[]} highlight={highlightLines} />
  </>,
);
