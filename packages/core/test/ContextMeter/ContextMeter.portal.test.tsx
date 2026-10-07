import '@testing-library/jest-dom';

import { ContextMeter } from '@oc-tech/omni-ui-components';
import { render, screen } from '@testing-library/react';
import { contextMeterPropsFactory } from 'factories/omni-ui-components/ContextMeter/ContextMeter.factories';

describe('omni-ui-components/ContextMeter portal', () => {
  it('mounts the popover in a custom container with data-oui-surface', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<ContextMeter {...contextMeterPropsFactory({ open: true })} container={host} />);
    const surface = screen.getByRole('dialog');
    expect(host).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'context-meter');
    host.remove();
  });

  it('mounts in body by default', () => {
    const { container } = render(<ContextMeter {...contextMeterPropsFactory({ open: true })} />);
    const surface = screen.getByRole('dialog');
    expect(container).not.toContainElement(surface);
    expect(document.body).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'context-meter');
  });
});
