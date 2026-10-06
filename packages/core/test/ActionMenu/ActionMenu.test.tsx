import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ActionMenu, type ActionMenuProps } from '@oc-tech/omni-ui-components/ActionMenu';
import {
  actionMenuPropsFactory,
  actionMenuVariants,
  answerStyleMenu,
  captureModeMenu,
  micLostMenu,
  screenPermissionMenu,
  shortcutsMenu,
} from 'factories/omni-ui-components/ActionMenu/ActionMenu.factories';

const open = async (props: Partial<ActionMenuProps> = {}) => {
  const user = userEvent.setup();
  const view = render(<ActionMenu {...actionMenuPropsFactory(props)} trigger={<button>Open</button>} />);
  await user.click(screen.getByRole('button', { name: 'Open' }));
  return { user, ...view };
};

describe('omni-ui-components/ActionMenu', () => {
  describe('roles and sections', () => {
    it('opens a labelled menu with radio rows and aria-checked from `checked`', async () => {
      await open();
      expect(screen.getByRole('menu', { name: 'Capture options' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemradio', { name: /^Manual/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('menuitemradio', { name: /^Auto/ })).toHaveAttribute('aria-checked', 'false');
    });

    it('groups rows under their section labels and divides sections', async () => {
      await open();
      expect(screen.getByRole('group', { name: 'When to analyse' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Display' })).toBeInTheDocument();
      expect(document.querySelectorAll('[data-slot="action-menu-divider"]').length).toBe(2);
    });

    it('uses plain menuitem rows for sections without a checked state and checkbox rows for `multiple`', async () => {
      await open({
        sections: [
          { id: 'a', items: [{ id: 'one', label: 'One' }] },
          {
            id: 'b',
            selection: 'multiple',
            items: [{ id: 'two', label: 'Two', checked: true }],
          },
        ],
      });
      expect(screen.getByRole('menuitem', { name: 'One' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemcheckbox', { name: 'Two' })).toHaveAttribute('aria-checked', 'true');
    });

    it('renders the title and the Technical / Conversation group labels of the answer-style menu', async () => {
      await open({ ...answerStyleMenu });
      expect(screen.getByText('Answer style for new work')).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Technical' })).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Conversation' })).toBeInTheDocument();
      expect(
        screen.getByRole('menuitemradio', {
          name: 'Data Structures & Algorithms',
        }),
      ).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('fixed check column', () => {
    it('keeps an empty column on unchecked rows so labels line up', async () => {
      await open({ ...answerStyleMenu });
      const rows = Array.from(document.querySelectorAll('[data-slot="action-menu-item"]'));
      expect(rows.length).toBe(9);
      rows.forEach((row) => expect(row.querySelector('[data-slot="action-menu-column"]')).not.toBeNull());
      expect(document.querySelectorAll('[data-slot="action-menu-check"]').length).toBe(1);
    });

    it('shows the row icon in the column when there is no checked state', async () => {
      await open({ ...captureModeMenu });
      const add = screen.getByRole('menuitem', {
        name: /Add screen to this problem/,
      });
      expect(add.querySelector('[data-slot="action-menu-column"] svg')).not.toBeNull();
    });
  });

  describe('rows: description, shortcut, tone, disabled reason', () => {
    it('shows descriptions and shortcuts as plain mono glyphs', async () => {
      await open();
      const manual = screen.getByRole('menuitemradio', { name: /^Manual/ });
      expect(within(manual).getByText('Analyse only when you press it')).toBeInTheDocument();
      expect(within(manual).getByText('⌘⇧S')).toHaveClass('font-mono');
      expect(screen.getByText('⌥⇧U')).toBeInTheDocument();
    });

    it('marks a disabled row aria-disabled, shows its reason as the second line and does not select it', async () => {
      const onSelect = vi.fn();
      const rowSelect = vi.fn();
      const { user } = await open({
        onSelect,
        sections: [
          {
            id: 's',
            items: [
              {
                id: 'add',
                label: 'Add screen',
                disabledReason: 'Available once a problem is open',
                onSelect: rowSelect,
              },
            ],
          },
        ],
      });
      const item = screen.getByRole('menuitem', { name: /Add screen/ });
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(within(item).getByText('Available once a problem is open')).toBeInTheDocument();
      await user.click(item);
      expect(rowSelect).not.toHaveBeenCalled();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('colours a danger row with the destructive tone', async () => {
      const user = userEvent.setup();
      render(<ActionMenu {...actionMenuPropsFactory({ ...shortcutsMenu })} defaultOpen trigger={<button>Open</button>} />);
      expect(user).toBeDefined();
      const row = screen.getByText('Clear session memory').closest('[data-slot="action-menu-item"]');
      expect(row).toHaveAttribute('data-tone', 'danger');
      expect(row).toHaveClass('text-[color:var(--oui-tone-danger-fg)]');
    });
  });

  describe('callbacks', () => {
    it('calls the row onSelect then the menu onSelect(itemId) once, and closes', async () => {
      const calls: string[] = [];
      const { user } = await open({
        onSelect: (id) => calls.push(`menu:${id}`),
        sections: [
          {
            id: 's',
            items: [
              {
                id: 'auto',
                label: 'Auto',
                onSelect: () => calls.push('row:auto'),
              },
            ],
          },
        ],
      });
      await user.click(screen.getByRole('menuitem', { name: 'Auto' }));
      expect(calls).toEqual(['row:auto', 'menu:auto']);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('reports open and close through onOpenChange', async () => {
      const onOpenChange = vi.fn();
      const { user } = await open({ onOpenChange });
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      await user.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('is controllable through `open`', () => {
      render(<ActionMenu {...actionMenuPropsFactory()} open trigger={<button>Open</button>} />);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('keyboard', () => {
    it('moves with the arrow keys, selects with Enter and closes with Escape', async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      render(<ActionMenu {...actionMenuPropsFactory({ onSelect })} trigger={<button>Open</button>} />);
      screen.getByRole('button', { name: 'Open' }).focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('menu')).toBeInTheDocument();
      // Opening from the keyboard focuses the first row.
      expect(screen.getByRole('menuitemradio', { name: /^Manual/ })).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitemradio', { name: /^Auto/ })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledWith('auto', expect.objectContaining({ id: 'auto' }));
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('skips disabled rows when moving', async () => {
      const user = userEvent.setup();
      render(
        <ActionMenu
          {...actionMenuPropsFactory({
            sections: [
              {
                id: 's',
                items: [
                  { id: 'a', label: 'A' },
                  { id: 'b', label: 'B', disabled: true },
                  { id: 'c', label: 'C' },
                ],
              },
            ],
          })}
          trigger={<button>Open</button>}
        />,
      );
      screen.getByRole('button', { name: 'Open' }).focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('menuitem', { name: 'A' })).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'C' })).toHaveFocus();
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      const { user } = await open();
      await user.keyboard('{Escape}');
      expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
    });
  });

  describe('notice and hint', () => {
    it('renders the leading notice (status + title + detail) above the sections', async () => {
      await open({ ...micLostMenu });
      const notice = document.querySelector('[data-slot="action-menu-notice"]') as HTMLElement;
      expect(notice).toHaveAttribute('data-tone', 'warning');
      expect(within(notice).getByText('Microphone lost')).toBeInTheDocument();
      expect(within(notice).getByText('Trying again · attempt 2')).toBeInTheDocument();
      const scroll = document.querySelector('[data-slot="action-menu-scroll"]') as HTMLElement;
      expect(scroll.firstElementChild).toBe(notice);
    });

    it('runs the notice action and closes the menu', async () => {
      const onSelect = vi.fn();
      const { user } = await open({
        ...screenPermissionMenu,
        notice: {
          ...screenPermissionMenu.notice!,
          action: { label: 'Open System Settings', onSelect },
        },
      });
      await user.click(screen.getByRole('menuitem', { name: 'Open System Settings' }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('renders a notice without an action', async () => {
      await open({ notice: { tone: 'danger', title: 'Offline' } });
      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="action-menu-notice-action"]')).toBeNull();
    });

    it('renders the trailing hint row with its keys, pinned outside the scroll area', async () => {
      await open({ ...answerStyleMenu });
      const hint = document.querySelector('[data-slot="action-menu-hint"]') as HTMLElement;
      expect(within(hint).getByText('Previous / next')).toBeInTheDocument();
      expect(within(hint).getByText('⌘↑ ⌘↓')).toBeInTheDocument();
      expect(document.querySelector('[data-slot="action-menu-scroll"]')?.contains(hint)).toBe(false);
    });
  });

  describe('height and placement', () => {
    it('caps the height to the room left in the viewport and scrolls the rows inside', async () => {
      await open({ ...answerStyleMenu });
      const menu = screen.getByRole('menu');
      expect(menu.style.maxHeight).toBe('var(--radix-dropdown-menu-content-available-height)');
      expect(document.querySelector('[data-slot="action-menu-scroll"]')).toHaveClass('overflow-y-auto');
    });

    it('applies an explicit maxHeight as a cap that still respects the viewport', async () => {
      await open({ ...answerStyleMenu, maxHeight: 160 });
      expect(screen.getByRole('menu').style.maxHeight).toBe('min(160px, var(--radix-dropdown-menu-content-available-height))');
    });

    it('is border-box and capped with the viewport collision padding so it never extends past a short window', async () => {
      await open({ ...answerStyleMenu });
      const menu = screen.getByRole('menu');
      expect(menu).toHaveClass('box-border');
      expect(menu.style.maxHeight).toBe('var(--radix-dropdown-menu-content-available-height)');
      expect(document.querySelector('[data-slot="action-menu-hint"]')).not.toBeNull();
    });

    it('sets the width (number = px)', async () => {
      await open({ width: 320 });
      expect(screen.getByRole('menu').style.width).toBe('320px');
    });

    it('renders in a portal on document.body by default', async () => {
      const { container } = await open();
      expect(container.querySelector('[role="menu"]')).toBeNull();
      expect(document.body.querySelector('[role="menu"]')).not.toBeNull();
    });

    it("can render inside the trigger's own DOM with portal={false}", async () => {
      const { container } = await open({ portal: false });
      expect(container.querySelector('[role="menu"]')).not.toBeNull();
    });

    it('can render into a caller-supplied container', async () => {
      const root = document.createElement('div');
      root.id = 'app-root';
      document.body.appendChild(root);
      await open({ container: root });
      expect(root.querySelector('[role="menu"]')).not.toBeNull();
      root.remove();
    });
  });

  describe('kind="list"', () => {
    it('renders a read-only grouped reference list in a dialog, not a menu', async () => {
      const user = userEvent.setup();
      render(<ActionMenu {...actionMenuPropsFactory({ ...shortcutsMenu })} trigger={<button>Shortcuts</button>} />);
      await user.click(screen.getByRole('button', { name: 'Shortcuts' }));
      expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
      const groups = screen.getAllByRole('group').map((group) => group.getAttribute('aria-label'));
      expect(groups).toEqual(['Capture', 'Listening', 'View', 'Answer style', 'App']);
    });

    it('lists glyph chords and puts the destructive row last', async () => {
      render(<ActionMenu {...actionMenuPropsFactory({ ...shortcutsMenu })} defaultOpen trigger={<button>Shortcuts</button>} />);
      expect(screen.getByText('⌘⇧S')).toBeInTheDocument();
      expect(screen.getByText('⌥R')).toBeInTheDocument();
      expect(screen.getByText('⌘↑ ⌘↓')).toBeInTheDocument();
      const rows = Array.from(document.querySelectorAll('[data-slot="action-menu-item"]'));
      expect(rows[rows.length - 1]).toHaveAttribute('data-tone', 'danger');
      expect(document.body.textContent).not.toMatch(/Alt\+|Cmd/);
    });
  });

  it('every factory variant renders when open', () => {
    actionMenuVariants.forEach((variant) => {
      const { unmount } = render(<ActionMenu {...actionMenuPropsFactory(variant.args)} defaultOpen trigger={<button>Open</button>} />);
      expect(document.querySelector('[data-slot="action-menu"]')).not.toBeNull();
      unmount();
    });
  });
});

describe('omni-ui-components/ActionMenu select mode and focus', () => {
  const sections = (value: string) => [
    {
      id: 'mode',
      label: 'Mode',
      value,
      items: [
        { id: 'manual', label: 'Manual' },
        { id: 'auto', label: 'Auto' },
      ],
    },
  ];

  const Controlled = ({ onValueChange, onSelect }: { onValueChange?: (s: string, i: string) => void; onSelect?: (id: string) => void }) => {
    const [value, setValue] = React.useState('manual');
    return (
      <ActionMenu
        {...actionMenuPropsFactory()}
        trigger={<button>Open</button>}
        label="Mode"
        sections={sections(value)}
        onSelect={(id) => onSelect?.(id)}
        onValueChange={(sectionId, id) => {
          setValue(id);
          onValueChange?.(sectionId, id);
        }}
      />
    );
  };

  it('derives checked from section.value and treats the section as single-select', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menuitemradio', { name: 'Manual' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Auto' })).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onValueChange(sectionId, itemId) and onSelect exactly once per choice, and the controlled value moves the check', async () => {
    const onValueChange = vi.fn();
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Controlled onValueChange={onValueChange} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Auto' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('mode', 'auto');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menuitemradio', { name: 'Auto' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Manual' })).toHaveAttribute('aria-checked', 'false');
  });

  it('a select across several groups (answer style) checks only the chosen row', async () => {
    const user = userEvent.setup();
    const Select = () => {
      const [value, setValue] = React.useState('dsa');
      return (
        <ActionMenu
          {...actionMenuPropsFactory({ ...answerStyleMenu })}
          trigger={<button>Style</button>}
          sections={answerStyleMenu.sections.map((s) => ({ ...s, value }))}
          onValueChange={(_s, id) => setValue(id)}
        />
      );
    };
    render(<Select />);
    await user.click(screen.getByRole('button', { name: 'Style' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Negotiation' }));
    await user.click(screen.getByRole('button', { name: 'Style' }));
    const checked = screen.getAllByRole('menuitemradio').filter((el) => el.getAttribute('aria-checked') === 'true');
    expect(checked.map((el) => el.textContent)).toEqual(['Negotiation']);
  });

  it('does not call onValueChange for plain (non-single) sections or disabled rows', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ActionMenu
        {...actionMenuPropsFactory()}
        trigger={<button>Open</button>}
        onValueChange={onValueChange}
        sections={[
          {
            id: 'a',
            items: [
              { id: 'x', label: 'Plain' },
              { id: 'y', label: 'Off', disabled: true },
            ],
          },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('menuitem', { name: 'Plain' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe('focus on close', () => {
    it('pointer selection leaves nothing focused; keyboard selection returns focus to the trigger', async () => {
      const user = userEvent.setup();
      render(<Controlled />);
      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);
      await user.click(screen.getByRole('menuitemradio', { name: 'Auto' }));
      expect(trigger).not.toHaveFocus();

      trigger.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}{Enter}');
      expect(trigger).toHaveFocus();
    });

    it('returnFocus="always" restores focus even after a pointer selection', async () => {
      const user = userEvent.setup();
      render(<ActionMenu {...actionMenuPropsFactory({ returnFocus: 'always' })} trigger={<button>Open</button>} />);
      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);
      await user.click(screen.getByRole('menuitemradio', { name: /^Auto/ }));
      expect(trigger).toHaveFocus();
    });

    it('kind="list" also drops focus after an outside click', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <ActionMenu {...actionMenuPropsFactory({ ...shortcutsMenu })} trigger={<button>Shortcuts</button>} />
          <p data-testid="outside">x</p>
        </div>,
      );
      const trigger = screen.getByRole('button', { name: 'Shortcuts' });
      await user.click(trigger);
      await user.click(screen.getByTestId('outside'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).not.toHaveFocus();
    });
  });
});
