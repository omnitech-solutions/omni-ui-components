import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Flex } from '@oc-tech/omni-ui-components/Flex';

describe('omni-ui-components/Flex', () => {
  it('is a horizontal flex row by default', () => {
    render(<Flex data-testid="f">x</Flex>);
    expect(screen.getByTestId('f')).toHaveClass('flex');
    expect(screen.getByTestId('f')).not.toHaveClass('flex-col');
  });

  it('maps vertical, gap, align, justify and wrap to layout styles and lets style override them', () => {
    render(
      <Flex data-testid="f" vertical gap={12} align="center" justify="space-between" wrap="wrap" className="extra" style={{ gap: 4 }}>
        x
      </Flex>,
    );
    const el = screen.getByTestId('f');
    expect(el).toHaveClass('flex-col', 'extra');
    expect(el.style.alignItems).toBe('center');
    expect(el.style.justifyContent).toBe('space-between');
    expect(el.style.flexWrap).toBe('wrap');
    expect(el.style.gap).toBe('4px');
  });

  it('applies the gap prop when style does not override it', () => {
    render(
      <Flex data-testid="f" gap="2rem">
        x
      </Flex>,
    );
    expect(screen.getByTestId('f').style.gap).toBe('2rem');
  });
});
