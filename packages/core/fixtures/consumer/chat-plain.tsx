import { createRoot } from 'react-dom/client';
import { Markdown, Transcript } from '@oc-tech/omni-ui-components/chat';

createRoot(document.body).render(
  <>
    <Transcript entries={[]} />
    <Markdown text="# Hello" />
  </>,
);
