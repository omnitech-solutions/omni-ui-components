import '@testing-library/jest-dom';
import { EmailInput } from '@omnitech/omni-ui-core';
import { runControlContract } from '../__support__/runControlContract';

runControlContract({
  name: 'EmailInput',
  Component: EmailInput,
  baseProps: { id: 'email-contract', label: 'Email', value: '' },
  controlSelector: 'input[type="email"]',
  readValue: (el) => (el as HTMLInputElement).value,
  typeValue: async (user, ctrl, next) => {
    await user.clear(ctrl);
    await user.type(ctrl, next);
  },
  sampleValue: 'ada@omni.com',
  supports: { typing: true, controlled: true, disabled: true, ariaInvalid: true, idLabelLink: true },
});
