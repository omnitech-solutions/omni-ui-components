import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

beforeAll(() => {
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { ColorPicker } from '@omnitech/omni-ui-core/ColorPicker';

describe('omni-ui-components/ColorPicker', () => {
  it('renders the swatch trigger + label', () => {
    render(<ColorPicker data-testid="c" label="Brand color" value="#22c55e" onChange={() => undefined} />);
    expect(screen.getByText('Brand color')).toBeInTheDocument();
    expect(screen.getByTestId('c')).toBeInTheDocument();
    expect(screen.getByTestId('c').textContent).toContain('#22c55e');
  });

  it('flags aria-invalid on error', () => {
    render(<ColorPicker data-testid="c" label="t" error="pick a color" onChange={() => undefined} />);
    expect(screen.getByTestId('c')).toHaveAttribute('aria-invalid', 'true');
  });
});
