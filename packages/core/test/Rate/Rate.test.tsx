import '@testing-library/jest-dom';

import {
  DEFAULT_RATE_LABELS,
  Rate,
  RatePrimitive,
  type RateProps,
} from '@oc-tech/omni-ui-components/Rate';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ratePropsFactory } from 'factories/omni-ui-components/Rate/Rate.factories';
import * as React from 'react';

const checked = () =>
  screen
    .getAllByRole('radio')
    .filter((each) => each.getAttribute('aria-checked') === 'true')
    .map((each) => each.getAttribute('aria-label'));

const filled = () =>
  screen.getAllByRole('radio').filter((each) => each.getAttribute('data-filled') === 'true').length;

describe('omni-ui-components/Rate', () => {
  describe('primitive: value', () => {
    it('uncontrolled: starts at defaultValue, a click changes it and fires onChange', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(<RatePrimitive aria-label="Score" defaultValue={3} onChange={handle} />);
      expect(checked()).toEqual(['3 stars']);
      expect(filled()).toBe(3);
      await user.click(screen.getByRole('radio', { name: '5 stars' }));
      expect(handle).toHaveBeenCalledWith(5);
      expect(checked()).toEqual(['5 stars']);
      expect(filled()).toBe(5);
    });

    it('starts empty: no mark is checked and the first holds the tab stop', () => {
      render(<RatePrimitive aria-label="Score" />);
      expect(checked()).toEqual([]);
      expect(screen.getAllByRole('radio').map((each) => each.tabIndex)).toEqual([
        0, -1, -1, -1, -1,
      ]);
    });

    it('controlled: shows the given value and only asks for a change', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      const { rerender } = render(<RatePrimitive aria-label="Score" value={2} onChange={handle} />);
      await user.click(screen.getByRole('radio', { name: '4 stars' }));
      expect(handle).toHaveBeenCalledWith(4);
      expect(checked()).toEqual(['2 stars']);
      rerender(<RatePrimitive aria-label="Score" value={4} onChange={handle} />);
      expect(checked()).toEqual(['4 stars']);
    });

    it('clears when the current value is activated again, unless allowClear is off', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      const { rerender } = render(
        <RatePrimitive aria-label="Score" defaultValue={3} onChange={handle} />,
      );
      await user.click(screen.getByRole('radio', { name: '3 stars' }));
      expect(handle).toHaveBeenLastCalledWith(0);
      expect(checked()).toEqual([]);
      handle.mockClear();
      rerender(<RatePrimitive aria-label="Score" value={3} allowClear={false} onChange={handle} />);
      await user.click(screen.getByRole('radio', { name: '3 stars' }));
      expect(handle).not.toHaveBeenCalled();
    });

    it('writes the value to a hidden input when named', () => {
      const { container } = render(<RatePrimitive aria-label="Score" name="score" value={4} />);
      expect(container.querySelector('input[type="hidden"][name="score"]')).toHaveValue('4');
    });
  });

  describe('primitive: roles and names', () => {
    it('is a radiogroup of named radios, with slots, a size and a test id', () => {
      render(<RatePrimitive id="r" aria-label="Score" count={3} size="lg" className="extra" />);
      const group = screen.getByRole('radiogroup', { name: 'Score' });
      expect(group).toHaveAttribute('id', 'r');
      expect(group).toHaveAttribute('data-slot', 'rate');
      expect(group).toHaveAttribute('data-size', 'lg');
      expect(group).toHaveAttribute('data-testid', 'r');
      expect(group).toHaveClass('extra');
      expect(screen.getAllByRole('radio').map((each) => each.getAttribute('aria-label'))).toEqual([
        '1 star',
        '2 stars',
        '3 stars',
      ]);
      expect(screen.getByTestId('r-mark-2')).toHaveAttribute('data-slot', 'rate-mark');
    });

    it('takes mark names from labels, and from the deprecated starLabel', () => {
      const { rerender } = render(
        <RatePrimitive count={3} labels={{ mark: (value, count) => `${value} von ${count}` }} />,
      );
      expect(screen.getByRole('radio', { name: '3 von 3' })).toBeInTheDocument();
      rerender(<RatePrimitive count={3} starLabel={(value) => `Note ${value}`} />);
      expect(screen.getByRole('radio', { name: 'Note 2' })).toBeInTheDocument();
      expect(DEFAULT_RATE_LABELS.mark(1, 5)).toBe('1 star');
    });

    it('renders a custom icon in every mark', () => {
      render(<RatePrimitive count={2} icon={<span data-testid="heart" />} />);
      expect(screen.getAllByTestId('heart')).toHaveLength(2);
    });

    it('carries describedby, labelledby, invalid and required on the group', () => {
      render(
        <>
          <span id="name">Score</span>
          <span id="help">Help</span>
          <RatePrimitive aria-labelledby="name" aria-describedby="help" invalid required />
        </>,
      );
      const group = screen.getByRole('radiogroup', { name: 'Score' });
      expect(group).toHaveAccessibleDescription('Help');
      expect(group).toHaveAttribute('aria-invalid', 'true');
      expect(group).toHaveAttribute('aria-required', 'true');
      expect(group).toHaveAttribute('data-state', 'invalid');
    });

    it('forwards its ref to the group, and focusing the group lands on the tab stop', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<RatePrimitive ref={ref} id="score" defaultValue={2} />);
      expect(ref.current).toBe(document.getElementById('score'));
      document.getElementById('score')?.focus();
      expect(screen.getByRole('radio', { name: '2 stars' })).toHaveFocus();
    });
  });

  describe('primitive: keyboard', () => {
    it('has one tab stop; arrows, Home and End move focus and the value together', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(<RatePrimitive aria-label="Score" defaultValue={2} onChange={handle} />);
      await user.tab();
      expect(screen.getByRole('radio', { name: '2 stars' })).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('radio', { name: '3 stars' })).toHaveFocus();
      expect(checked()).toEqual(['3 stars']);
      await user.keyboard('{ArrowUp}');
      expect(checked()).toEqual(['4 stars']);
      await user.keyboard('{ArrowLeft}{ArrowDown}');
      expect(checked()).toEqual(['2 stars']);
      await user.keyboard('{End}');
      expect(checked()).toEqual(['5 stars']);
      await user.keyboard('{ArrowRight}');
      expect(checked()).toEqual(['5 stars']);
      await user.keyboard('{Home}');
      expect(checked()).toEqual(['1 star']);
      await user.keyboard('{ArrowLeft}');
      expect(checked()).toEqual(['1 star']);
      expect(handle.mock.calls.map(([next]) => next)).toEqual([3, 4, 3, 2, 5, 1]);
      await user.keyboard('a');
      expect(checked()).toEqual(['1 star']);
      await user.tab();
      expect(document.body).toHaveFocus();
    });

    it('Space on the current mark clears it', async () => {
      const user = userEvent.setup();
      render(<RatePrimitive aria-label="Score" defaultValue={2} />);
      await user.tab();
      await user.keyboard(' ');
      expect(checked()).toEqual([]);
    });
  });

  describe('primitive: disabled and read-only', () => {
    it('disabled: marks are disabled and nothing changes', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(
        <RatePrimitive aria-label="Score" value={4} disabled name="score" onChange={handle} />,
      );
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAttribute('aria-disabled', 'true');
      expect(group).toHaveAttribute('data-state', 'disabled');
      for (const each of screen.getAllByRole('radio')) expect(each).toBeDisabled();
      await user.click(screen.getByRole('radio', { name: '2 stars' }));
      expect(handle).not.toHaveBeenCalled();
    });

    it('read-only: focusable and announced, but clicks and keys change nothing', async () => {
      const user = userEvent.setup();
      const handle = jest.fn();
      render(<RatePrimitive aria-label="Score" defaultValue={4} readOnly onChange={handle} />);
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAttribute('aria-readonly', 'true');
      expect(group).toHaveAttribute('data-state', 'readonly');
      await user.tab();
      expect(screen.getByRole('radio', { name: '4 stars' })).toHaveFocus();
      await user.keyboard('{ArrowLeft}{Home} ');
      await user.click(screen.getByRole('radio', { name: '1 star' }));
      expect(handle).not.toHaveBeenCalled();
      expect(checked()).toEqual(['4 stars']);
    });
  });

  describe('chrome layer', () => {
    it('stays compatible with the bare usages', () => {
      const { rerender } = render(<Rate defaultValue={3} />);
      expect(checked()).toEqual(['3 stars']);
      rerender(<Rate value={4} disabled />);
      expect(checked()).toEqual(['4 stars']);
      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-labelledby');
    });

    it('names the group by its label and describes it by the description', () => {
      render(<Rate {...ratePropsFactory({ required: true })} />);
      const group = screen.getByRole('radiogroup', { name: /Answer quality/ });
      expect(group).toHaveAttribute('id', 'demo-rate');
      expect(group).toHaveAccessibleDescription('How well did the answer land?');
      expect(group).toHaveAttribute('aria-required', 'true');
      expect(group).not.toHaveAttribute('aria-invalid');
    });

    it('shows the error as an alert, marks the group invalid and describes it by the error', () => {
      render(<Rate {...ratePropsFactory({ error: 'Rate it first', layout: 'horizontal' })} />);
      expect(screen.getByRole('alert')).toHaveTextContent('Rate it first');
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAttribute('aria-invalid', 'true');
      expect(group).toHaveAccessibleDescription('Rate it first');
    });

    it('merges a caller describedby and labelledby with its own', () => {
      render(
        <>
          <span id="more">More</span>
          <span id="extra">Extra</span>
          <Rate {...ratePropsFactory()} aria-describedby="more" aria-labelledby="extra" />
        </>,
      );
      const group = screen.getByRole('radiogroup');
      expect(group).toHaveAccessibleName('Answer quality Extra');
      expect(group).toHaveAccessibleDescription('More How well did the answer land?');
    });

    it('works controlled through the chrome layer', async () => {
      const user = userEvent.setup();
      const Harness = (props: RateProps) => {
        const [value, setValue] = React.useState(1);
        return <Rate {...props} value={value} onChange={setValue} />;
      };
      render(<Harness label="Score" invalid />);
      await user.click(screen.getByRole('radio', { name: '4 stars' }));
      expect(checked()).toEqual(['4 stars']);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
