import '@testing-library/jest-dom';
import * as React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PanelShell } from '@oc-tech/omni-ui-components/PanelShell';
import { ChatShellDemo, panelShellPropsFactory, panelShellVariants } from 'factories/omni-ui-components/PanelShell/PanelShell.factories';

describe('omni-ui-components/PanelShell', () => {
  it('panel mode: a 440px region beside the host', () => {
    render(<PanelShell {...panelShellPropsFactory({ host: <p>host</p>, children: <p>body</p> })} />);
    const panel = screen.getByRole('region', { name: 'Chat' });
    expect(panel).toHaveStyle({ flex: '0 0 440px' });
    expect(screen.getByText('host')).toBeInTheDocument();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('width accepts a number or a CSS length', () => {
    const { rerender } = render(<PanelShell {...panelShellPropsFactory({ width: 320 })} />);
    expect(screen.getByRole('region')).toHaveStyle({ flex: '0 0 320px' });
    rerender(<PanelShell {...panelShellPropsFactory({ width: '30%' })} />);
    expect(screen.getByRole('region')).toHaveStyle({ flex: '0 0 30%' });
  });

  it('full mode fills the area and hides the host while open', () => {
    const { rerender } = render(<PanelShell {...panelShellPropsFactory({ mode: 'full', host: <p>host</p> })} />);
    expect(screen.queryByText('host')).not.toBeInTheDocument();
    expect(screen.getByRole('region').style.flex).toBe('');
    rerender(<PanelShell {...panelShellPropsFactory({ mode: 'full', host: <p>host</p>, open: false })} />);
    expect(screen.getByText('host')).toBeInTheDocument();
  });

  it('closed renders only the host', () => {
    render(<PanelShell {...panelShellPropsFactory({ open: false, host: <p>host</p> })} />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.getByText('host')).toBeInTheDocument();
  });

  it('lays out header, body and footer slots, and the overlay slot', () => {
    render(<PanelShell {...panelShellPropsFactory({ header: <p>head</p>, footer: <p>foot</p>, overlay: <p>over</p>, children: <p>body</p> })} />);
    const panel = screen.getByRole('region');
    ['head', 'body', 'foot', 'over'].forEach((text) => expect(within(panel).getByText(text)).toBeInTheDocument());
    expect(panel.querySelector('[data-slot="panel-shell-body"]')).toHaveClass('overflow-y-auto');
  });

  it('a docked sidebar is always shown beside the body, an overlay one only while open', () => {
    const { rerender } = render(<PanelShell {...panelShellPropsFactory({ sidebar: <p>list</p>, sidebarMode: 'docked', sidebarOpen: false })} />);
    expect(screen.getByText('list').closest('[data-slot="panel-shell-sidebar"]')).toHaveAttribute('data-mode', 'docked');
    rerender(<PanelShell {...panelShellPropsFactory({ sidebar: <p>list</p>, sidebarMode: 'overlay', sidebarOpen: false })} />);
    expect(screen.queryByText('list')).not.toBeInTheDocument();
    rerender(<PanelShell {...panelShellPropsFactory({ sidebar: <p>list</p>, sidebarMode: 'overlay', sidebarOpen: true })} />);
    expect(screen.getByText('list').closest('[data-slot="panel-shell-sidebar"]')).toHaveAttribute('data-mode', 'overlay');
  });

  it('Escape closes an open overlay sidebar first, then the panel only with closeOnEscape', () => {
    const onSidebarOpenChange = jest.fn();
    const onOpenChange = jest.fn();
    const { rerender } = render(
      <PanelShell {...panelShellPropsFactory({ sidebar: <button>list</button>, sidebarMode: 'overlay', sidebarOpen: true, onSidebarOpenChange, onOpenChange, closeOnEscape: true })} />,
    );
    fireEvent.keyDown(screen.getByText('list'), { key: 'Escape' });
    expect(onSidebarOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).not.toHaveBeenCalled();
    rerender(<PanelShell {...panelShellPropsFactory({ children: <button>body</button>, onOpenChange, closeOnEscape: true })} />);
    fireEvent.keyDown(screen.getByText('body'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    rerender(<PanelShell {...panelShellPropsFactory({ children: <button>body</button>, onOpenChange })} />);
    fireEvent.keyDown(screen.getByText('body'), { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('translates the region name', () => {
    render(<PanelShell {...panelShellPropsFactory({ label: 'Asistente' })} />);
    expect(screen.getByRole('region', { name: 'Asistente' })).toBeInTheDocument();
  });

  it('renders every factory variant', () => {
    panelShellVariants.forEach((variant) => {
      const { container, unmount } = render(<PanelShell {...panelShellPropsFactory(variant.args)} />);
      expect(container.querySelector('[data-slot="panel-shell"]')).toBeInTheDocument();
      unmount();
    });
  });
});

describe('ChatShell (composed)', () => {
  it('opens the history overlay, picks a conversation, opens settings and expands to full page', async () => {
    render(<ChatShellDemo />);
    expect(screen.queryByRole('navigation', { name: 'Conversations' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Conversations/ }));
    expect(await screen.findByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Debounce vs throttle' }));
    await waitFor(() => expect(screen.queryByRole('navigation', { name: 'Conversations' })).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Debounce vs throttle/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Expand to full page' }));
    expect(screen.getByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
    expect(screen.queryByText('Host page')).not.toBeInTheDocument();
  });

  it('deleting a conversation raises a toast with Undo that brings it back', async () => {
    render(<ChatShellDemo mode="full" empty />);
    const row = screen.getByRole('button', { name: 'Design a rate limiter' }).closest('[data-slot="conversation-row"]') as HTMLElement;
    await userEvent.click(within(row).getByRole('button', { name: 'Delete' }));
    expect(screen.queryByRole('button', { name: 'Design a rate limiter' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Conversation deleted');
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Design a rate limiter' })).toBeInTheDocument();
  });
});
