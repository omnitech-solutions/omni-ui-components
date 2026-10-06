import '@testing-library/jest-dom';
import * as React from 'react';
import { expectTypeOf } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { VersionPager, type VersionItem } from '@oc-tech/omni-ui-components/VersionPager';
import { VersionPagerDemo, versionPagerPropsFactory } from 'factories/omni-ui-components/VersionPager/VersionPager.factories';

describe('omni-ui-components/VersionPager', () => {
  it('shows "i / n" (1-based) between Previous and Next', () => {
    render(<VersionPager {...versionPagerPropsFactory()} />);
    expect(screen.getByRole('group', { name: 'Versions' })).toHaveTextContent('2 / 3');
    expect(screen.getByRole('button', { name: 'Previous version' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next version' })).toBeEnabled();
  });

  it('disables Previous at the first version and Next at the last', () => {
    const { rerender } = render(<VersionPager {...versionPagerPropsFactory({ index: 0 })} />);
    expect(screen.getByRole('button', { name: 'Previous version' })).toBeDisabled();
    rerender(<VersionPager {...versionPagerPropsFactory({ index: 2 })} />);
    expect(screen.getByRole('button', { name: 'Next version' })).toBeDisabled();
  });

  it('disabled disables both; onMove gets -1 or 1', async () => {
    const onMove = vi.fn();
    const { rerender } = render(<VersionPager {...versionPagerPropsFactory({ onMove })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Previous version' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next version' }));
    expect(onMove.mock.calls.map((call) => call[0])).toEqual([-1, 1]);
    rerender(<VersionPager {...versionPagerPropsFactory({ onMove, disabled: true })} />);
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });

  it('labels and position text are config; the demo steps through the versions', async () => {
    const { unmount } = render(
      <VersionPager
        {...versionPagerPropsFactory({
          labels: { next: 'Weiter', position: (i, n) => `${i + 1} von ${n}` },
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument();
    expect(screen.getByText('2 von 3')).toBeInTheDocument();
    unmount();
    render(<VersionPagerDemo />);
    await userEvent.click(screen.getByRole('button', { name: 'Next version' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next version' })).toBeDisabled();
  });

  it('renders nothing without onMove', () => {
    const { container } = render(<VersionPager {...versionPagerPropsFactory({ onMove: undefined })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('onMove receives the version being left and onSelect the version moved to, by reference; either alone renders', async () => {
    type Version = VersionItem & { author: string };
    const versions: Version[] = [
      { id: 'v1', author: 'you' },
      { id: 'v2', author: 'claude' },
      { id: 'v3', author: 'claude' },
    ];
    const onMove = vi.fn((_step: -1 | 1, current?: Version) => {
      if (current) expectTypeOf(current.author).toEqualTypeOf<string>();
    });
    const onSelect = vi.fn((version: Version, _index: number) => {
      expectTypeOf(version.author).toEqualTypeOf<string>();
    });
    const { rerender } = render(<VersionPager<Version> index={1} versions={versions} onSelect={onSelect} />);
    expect(screen.getByRole('group', { name: 'Versions' })).toHaveTextContent('2 / 3');
    await userEvent.click(screen.getByRole('button', { name: 'Next version' }));
    expect(onSelect.mock.calls[0]![0]).toBe(versions[2]);
    expect(onSelect.mock.calls[0]![1]).toBe(2);
    rerender(<VersionPager<Version> index={1} versions={versions} onMove={onMove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Previous version' }));
    expect(onMove.mock.calls[0]![0]).toBe(-1);
    expect(onMove.mock.calls[0]![1]).toBe(versions[1]);
  });
});
