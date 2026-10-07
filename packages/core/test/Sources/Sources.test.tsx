import '@testing-library/jest-dom';

import { type SourceItem, Sources } from '@oc-tech/omni-ui-components/Sources';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  sampleSources,
  sourcesPropsFactory,
} from 'factories/omni-ui-components/Sources/Sources.factories';
import { expectTypeOf } from 'vitest';

describe('omni-ui-components/Sources', () => {
  it('draws one chip per source with number, title and meta, none pressed', () => {
    render(<Sources {...sourcesPropsFactory()} />);
    const chips = screen.getAllByRole('button');
    expect(chips).toHaveLength(3);
    expect(chips[0]).toHaveTextContent('1Two Sum notesrev 3 · Notes');
    chips.forEach((chip) => expect(chip).toHaveAttribute('aria-pressed', 'false'));
    expect(screen.getByRole('group', { name: 'Sources' })).toBeInTheDocument();
  });

  it('opens one card at a time and closes on the same chip, the close control, or another chip replaces it', async () => {
    const onToggle = vi.fn();
    render(<Sources {...sourcesPropsFactory({ onToggle })} />);
    await userEvent.click(screen.getByRole('button', { name: /Two Sum notes/ }));
    expect(screen.getByText(/single lookup/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Two Sum notes/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: /Map reference/ }));
    expect(screen.queryByText(/single lookup/)).toBeNull();
    expect(screen.getByText(/insertion order/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText(/insertion order/)).toBeNull();
    expect(onToggle.mock.calls.map((call) => [call[0].n, call[1]])).toEqual([
      [1, true],
      [1, false],
      [2, true],
      [2, false],
    ]);
  });

  it('chip chosen again closes its card', async () => {
    render(<Sources {...sourcesPropsFactory({ defaultOpenN: 1 })} />);
    await userEvent.click(screen.getByRole('button', { name: /Two Sum notes/ }));
    expect(screen.queryByRole('group', { name: 'Two Sum notes' })).toBeNull();
  });

  it('is controlled by openN, so a citation can open it', () => {
    const { rerender } = render(<Sources {...sourcesPropsFactory({ openN: null })} />);
    expect(screen.queryByText(/insertion order/)).toBeNull();
    rerender(<Sources {...sourcesPropsFactory({ openN: 2 })} />);
    expect(screen.getByText(/insertion order/)).toBeInTheDocument();
  });

  it('labels and renderCard are configurable; empty items render nothing', () => {
    const { container, rerender } = render(
      <Sources
        {...sourcesPropsFactory({
          openN: 1,
          labels: { close: 'Zu', group: 'Quellen' },
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Zu' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Quellen' })).toBeInTheDocument();
    rerender(
      <Sources
        {...sourcesPropsFactory({
          openN: 1,
          renderCard: (item) => <b>own {item.n}</b>,
        })}
      />,
    );
    expect(screen.getByText('own 1')).toBeInTheDocument();
    rerender(<Sources items={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(sampleSources()).toHaveLength(3);
  });

  it('onClose fires with the closed source item after onToggle(source, false); a controlled card still reports', async () => {
    const calls: string[] = [];
    render(
      <Sources
        {...sourcesPropsFactory({ openN: 2 })}
        onToggle={(source, open) => calls.push(`toggle:${source.n}:${open}`)}
        onClose={(source) => calls.push(`close:${source.n}`)}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(calls).toEqual(['close:2', 'toggle:2:false']);
    await userEvent.click(screen.getByRole('button', { name: /Two Sum notes/ }));
    expect(calls.at(-1)).toBe('toggle:1:true');
  });

  it('callbacks and renderCard receive the extended source by reference; its extra fields are typed', async () => {
    type Doc = SourceItem & { url: string };
    const items: Doc[] = sampleSources().map((source) => ({
      ...source,
      url: `https://x.example/${source.id}`,
    }));
    const onToggle = vi.fn((source: Doc) => {
      expectTypeOf(source.url).toEqualTypeOf<string>();
    });
    const onClose = vi.fn();
    render(
      <Sources<Doc>
        items={items}
        onToggle={onToggle}
        onClose={onClose}
        renderCard={(source, close) => <button onClick={close}>{source.url}</button>}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Map reference/ }));
    expect(onToggle.mock.calls[0]![0]).toBe(items[1]);
    await userEvent.click(screen.getByRole('button', { name: 'https://x.example/s2' }));
    expect(onClose.mock.calls[0]![0]).toBe(items[1]);
  });
});
