import '@testing-library/jest-dom';
import * as React from 'react';
import { render, rerender as _, screen } from '@testing-library/react';

import { useStableId } from '@oc-tech/omni-ui-components';

describe('useStableId', () => {
  const Probe: React.FC<{ prefix?: string }> = ({ prefix }) => {
    const id = useStableId(prefix);
    return <span data-testid="probe">{id}</span>;
  };

  it('returns a string that starts with the prefix', () => {
    render(<Probe prefix="oui-input" />);
    expect(screen.getByTestId('probe').textContent).toMatch(/^oui-input-\d+$/);
  });

  it("defaults the prefix to 'oui'", () => {
    render(<Probe />);
    expect(screen.getByTestId('probe').textContent).toMatch(/^oui-\d+$/);
  });

  it('returns a stable id across re-renders of the same instance', () => {
    const { rerender, getByTestId } = render(<Probe prefix="x" />);
    const first = getByTestId('probe').textContent;
    rerender(<Probe prefix="x" />);
    expect(getByTestId('probe').textContent).toBe(first);
  });

  it('generates a different id for each mounted instance', () => {
    const { container } = render(
      <>
        <Probe prefix="x" />
        <Probe prefix="x" />
      </>,
    );
    const spans = container.querySelectorAll('[data-testid="probe"]');
    expect(spans[0].textContent).not.toBe(spans[1].textContent);
  });
});
