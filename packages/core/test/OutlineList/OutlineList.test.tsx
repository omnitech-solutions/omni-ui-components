import '@testing-library/jest-dom';

import {
  DEFAULT_OUTLINE_LIST_LABELS,
  type OutlineItem,
  OutlineList,
} from '@oc-tech/omni-ui-components/OutlineList';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  OutlineListDemo,
  outlineListPropsFactory,
  outlineListVariants,
  outlineQuestions,
} from 'factories/omni-ui-components/OutlineList/OutlineList.factories';
import * as React from 'react';
import { expectTypeOf } from 'vitest';

const rowsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="outline-list-row"]'));
const numbersOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="outline-list-number"]')).map(
    (node) => node.textContent,
  );
const labelsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="outline-list-label"]')).map(
    (node) => node.textContent,
  );

describe('omni-ui-components/OutlineList', () => {
  it('draws a numbered button per item in the order given, named by its label, with the title as the list name', () => {
    const { container } = render(
      <OutlineList {...outlineListPropsFactory({ order: 'as-given', defaultValue: null })} />,
    );
    const list = screen.getByRole('list', { name: 'Questions' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(numbersOf(container)).toEqual(['1', '2', '3', '4']);
    expect(labelsOf(container)).toEqual(outlineQuestions.map((question) => question.label));
    const row = screen.getByRole('button', { name: 'Microservice or monolith?' });
    expect(row).toHaveAttribute('type', 'button');
    expect(row).toHaveAttribute('title', 'Microservice or monolith?');
    expect(container.querySelector('[data-slot="outline-list-header"]')).toHaveTextContent(
      'Questionsnewest first',
    );
    expect(container.querySelector('[aria-current]')).toBeNull();
  });

  it('reversed draws the last item first and keeps the numbers of the order given', () => {
    const { container } = render(<OutlineList {...outlineListPropsFactory()} />);
    expect(numbersOf(container)).toEqual(['4', '3', '2', '1']);
    expect(labelsOf(container)[0]).toBe('Data consistency across services');
    expect(labelsOf(container)[3]).toBe('Tell me about yourself');
  });

  it('an item number of its own replaces the position', () => {
    const { container } = render(
      <OutlineList
        items={[
          { id: 'a', label: 'Warm-up', number: 'A' },
          { id: 'b', label: 'Design', number: 7 },
          { id: 'c', label: 'Wrap-up' },
        ]}
      />,
    );
    expect(numbersOf(container)).toEqual(['A', '7', '3']);
  });

  it('marks the chosen row with aria-current: defaultValue first, then the row that is pressed (uncontrolled)', async () => {
    const onValueChange = vi.fn();
    render(<OutlineList {...outlineListPropsFactory({ onValueChange })} />);
    const second = screen.getByRole('button', { name: 'Microservice or monolith?' });
    const first = screen.getByRole('button', { name: 'Tell me about yourself' });
    expect(second).toHaveAttribute('aria-current', 'true');
    expect(first).not.toHaveAttribute('aria-current');
    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(second).not.toHaveAttribute('aria-current');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![0]).toBe(outlineQuestions[0]);
  });

  it('controlled: value decides the chosen row, a press only reports, and null chooses none', async () => {
    const onValueChange = vi.fn();
    const props = outlineListPropsFactory({ onValueChange, defaultValue: 'q1' });
    const { rerender, container } = render(<OutlineList {...props} value="q3" />);
    const third = screen.getByRole('button', {
      name: 'How would you migrate a monolith without a freeze?',
    });
    expect(third).toHaveAttribute('aria-current', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Tell me about yourself' }));
    expect(onValueChange.mock.calls[0]![0]).toBe(outlineQuestions[0]);
    expect(third).toHaveAttribute('aria-current', 'true');
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
    rerender(<OutlineList {...props} value="q1" />);
    expect(screen.getByRole('button', { name: 'Tell me about yourself' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    rerender(<OutlineList {...props} value={null} />);
    expect(container.querySelector('[aria-current]')).toBeNull();
  });

  it('the live row is marked data-state="live", green, and says so after its meta; a live row with no meta says only the word', () => {
    const { container } = render(
      <OutlineList
        labels={{ live: 'now' }}
        onValueChange={() => undefined}
        items={[
          { id: 'a', label: 'Asked', meta: '11:46', state: 'live' },
          { id: 'b', label: 'Bare', state: 'live' },
          { id: 'c', label: 'Quiet', meta: '11:50', state: 'default' },
          { id: 'd', label: 'Nothing under it' },
        ]}
      />,
    );
    const [asked, bare, quiet, nothing] = rowsOf(container);
    expect(asked).toHaveAttribute('data-state', 'live');
    expect(asked!.className).toContain('--oui-tone-success-bg');
    expect(asked!.querySelector('[data-slot="outline-list-meta"]')).toHaveTextContent(
      '11:46 · now',
    );
    expect(asked!.querySelector('[data-slot="outline-list-label"]')!.className).toContain(
      '--oui-tone-success-fg',
    );
    expect(bare!.querySelector('[data-slot="outline-list-meta"]')!.textContent).toBe('now');
    expect(quiet).toHaveAttribute('data-state', 'default');
    expect(quiet!.querySelector('[data-slot="outline-list-meta"]')!.textContent).toBe('11:50');
    expect(nothing!.querySelector('[data-slot="outline-list-meta"]')).toBeNull();
    expect(DEFAULT_OUTLINE_LIST_LABELS).toEqual({ list: 'Outline', live: 'live' });
  });

  it('live wins over chosen in colour, and the chosen row still carries aria-current', () => {
    const { container } = render(<OutlineList {...outlineListPropsFactory({ value: 'q4' })} />);
    const live = rowsOf(container)[0]!;
    expect(live).toHaveAttribute('aria-current', 'true');
    expect(live).toHaveAttribute('data-state', 'live');
    expect(live.className).toContain('--oui-tone-success-fg');
    const chosen = render(<OutlineList {...outlineListPropsFactory({ value: 'q2' })} />).container;
    const row = chosen.querySelector<HTMLElement>('[aria-current="true"]')!;
    expect(row.className).toContain('border-[color:var(--oui-foreground)]');
    expect(row.querySelector('[data-slot="outline-list-number"]')!.className).toContain(
      'text-[color:var(--oui-foreground)]',
    );
  });

  it('without onValueChange the rows are not pressable: no buttons, no aria-current, the content is still there', () => {
    const { container } = render(
      <OutlineList {...outlineListPropsFactory({ onValueChange: undefined })} />,
    );
    expect(screen.queryByRole('button')).toBeNull();
    const rows = rowsOf(container);
    expect(rows).toHaveLength(4);
    rows.forEach((row) => {
      expect(row.tagName).toBe('DIV');
      expect(row).not.toHaveAttribute('aria-current');
      expect(row).not.toHaveAttribute('tabindex');
    });
    expect(rows[0]).toHaveAttribute('data-state', 'live');
    expect(rows[0]).toHaveTextContent('Data consistency across services');
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('ArrowDown, ArrowUp, Home and End move the focus between rows and stop at the ends; other keys do nothing', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<OutlineList {...outlineListPropsFactory({ onValueChange })} />);
    const rows = rowsOf(container);
    rows[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(rows[1]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(rows[3]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(rows[3]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(rows[2]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(rows[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(rows[0]).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(rows[3]).toHaveFocus();
    await userEvent.keyboard('a');
    expect(rows[3]).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    // A handled key is taken (the list does not scroll); one at the end, or any other key, is left alone.
    expect(fireEvent.keyDown(rows[1]!, { key: 'ArrowDown' })).toBe(false);
    expect(fireEvent.keyDown(rows[3]!, { key: 'ArrowDown' })).toBe(true);
    expect(fireEvent.keyDown(rows[1]!, { key: 'Tab' })).toBe(true);
  });

  it('Enter on a focused row chooses it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<OutlineList {...outlineListPropsFactory({ onValueChange })} />);
    rowsOf(container)[0]!.focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange.mock.calls[0]![0]).toBe(outlineQuestions[2]);
  });

  it('an extended item reaches onValueChange by reference with its own fields typed', async () => {
    type Step = OutlineItem & { durationMs: number };
    const steps: Step[] = [
      { id: 's1', label: 'Read the brief', durationMs: 1200 },
      { id: 's2', label: 'Draft the answer', durationMs: 5400 },
    ];
    const onValueChange = vi.fn((step: Step) => {
      expectTypeOf(step.durationMs).toEqualTypeOf<number>();
      expectTypeOf(step).toEqualTypeOf<Step>();
    });
    render(<OutlineList<Step> items={steps} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Draft the answer' }));
    expect(onValueChange.mock.calls[0]![0]).toBe(steps[1]);
    expect(steps[1]).toEqual({ id: 's2', label: 'Draft the answer', durationMs: 5400 });
  });

  it('a label that is not a string takes its accessible name and tooltip from name', () => {
    render(
      <OutlineList
        onValueChange={() => undefined}
        items={[
          { id: 'a', label: <em>Trade-offs</em>, name: 'Trade-offs of each' },
          { id: 'b', label: <strong>Unnamed</strong> },
          { id: 'c', label: 'Shown', name: 'Spoken' },
        ]}
      />,
    );
    const named = screen.getByRole('button', { name: 'Trade-offs of each' });
    expect(named).toHaveAttribute('title', 'Trade-offs of each');
    expect(named).toHaveTextContent('Trade-offs');
    const unnamed = screen.getByText('Unnamed').closest('button')!;
    expect(unnamed).not.toHaveAttribute('aria-label');
    expect(unnamed).not.toHaveAttribute('title');
    expect(screen.getByRole('button', { name: 'Spoken' })).toHaveTextContent('Shown');
  });

  it('the header shows with a title or a hint alone, and is left out with neither; the list name falls back to the label', () => {
    const items = [{ id: 'a', label: 'One' }];
    const { container, rerender } = render(<OutlineList items={items} />);
    expect(container.querySelector('[data-slot="outline-list-header"]')).toBeNull();
    expect(screen.getByRole('list', { name: 'Outline' })).toBeInTheDocument();
    rerender(<OutlineList items={items} labels={{ list: 'Steps' }} hint="3 of 9" />);
    expect(container.querySelector('[data-slot="outline-list-header"]')).toHaveTextContent(
      '3 of 9',
    );
    expect(screen.getByRole('list', { name: 'Steps' })).toBeInTheDocument();
    rerender(<OutlineList items={items} title={<b>Run</b>} />);
    expect(container.querySelector('[data-slot="outline-list-header"]')).toHaveTextContent('Run');
    expect(screen.getByRole('list', { name: 'Outline' })).toBeInTheDocument();
  });

  it('with no items it shows empty in place of the list, under the header', () => {
    const { container } = render(
      <OutlineList items={[]} title="Questions" empty="Questions appear here as they are asked." />,
    );
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByText('Questions appear here as they are asked.')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="outline-list-header"]')).toHaveTextContent(
      'Questions',
    );
  });

  it('forwards its ref, className and other attributes to the root', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <OutlineList
        ref={ref}
        items={[{ id: 'a', label: 'One' }]}
        className="w-64"
        data-testid="outline"
      />,
    );
    const root = screen.getByTestId('outline');
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute('data-slot', 'outline-list');
    expect(root).toHaveClass('w-64', 'flex');
  });

  it('the demo keeps the chosen row and reports the item; readOnly leaves the buttons out; every variant renders', async () => {
    const onAction = vi.fn();
    const { unmount } = render(<OutlineListDemo onAction={onAction} />);
    const first = screen.getByRole('button', { name: 'Tell me about yourself' });
    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(onAction).toHaveBeenCalledWith('value', outlineQuestions[0]);
    unmount();
    const readOnly = render(<OutlineListDemo readOnly />);
    expect(screen.queryByRole('button')).toBeNull();
    readOnly.unmount();
    for (const variant of outlineListVariants) {
      const { container, unmount: done } = render(
        <OutlineList {...outlineListPropsFactory(variant.args)} />,
      );
      expect(container.querySelector('[data-slot="outline-list"]')).toBeInTheDocument();
      done();
    }
  });
});
