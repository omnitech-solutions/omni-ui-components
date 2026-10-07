import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Space } from '@oc-tech/omni-ui-components/Space';

describe('omni-ui-components/Space', () => {
  it('lays children out in a row with an 8px gap by default', () => {
    render(<Space data-testid="s">x</Space>);
    expect(screen.getByTestId('s')).toHaveClass('flex', 'flex-row');
    expect(screen.getByTestId('s').style.gap).toBe('8px');
  });

  it('stacks vertically, wraps, takes a custom size and lets style override the gap', () => {
    const { rerender } = render(
      <Space data-testid="s" direction="vertical" wrap size="1rem" className="extra">
        x
      </Space>,
    );
    const el = () => screen.getByTestId('s');
    expect(el()).toHaveClass('flex-col', 'flex-wrap', 'extra');
    expect(el().style.gap).toBe('1rem');
    rerender(
      <Space data-testid="s" size={4} style={{ gap: 2 }}>
        x
      </Space>,
    );
    expect(el().style.gap).toBe('2px');
    expect(el()).not.toHaveClass('flex-wrap');
  });
});
