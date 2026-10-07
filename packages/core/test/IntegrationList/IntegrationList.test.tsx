import '@testing-library/jest-dom';

import { IntegrationList } from '@oc-tech/omni-ui-components/IntegrationList';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  IntegrationListDemo,
  integrationListPropsFactory,
  integrationListVariants,
} from 'factories/omni-ui-components/IntegrationList/IntegrationList.factories';

describe('omni-ui-components/IntegrationList', () => {
  it('renders a row per item with name, detail, a switch and a remove button', () => {
    render(<IntegrationList {...integrationListPropsFactory()} />);
    const list = screen.getByRole('list', { name: 'Connectors' });
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Docs search');
    expect(rows[0]).toHaveTextContent('4 tools · connected');
    expect(within(rows[0]).getByRole('switch', { name: 'Docs search' })).toBeChecked();
    expect(within(rows[2]).getByRole('switch', { name: 'Staging database' })).not.toBeChecked();
    expect(within(rows[0]).getByRole('button', { name: 'Remove Docs search' })).toBeInTheDocument();
    expect(rows[1]).toHaveAttribute('data-status', 'unreachable');
  });

  it('toggle and remove report the id', async () => {
    const onToggle = jest.fn();
    const onRemove = jest.fn();
    render(<IntegrationList {...integrationListPropsFactory({ onToggle, onRemove })} />);
    await userEvent.click(screen.getByRole('switch', { name: 'Staging database' }));
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ id: 'i3' }), true);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Issue tracker' }));
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ id: 'i2' }));
  });

  it('shows the intro, a loading line and an empty line', () => {
    const { rerender } = render(
      <IntegrationList {...integrationListPropsFactory(integrationListVariants[1].args)} />,
    );
    expect(screen.getByText(/Model Context Protocol/)).toBeInTheDocument();
    expect(screen.getByText('Checking connectors…')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    rerender(<IntegrationList {...integrationListPropsFactory(integrationListVariants[2].args)} />);
    expect(screen.getByText('No connectors yet.')).toBeInTheDocument();
    rerender(
      <IntegrationList
        {...integrationListPropsFactory({ items: [], empty: 'Nothing connected', intro: null })}
      />,
    );
    expect(screen.getByText('Nothing connected')).toBeInTheDocument();
    expect(screen.queryByText(/Model Context Protocol/)).not.toBeInTheDocument();
  });

  it('add form: disabled when empty, submits the trimmed address, clears after success', async () => {
    const onAdd = jest.fn(() => Promise.resolve());
    render(<IntegrationList {...integrationListPropsFactory({ onAdd })} />);
    const add = screen.getByRole('button', { name: 'Add server' });
    expect(add).toBeDisabled();
    const field = screen.getByRole('textbox', { name: 'MCP server address' });
    expect(field).toHaveAttribute('type', 'url');
    expect(field).toHaveAttribute('placeholder', 'https://your-server.example/mcp');
    await userEvent.type(field, '  https://a.example/mcp  ');
    await userEvent.click(add);
    expect(onAdd).toHaveBeenCalledWith('https://a.example/mcp');
    await waitFor(() => expect(field).toHaveValue(''));
  });

  it('keeps the address when the add rejects', async () => {
    const onAdd = jest.fn(() => Promise.reject(new Error('no')));
    render(<IntegrationList {...integrationListPropsFactory({ onAdd })} />);
    const field = screen.getByRole('textbox', { name: 'MCP server address' });
    await userEvent.type(field, 'https://b.example');
    await userEvent.click(screen.getByRole('button', { name: 'Add server' }));
    expect(onAdd).toHaveBeenCalledWith('https://b.example');
    await waitFor(() => expect(field).toHaveValue('https://b.example'));
  });

  it('hides switch, remove and the add form without their callbacks', () => {
    render(<IntegrationList {...integrationListPropsFactory(integrationListVariants[3].args)} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('fits an OAuth variant: connectAction in the header, account and per-row connect buttons', () => {
    render(<IntegrationList {...integrationListPropsFactory(integrationListVariants[4].args)} />);
    expect(screen.getByRole('button', { name: 'Add account' })).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reconnect' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument();
  });

  it('translates labels', () => {
    render(
      <IntegrationList
        {...integrationListPropsFactory({
          labels: { add: 'Añadir', remove: (n) => `Quitar ${n}`, addField: 'Dirección' },
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Añadir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar Docs search' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Dirección' })).toBeInTheDocument();
  });

  it('the demo adds a server row', async () => {
    render(<IntegrationListDemo />);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'MCP server address' }),
      'https://tools.example.com/mcp',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add server' }));
    await waitFor(() => expect(screen.getByText('tools.example.com')).toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});
