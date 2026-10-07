import '@testing-library/jest-dom';

import { ConversationList } from '@oc-tech/omni-ui-components/ConversationList';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { conversationListPropsFactory } from 'factories/omni-ui-components/ConversationList/ConversationList.factories';

const nav = () => screen.getByRole('navigation', { name: 'Conversations' });
const rows = () =>
  Array.from(nav().querySelectorAll<HTMLElement>('[data-slot="conversation-row"]'));
const titleOf = (row: HTMLElement) => row.querySelector('button') as HTMLButtonElement;
const stops = () =>
  Array.from(nav().querySelectorAll<HTMLElement>('[data-slot="conversation-row"] button')).filter(
    (b) => b.getAttribute('tabindex') === '0',
  );

const setup = () =>
  render(
    <>
      <button type="button">before</button>
      <ConversationList
        {...conversationListPropsFactory({ onOpen: vi.fn(), onSearchChange: undefined })}
      />
      <button type="button">after</button>
    </>,
  );

describe('omni-ui-components/ConversationList roving tabindex', () => {
  it('has one tab stop in the rows, starting on the open row', () => {
    setup();
    expect(stops()).toHaveLength(1);
    expect(stops()[0]).toHaveTextContent('Two Sum with a hash map');
  });

  it('Up and Down move between rows and the tab stop follows', async () => {
    setup();
    const [first, second] = rows();
    titleOf(first).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(titleOf(second)).toHaveFocus();
    expect(stops()).toEqual([titleOf(second)]);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    // The list does not wrap: Up from the first row stays there.
    expect(titleOf(first)).toHaveFocus();
  });

  it('Home and End go to the first and last row', async () => {
    setup();
    titleOf(rows()[2]).focus();
    await userEvent.keyboard('{End}');
    expect(titleOf(rows()[rows().length - 1])).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(titleOf(rows()[0])).toHaveFocus();
  });

  it('Right and Left move along a row into its actions and back', async () => {
    setup();
    const row = rows()[0];
    titleOf(row).focus();
    await userEvent.keyboard('{ArrowRight}');
    const actions = Array.from(
      row.querySelectorAll<HTMLElement>('[data-slot="conversation-row-actions"] button'),
    );
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0]).toHaveFocus();
    expect(actions[0]).toHaveAttribute('tabindex', '0');
    await userEvent.keyboard('{ArrowLeft}');
    expect(titleOf(row)).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(titleOf(row)).toHaveFocus();
  });

  it('Down from an action lands on the same action of the next row', async () => {
    setup();
    const actionOf = (row: HTMLElement) =>
      row.querySelector<HTMLElement>(
        '[data-slot="conversation-row-actions"] button',
      ) as HTMLElement;
    actionOf(rows()[0]).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(actionOf(rows()[1])).toHaveFocus();
  });

  it('Tab leaves the rows and Shift+Tab returns to the last row used', async () => {
    setup();
    titleOf(rows()[1]).focus();
    await userEvent.tab();
    // Past the row actions of every row, the next tab stop is the archived or footer control, never another row.
    expect(rows().some((row) => row.contains(document.activeElement))).toBe(false);
    await userEvent.tab({ shift: true });
    expect(titleOf(rows()[1])).toHaveFocus();
  });
});
