import '@testing-library/jest-dom';

import {
  Cascader,
  type CascaderOption,
  CascaderPrimitive,
  type CascaderProps,
  DEFAULT_CASCADER_LABELS,
} from '@oc-tech/omni-ui-components/Cascader';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  cascaderFixture,
  cascaderPropsFactory,
  SAMPLE_STACK,
  type StackOption,
} from 'factories/omni-ui-components/Cascader/Cascader.factories';
import * as React from 'react';

type Props = CascaderProps<StackOption>;

const renderCascader = (overrides: Partial<Props> = {}) =>
  render(<Cascader<StackOption> {...cascaderPropsFactory({ 'data-testid': 'c', ...overrides })} />);

const trigger = () => screen.getByRole('combobox');
const option = (name: string) => screen.getByRole('option', { name });
const openByKeyboard = async (user: ReturnType<typeof userEvent.setup>) => {
  trigger().focus();
  await user.keyboard('{ArrowDown}');
};

describe('omni-ui-components/Cascader', () => {
  describe('trigger', () => {
    it('is a combobox named by the label, closed, showing the placeholder', () => {
      renderCascader();
      const combobox = screen.getByRole('combobox', { name: 'Stack' });
      expect(combobox).toHaveAttribute('id', 'demo-cascader');
      expect(combobox).toHaveAttribute('aria-haspopup', 'dialog');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
      expect(combobox).toHaveTextContent('Choose a technology');
      expect(combobox).toHaveAttribute('data-placeholder', 'true');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('falls back to the default placeholder label, and to a translated one', () => {
      const { rerender } = render(<CascaderPrimitive aria-label="Stack" options={SAMPLE_STACK} />);
      expect(trigger()).toHaveTextContent(DEFAULT_CASCADER_LABELS.placeholder);
      rerender(
        <CascaderPrimitive
          aria-label="Stack"
          options={SAMPLE_STACK}
          labels={{ placeholder: 'Choisir' }}
        />,
      );
      expect(trigger()).toHaveTextContent('Choisir');
    });

    it('shows the chosen labels joined by the separator', () => {
      renderCascader({ value: ['frontend', 'styling', 'tailwind'] });
      expect(trigger()).toHaveTextContent('Frontend / Styling / Tailwind');
      expect(trigger()).not.toHaveAttribute('data-placeholder');
    });

    it('uses displaySeparator and shows the raw value of a segment that is not in the tree', () => {
      renderCascader({ value: ['frontend', 'svelte'], displaySeparator: ' > ' });
      expect(trigger()).toHaveTextContent('Frontend > svelte');
    });

    it('reflects variant and inputSize through inputVariants', () => {
      renderCascader({ variant: 'ghost', inputSize: 'lg' });
      expect(trigger()).toHaveAttribute('data-variant', 'ghost');
      expect(trigger()).toHaveAttribute('data-input-size', 'lg');
      expect(trigger().className).toContain('h-[var(--oui-field-height-xl)]');
      expect(trigger().className).toContain('bg-transparent');
    });

    it('forwards the ref to the focusable trigger and passes aria names through', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(
        <>
          <span id="ext">Area</span>
          <CascaderPrimitive
            ref={ref}
            id="p"
            aria-labelledby="ext"
            aria-describedby="hint"
            className="custom"
            options={cascaderFixture()}
          />
        </>,
      );
      expect(ref.current).toBe(document.getElementById('p'));
      expect(ref.current).toHaveAccessibleName('Area');
      expect(ref.current).toHaveAttribute('aria-describedby', 'hint');
      expect(ref.current).toHaveAttribute('data-testid', 'p');
      expect(ref.current?.parentElement).toHaveClass('custom');
    });

    it('accepts a callback ref and renders without any id', () => {
      const seen: Array<HTMLButtonElement | null> = [];
      render(
        <CascaderPrimitive
          ref={(node) => {
            seen.push(node);
          }}
          aria-label="Stack"
          options={cascaderFixture()}
        />,
      );
      expect(seen[0]).toBe(trigger());
      expect(trigger()).not.toHaveAttribute('data-testid');
    });

    it('carries the joined path in a hidden input when named', () => {
      const { container } = renderCascader({ name: 'stack', value: ['backend', 'hono'] });
      expect(container.querySelector('input[type="hidden"][name="stack"]')).toHaveValue(
        'backend/hono',
      );
    });
  });

  describe('opening and closing', () => {
    it('opens on click with one column and focuses the first enabled option', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      renderCascader({ onOpenChange });
      await user.click(trigger());
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('dialog', { name: 'Options' })).toBeInTheDocument();
      expect(screen.getAllByRole('listbox')).toHaveLength(1);
      expect(screen.getByRole('listbox', { name: 'Level 1' })).toBeInTheDocument();
      expect(option('Frontend')).toHaveFocus();
      expect(option('DevOps')).toHaveAttribute('aria-disabled', 'true');
    });

    it.each(['{Enter}', ' ', '{ArrowDown}', '{ArrowUp}'])('opens with %s', async (key) => {
      const user = userEvent.setup();
      renderCascader();
      trigger().focus();
      await user.keyboard(key);
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('ignores other keys on the trigger', async () => {
      const user = userEvent.setup();
      renderCascader();
      trigger().focus();
      await user.keyboard('a');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('closes on Escape and returns focus to the trigger without changing the value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderCascader({ onChange });
      await openByKeyboard(user);
      await user.keyboard('{ArrowRight}{Escape}');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger()).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('opens on the chosen path, with its parents expanded and marked selected', async () => {
      const user = userEvent.setup();
      renderCascader({ value: ['frontend', 'styling', 'tailwind'] });
      await user.click(trigger());
      expect(screen.getAllByRole('listbox')).toHaveLength(3);
      expect(option('Tailwind')).toHaveFocus();
      expect(option('Frontend')).toHaveAttribute('aria-selected', 'true');
      expect(option('Styling')).toHaveAttribute('aria-selected', 'true');
      expect(option('Styling')).toHaveAttribute('data-expanded', 'true');
      expect(option('Tailwind')).toHaveAttribute('aria-selected', 'true');
      expect(option('React')).toHaveAttribute('aria-selected', 'false');
    });

    it('opens on the enabled part of a path that runs through a disabled option', async () => {
      const user = userEvent.setup();
      renderCascader({ value: ['frontend', 'vue'] });
      await user.click(trigger());
      expect(option('Frontend')).toHaveFocus();
      expect(screen.getAllByRole('listbox')).toHaveLength(1);
    });

    it('falls back to the first enabled option when the path starts disabled', async () => {
      const user = userEvent.setup();
      renderCascader({ value: ['devops', 'k8s'] });
      await user.click(trigger());
      expect(option('Frontend')).toHaveFocus();
    });

    it('supports defaultOpen and a controlled open', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      const { unmount } = renderCascader({ defaultOpen: true });
      expect(await screen.findByRole('option', { name: 'Frontend' })).toBeInTheDocument();
      unmount();
      renderCascader({ open: false, onOpenChange });
      await user.click(trigger());
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('says so when there are no options, and keys do nothing', async () => {
      const user = userEvent.setup();
      renderCascader({ options: [] });
      await openByKeyboard(user);
      expect(screen.getByText('No options')).toBeInTheDocument();
      await user.keyboard('{ArrowDown}{ArrowUp}{ArrowRight}{ArrowLeft}{Enter}');
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('renders the popup into the given container', async () => {
      const user = userEvent.setup();
      const host = document.createElement('div');
      document.body.appendChild(host);
      renderCascader({ container: host });
      await user.click(trigger());
      expect(host).toContainElement(option('Frontend'));
      host.remove();
    });
  });

  describe('keyboard', () => {
    it('moves within a column, skipping disabled options and wrapping', async () => {
      const user = userEvent.setup();
      renderCascader();
      await openByKeyboard(user);
      await user.keyboard('{ArrowDown}');
      expect(option('Backend')).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(option('PostgreSQL')).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(option('Frontend')).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(option('PostgreSQL')).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(option('Backend')).toHaveFocus();
      await user.keyboard('{Home}');
      expect(option('Frontend')).toHaveFocus();
      await user.keyboard('{End}');
      expect(option('PostgreSQL')).toHaveFocus();
    });

    it('ArrowRight opens the children column and moves into it; ArrowLeft goes back', async () => {
      const user = userEvent.setup();
      renderCascader();
      await openByKeyboard(user);
      await user.keyboard('{ArrowRight}');
      expect(screen.getAllByRole('listbox')).toHaveLength(2);
      expect(option('React')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(option('Frontend')).toHaveFocus();
      expect(option('Frontend')).toHaveAttribute('data-expanded', 'true');
      expect(screen.getAllByRole('listbox')).toHaveLength(2);
      // At the root there is no parent column: ArrowLeft stays put.
      await user.keyboard('{ArrowLeft}');
      expect(option('Frontend')).toHaveFocus();
      // Moving within the column folds the children column away.
      await user.keyboard('{ArrowDown}');
      expect(option('Backend')).toHaveAttribute('data-expanded', 'false');
    });

    it('ArrowRight on a leaf does nothing; on a branch whose children are all disabled it only shows them', async () => {
      const user = userEvent.setup();
      const options: CascaderOption[] = [
        { value: 'a', label: 'A', children: [{ value: 'a1', label: 'A1', disabled: true }] },
        { value: 'b', label: 'B', children: [] },
      ];
      render(<CascaderPrimitive aria-label="Letters" options={options} />);
      await openByKeyboard(user);
      await user.keyboard('{ArrowRight}');
      expect(option('A')).toHaveFocus();
      expect(option('A1')).toBeInTheDocument();
      await user.keyboard('{ArrowDown}{ArrowRight}');
      expect(option('B')).toHaveFocus();
      expect(screen.getAllByRole('listbox')).toHaveLength(1);
    });

    it('Enter on a branch steps in; Enter on a leaf commits, closes and refocuses the trigger', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderCascader({ onChange });
      await openByKeyboard(user);
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onChange).not.toHaveBeenCalled();
      expect(option('Hono')).toHaveFocus();
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]).toEqual(['backend', 'rails']);
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger()).toHaveFocus();
      expect(trigger()).toHaveTextContent('Backend / Rails');
    });

    it('Space commits a leaf', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderCascader({ onChange });
      await openByKeyboard(user);
      await user.keyboard('{End} ');
      expect(onChange.mock.calls[0][0]).toEqual(['postgres']);
    });

    it('with changeOnSelect, Enter commits a branch and closes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderCascader({ onChange, changeOnSelect: true });
      await openByKeyboard(user);
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenCalledWith(['frontend'], [SAMPLE_STACK[0]]);
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger()).toHaveTextContent('Frontend');
    });
  });

  describe('pointer', () => {
    it('clicking a branch opens its column; clicking a leaf commits and closes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderCascader({ onChange });
      await user.click(trigger());
      await user.click(option('Frontend'));
      expect(onChange).not.toHaveBeenCalled();
      await user.click(option('Styling'));
      expect(screen.getAllByRole('listbox')).toHaveLength(3);
      // Switching branch at the root replaces the deeper columns.
      await user.click(option('Backend'));
      expect(screen.getAllByRole('listbox')).toHaveLength(2);
      await user.click(option('Hono'));
      expect(onChange.mock.calls[0][0]).toEqual(['backend', 'hono']);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('with changeOnSelect, clicking a branch commits it and stays open', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderCascader({ onChange, changeOnSelect: true });
      await user.click(trigger());
      await user.click(option('Frontend'));
      expect(onChange).toHaveBeenCalledWith(['frontend'], [SAMPLE_STACK[0]]);
      expect(option('React')).toBeInTheDocument();
    });

    it('a disabled option cannot be picked', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderCascader({ onChange, changeOnSelect: true });
      await user.click(trigger());
      await user.click(option('DevOps'));
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getAllByRole('listbox')).toHaveLength(1);
    });
  });

  describe('value', () => {
    it('uncontrolled: starts from defaultValue and keeps the picked path', async () => {
      const user = userEvent.setup();
      renderCascader({ defaultValue: ['backend', 'hono'] });
      expect(trigger()).toHaveTextContent('Backend / Hono');
      await user.click(trigger());
      await user.click(option('Rails'));
      expect(trigger()).toHaveTextContent('Backend / Rails');
    });

    it('controlled: reports the pick and keeps showing the given value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { rerender } = renderCascader({ value: ['backend', 'hono'], onChange });
      await user.click(trigger());
      await user.click(option('Rails'));
      expect(onChange.mock.calls[0][0]).toEqual(['backend', 'rails']);
      expect(trigger()).toHaveTextContent('Backend / Hono');
      rerender(
        <Cascader<StackOption>
          {...cascaderPropsFactory({ 'data-testid': 'c', value: ['postgres'], onChange })}
        />,
      );
      expect(trigger()).toHaveTextContent('PostgreSQL');
    });

    it('hands the chosen options to onChange by reference, extended fields intact', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn<void, [string[], StackOption[]]>();
      renderCascader({ onChange });
      await openByKeyboard(user);
      await user.keyboard('{ArrowRight}{ArrowDown}{ArrowRight}{Enter}');
      const [path, chosen] = onChange.mock.calls[0];
      const frontend = SAMPLE_STACK[0];
      const styling = frontend.children?.[2] as StackOption;
      const tailwind = styling.children?.[0] as StackOption;
      expect(path).toEqual(['frontend', 'styling', 'tailwind']);
      expect(chosen).toHaveLength(3);
      expect(chosen[0]).toBe(frontend);
      expect(chosen[1]).toBe(styling);
      expect(chosen[2]).toBe(tailwind);
      expect(chosen[2].years).toBe(4);
    });
  });

  describe('clear', () => {
    it('is drawn only with a value, and empties it', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const onClear = jest.fn();
      const { unmount } = renderCascader({ allowClear: true });
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
      unmount();
      renderCascader({ allowClear: true, defaultValue: ['postgres'], onChange, onClear });
      await user.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(onChange).toHaveBeenCalledWith([], []);
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(trigger()).toHaveTextContent('Choose a technology');
      expect(trigger()).toHaveFocus();
      expect(screen.queryByTestId('c-clear')).not.toBeInTheDocument();
    });

    it('is not drawn when disabled or read-only, and takes a translated name and icon', () => {
      const { rerender } = renderCascader({
        allowClear: true,
        value: ['postgres'],
        disabled: true,
      });
      expect(screen.queryByTestId('c-clear')).not.toBeInTheDocument();
      rerender(
        <Cascader<StackOption>
          {...cascaderPropsFactory({ allowClear: true, value: ['postgres'], readOnly: true })}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
      rerender(
        <Cascader<StackOption>
          {...cascaderPropsFactory({
            allowClear: true,
            value: ['postgres'],
            labels: { clear: 'Effacer' },
            clearIcon: <i data-testid="x" />,
            suffixIcon: <i data-testid="caret" />,
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Effacer' })).toContainElement(
        screen.getByTestId('x'),
      );
      expect(screen.getByTestId('caret')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('disabled: the trigger is disabled and does not open', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      renderCascader({ disabled: true, onOpenChange, defaultOpen: true });
      expect(trigger()).toBeDisabled();
      expect(trigger()).toHaveAttribute('data-state', 'disabled');
      await user.click(trigger());
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('read-only: focusable and announced, the popup does not open', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      renderCascader({ readOnly: true, value: ['postgres'], onOpenChange });
      await user.tab();
      expect(trigger()).toHaveFocus();
      expect(trigger()).toHaveAttribute('aria-readonly', 'true');
      expect(trigger()).toHaveAttribute('data-state', 'readonly');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      await user.click(trigger());
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('required: sets aria-required and draws the asterisk', () => {
      renderCascader({ required: true });
      expect(trigger()).toBeRequired();
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('invalid: sets aria-invalid and the invalid border state', () => {
      renderCascader({ invalid: true });
      expect(trigger()).toBeInvalid();
      expect(trigger()).toHaveAttribute('data-state', 'invalid');
      expect(trigger().className).toContain('aria-invalid:border-[var(--oui-border-invalid)]');
    });
  });

  describe('chrome', () => {
    it('describes the trigger by the description and the error, which is an alert', () => {
      renderCascader({ error: 'Choose a technology first', 'aria-describedby': 'extra' });
      expect(screen.getByRole('alert')).toHaveTextContent('Choose a technology first');
      expect(trigger()).toBeInvalid();
      expect(trigger()).toHaveAttribute(
        'aria-describedby',
        'extra demo-cascader-description demo-cascader-error',
      );
      expect(trigger()).toHaveAccessibleDescription(/Choose a technology first/);
    });

    it('focuses the trigger from its label, and lays out horizontally', async () => {
      const user = userEvent.setup();
      renderCascader({ layout: 'horizontal', className: 'mine', wrapperClassName: 'wrap' });
      expect(screen.getByTestId('c-root')).toHaveClass('flex-1', 'mine');
      await user.click(screen.getByText('Stack'));
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('generates an id and has no describedby without label, description or error', () => {
      render(<Cascader aria-label="Stack" options={cascaderFixture()} />);
      expect(trigger().id).not.toBe('');
      expect(trigger()).not.toHaveAttribute('aria-describedby');
    });

    it('takes a custom expand icon and translated popup names', async () => {
      const user = userEvent.setup();
      renderCascader({
        expandIcon: <i data-testid="more" />,
        labels: { popup: 'Choix', level: 'Niveau' },
      });
      await user.click(trigger());
      expect(screen.getByRole('dialog', { name: 'Choix' })).toBeInTheDocument();
      expect(screen.getByRole('listbox', { name: 'Niveau 1' })).toBeInTheDocument();
      expect(screen.getAllByTestId('more').length).toBeGreaterThan(0);
    });
  });
});
