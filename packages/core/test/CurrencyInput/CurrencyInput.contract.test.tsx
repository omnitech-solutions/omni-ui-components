import '@testing-library/jest-dom';
import { CurrencyInput } from '@oc-tech/omni-ui-components';
import { runControlContract } from '../__support__/runControlContract';

runControlContract({
  name: 'CurrencyInput',
  Component: CurrencyInput,
  baseProps: { id: 'currency-contract', label: 'Amount', value: 0, currency: 'USD' },
  controlSelector: 'input[inputmode="decimal"], input[type="text"]',
  supports: { typing: false, disabled: true, ariaInvalid: true, idLabelLink: true },
});
