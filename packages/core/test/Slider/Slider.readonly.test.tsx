import '@testing-library/jest-dom';
import { SliderPrimitive } from '@oc-tech/omni-ui-components/Slider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/Slider: read-only and thumb names', () => {
  it('a read-only thumb stays focusable, is announced, and arrow keys do not move it', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onValueCommit = jest.fn();
    render(
      <SliderPrimitive
        id="s"
        value={40}
        readOnly
        onChange={onChange}
        onValueCommit={onValueCommit}
        aria-label="Volume"
      />,
    );
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAttribute('aria-readonly', 'true');
    thumb.focus();
    expect(thumb).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowUp}{Home}{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
    expect(onChange).not.toHaveBeenCalled();
    expect(onValueCommit).not.toHaveBeenCalled();
  });

  it('uncontrolled read-only is pinned to its default', async () => {
    const user = userEvent.setup();
    render(<SliderPrimitive id="s" defaultValue={10} readOnly aria-label="Volume" />);
    const thumb = screen.getByRole('slider');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '10');
  });

  it('names each thumb of a range with thumbLabels, and reports both values', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <SliderPrimitive
        id="s"
        value={[20, 80]}
        thumbLabels={['From', 'To']}
        onChange={onChange}
        aria-label="Range"
      />,
    );
    const to = screen.getByRole('slider', { name: 'To' });
    expect(screen.getByRole('slider', { name: 'From' })).toHaveAttribute('aria-valuenow', '20');
    to.focus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith([20, 79]);
  });
});
