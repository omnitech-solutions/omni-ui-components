import '@testing-library/jest-dom';

import {
  ContextMeter,
  type ContextSection,
  contextLevel,
  contextPercent,
  formatTokens,
} from '@oc-tech/omni-ui-components';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  contextMeterPropsFactory,
  contextMeterVariants,
  OpenContextMeter,
} from 'factories/omni-ui-components/ContextMeter/ContextMeter.factories';

const ring = () => document.querySelector('[data-slot="context-meter"]') as HTMLElement;
const arc = () => document.querySelector('[data-slot="progress-ring-arc"]') as SVGElement;

describe('omni-ui-components/ContextMeter', () => {
  describe('utilities', () => {
    it('formats tokens in thousands', () => {
      expect(formatTokens(1200)).toBe('1.2k');
      expect(formatTokens(3100)).toBe('3.1k');
      expect(formatTokens(262000, 0)).toBe('262k');
      expect(formatTokens(0)).toBe('0.0k');
    });
    it('computes a rounded, clamped percent and none without a window', () => {
      expect(contextPercent(3100, 262000)).toBe(1);
      expect(contextPercent(131000, 262000)).toBe(50);
      expect(contextPercent(900000, 262000)).toBe(100);
      expect(contextPercent(100, undefined)).toBeUndefined();
      expect(contextPercent(100, 0)).toBeUndefined();
    });
    it('levels: exclusive thresholds at 60 and 80', () => {
      expect(contextLevel(60)).toBe('normal');
      expect(contextLevel(61)).toBe('warn');
      expect(contextLevel(80)).toBe('warn');
      expect(contextLevel(81)).toBe('danger');
      expect(contextLevel(undefined)).toBe('normal');
      expect(contextLevel(40, { warn: 30, danger: 50 })).toBe('warn');
    });
  });

  describe('ring', () => {
    it('is a button named by the percent, collapsed', () => {
      render(<ContextMeter {...contextMeterPropsFactory()} />);
      const button = screen.getByRole('button', { name: 'Context 1% used' });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('title', 'Context 1% used');
    });

    it('with no window is empty and says how many tokens are in context', () => {
      render(<ContextMeter {...contextMeterPropsFactory({ window: undefined, used: 1200 })} />);
      expect(
        screen.getByRole('button', { name: 'About 1.2k tokens in context' }),
      ).toBeInTheDocument();
      expect(ring()).toHaveAttribute('data-level', 'normal');
      expect(ring()).not.toHaveAttribute('data-percent');
    });

    it.each([
      [131000, 'normal', 'accent'],
      [183400, 'warn', 'warning'],
      [235800, 'danger', 'danger'],
    ])('at %i tokens the level is %s (ring tone %s)', (used, level, tone) => {
      render(<ContextMeter {...contextMeterPropsFactory({ used })} />);
      expect(ring()).toHaveAttribute('data-level', level);
      expect(document.querySelector('[data-slot="progress-ring"]')).toHaveAttribute(
        'data-tone',
        tone,
      );
    });

    it('fills the arc in proportion', () => {
      render(<ContextMeter {...contextMeterPropsFactory({ used: 131000 })} />);
      const ratio =
        1 -
        Number(arc().getAttribute('stroke-dashoffset')) /
          Number(arc().getAttribute('stroke-dasharray'));
      expect(ratio).toBeCloseTo(0.5, 1);
    });
  });

  describe('popover', () => {
    it('opens a dialog with the percent, bar, summary, section rows in k and the note', async () => {
      render(<ContextMeter {...contextMeterPropsFactory({ used: 131000 })} />);
      await userEvent.click(ring());
      const dialog = screen.getByRole('dialog', { name: 'Context window' });
      expect(ring()).toHaveAttribute('aria-expanded', 'true');
      expect(within(dialog).getByText('50%')).toBeInTheDocument();
      expect(within(dialog).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
      expect(within(dialog).getByText('About 131.0k of 262k tokens')).toBeInTheDocument();
      expect(within(dialog).getByText('Workspace').nextSibling).toHaveTextContent('0.9k');
      expect(
        within(dialog).getByText(
          'When it fills up, older turns are summarised — never silently dropped.',
        ),
      ).toBeInTheDocument();
    });

    it('without a window shows the approximate count and no bar', () => {
      render(<OpenContextMeter window={undefined} used={1200} />);
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('~1.2k')).toBeInTheDocument();
      expect(within(dialog).getByText('About 1.2k tokens')).toBeInTheDocument();
      expect(within(dialog).queryByRole('progressbar')).toBeNull();
    });

    it('offers Summarise now only with a handler, and calls it', async () => {
      const onSummarise = vi.fn();
      const { unmount } = render(<OpenContextMeter onSummarise={onSummarise} />);
      await userEvent.click(screen.getByRole('button', { name: 'Summarise now' }));
      expect(onSummarise).toHaveBeenCalledTimes(1);
      unmount();
      render(<OpenContextMeter onSummarise={undefined} />);
      expect(screen.queryByRole('button', { name: 'Summarise now' })).toBeNull();
    });

    it('closes on Escape and returns focus to the ring', async () => {
      render(<ContextMeter {...contextMeterPropsFactory()} />);
      await userEvent.click(ring());
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(ring()).toHaveFocus();
    });

    it('takes every string from labels', async () => {
      render(
        <OpenContextMeter
          labels={{
            dialog: 'Contexto',
            heading: 'Contexto',
            summarise: 'Resumir',
            note: 'Nota',
            summary: (used, window) => `${used} / ${window}`,
            title: (p) => `${p} por ciento`,
          }}
        />,
      );
      expect(screen.getByRole('dialog', { name: 'Contexto' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Resumir' })).toBeInTheDocument();
      expect(screen.getByText('3.1k / 262k')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '1 por ciento' })).toBeInTheDocument();
    });
  });

  it('fires onOpenChange in uncontrolled mode', async () => {
    const onOpenChange = vi.fn();
    render(<ContextMeter {...contextMeterPropsFactory({ onOpenChange })} />);
    await userEvent.click(ring());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('passes the sections array to onSummarise by reference, extra fields intact (generic over the item)', async () => {
    type Section = ContextSection & { source: string };
    const sections: Section[] = [{ label: 'Workspace', tokens: 900, source: 'ws' }];
    const onSummarise = vi.fn((given: Section[]) => given[0]!.source);
    render(
      <ContextMeter<Section>
        used={3100}
        window={262000}
        sections={sections}
        onSummarise={onSummarise}
        defaultOpen
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Summarise now' }));
    expect(onSummarise.mock.calls[0]![0]).toBe(sections);
    expect(onSummarise).toHaveReturnedWith('ws');
  });

  it('has focus on the ring right after Escape', async () => {
    render(<ContextMeter {...contextMeterPropsFactory()} />);
    await userEvent.click(ring());
    await userEvent.keyboard('{Escape}');
    expect(ring()).toHaveFocus();
  });

  it('every documented variant renders', () => {
    for (const variant of contextMeterVariants) {
      const { unmount } = render(<ContextMeter {...contextMeterPropsFactory(variant.args)} />);
      expect(ring()).toBeInTheDocument();
      unmount();
    }
  });
});
