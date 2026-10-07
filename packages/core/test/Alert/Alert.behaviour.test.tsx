import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { Alert } from '@oc-tech/omni-ui-components/Alert';

describe('omni-ui-components/Alert wrapper', () => {
  it('renders title and body with a polite status role by default', () => {
    render(<Alert title="Saved">Your changes are in.</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    expect(screen.getByRole('status')).toHaveTextContent('Your changes are in.');
  });

  it('uses the assertive alert role for errors and forwards the ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Alert ref={ref} variant="error">
        Boom
      </Alert>,
    );
    expect(screen.getByRole('alert')).toBe(ref.current);
    expect(ref.current).toHaveAttribute('aria-live', 'assertive');
  });
});
