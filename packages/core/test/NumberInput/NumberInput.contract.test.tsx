import '@testing-library/jest-dom';
import { NumberInput } from '@oc-tech/omni-ui-components';
import { runControlContract } from '../__support__/runControlContract';

runControlContract({
  name: 'NumberInput',
  Component: NumberInput,
  baseProps: { id: 'number-contract', label: 'Quantity', value: 0 },
  controlSelector: 'input[inputmode="decimal"], input[inputmode="numeric"], input[type="text"]',
  supports: { typing: false, disabled: true, ariaInvalid: true, idLabelLink: true },
});
