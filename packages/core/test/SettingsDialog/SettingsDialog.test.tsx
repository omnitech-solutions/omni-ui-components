import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SettingRow, SettingsDialog } from '@oc-tech/omni-ui-components/SettingsDialog';
import { SettingsDialogDemo, settingsDialogPropsFactory, settingsDialogVariants } from 'factories/omni-ui-components/SettingsDialog/SettingsDialog.factories';

describe('omni-ui-components/SettingsDialog', () => {
  it('renders a named modal dialog with a vertical tablist and a tabpanel for the active tab', () => {
    render(<SettingsDialog {...settingsDialogPropsFactory()} />);
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    const list = within(dialog).getByRole('tablist');
    expect(list).toHaveAttribute('aria-orientation', 'vertical');
    const tabs = within(list).getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['General', 'Personalisation', 'Data & privacy', 'Connectors', 'Shortcuts']);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabindex', '0');
    expect(tabs[1]).toHaveAttribute('tabindex', '-1');
    const panel = within(dialog).getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', tabs[0].id);
    expect(tabs[0]).toHaveAttribute('aria-controls', panel.id);
  });

  it('renders nothing when closed and calls render only for the active tab', () => {
    const renderOther = jest.fn(() => <span>other</span>);
    const { rerender } = render(<SettingsDialog {...settingsDialogPropsFactory({ open: false })} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(
      <SettingsDialog
        {...settingsDialogPropsFactory({
          tabs: [
            { id: 'a', label: 'A', render: () => <span>panel a</span> },
            { id: 'b', label: 'B', render: renderOther },
          ],
        })}
      />,
    );
    expect(screen.getByText('panel a')).toBeInTheDocument();
    expect(renderOther).not.toHaveBeenCalled();
  });

  it('selects a tab by click: uncontrolled, and reports onTab', async () => {
    const onTab = jest.fn();
    render(<SettingsDialog {...settingsDialogPropsFactory({ onTabChange: onTab })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Data & privacy/ }));
    expect(onTab).toHaveBeenCalledWith(expect.objectContaining({ id: 'data' }));
    expect(screen.getByRole('tab', { name: /Data & privacy/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Export all data');
  });

  it('is controlled by activeTab', async () => {
    const onTab = jest.fn();
    render(<SettingsDialog {...settingsDialogPropsFactory({ activeTab: 'general', onTabChange: onTab })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Connectors/ }));
    expect(onTab).toHaveBeenCalledWith(expect.objectContaining({ id: 'connectors' }));
    expect(screen.getByRole('tab', { name: /General/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('arrow keys, Home and End move focus and select (roving tabindex)', async () => {
    const onTab = jest.fn();
    render(<SettingsDialog {...settingsDialogPropsFactory({ onTabChange: onTab })} />);
    screen.getByRole('tab', { name: /General/ }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: /Personalisation/ })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /Personalisation/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /General/ })).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: /Shortcuts/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: /General/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('tab', { name: /Shortcuts/ })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: /General/ })).toHaveFocus();
    expect(onTab).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'general' }));
  });

  it('Escape and the close button call onClose', async () => {
    const onClose = jest.fn();
    render(<SettingsDialog {...settingsDialogPropsFactory({ onClose })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('traps focus inside the dialog and closes on Escape', async () => {
    render(<SettingsDialogDemo />);
    const trigger = screen.getByRole('button', { name: 'Open settings' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Settings' });
    // Tab many times: focus never leaves the dialog.
    for (let i = 0; i < 14; i += 1) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // Focus return to the trigger is asserted in the FocusReturn story (happy-dom does not run Radix's timer the same way).
    expect(trigger).toBeInTheDocument();
  });

  it('translates the title and close name', () => {
    render(<SettingsDialog {...settingsDialogPropsFactory({ labels: { title: 'Ajustes', close: 'Cerrar' } })} />);
    expect(screen.getByRole('dialog', { name: 'Ajustes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('renders every factory variant', () => {
    settingsDialogVariants.forEach((variant) => {
      const { unmount } = render(<SettingsDialog {...settingsDialogPropsFactory(variant.args)} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      unmount();
    });
  });
});

describe('omni-ui-components/SettingRow', () => {
  it('renders title, description and control; tone and layout are data attributes', () => {
    const { container } = render(
      <SettingRow tone="danger" title="Delete everything" description="All conversations">
        <button>Delete all</button>
      </SettingRow>,
    );
    const row = container.querySelector('[data-slot="setting-row"]')!;
    expect(row).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByText('Delete everything')).toBeInTheDocument();
    expect(screen.getByText('All conversations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete all' })).toBeInTheDocument();
  });

  it('makes a stack title a real label for the control', () => {
    render(
      <SettingRow layout="stack" htmlFor="f" title="Instructions">
        <textarea id="f" />
      </SettingRow>,
    );
    expect(screen.getByLabelText('Instructions')).toBeInTheDocument();
  });

  it('renders no control wrapper without children', () => {
    const { container } = render(<SettingRow title="Only text" />);
    expect(container.querySelector('[data-slot="setting-control"]')).toBeNull();
  });
});

describe('omni-ui-components/GeneralSettings', () => {
  it('onThemeChange and onSendOnEnterChange fire uncontrolled and controlled; rows without a callback are not rendered', async () => {
    const { GeneralSettings } = await import('@oc-tech/omni-ui-components/SettingsDialog');
    const onThemeChange = jest.fn();
    const onSendOnEnterChange = jest.fn();
    const { rerender } = render(<GeneralSettings onThemeChange={onThemeChange} onSendOnEnterChange={onSendOnEnterChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await userEvent.click(screen.getByRole('switch', { name: 'Send with Enter' }));
    expect(onSendOnEnterChange).toHaveBeenCalledWith(false);
    rerender(<GeneralSettings theme="light" onThemeChange={onThemeChange} sendOnEnter onSendOnEnterChange={onSendOnEnterChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(onThemeChange).toHaveBeenLastCalledWith('dark');
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    rerender(<GeneralSettings />);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});
