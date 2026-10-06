import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { Divider } from '@oc-tech/omni-ui-components/Divider';
import { CONTROL_SEPARATOR_CLASS, dividerVariants } from 'factories/omni-ui-components/Divider/Divider.factories';

describe('omni-ui-components/Divider as control separator', () => {
  it('a vertical Divider takes the 20px token height and the neutral border colour through className alone', () => {
    const { container } = render(<Divider orientation="vertical" className={CONTROL_SEPARATOR_CLASS} />);
    const sep = container.firstElementChild!;
    expect(sep).toHaveAttribute('data-orientation', 'vertical');
    expect(sep).toHaveClass('h-[var(--oui-control-separator)]');
    expect(sep).toHaveClass('bg-[color:var(--oui-tone-neutral-border)]');
    // The class replaces the default full-height and border colour rather than stacking with them.
    expect(sep).not.toHaveClass('h-full');
    expect(sep).not.toHaveClass('bg-border');
    expect(sep).toHaveClass('w-px');
  });

  it('is decorative by default', () => {
    const { container } = render(<Divider orientation="vertical" className={CONTROL_SEPARATOR_CLASS} />);
    expect(container.firstElementChild).toHaveAttribute('role', 'none');
  });

  it('renders every factory variant', () => {
    dividerVariants.forEach((variant) => {
      const { unmount, container } = render(<Divider {...variant.args} />);
      expect(container.firstElementChild).toBeInTheDocument();
      unmount();
    });
  });
});
