import '@testing-library/jest-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@oc-tech/omni-ui-components/Tooltip';
import { render } from '@testing-library/react';

const setup = (container?: HTMLElement) =>
  render(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent container={container}>Tip</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );

describe('omni-ui-components/Tooltip portal', () => {
  it('mounts in a custom container with data-oui-surface', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    setup(host);
    const surface = document.querySelector('[data-oui-surface]') as HTMLElement;
    expect(host).toContainElement(surface);
    expect(surface).toHaveTextContent('Tip');
    host.remove();
  });

  it('mounts in body by default', () => {
    const { container } = setup();
    const surface = document.querySelector('[data-oui-surface]') as HTMLElement;
    expect((surface.closest('[data-radix-popper-content-wrapper]') ?? surface).parentElement).toBe(
      document.body,
    );
    expect(container).not.toContainElement(surface);
  });
});
