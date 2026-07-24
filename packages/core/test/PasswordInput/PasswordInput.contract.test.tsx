import '@testing-library/jest-dom';
import { PasswordInput } from '@oc-tech/omni-ui-components';
import { runControlContract } from '../__support__/runControlContract';

runControlContract({
  name: 'PasswordInput',
  Component: PasswordInput,
  baseProps: { id: 'password-contract', label: 'Password', value: '', toggleable: false },
  controlSelector: 'input[type="password"]',
  readValue: (el) => (el as HTMLInputElement).value,
  typeValue: async (user, ctrl, next) => {
    await user.clear(ctrl);
    await user.type(ctrl, next);
  },
  sampleValue: 'hunter2',
  supports: { typing: true, controlled: true, disabled: true, ariaInvalid: true, idLabelLink: true },
});
