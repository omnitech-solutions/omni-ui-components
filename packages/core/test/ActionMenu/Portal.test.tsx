import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ActionMenu } from '@oc-tech/omni-ui-components/ActionMenu';
import { actionMenuPropsFactory } from 'factories/omni-ui-components/ActionMenu/ActionMenu.factories';

describe('omni-ui-components/ActionMenu portal', () => {
  it.each(['menu', 'list'] as const)('mounts %s content in a custom container with data-oui-surface', async (kind) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const user = userEvent.setup();
    render(<ActionMenu {...actionMenuPropsFactory({ kind, container: host })} trigger={<button>Open</button>} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const surface = document.querySelector('[data-slot="action-menu"]') as HTMLElement;
    expect(host).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface');
    host.remove();
  });

  it('mounts in body by default', async () => {
    const user = userEvent.setup();
    const { container } = render(<ActionMenu {...actionMenuPropsFactory()} trigger={<button>Open</button>} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const surface = document.querySelector('[data-slot="action-menu"]') as HTMLElement;
    expect((surface.closest('[data-radix-popper-content-wrapper]') ?? surface).parentElement).toBe(document.body);
    expect(container).not.toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface');
  });
});
