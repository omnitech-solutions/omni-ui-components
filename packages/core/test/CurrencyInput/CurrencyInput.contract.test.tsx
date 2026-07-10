import '@testing-library/jest-dom';
import { CurrencyInput } from '@omnitech/omni-ui-core';
import { runControlContract } from '../__support__/runControlContract';

runControlContract({
  name: 'CurrencyInput',
  Component: CurrencyInput,
  baseProps: { id: 'currency-contract', label: 'Amount', value: 0, currency: 'USD' },
  controlSelector: 'input[inputmode="decimal"], input[type="text"]',
  supports: { typing: false, disabled: true, ariaInvalid: true, idLabelLink: true },
});
