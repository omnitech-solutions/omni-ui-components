import '@testing-library/jest-dom';

import { CommandPopover } from '@oc-tech/omni-ui-components/CommandPopover';
import { render } from '@testing-library/react';
import { commandPopoverPropsFactory } from 'factories/omni-ui-components/CommandPopover/CommandPopover.factories';

describe('omni-ui-components/CommandPopover portal', () => {
  it('with an anchor, mounts in a custom container with data-oui-surface', () => {
    const host = document.createElement('div');
    const anchor = document.createElement('div');
    document.body.append(host, anchor);
    render(<CommandPopover {...commandPopoverPropsFactory()} anchor={anchor} container={host} />);
    const surface = document.querySelector('[data-slot="command-popover"]') as HTMLElement;
    expect(host).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'command-popover');
    host.remove();
    anchor.remove();
  });

  it('with an anchor and no container, mounts in body', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    const { container } = render(
      <CommandPopover {...commandPopoverPropsFactory()} anchor={anchor} />,
    );
    const surface = document.querySelector('[data-slot="command-popover"]') as HTMLElement;
    expect(container).not.toContainElement(surface);
    expect(surface.parentElement).toBe(document.body);
    expect(surface).toHaveAttribute('data-oui-surface', 'command-popover');
    anchor.remove();
  });

  it('without an anchor, stays in place (no portal) and still carries the attribute', () => {
    const { container } = render(<CommandPopover {...commandPopoverPropsFactory()} />);
    const surface = document.querySelector('[data-slot="command-popover"]') as HTMLElement;
    expect(container).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'command-popover');
  });
});
