import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ModelPicker } from '@oc-tech/omni-ui-components';
import { modelPickerPropsFactory } from 'factories/omni-ui-components/ModelPicker/ModelPicker.factories';

describe('omni-ui-components/ModelPicker portal', () => {
  it('mounts the menu in a custom container with data-oui-surface', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    render(<ModelPicker {...modelPickerPropsFactory({ open: true })} container={host} />);
    const surface = screen.getByRole('dialog');
    expect(host).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'model-picker');
    host.remove();
  });

  it('mounts in body by default', () => {
    const { container } = render(<ModelPicker {...modelPickerPropsFactory({ open: true })} />);
    const surface = screen.getByRole('dialog');
    expect(container).not.toContainElement(surface);
    expect(document.body).toContainElement(surface);
    expect(surface).toHaveAttribute('data-oui-surface', 'model-picker');
  });
});
