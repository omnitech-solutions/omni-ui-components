import '@testing-library/jest-dom';
import { Textarea } from '@omnitech/omni-ui-core';
import { runControlContract } from '../__support__/runControlContract';

runControlContract({
  name: 'Textarea',
  Component: Textarea,
  baseProps: { id: 'textarea-contract', label: 'Message', value: '' },
  controlSelector: 'textarea',
  readValue: (el) => (el as HTMLTextAreaElement).value,
  typeValue: async (user, ctrl, next) => {
    await user.clear(ctrl);
    await user.type(ctrl, next);
  },
  sampleValue: 'hello',
  supports: { typing: true, controlled: true, disabled: true, readOnly: true, ariaInvalid: true, idLabelLink: true },
});
