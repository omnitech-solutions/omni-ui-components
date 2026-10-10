import '@testing-library/jest-dom';
import { SegmentedPrimitive } from '@oc-tech/omni-ui-components/Segmented';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

describe('omni-ui-components/Segmented: read-only', () => {
  it('single mode: options stay focusable, say they are unavailable, and the value is fixed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <SegmentedPrimitive
        id="s"
        options={options}
        value="a"
        readOnly
        onChange={onChange}
        aria-label="Letters"
      />,
    );
    const root = document.querySelector('[data-slot="segmented"]') as HTMLElement;
    expect(root).toHaveAttribute('data-readonly');
    expect(root).toHaveAttribute('aria-label', 'Letters');
    const beta = screen.getByText('Beta').closest('button') as HTMLElement;
    expect(beta).not.toBeDisabled();
    expect(beta).toHaveAttribute('aria-disabled', 'true');
    await user.click(beta);
    beta.focus();
    await user.keyboard(' ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('multiple mode: nothing toggles', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <SegmentedPrimitive
        mode="multiple"
        id="s"
        options={options}
        value={['a']}
        readOnly
        onChange={onChange}
      />,
    );
    await user.click(screen.getByText('Beta'));
    await user.click(screen.getByText('Alpha'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
