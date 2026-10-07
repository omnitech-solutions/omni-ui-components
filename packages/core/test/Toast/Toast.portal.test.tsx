import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Toast } from '@oc-tech/omni-ui-components/Toast';
import { toastPropsFactory } from 'factories/omni-ui-components/Toast/Toast.factories';

describe('omni-ui-components/Toast portal', () => {
  it('mounts in a custom container with data-oui-surface', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const { container } = render(<Toast {...toastPropsFactory()} container={host} />);
    const surface = screen.getByRole('status');
    expect(host).toContainElement(surface);
    expect(container).not.toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'toast');
    host.remove();
  });

  it('renders in place by default (unchanged) and carries the attribute', () => {
    const { container } = render(<Toast {...toastPropsFactory()} />);
    const surface = screen.getByRole('status');
    expect(container).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'toast');
  });
});
