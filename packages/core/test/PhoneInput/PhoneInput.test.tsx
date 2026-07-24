import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PhoneInput, formatPhone } from '@oc-tech/omni-ui-components/PhoneInput';

describe('omni-ui-components/PhoneInput formatPhone', () => {
  it('groups US digits as (XXX) XXX-XXXX', () => {
    expect(formatPhone('5551234567')).toBe('(555) 123-4567');
  });

  it('partial US group is open-paren prefix', () => {
    expect(formatPhone('555')).toBe('(555');
    expect(formatPhone('555123')).toBe('(555) 123');
  });

  it('international groups as +CC XXX XXX XXXX with leading +', () => {
    expect(formatPhone('+15551234567')).toBe('+1 555 123 4567');
  });

  it('respects defaultDialCode length', () => {
    expect(formatPhone('5551234567', '+44')).toBe('+55 512 345 67');
  });

  it('strips non-digit chars', () => {
    expect(formatPhone('(555) 123-4567abc')).toBe('(555) 123-4567');
  });

  it('returns empty for empty input', () => {
    expect(formatPhone('')).toBe('');
  });
});

import * as React from 'react';

const Controlled: React.FC = () => {
  const [v, setV] = React.useState('');
  return <PhoneInput data-testid="p" label="Phone" value={v} onChange={setV} />;
};

describe('omni-ui-components/PhoneInput render', () => {
  it('formats as the user types', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByTestId('p') as HTMLInputElement;
    await user.type(input, '5551234567');
    expect(input.value).toBe('(555) 123-4567');
  });
});
