import '@testing-library/jest-dom';

import {
  DEFAULT_MENTIONS_LABELS,
  Mentions,
  type MentionsOption,
  MentionsPrimitive,
  type MentionsPrimitiveProps,
} from '@oc-tech/omni-ui-components/Mentions';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type MemberOption,
  mentionsPropsFactory,
  SAMPLE_MEMBERS,
} from 'factories/omni-ui-components/Mentions/Mentions.factories';
import * as React from 'react';

const people: MentionsOption[] = [
  { value: 'alex', label: 'Alex Morgan', description: 'Design' },
  { value: 'jamie', label: 'Jamie Chen' },
  { value: 'samir', disabled: true },
  { value: 'jane', label: <em>Jane</em> },
];

/** Controlled harness: the value follows onChange like a real consumer. */
const Harness = ({
  initial = '',
  onChange,
  ...rest
}: { initial?: string } & MentionsPrimitiveProps) => {
  const [value, setValue] = React.useState(initial);
  return (
    <MentionsPrimitive
      aria-label="Comment"
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

const box = () => screen.getByRole<HTMLTextAreaElement>('textbox');

describe('omni-ui-components/Mentions', () => {
  describe('primitive: value in, value out', () => {
    it('controlled: shows the value and reports each edit', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness initial="hi" onChange={onChange} />);
      expect(box()).toHaveValue('hi');
      await user.type(box(), '!');
      expect(onChange).toHaveBeenLastCalledWith('hi!');
      expect(box()).toHaveValue('hi!');
    });

    it('uncontrolled: starts from defaultValue, keeps its own state and still calls onChange', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <MentionsPrimitive
          aria-label="Comment"
          defaultValue="a"
          onChange={onChange}
          options={people}
        />,
      );
      await user.type(box(), 'b');
      expect(box()).toHaveValue('ab');
      expect(onChange).toHaveBeenLastCalledWith('ab');
    });

    it('works with no options and no callbacks', async () => {
      const user = userEvent.setup();
      render(<MentionsPrimitive aria-label="Comment" />);
      await user.type(box(), '@a{Enter}b');
      expect(box()).toHaveValue('@a\nb');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('primitive: opening the list', () => {
    it('opens on a trigger at the start of the text, wired by aria to a listbox of options', async () => {
      const user = userEvent.setup();
      render(<Harness id="c" />);
      const textarea = box();
      expect(textarea).toHaveAttribute('id', 'c');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('aria-autocomplete', 'list');
      expect(textarea).not.toHaveAttribute('data-open');
      expect(textarea).not.toHaveAttribute('aria-controls');
      await user.type(textarea, '@');
      expect(textarea).toHaveAttribute('data-open');
      const list = screen.getByRole('listbox', { name: DEFAULT_MENTIONS_LABELS.suggestions });
      expect(textarea).toHaveAttribute('aria-controls', list.id);
      expect(screen.getAllByRole('option').map((option) => option.id)).toEqual([
        'c-option-0',
        'c-option-1',
        'c-option-2',
        'c-option-3',
      ]);
      expect(textarea).toHaveAttribute('aria-activedescendant', 'c-option-0');
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'samir' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('opens after whitespace, but not in the middle of a word', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(box(), 'mail@');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      await user.type(box(), ' @');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('filters by the query on value and on a string label, case-insensitively', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(box(), '@MORG');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByRole('option', { name: /Alex Morgan/ })).toBeInTheDocument();
      await user.clear(box());
      await user.type(box(), '@jan');
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });

    it('closes when nothing matches, and on whitespace in the query', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(box(), '@zz');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(box()).not.toHaveAttribute('data-open');
      await user.clear(box());
      await user.type(box(), '@al');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await user.type(box(), ' ');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('filter={false} draws the options as given and reports the query through onSearch', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(<Harness filter={false} onSearch={onSearch} />);
      await user.type(box(), '@zz');
      expect(screen.getAllByRole('option')).toHaveLength(4);
      expect(onSearch.mock.calls).toEqual([
        ['', '@'],
        ['z', '@'],
        ['zz', '@'],
      ]);
    });

    it('supports several triggers, the longest first, and reports which one', async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      const onMention = jest.fn();
      render(<Harness trigger={['#', '##', '']} onSearch={onSearch} onMention={onMention} />);
      await user.type(box(), '@a');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      await user.clear(box());
      await user.type(box(), '##al');
      expect(onSearch).toHaveBeenLastCalledWith('al', '##');
      await user.keyboard('{Enter}');
      expect(onMention).toHaveBeenCalledWith(people[0], '##');
      expect(box()).toHaveValue('##alex ');
    });

    it('re-reads the mention when the caret moves by arrow key or click', async () => {
      const onKeyUp = jest.fn();
      const onClick = jest.fn();
      render(<Harness initial="@al hello" onKeyUp={onKeyUp} onClick={onClick} />);
      const textarea = box();
      textarea.focus();
      textarea.setSelectionRange(3, 3);
      fireEvent.click(textarea);
      expect(onClick).toHaveBeenCalled();
      expect(screen.getAllByRole('option')).toHaveLength(1);
      textarea.setSelectionRange(9, 9);
      fireEvent.keyUp(textarea, { key: 'End' });
      expect(onKeyUp).toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      fireEvent.keyUp(textarea, { key: 'a' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('takes the list name from labels', async () => {
      const user = userEvent.setup();
      render(<Harness labels={{ suggestions: 'People' }} />);
      await user.type(box(), '@');
      expect(screen.getByRole('listbox', { name: 'People' })).toBeInTheDocument();
    });
  });

  describe('primitive: keyboard', () => {
    it('ArrowDown and ArrowUp move the active option, skip disabled ones and wrap', async () => {
      const user = userEvent.setup();
      render(<Harness id="c" />);
      await user.type(box(), '@');
      await user.keyboard('{ArrowDown}');
      expect(box()).toHaveAttribute('aria-activedescendant', 'c-option-1');
      expect(screen.getByRole('option', { name: 'Jamie Chen' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await user.keyboard('{ArrowDown}');
      expect(box()).toHaveAttribute('aria-activedescendant', 'c-option-3');
      await user.keyboard('{ArrowDown}');
      expect(box()).toHaveAttribute('aria-activedescendant', 'c-option-0');
      await user.keyboard('{ArrowUp}');
      expect(box()).toHaveAttribute('aria-activedescendant', 'c-option-3');
    });

    it('Enter picks: trigger and query become "@value " and the caret sits after it', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const onMention = jest.fn();
      render(<Harness initial="Hi  there" onChange={onChange} onMention={onMention} />);
      const textarea = box();
      await user.click(textarea);
      textarea.setSelectionRange(3, 3);
      await user.keyboard('@ja');
      expect(textarea).toHaveValue('Hi @ja there');
      await user.keyboard('{Enter}');
      expect(onChange).toHaveBeenLastCalledWith('Hi @jamie  there');
      expect(onMention).toHaveBeenCalledWith(people[1], '@');
      expect(textarea).toHaveValue('Hi @jamie  there');
      expect(textarea.selectionStart).toBe(10);
      expect(textarea.selectionEnd).toBe(10);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(textarea).toHaveFocus();
    });

    it('Tab picks too, and focus stays in the textarea', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Harness />
          <button type="button">Next</button>
        </>,
      );
      await user.type(box(), '@al');
      await user.tab();
      expect(box()).toHaveValue('@alex ');
      expect(box()).toHaveFocus();
    });

    it('Escape closes the list and keeps the text; arrows then move the caret as usual', async () => {
      const user = userEvent.setup();
      const onKeyDown = jest.fn();
      render(<Harness onKeyDown={onKeyDown} />);
      await user.type(box(), '@al');
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(box()).toHaveValue('@al');
      const arrow = fireEvent.keyDown(box(), { key: 'ArrowDown' });
      expect(arrow).toBe(true);
      await user.keyboard('{Enter}');
      expect(box()).toHaveValue('@al\n');
      expect(onKeyDown).toHaveBeenCalled();
    });

    it('nothing is active or pickable when every match is disabled', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.type(box(), '@sam');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(box()).not.toHaveAttribute('aria-activedescendant');
      await user.keyboard('{ArrowDown}{Enter}');
      expect(box()).toHaveValue('@sam\n');
    });

    it("the host's onKeyDown runs first and can take the key; composition is left alone", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Harness onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()} />,
      );
      await user.type(box(), '@al');
      fireEvent.keyDown(box(), { key: 'Enter' });
      expect(box()).toHaveValue('@al');
      rerender(<Harness />);
      fireEvent.keyDown(box(), { key: 'Enter', isComposing: true });
      expect(box()).toHaveValue('@al');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('primitive: pointer and blur', () => {
    it('clicking an option picks it and keeps focus in the textarea', async () => {
      const user = userEvent.setup();
      const onMention = jest.fn();
      render(<Harness onMention={onMention} />);
      await user.type(box(), '@');
      const option = screen.getByRole('option', { name: 'Jane' });
      await user.hover(option);
      expect(option).toHaveAttribute('aria-selected', 'true');
      fireEvent.mouseDown(option);
      expect(onMention).toHaveBeenCalledWith(people[3], '@');
      expect(box()).toHaveValue('@jane ');
      expect(box()).toHaveFocus();
    });

    it('a disabled option cannot be picked or made active', async () => {
      const user = userEvent.setup();
      const onMention = jest.fn();
      render(<Harness onMention={onMention} />);
      await user.type(box(), '@');
      const option = screen.getByRole('option', { name: 'samir' });
      await user.hover(option);
      expect(option).toHaveAttribute('aria-selected', 'false');
      fireEvent.mouseDown(option);
      expect(onMention).not.toHaveBeenCalled();
      expect(box()).toHaveValue('@');
    });

    it('blur closes the list', async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();
      render(
        <>
          <Harness onBlur={onBlur} />
          <button type="button">Next</button>
        </>,
      );
      await user.type(box(), '@');
      await user.click(screen.getByRole('button', { name: 'Next' }));
      expect(onBlur).toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('primitive: states and pass-through', () => {
    it('disabled: not editable and the list never opens', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness disabled initial="@" onChange={onChange} />);
      expect(box()).toBeDisabled();
      await user.type(box(), 'a');
      fireEvent.click(box());
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('read-only: focusable, announced, value fixed and the list never opens', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Harness readOnly initial="@al" onChange={onChange} />);
      await user.click(box());
      expect(box()).toHaveFocus();
      expect(box()).toHaveAttribute('aria-readonly', 'true');
      await user.keyboard('x');
      expect(onChange).not.toHaveBeenCalled();
      expect(box()).toHaveValue('@al');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('required sets aria-required; invalid sets aria-invalid', () => {
      const { rerender } = render(<Harness />);
      expect(box()).not.toHaveAttribute('aria-required');
      expect(box()).not.toHaveAttribute('aria-invalid');
      rerender(<Harness required invalid />);
      expect(box()).toHaveAttribute('aria-required', 'true');
      expect(box()).toHaveAttribute('aria-invalid', 'true');
    });

    it('passes rows, placeholder, variant, textareaSize, name, className, data-testid and aria-describedby', () => {
      render(
        <Harness
          rows={3}
          placeholder="Write"
          variant="ghost"
          textareaSize="lg"
          name="comment"
          className="mine"
          data-testid="m"
          aria-describedby="hint"
        />,
      );
      const textarea = box();
      expect(textarea).toHaveAttribute('rows', '3');
      expect(textarea).toHaveAttribute('placeholder', 'Write');
      expect(textarea).toHaveAttribute('data-variant', 'ghost');
      expect(textarea).toHaveAttribute('data-textarea-size', 'lg');
      expect(textarea).toHaveAttribute('name', 'comment');
      expect(textarea).toHaveClass('mine');
      expect(textarea).toHaveAttribute('data-testid', 'm');
      expect(textarea).toHaveAttribute('aria-describedby', 'hint');
    });

    it('forwards an object ref and a callback ref to the textarea, which carries the id', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      const { unmount } = render(<MentionsPrimitive ref={ref} id="c" aria-label="Comment" />);
      expect(ref.current).toBe(document.getElementById('c'));
      unmount();
      const callback = jest.fn();
      render(<MentionsPrimitive ref={callback} aria-label="Comment" />);
      expect(callback).toHaveBeenCalledWith(box());
      expect(box().id).toMatch(/^oui-mentions-/);
    });
  });

  describe('chrome layer', () => {
    it('stays compatible with the overview usage', () => {
      render(
        <Mentions
          label="Comment"
          value="@alex "
          placeholder="Write a comment..."
          rows={3}
          onChange={() => undefined}
        />,
      );
      expect(screen.getByLabelText('Comment')).toHaveValue('@alex ');
      expect(screen.getByLabelText('Comment')).toHaveAttribute('rows', '3');
    });

    it('labels the textarea and describes it with the description', () => {
      render(<Mentions id="c" label="Comment" description="Type @" required />);
      const textarea = screen.getByRole('textbox', { name: /Comment/ });
      expect(textarea).toHaveAttribute('id', 'c');
      expect(textarea).toHaveAttribute('aria-describedby', 'c-description');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('shows the error as an alert, marks the textarea invalid and keeps a host aria-describedby', () => {
      render(<Mentions id="c" label="Comment" error="Write something" aria-describedby="extra" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Write something');
      expect(box()).toHaveAttribute('aria-invalid', 'true');
      expect(box()).toHaveAttribute('aria-describedby', 'extra c-error');
    });

    it('forwards the ref and generates an id when none is given', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Mentions ref={ref} label="Comment" layout="horizontal" />);
      expect(ref.current).toBe(screen.getByLabelText('Comment'));
      expect(ref.current?.id).toMatch(/^oui-mentions-/);
    });

    it('generic: onMention receives the original extended option by reference', async () => {
      const user = userEvent.setup();
      const onMention = jest.fn<void, [MemberOption, string]>();
      const onChange = jest.fn();
      render(
        <Mentions<MemberOption>
          {...mentionsPropsFactory({ value: undefined })}
          onMention={onMention}
          onChange={onChange}
        />,
      );
      await user.type(screen.getByLabelText('Comment'), '@jamie{Enter}');
      expect(onMention.mock.calls[0][0]).toBe(SAMPLE_MEMBERS[1]);
      expect(onMention.mock.calls[0][0].memberId).toBe(2);
      expect(onChange).toHaveBeenLastCalledWith('@jamie ');
    });
  });
});
