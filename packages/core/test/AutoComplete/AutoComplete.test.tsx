import '@testing-library/jest-dom';

import {
  AutoComplete,
  type AutoCompleteOption,
  AutoCompletePrimitive,
  type AutoCompletePrimitiveProps,
  DEFAULT_AUTOCOMPLETE_LABELS,
} from '@oc-tech/omni-ui-components/AutoComplete';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  autoCompletePropsFactory,
  type PersonOption,
  SAMPLE_PEOPLE,
} from 'factories/omni-ui-components/AutoComplete/AutoComplete.factories';
import * as React from 'react';

const people: AutoCompleteOption[] = [
  { value: 'Alex Morgan' },
  { value: 'Jamie Chen', label: 'Jamie C.' },
  { value: 'Samir Patel', disabled: true },
  { value: 'Jane Miller', label: <em>Jane</em> },
];

/** Controlled harness: the value follows onChange like a real consumer. */
const Harness = ({
  initial = '',
  onChange,
  ...rest
}: { initial?: string } & AutoCompletePrimitiveProps) => {
  const [value, setValue] = React.useState(initial);
  return (
    <AutoCompletePrimitive
      aria-label="Assignee"
      options={people}
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

const input = () => screen.getByRole('combobox');

describe('omni-ui-components/AutoComplete', () => {
  describe('primitive: value in, value out', () => {
    it('controlled: shows the value and reports each keystroke', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness initial="A" onChange={onChange} />);
      expect(input()).toHaveValue('A');
      await user.type(input(), 'l');
      expect(onChange).toHaveBeenLastCalledWith('Al');
      expect(input()).toHaveValue('Al');
    });

    it('controlled without an update keeps the given value', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <AutoCompletePrimitive
          aria-label="Assignee"
          value="A"
          onChange={onChange}
          options={people}
        />,
      );
      await user.type(input(), 'l');
      expect(onChange).toHaveBeenLastCalledWith('Al');
      expect(input()).toHaveValue('A');
    });

    it('uncontrolled: starts from defaultValue, keeps its own state and still calls onChange', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <AutoCompletePrimitive
          aria-label="Assignee"
          defaultValue="Ja"
          onChange={onChange}
          options={people}
        />,
      );
      expect(input()).toHaveValue('Ja');
      await user.type(input(), 'n');
      expect(input()).toHaveValue('Jan');
      expect(onChange).toHaveBeenLastCalledWith('Jan');
    });

    it('accepts free text that matches no option, and says nothing matches', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness onChange={onChange} />);
      await user.type(input(), 'Zed');
      expect(input()).toHaveValue('Zed');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(DEFAULT_AUTOCOMPLETE_LABELS.noResults);
      expect(input()).toHaveAttribute('aria-expanded', 'false');
    });

    it('works with no options and no callbacks', async () => {
      const user = userEvent.setup();
      render(<AutoCompletePrimitive aria-label="Assignee" />);
      await user.type(input(), 'x{ArrowDown}{Enter}');
      expect(input()).toHaveValue('x');
    });
  });

  describe('primitive: list and roles', () => {
    it('is a combobox wired to a listbox of options with ids', async () => {
      const user = userEvent.setup();
      render(<Harness id="who" />);
      const field = input();
      expect(field).toHaveAttribute('id', 'who');
      expect(field).toHaveAttribute('aria-autocomplete', 'list');
      expect(field).toHaveAttribute('aria-expanded', 'false');
      expect(field).not.toHaveAttribute('aria-controls');
      await user.click(field);
      expect(field).toHaveAttribute('aria-expanded', 'true');
      const list = screen.getByRole('listbox', { name: 'Suggestions' });
      expect(field).toHaveAttribute('aria-controls', list.id);
      const options = screen.getAllByRole('option');
      expect(options.map((option) => option.id)).toEqual([
        'who-option-0',
        'who-option-1',
        'who-option-2',
        'who-option-3',
      ]);
      expect(screen.getByRole('option', { name: 'Jamie C.' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Samir Patel' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('filters by the typed text on value and on a string label, case-insensitively', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(input(), 'jamie c.');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      await user.clear(input());
      await user.type(input(), 'CHEN');
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });

    it('filter={false} draws the options as given', async () => {
      const user = userEvent.setup();
      render(<Harness filter={false} />);
      await user.type(input(), 'zzz');
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    it('draws the default icon, a custom icon, or none', () => {
      const { rerender, container } = render(<Harness />);
      expect(container.querySelector('[data-slot="autocomplete-icon"] svg')).toBeInTheDocument();
      rerender(<Harness icon={<i data-testid="mine" />} />);
      expect(screen.getByTestId('mine')).toBeInTheDocument();
      rerender(<Harness icon={null} />);
      expect(container.querySelector('[data-slot="autocomplete-icon"]')).not.toBeInTheDocument();
    });

    it('takes its words from labels, and placeholder wins over labels.placeholder', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Harness labels={{ placeholder: 'Find', noResults: 'Nobody', suggestions: 'People' }} />,
      );
      expect(input()).toHaveAttribute('placeholder', 'Find');
      await user.click(input());
      expect(screen.getByRole('listbox', { name: 'People' })).toBeInTheDocument();
      await user.type(input(), 'zzz');
      expect(screen.getByRole('status')).toHaveTextContent('Nobody');
      rerender(<Harness placeholder="Name" labels={{ placeholder: 'Find' }} />);
      expect(input()).toHaveAttribute('placeholder', 'Name');
    });

    it('forwards the ref to the input, which carries the id', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<AutoCompletePrimitive ref={ref} id="who" aria-label="Assignee" />);
      expect(ref.current).toBe(document.getElementById('who'));
      expect(ref.current?.tagName).toBe('INPUT');
    });

    it('passes aria-describedby, aria-labelledby, name, className and data-testid to the input', () => {
      render(
        <>
          <span id="lbl">Who</span>
          <AutoCompletePrimitive
            aria-labelledby="lbl"
            aria-describedby="hint"
            name="assignee"
            className="mine"
            data-testid="ac"
          />
        </>,
      );
      const field = screen.getByRole('combobox', { name: 'Who' });
      expect(field).toHaveAttribute('aria-describedby', 'hint');
      expect(field).toHaveAttribute('name', 'assignee');
      expect(field).toHaveClass('mine');
      expect(field).toHaveAttribute('data-testid', 'ac');
    });
  });

  describe('primitive: keyboard', () => {
    it('ArrowDown and ArrowUp move the active option, skip disabled ones and wrap', async () => {
      const user = userEvent.setup();
      render(<Harness id="who" />);
      input().focus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(input()).toHaveAttribute('aria-activedescendant', 'who-option-0');
      expect(screen.getByRole('option', { name: 'Alex Morgan' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(input()).toHaveAttribute('aria-activedescendant', 'who-option-3');
      await user.keyboard('{ArrowDown}');
      expect(input()).toHaveAttribute('aria-activedescendant', 'who-option-0');
      await user.keyboard('{ArrowUp}');
      expect(input()).toHaveAttribute('aria-activedescendant', 'who-option-3');
      await user.keyboard('{ArrowUp}');
      expect(input()).toHaveAttribute('aria-activedescendant', 'who-option-1');
    });

    it('ArrowUp with nothing active goes to the last enabled option', async () => {
      const user = userEvent.setup();
      render(<Harness id="who" />);
      await user.click(input());
      await user.keyboard('{ArrowUp}');
      expect(input()).toHaveAttribute('aria-activedescendant', 'who-option-3');
    });

    it('has no active option when every option is disabled', async () => {
      const user = userEvent.setup();
      render(<Harness options={[{ value: 'a', disabled: true }]} />);
      await user.click(input());
      await user.keyboard('{ArrowDown}');
      expect(input()).not.toHaveAttribute('aria-activedescendant');
    });

    it('Enter picks the active option: onChange with its value, onSelect with the option', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const onSelect = jest.fn();
      render(<Harness onChange={onChange} onSelect={onSelect} />);
      await user.type(input(), 'j{ArrowDown}{Enter}');
      expect(onChange).toHaveBeenLastCalledWith('Jamie Chen');
      expect(onSelect).toHaveBeenCalledWith(people[1]);
      expect(input()).toHaveValue('Jamie Chen');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input()).toHaveFocus();
    });

    it('Enter with no active option leaves the text and the key alone', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      const onSubmit = jest.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <Harness onSelect={onSelect} />
          <button type="submit">Save</button>
        </form>,
      );
      await user.type(input(), 'j{Enter}');
      expect(onSelect).not.toHaveBeenCalled();
      expect(input()).toHaveValue('j');
      expect(onSubmit).toHaveBeenCalled();
    });

    it('Escape closes the list and keeps the text; typing opens it again', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(input(), 'j');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input()).toHaveValue('j');
      await user.keyboard('{Escape}');
      await user.keyboard('a');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('Tab closes the list and moves on', async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();
      const onFocus = jest.fn();
      render(
        <>
          <Harness onBlur={onBlur} onFocus={onFocus} />
          <button type="button">Next</button>
        </>,
      );
      await user.click(input());
      expect(onFocus).toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.tab();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(onBlur).toHaveBeenCalled();
    });

    it("the host's onKeyDown runs first and can take the key", async () => {
      const user = userEvent.setup();
      render(<Harness onKeyDown={(event) => event.preventDefault()} />);
      input().focus();
      await user.keyboard('{ArrowDown}');
      expect(input()).not.toHaveAttribute('aria-activedescendant');
    });
  });

  describe('primitive: pointer', () => {
    it('clicking an option picks it and keeps focus in the input', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      const onClick = jest.fn();
      render(<Harness onSelect={onSelect} onClick={onClick} />);
      await user.click(input());
      expect(onClick).toHaveBeenCalled();
      await user.hover(screen.getByRole('option', { name: 'Jane' }));
      expect(screen.getByRole('option', { name: 'Jane' })).toHaveAttribute('aria-selected', 'true');
      await user.click(screen.getByRole('option', { name: 'Jane' }));
      expect(onSelect).toHaveBeenCalledWith(people[3]);
      expect(input()).toHaveValue('Jane Miller');
      expect(input()).toHaveFocus();
    });

    it('a disabled option cannot be picked or made active', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn();
      render(<Harness onSelect={onSelect} />);
      await user.click(input());
      const option = screen.getByRole('option', { name: 'Samir Patel' });
      await user.hover(option);
      expect(option).toHaveAttribute('aria-selected', 'false');
      fireEvent.mouseDown(option);
      expect(onSelect).not.toHaveBeenCalled();
      expect(input()).toHaveValue('');
    });

    it('a press outside closes the list; a press inside does not', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Harness />
          <p>Elsewhere</p>
        </>,
      );
      await user.click(input());
      fireEvent.mouseDown(input());
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByText('Elsewhere'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('primitive: states', () => {
    it('disabled: not editable and the list never opens', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness disabled onChange={onChange} />);
      expect(input()).toBeDisabled();
      await user.click(input());
      await user.type(input(), 'j');
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('read-only: focusable, announced, value fixed and the list never opens', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness readOnly initial="Alex Morgan" onChange={onChange} />);
      await user.click(input());
      expect(input()).toHaveFocus();
      expect(input()).toHaveAttribute('aria-readonly', 'true');
      await user.keyboard('x{ArrowDown}');
      expect(onChange).not.toHaveBeenCalled();
      expect(input()).toHaveValue('Alex Morgan');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(input()).toHaveAttribute('aria-expanded', 'false');
    });

    it('required sets aria-required; invalid sets aria-invalid', () => {
      const { rerender } = render(<Harness />);
      expect(input()).not.toHaveAttribute('aria-required');
      expect(input()).not.toHaveAttribute('aria-invalid');
      rerender(<Harness required invalid />);
      expect(input()).toHaveAttribute('aria-required', 'true');
      expect(input()).toHaveAttribute('aria-invalid', 'true');
      expect(input()).toHaveAttribute('data-state', 'invalid');
    });

    it('accepts variant and inputSize like Input', () => {
      render(<Harness variant="ghost" inputSize="lg" />);
      expect(input()).toHaveAttribute('data-variant', 'ghost');
      expect(input()).toHaveAttribute('data-input-size', 'lg');
    });
  });

  describe('chrome layer', () => {
    it('stays compatible with the overview usage', () => {
      render(
        <AutoComplete
          label="Assignee"
          value=""
          onChange={() => undefined}
          options={[{ value: 'Alex Morgan' }, { value: 'Jamie Chen' }]}
        />,
      );
      expect(screen.getByLabelText('Assignee')).toHaveAttribute('role', 'combobox');
      expect(screen.getByLabelText('Assignee')).toHaveAttribute('placeholder', 'Search…');
    });

    it('labels the input and describes it with the description', () => {
      render(<AutoComplete id="who" label="Assignee" description="Type a name" required />);
      const field = screen.getByRole('combobox', { name: /Assignee/ });
      expect(field).toHaveAttribute('id', 'who');
      expect(field).toHaveAttribute('aria-describedby', 'who-description');
      expect(field).toHaveAttribute('aria-required', 'true');
      expect(screen.getByText('Type a name')).toHaveAttribute('id', 'who-description');
    });

    it('shows the error as an alert, marks the input invalid and keeps a host aria-describedby', () => {
      render(
        <AutoComplete id="who" label="Assignee" error="Pick someone" aria-describedby="extra" />,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Pick someone');
      expect(input()).toHaveAttribute('aria-invalid', 'true');
      expect(input()).toHaveAttribute('aria-describedby', 'extra who-error');
    });

    it('forwards the ref and generates an id when none is given', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<AutoComplete ref={ref} label="Assignee" layout="horizontal" />);
      expect(ref.current).toBe(screen.getByLabelText('Assignee'));
      expect(ref.current?.id).toMatch(/^oui-autocomplete-/);
    });

    it('generic: onSelect receives the original extended option by reference', async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn<void, [PersonOption]>();
      const onChange = jest.fn();
      render(
        <AutoComplete<PersonOption>
          {...autoCompletePropsFactory({ value: undefined })}
          onSelect={onSelect}
          onChange={onChange}
        />,
      );
      await user.type(screen.getByLabelText('Assignee'), 'jamie{ArrowDown}{Enter}');
      expect(onSelect.mock.calls[0][0]).toBe(SAMPLE_PEOPLE[1]);
      expect(onSelect.mock.calls[0][0].team).toBe('Platform');
      expect(onChange).toHaveBeenLastCalledWith('Jamie Chen');
    });
  });
});
