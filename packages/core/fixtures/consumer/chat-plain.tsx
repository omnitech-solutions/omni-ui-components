import { Markdown, Transcript } from '@oc-tech/omni-ui-components/chat';
import { createRoot } from 'react-dom/client';

createRoot(document.body).render(
  <>
    <Transcript entries={[]} />
    <Markdown text="# Hello" />
  </>,
);
