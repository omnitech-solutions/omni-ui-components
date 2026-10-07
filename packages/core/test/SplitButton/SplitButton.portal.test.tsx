import '@testing-library/jest-dom';

import { SplitButton } from '@oc-tech/omni-ui-components/SplitButton';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { splitButtonPropsFactory } from 'factories/omni-ui-components/SplitButton/SplitButton.factories';

const openCaret = async (container?: HTMLElement) => {
  const base = splitButtonPropsFactory();
  const user = userEvent.setup();
  render(<SplitButton {...base} menu={{ ...base.menu, container }} />);
  await user.click(screen.getByRole('button', { name: 'More options' }));
  return document.querySelector('[data-slot="action-menu"]') as HTMLElement;
};

describe('omni-ui-components/SplitButton portal', () => {
  it('mounts the menu in a custom container with data-oui-surface', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const surface = await openCaret(host);
    expect(host).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface');
    host.remove();
  });

  it('mounts the menu in body by default', async () => {
    const surface = await openCaret();
    expect((surface.closest('[data-radix-popper-content-wrapper]') ?? surface).parentElement).toBe(
      document.body,
    );
    expect(surface).toHaveAttribute('data-oui-surface');
  });
});
