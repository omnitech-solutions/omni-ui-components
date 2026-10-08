import '@testing-library/jest-dom';

import {
  DEFAULT_OUTLINE_LIST_LABELS,
  type OutlineItem,
  OutlineList,
  OutlineListItem,
  type OutlineRowState,
} from '@oc-tech/omni-ui-components/OutlineList';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  NextStepPanel,
  outlineListPropsFactory,
  outlineListVariants,
  StepsPanel,
  StepsWithCustomRows,
  StepsWithTags,
  steps,
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
  it('draws a numbered button per item in the order given, named by its content, with aria-label as the list name', () => {
    const { container } = render(
      <OutlineList {...outlineListPropsFactory({ order: 'as-given', defaultValue: null })} />,
    );
    const list = screen.getByRole('list', { name: 'Steps' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(numbersOf(container)).toEqual(['1', '2', '3', '4']);
    expect(labelsOf(container)).toEqual(steps.map((step) => step.label));
    const row = screen.getByRole('button', { name: /Configure/ });
    expect(row).toHaveAttribute('type', 'button');
    expect(row).toHaveAttribute('title', 'Configure');
    // The row is named by what it shows: its number, label and meta. It carries no aria-label.
    expect(row).not.toHaveAttribute('aria-label');
    expect(row).toHaveTextContent('2Configure5 min');
    expect(screen.getByRole('button', { name: /Deploy/ })).toHaveTextContent('4Deploy3 min · live');
    expect(container.querySelector('[data-slot="outline-list-header"]')).toBeNull();
    expect(container.querySelector('[aria-current]')).toBeNull();
  });

  it('reversed draws the last item first and keeps the numbers of the order given', () => {
    const { container } = render(<OutlineList {...outlineListPropsFactory()} />);
    expect(numbersOf(container)).toEqual(['4', '3', '2', '1']);
    expect(labelsOf(container)[0]).toBe('Deploy');
    expect(labelsOf(container)[3]).toBe('Install');
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
    const second = screen.getByRole('button', { name: /Configure/ });
    const first = screen.getByRole('button', { name: /Install/ });
    expect(second).toHaveAttribute('aria-current', 'true');
    expect(first).not.toHaveAttribute('aria-current');
    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(second).not.toHaveAttribute('aria-current');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]![0]).toBe(steps[0]);
  });

  it('controlled: value decides the chosen row, a press only reports, and null chooses none', async () => {
    const onValueChange = vi.fn();
    const props = outlineListPropsFactory({ onValueChange, defaultValue: 'install' });
    const { rerender, container } = render(<OutlineList {...props} value="build" />);
    const third = screen.getByRole('button', {
      name: /Build the project/,
    });
    expect(third).toHaveAttribute('aria-current', 'true');
    await userEvent.click(screen.getByRole('button', { name: /Install/ }));
    expect(onValueChange.mock.calls[0]![0]).toBe(steps[0]);
    expect(third).toHaveAttribute('aria-current', 'true');
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
    rerender(<OutlineList {...props} value="install" />);
    expect(screen.getByRole('button', { name: /Install/ })).toHaveAttribute('aria-current', 'true');
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
    const { container } = render(<OutlineList {...outlineListPropsFactory({ value: 'deploy' })} />);
    const live = rowsOf(container)[0]!;
    expect(live).toHaveAttribute('aria-current', 'true');
    expect(live).toHaveAttribute('data-state', 'live');
    expect(live.className).toContain('--oui-tone-success-fg');
    const chosen = render(
      <OutlineList {...outlineListPropsFactory({ value: 'configure' })} />,
    ).container;
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
    expect(rows[0]).toHaveTextContent('Deploy');
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
    // An arrow key is taken (the list does not scroll), at the last row too; any other key is left alone.
    expect(fireEvent.keyDown(rows[1]!, { key: 'ArrowDown' })).toBe(false);
    expect(fireEvent.keyDown(rows[3]!, { key: 'ArrowDown' })).toBe(false);
    expect(fireEvent.keyDown(rows[1]!, { key: 'Tab' })).toBe(true);
  });

  it('Enter on a focused row chooses it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<OutlineList {...outlineListPropsFactory({ onValueChange })} />);
    rowsOf(container)[0]!.focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange.mock.calls[0]![0]).toBe(steps[2]);
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
    await userEvent.click(screen.getByRole('button', { name: /Draft the answer/ }));
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
    const named = screen.getByText('Trade-offs').closest('button')!;
    expect(named).toHaveAttribute('title', 'Trade-offs of each');
    expect(named).toHaveTextContent('Trade-offs');
    const unnamed = screen.getByText('Unnamed').closest('button')!;
    expect(unnamed).not.toHaveAttribute('aria-label');
    expect(unnamed).not.toHaveAttribute('title');
    expect(screen.getByText('Shown').closest('button')).toHaveAttribute('title', 'Spoken');
  });

  it('it is the rows only: no header; the list is named by aria-label, else labels.list, else the default', () => {
    const items = [{ id: 'a', label: 'One' }];
    const { container, rerender } = render(<OutlineList items={items} />);
    expect(container.querySelector('[data-slot="outline-list"]')!.children).toHaveLength(1);
    expect(screen.getByRole('list', { name: 'Outline' })).toBeInTheDocument();
    rerender(<OutlineList items={items} labels={{ list: 'Steps' }} />);
    expect(screen.getByRole('list', { name: 'Steps' })).toBeInTheDocument();
    rerender(<OutlineList items={items} labels={{ list: 'Steps' }} aria-label="Sections" />);
    expect(screen.getByRole('list', { name: 'Sections' })).toBeInTheDocument();
  });

  it('with no items it shows empty in place of the list', () => {
    render(<OutlineList items={[]} empty="Steps appear here as they are added." />);
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByText('Steps appear here as they are added.')).toBeInTheDocument();
  });

  it('the list is one tab stop: the chosen row, else the first; the stop follows the focus', async () => {
    const { container, unmount } = render(<OutlineList {...outlineListPropsFactory()} />);
    const stops = () => rowsOf(container).map((row) => row.getAttribute('tabindex'));
    // Reversed: deploy, build, configure (chosen), install.
    expect(stops()).toEqual(['-1', '-1', '0', '-1']);
    await userEvent.tab();
    expect(rowsOf(container)[2]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(rowsOf(container)[1]).toHaveFocus();
    expect(stops()).toEqual(['-1', '0', '-1', '-1']);
    await userEvent.tab();
    expect(document.body).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(rowsOf(container)[1]).toHaveFocus();
    unmount();
    const none = render(<OutlineList {...outlineListPropsFactory({ defaultValue: null })} />);
    expect(rowsOf(none.container).map((row) => row.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
      '-1',
    ]);
  });

  it('arrow keys with a modifier are left alone', () => {
    const { container } = render(<OutlineList {...outlineListPropsFactory()} />);
    const rows = rowsOf(container);
    rows[0]!.focus();
    expect(fireEvent.keyDown(rows[0]!, { key: 'ArrowDown', altKey: true })).toBe(true);
    expect(rows[0]).toHaveFocus();
  });

  it('the rows sit in the library List and ListItem, restyled and not replaced', () => {
    const { container } = render(<OutlineList {...outlineListPropsFactory()} />);
    const list = screen.getByRole('list', { name: 'Steps' });
    expect(list.tagName).toBe('UL');
    // The List's own border and dividers are switched off by the classes the outline passes.
    expect(list).toHaveClass('divide-y-0', 'border-0', 'bg-transparent');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(item).toHaveClass('text-sm', 'p-0');
      expect(item.querySelector('[data-slot="outline-list-row"]')).not.toBeNull();
    }
    expect(container.querySelectorAll('[data-slot="outline-list-row"]')).toHaveLength(4);
  });

  it('trailing draws a node at the end of its row, inside the button, and only where given', async () => {
    render(<StepsWithTags />);
    const tagged = screen.getByRole('button', { name: /Configure/ });
    const slot = tagged.querySelector('[data-slot="outline-list-trailing"]')!;
    expect(slot).toHaveTextContent('new');
    expect(tagged.lastElementChild).toBe(slot);
    expect(
      screen
        .getByRole('button', { name: /Install/ })
        .querySelector('[data-slot="outline-list-trailing"]'),
    ).toBeNull();
    await userEvent.click(tagged);
    expect(tagged).toHaveAttribute('aria-current', 'true');
    expect(
      within(screen.getByRole('region', { name: 'Steps' })).getByText('/docs/configure'),
    ).toBeInTheDocument();
  });

  it('renderItem draws each row from the item, its state and select; select chooses the item and reports it', async () => {
    type Step = OutlineItem & { href: string };
    const items: Step[] = [
      { id: 'a', label: 'One', href: '/one' },
      { id: 'b', label: 'Two', href: '/two', state: 'live' },
    ];
    const seen: [Step, OutlineRowState][] = [];
    const onValueChange = vi.fn();
    render(
      <OutlineList<Step>
        items={items}
        defaultValue="a"
        order="reversed"
        onValueChange={onValueChange}
        renderItem={(item, state, select) => {
          expectTypeOf(item).toEqualTypeOf<Step>();
          seen.push([item, state]);
          return (
            <a data-slot="outline-list-row" href={item.href} onClick={select}>
              {state.number}. {item.label} {state.current ? '(on show)' : ''}
            </a>
          );
        }}
      />,
    );
    expect(seen[0]![0]).toBe(items[1]);
    expect(seen[0]![1]).toEqual({ number: 2, current: false, live: true });
    expect(seen[1]![1]).toEqual({ number: 1, current: true, live: false });
    expect(screen.queryByRole('button')).toBeNull();
    const link = screen.getByRole('link', { name: '2. Two' });
    expect(link).toHaveAttribute('href', '/two');
    link.addEventListener('click', (event) => event.preventDefault());
    await userEvent.click(link);
    expect(onValueChange.mock.calls[0]![0]).toBe(items[1]);
    expect(screen.getByRole('link', { name: '2. Two (on show)' })).toBeInTheDocument();
  });

  it('renderItem returning OutlineListItem keeps the row, its roving tab stop and the choice, with the extra class', async () => {
    render(<StepsWithCustomRows />);
    const rows = screen.getAllByRole('button');
    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    const optional = screen.getByRole('button', { name: /Build the project/ });
    expect(optional).toHaveClass('italic', 'flex');
    expect(rows[0]).not.toHaveClass('italic');
    expect(rows[0]).toHaveAttribute('aria-current', 'true');
    expect(rows[3]).toHaveAttribute('data-state', 'live');
    await userEvent.click(optional);
    expect(optional).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('/docs/build')).toBeInTheDocument();
    optional.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(rows[3]).toHaveFocus();
  });

  it('select from renderItem chooses the item even without onValueChange', async () => {
    render(
      <OutlineList
        items={[
          { id: 'a', label: 'One' },
          { id: 'b', label: 'Two' },
        ]}
        renderItem={(item, state, select) => (
          <OutlineListItem item={item} {...state} onSelect={select} />
        )}
      />,
    );
    const two = screen.getByRole('button', { name: /Two/ });
    await userEvent.click(two);
    expect(two).toHaveAttribute('aria-current', 'true');
  });

  it('OutlineListItem on its own: a button with onSelect that hands back the item, plain without; number, current and live as given', async () => {
    type Step = OutlineItem & { href: string };
    const step: Step = { id: 's', label: 'Configure', meta: '5 min', href: '/c', number: 9 };
    const onSelect = vi.fn((item: Step) => {
      expectTypeOf(item.href).toEqualTypeOf<string>();
    });
    const { rerender, container } = render(
      <OutlineListItem<Step> item={step} onSelect={onSelect} />,
    );
    const row = screen.getByRole('button', { name: /Configure/ });
    expect(row).toHaveAttribute('data-slot', 'outline-list-row');
    expect(row).toHaveAttribute('data-state', 'default');
    expect(row).not.toHaveAttribute('aria-current');
    expect(numbersOf(container)).toEqual(['9']);
    expect(screen.queryByRole('list')).toBeNull();
    await userEvent.click(row);
    expect(onSelect.mock.calls[0]![0]).toBe(step);
    rerender(
      <OutlineListItem<Step>
        item={step}
        number={2}
        current
        live
        labels={{ live: 'now' }}
        className="w-64"
        onSelect={onSelect}
      />,
    );
    expect(row).toHaveAttribute('aria-current', 'true');
    expect(row).toHaveAttribute('data-state', 'live');
    expect(row).toHaveClass('w-64');
    expect(numbersOf(container)).toEqual(['2']);
    expect(container.querySelector('[data-slot="outline-list-meta"]')).toHaveTextContent(
      '5 min · now',
    );
    rerender(
      <OutlineListItem item={{ id: 'p', label: 'Plain', state: 'live' }} className="w-64" />,
    );
    expect(screen.queryByRole('button')).toBeNull();
    const plain = container.querySelector<HTMLElement>('[data-slot="outline-list-row"]')!;
    expect(plain.tagName).toBe('DIV');
    expect(plain).toHaveAttribute('data-state', 'live');
    expect(plain).toHaveClass('w-64');
    expect(numbersOf(container)).toEqual(['']);
    expect(container.querySelector('[data-slot="outline-list-meta"]')).toHaveTextContent('live');
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

  it('the examples: the panel reads the chosen step, the lone row opens, and every variant renders', async () => {
    const { unmount } = render(<StepsPanel />);
    const panel = screen.getByRole('region', { name: 'Steps' });
    const first = within(panel).getByRole('button', { name: /Install/ });
    expect(within(panel).getByRole('button', { name: /Configure/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await userEvent.click(first);
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(within(panel).getByText('/docs/install')).toBeInTheDocument();
    unmount();
    const lone = render(<NextStepPanel />);
    const row = screen.getByRole('button', { name: /Configure/ });
    expect(screen.getByText('not opened')).toBeInTheDocument();
    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText('/docs/configure')).toBeInTheDocument();
    lone.unmount();
    for (const variant of outlineListVariants) {
      const { container, unmount: done } = render(
        <OutlineList {...outlineListPropsFactory(variant.args)} />,
      );
      expect(container.querySelector('[data-slot="outline-list"]')).toBeInTheDocument();
      done();
    }
  });
});
