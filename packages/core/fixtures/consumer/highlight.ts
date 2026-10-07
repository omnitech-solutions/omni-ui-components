import { createHighlighter } from '@oc-tech/omni-ui-components/highlight';

const highlight = createHighlighter({ auto: true });
console.log(highlight('const a = 1;', 'ts'));
