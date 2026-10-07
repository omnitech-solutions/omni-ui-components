import '@testing-library/jest-dom';

import { Popover, PopoverContent, PopoverTrigger } from '@oc-tech/omni-ui-components/Popover';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Popover portal', () => {
  it('mounts in a custom container with data-oui-surface', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent container={host}>Body</PopoverContent>
      </Popover>,
    );
    const surface = screen.getByText('Body');
    expect(host).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface');
    host.remove();
  });

  it('mounts in body by default', () => {
    const { container } = render(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    const surface = screen.getByText('Body');
    expect((surface.closest('[data-radix-popper-content-wrapper]') ?? surface).parentElement).toBe(
      document.body,
    );
    expect(container).not.toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface');
  });
});
