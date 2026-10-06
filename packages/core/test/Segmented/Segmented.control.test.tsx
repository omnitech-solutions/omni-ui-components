import '@testing-library/jest-dom';
import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Code, Lightbulb, MessageSquare } from 'lucide-react';

import { Segmented, SegmentedPrimitive, type SegmentedOption, type SegmentedProps } from '@oc-tech/omni-ui-components/Segmented';
import { segmentedControlVariants } from 'factories/omni-ui-components/Segmented/Segmented.factories';

const panels: SegmentedOption[] = [
  { value: 'chat', icon: <MessageSquare />, ariaLabel: 'Chat' },
  { value: 'answer', icon: <Lightbulb />, ariaLabel: 'Answer' },
  { value: 'code', icon: <Code />, ariaLabel: 'Code' },
];

/** Controlled harness so a multiple-mode value follows onChange like a real consumer. */
const Harness = ({ initial, onChange, ...rest }: { initial: string[]; onChange?: (next: string[]) => void } & Record<string, unknown>) => {
  const [value, setValue] = React.useState(initial);
  return (
    <SegmentedPrimitive
      data-testid="s"
      mode="multiple"
      appearance="control"
      options={panels}
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe('omni-ui-components/Segmented control and multiple mode', () => {
  describe('multiple mode', () => {
    it('shows every on-option as pressed (aria-pressed buttons)', () => {
      render(<Harness initial={['chat', 'code']} />);
      expect(screen.getByRole('button', { name: 'Chat' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Answer' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Code' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('turns options on and off, reporting the whole array each time', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness initial={['chat']} onChange={onChange} />);
      await user.click(screen.getByRole('button', { name: 'Answer' }));
      expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining(['chat', 'answer']));
      expect(onChange.mock.calls.at(-1)![0]).toHaveLength(2);
      await user.click(screen.getByRole('button', { name: 'Chat' }));
      expect(onChange).toHaveBeenLastCalledWith(['answer']);
    });

    it('allows turning everything off when minActive is 0 (default)', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness initial={['chat']} onChange={onChange} />);
      await user.click(screen.getByRole('button', { name: 'Chat' }));
      expect(onChange).toHaveBeenLastCalledWith([]);
    });
  });

  describe('minActive', () => {
    it('the last active option cannot be turned off and says why', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness initial={['answer']} onChange={onChange} minActive={1} minActiveReason="At least one panel stays visible" />);
      const last = screen.getByRole('button', { name: 'Answer' });
      expect(last).toHaveAttribute('aria-disabled', 'true');
      expect(last).toHaveAttribute('data-locked', 'true');
      expect(last).toHaveAttribute('aria-pressed', 'true');
      expect(last).toHaveAttribute('data-state', 'on');
      await user.click(last);
      expect(onChange).not.toHaveBeenCalled();
      expect(last).toHaveAttribute('aria-pressed', 'true');
      await user.hover(last);
      expect(await screen.findByRole('tooltip')).toHaveTextContent('At least one panel stays visible');
    });

    it('does not lock the other (off) options', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness initial={['answer']} onChange={onChange} minActive={1} />);
      const other = screen.getByRole('button', { name: 'Chat' });
      expect(other).not.toHaveAttribute('aria-disabled');
      await user.click(other);
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('unlocks once a second option is on', async () => {
      const user = userEvent.setup();
      render(<Harness initial={['answer']} minActive={1} />);
      await user.click(screen.getByRole('button', { name: 'Chat' }));
      expect(screen.getByRole('button', { name: 'Answer' })).not.toHaveAttribute('aria-disabled');
      await user.click(screen.getByRole('button', { name: 'Answer' }));
      expect(screen.getByRole('button', { name: 'Answer' })).toHaveAttribute('aria-pressed', 'false');
      // Chat is now the last one on.
      expect(screen.getByRole('button', { name: 'Chat' })).toHaveAttribute('data-locked', 'true');
    });

    it('a locked option is still focusable (keyboard users reach the reason)', async () => {
      render(<Harness initial={['answer']} minActive={1} minActiveReason="Keep one visible" />);
      const locked = screen.getByRole('button', { name: 'Answer' });
      act(() => locked.focus());
      expect(locked).toHaveFocus();
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Keep one visible');
    });
  });

  describe('options: icon, label, disabledReason', () => {
    it('renders the icon and an optional visible label', () => {
      render(<SegmentedPrimitive data-testid="s" options={[{ value: 'a', icon: <Code data-testid="ic" />, label: 'Code' }]} value="a" />);
      expect(screen.getByTestId('ic')).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Code' })).toHaveTextContent('Code');
    });

    it('an icon-only option is named by ariaLabel', () => {
      render(<Harness initial={[]} />);
      expect(screen.getByRole('button', { name: 'Chat' })).toHaveTextContent('');
    });

    it('disabledReason makes the option aria-disabled, ignores clicks and explains itself on hover', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <Harness
          initial={['chat']}
          onChange={onChange}
          options={panels.map((o) => (o.value === 'code' ? { ...o, disabledReason: 'Starts after the approach' } : o))}
        />,
      );
      const code = screen.getByRole('button', { name: 'Code' });
      expect(code).toHaveAttribute('aria-disabled', 'true');
      expect(code).not.toBeDisabled();
      expect(code).toHaveAttribute('data-state', 'off');
      await user.click(code);
      expect(onChange).not.toHaveBeenCalled();
      await user.hover(code);
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Starts after the approach');
    });

    it('native disabled still works per option and for the group', () => {
      render(<Harness initial={[]} disabled />);
      panels.forEach((o) => expect(screen.getByRole('button', { name: o.ariaLabel })).toBeDisabled());
    });
  });

  describe('control appearance', () => {
    it('marks the root and uses the 36px control-row tokens', () => {
      render(<Harness initial={['chat']} />);
      const root = screen.getByTestId('s');
      expect(root).toHaveAttribute('data-appearance', 'control');
      expect(root).toHaveClass('h-[var(--oui-control-height)]');
      expect(root).toHaveClass('border');
    });

    it('active uses the accent tint, inactive is transparent', () => {
      render(<Harness initial={['chat']} />);
      const on = screen.getByRole('button', { name: 'Chat' });
      const off = screen.getByRole('button', { name: 'Answer' });
      expect(on).toHaveClass('data-[state=on]:bg-[color:var(--oui-segment-active-bg)]');
      expect(on).toHaveAttribute('data-state', 'on');
      expect(off).toHaveAttribute('data-state', 'off');
      expect(off).toHaveClass('bg-transparent');
    });

    it('the default appearance stays the rounded pill', () => {
      render(<SegmentedPrimitive data-testid="s" options={panels} value="chat" />);
      expect(screen.getByTestId('s')).toHaveAttribute('data-appearance', 'pill');
      expect(screen.getByTestId('s')).toHaveClass('rounded-full');
    });

    it('works in single mode too (one value, string onChange)', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<SegmentedPrimitive data-testid="s" appearance="control" options={panels} value="chat" onChange={onChange} />);
      await user.click(screen.getByRole('radio', { name: 'Answer' }));
      expect(onChange).toHaveBeenCalledWith('answer');
    });
  });

  it('renders every factory control variant', () => {
    segmentedControlVariants.forEach((variant) => {
      const { unmount } = render(<Segmented {...(variant.args as SegmentedProps)} />);
      expect(screen.getAllByRole(variant.args.mode === 'multiple' ? 'button' : 'radio').length).toBeGreaterThan(0);
      unmount();
    });
  });
});
