import '@testing-library/jest-dom';
import { PhoneInput } from '@omnitech/omni-ui-core';
import { runControlContract } from '../__support__/runControlContract';

runControlContract({
  name: 'PhoneInput',
  Component: PhoneInput,
  baseProps: { id: 'phone-contract', label: 'Phone', value: '' },
  controlSelector: 'input[type="tel"]',
  readValue: (el) => (el as HTMLInputElement).value,
  typeValue: async (user, ctrl, next) => {
    await user.clear(ctrl);
    await user.type(ctrl, next);
  },
  sampleValue: '+15550100',
  supports: { typing: true, controlled: true, disabled: true, ariaInvalid: true, idLabelLink: true },
});
