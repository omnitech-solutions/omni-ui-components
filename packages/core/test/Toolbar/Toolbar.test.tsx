import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';

import { Toolbar, useToolbarSize } from '@oc-tech/omni-ui-components/Toolbar';
import { NativeToolbarDemo, toolbarLabelledVariants, toolbarVariants } from 'factories/omni-ui-components/Toolbar/Toolbar.factories';

const SizeProbe = () => <span data-testid="probe">{useToolbarSize() ?? 'none'}</span>;

describe('omni-ui-components/Toolbar', () => {
  it('is a labelled horizontal toolbar', () => {
    render(<Toolbar label="Session controls" />);
    const bar = screen.getByRole('toolbar', { name: 'Session controls' });
    expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(bar).toHaveClass('gap-[var(--oui-control-gap)]');
  });

  it('provides its size to children through the context (default control)', () => {
    const { rerender } = render(
      <Toolbar label="Bar">
        <SizeProbe />
      </Toolbar>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('control');
    rerender(
      <Toolbar label="Bar" size="control-labelled">
        <SizeProbe />
      </Toolbar>,
    );
    expect(screen.getByTestId('probe')).toHaveTextContent('control-labelled');
    expect(screen.getByRole('toolbar')).toHaveAttribute('data-size', 'control-labelled');
  });

  it('has no size outside a Toolbar', () => {
    render(<SizeProbe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('none');
  });

  it('renders data-driven groups in order, each a named group, with a 20px separator between neighbours', () => {
    render(
      <Toolbar
        label="Bar"
        groups={[
          { id: 'a', label: 'First', children: <button>One</button> },
          { id: 'b', label: 'Second', children: <button>Two</button> },
          { id: 'c', children: <button>Three</button> },
        ]}
      />,
    );
    const first = screen.getByRole('group', { name: 'First' });
    const second = screen.getByRole('group', { name: 'Second' });
    expect(within(first).getByRole('button', { name: 'One' })).toBeInTheDocument();
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const separators = document.querySelectorAll('[data-slot="separator"], [data-orientation="vertical"]');
    expect(separators.length).toBe(2);
    separators.forEach((sep) => expect(sep).toHaveClass('h-[var(--oui-control-separator)]'));
  });

  it('places leading and trailing slots at the ends and children between', () => {
    render(
      <Toolbar label="Bar" leading={<i data-testid="lead" />} trailing={<i data-testid="trail" />}>
        <i data-testid="mid" />
      </Toolbar>,
    );
    const order = Array.from(screen.getByRole('toolbar').querySelectorAll('[data-testid]')).map((el) => el.getAttribute('data-testid'));
    expect(order).toEqual(['lead', 'mid', 'trail']);
  });

  it('omits separators when asked, and never draws one at an edge', () => {
    const { rerender } = render(<Toolbar label="Bar" groups={[{ id: 'a', children: <i /> }]} />);
    expect(document.querySelectorAll('[data-orientation="vertical"]').length).toBe(0);
    rerender(
      <Toolbar
        label="Bar"
        separators={false}
        groups={[
          { id: 'a', children: <i /> },
          { id: 'b', children: <i /> },
        ]}
      />,
    );
    expect(document.querySelectorAll('[data-orientation="vertical"]').length).toBe(0);
  });

  it('floating variant draws the pill surface', () => {
    render(<Toolbar label="Bar" variant="floating" />);
    expect(screen.getByRole('toolbar')).toHaveClass('rounded-2xl');
  });

  describe('Native App toolbar (board 1a)', () => {
    it.each(toolbarVariants.map((v) => [v.name, v] as const))('%s renders every control in the toolbar', (_name, v) => {
      render(<NativeToolbarDemo {...v.args} />);
      const bar = screen.getByRole('toolbar', {
        name: 'Live session controls',
      });
      expect(
        within(bar)
          .getAllByRole('group')
          .map((g) => g.getAttribute('aria-label')),
      ).toEqual(['Capture and microphone', 'Answer style', 'Panels', 'Tools']);
      expect(bar.querySelectorAll('[data-slot="split-button"]').length).toBe(2);
      expect(within(bar).getByTestId('answer-style-trigger')).toHaveTextContent('Data Structures & Algorithms');
      expect(within(bar).getByRole('button', { name: 'Shortcuts' })).toBeInTheDocument();
    });

    it('labelled rows size every split button to the labelled row from context', () => {
      render(<NativeToolbarDemo {...toolbarLabelledVariants[0].args} />);
      document.querySelectorAll('[data-slot="split-button"]').forEach((el) => expect(el).toHaveAttribute('data-size', 'control-labelled'));
    });

    it('paused state: both sensors dim and disabled with a reason; panel toggles stay usable', () => {
      render(<NativeToolbarDemo {...toolbarVariants[6].args} />);
      const dims = document.querySelectorAll('[data-slot="split-button"][data-tone="dim"]');
      expect(dims.length).toBe(2);
      dims.forEach((el) => expect(el.querySelector('[data-slot="split-button-main"]')).toHaveAttribute('aria-disabled', 'true'));
      expect(screen.getByRole('button', { name: 'Chat' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Code' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Code' })).not.toHaveAttribute('aria-disabled');
    });

    it('the last visible panel cannot be turned off and explains why in a tooltip', async () => {
      const user = userEvent.setup();
      render(<NativeToolbarDemo {...toolbarVariants[0].args} panels={['answer']} />);
      const answer = screen.getByRole('button', { name: 'Answer' });
      await user.click(answer);
      expect(answer).toHaveAttribute('aria-pressed', 'true');
      await user.hover(answer);
      expect((await screen.findAllByText('At least one panel stays visible'))[0]).toBeInTheDocument();
    });

    it('turning another panel on then lets the first be turned off', async () => {
      const user = userEvent.setup();
      render(<NativeToolbarDemo {...toolbarVariants[0].args} panels={['answer']} />);
      await user.click(screen.getByRole('button', { name: 'Chat' }));
      await user.click(screen.getByRole('button', { name: 'Answer' }));
      expect(screen.getByRole('button', { name: 'Answer' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('see-through and shortcuts use the bright foreground and the filled half-circle glyph', () => {
      render(<NativeToolbarDemo {...toolbarVariants[0].args} />);
      const seeThrough = screen.getByRole('button', { name: 'See-through' });
      expect(seeThrough).toHaveClass('text-[color:var(--oui-tone-neutral-fg)]');
      expect(seeThrough.querySelector('path[fill="currentColor"]')).not.toBeNull();
      expect(screen.getByRole('button', { name: 'Shortcuts' })).toHaveClass('text-[color:var(--oui-tone-neutral-fg)]');
    });
  });
});
