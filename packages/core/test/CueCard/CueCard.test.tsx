import '@testing-library/jest-dom';

import {
  CueCard,
  type CueSection,
  type CueSegment,
  DEFAULT_CUE_CARD_LABELS,
  HeardLine,
} from '@oc-tech/omni-ui-components/CueCard';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CueCardDemo,
  cueCardPropsFactory,
  cueCardVariants,
  cueClosingSections,
  cueInferredSections,
  cueTechnicalSections,
  heardLinePropsFactory,
  heardLineVariants,
} from 'factories/omni-ui-components/CueCard/CueCard.factories';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expectTypeOf } from 'vitest';

const section = (container: HTMLElement, kind: string) =>
  container.querySelector<HTMLElement>(`[data-slot="cue-card-section"][data-kind="${kind}"]`);
const kindsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-slot="cue-card-section"]')).map((node) =>
    node.getAttribute('data-kind'),
  );
const linesOf = (node: HTMLElement) =>
  Array.from(node.querySelectorAll<HTMLElement>('[data-slot="cue-card-line"]'));
const headingOf = (node: HTMLElement) => node.querySelector('[data-slot="cue-card-label"]');

const everyKind: CueSection[] = [
  { kind: 'say', lines: [{ segments: [{ text: 'Say it.' }] }] },
  { kind: 'anchors', lines: [{ segments: [{ text: 'Hang it here' }] }] },
  { kind: 'ask', lines: [{ segments: [{ text: 'Ask this?' }] }] },
  {
    kind: 'caution',
    lines: [{ segments: [{ text: 'Avoid that.' }] }, { segments: [{ text: 'Say this instead.' }] }],
  },
  { kind: 'context', lines: [{ segments: [{ text: 'Because of earlier.' }] }] },
];

describe('omni-ui-components/CueCard', () => {
  it('draws every section kind in the order given, each under its own heading, as an article in detail mode', () => {
    const { container } = render(<CueCard sections={everyKind} />);
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('data-slot', 'cue-card');
    expect(card).toHaveAttribute('data-mode', 'detail');
    expect(card).toHaveAttribute('data-status', 'ready');
    expect(kindsOf(container)).toEqual(['say', 'anchors', 'ask', 'caution', 'context']);
    expect(headingOf(section(container, 'say')!)).toHaveTextContent('Say this');
    expect(headingOf(section(container, 'anchors')!)).toHaveTextContent('Anchors');
    expect(headingOf(section(container, 'ask')!)).toHaveTextContent('Ask');
    expect(headingOf(section(container, 'caution')!)).toHaveTextContent('Careful');
    expect(headingOf(section(container, 'context')!)).toHaveTextContent('Context');
    expect(linesOf(card).map((line) => line.textContent)).toEqual([
      'Say it.',
      'Hang it here',
      'Ask this?',
      'Avoid that.',
      'Say this instead.',
      'Because of earlier.',
    ]);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('each kind has its own look: headings in the kind colour, the response large, anchors squared, context quiet with no mark', () => {
    const { container } = render(<CueCard sections={everyKind} />);
    const say = section(container, 'say')!;
    const anchors = section(container, 'anchors')!;
    const ask = section(container, 'ask')!;
    const context = section(container, 'context')!;
    expect(headingOf(say)!.className).toContain('--oui-tone-success-fg');
    expect(headingOf(ask)!.className).toContain('--oui-tone-success-fg');
    expect(headingOf(anchors)!.className).toContain('--oui-tone-accent-fg');
    expect(headingOf(context)!.className).toContain('--oui-panel-meta-fg');
    expect(linesOf(say)[0]!.className).toContain('text-[19px]');
    expect(linesOf(ask)[0]!.className).toContain('text-[19px]');
    expect(linesOf(anchors)[0]!.className).toContain('text-base');
    expect(linesOf(context)[0]!.className).toContain('text-sm');
    expect(say.querySelector('[aria-hidden="true"]')!.className).toContain('rounded-full');
    expect(anchors.querySelector('[aria-hidden="true"]')!.className).toContain('rounded-[1.5px]');
    expect(context.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('a caution is an amber box: the first line names it, later lines are the way back, and its icon is drawn only when given', () => {
    const { container, rerender } = render(<CueCard sections={everyKind} />);
    const caution = section(container, 'caution')!;
    expect(caution.className).toContain('--oui-tone-warning-bg');
    expect(caution.className).toContain('--oui-tone-warning-border');
    expect(headingOf(caution)!.className).toContain('--oui-tone-warning-fg');
    const [first, second] = linesOf(caution);
    expect(first!.className).not.toContain('text-[color:var(--oui-foreground)]');
    expect(second!.className).toContain('text-[color:var(--oui-foreground)]');
    expect(screen.queryByTestId('warn')).toBeNull();
    rerender(<CueCard sections={everyKind} cautionIcon={<svg data-testid="warn" />} />);
    expect(within(section(container, 'caution')!).getByTestId('warn')).toBeInTheDocument();
  });

  it('every piece carries its role (spoken when none is given) and only the marked ones are styled', () => {
    render(
      <CueCard
        sections={[
          {
            kind: 'say',
            lines: [
              {
                segments: [
                  { text: 'plain ' },
                  { text: 'said ', role: 'spoken' },
                  { text: 'opening ', role: 'cue' },
                  { text: 'Relay ', role: 'evidence' },
                  { text: 'risky ', role: 'caution' },
                  { text: 'aside', role: 'context' },
                ],
              },
            ],
          },
        ]}
      />,
    );
    const piece = (text: string) => screen.getByText(text, { trim: false });
    expect(piece('plain ')).toHaveAttribute('data-role', 'spoken');
    expect(piece('plain ').className).toBe('');
    expect(piece('said ')).toHaveAttribute('data-role', 'spoken');
    expect(piece('opening ')).toHaveAttribute('data-role', 'cue');
    expect(piece('opening ').className).toBe('font-semibold');
    expect(piece('Relay ')).toHaveAttribute('data-role', 'evidence');
    expect(piece('Relay ').className).toContain('--oui-tone-accent-fg');
    expect(piece('risky ')).toHaveAttribute('data-role', 'caution');
    expect(piece('risky ').className).toContain('--oui-tone-warning-fg');
    expect(piece('aside')).toHaveAttribute('data-role', 'context');
    expect(piece('aside').className).toContain('--oui-panel-meta-fg');
    expect(piece('aside')).toHaveAttribute('data-slot', 'cue-card-segment');
    const line = piece('aside').parentElement;
    expect(line?.tagName).toBe('P');
    expect(line?.textContent).toBe('plain said opening Relay risky aside');
  });

  it('an inferred claim is underlined with the tooltip; a verified or unmarked one is not', () => {
    render(<CueCard sections={cueInferredSections} labels={{ inferred: 'Check first' }} />);
    const claim = screen.getByText('dropped by about 40%');
    expect(claim).toHaveAttribute('title', 'Check first');
    expect(claim.className).toContain('decoration-dotted');
    expect(claim.className).toContain('--oui-tone-accent-fg');
    const verified = screen.getByText('Relay');
    expect(verified).not.toHaveAttribute('title');
    expect(verified.className).not.toContain('underline');
    expect(DEFAULT_CUE_CARD_LABELS.inferred).toBe('Not confirmed: check before saying');
  });

  it('a piece with a source is a button only with onSourceSelect; without it the piece is plain text that still names its source', async () => {
    const onSourceSelect = vi.fn();
    const { rerender } = render(<CueCard sections={cueClosingSections} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Relay').tagName).toBe('SPAN');
    expect(screen.getByText('Relay')).toHaveAttribute('data-source', 'roles/relay');
    rerender(<CueCard sections={cueClosingSections} onSourceSelect={onSourceSelect} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['Relay', 'Trufla']);
    expect(buttons[0]).toHaveAttribute('type', 'button');
    expect(buttons[0]).toHaveAttribute('data-role', 'evidence');
    expect(buttons[0]).toHaveAttribute('data-source', 'roles/relay');
    expect(buttons[0]!.className).toContain('--oui-tone-accent-fg');
    // A piece with no source stays text even when sources are pressable.
    expect(screen.getByText('One thing I should have said earlier:').tagName).toBe('SPAN');
    expect(screen.getByText('One thing I should have said earlier:')).not.toHaveAttribute(
      'data-source',
    );
    await userEvent.click(buttons[1]!);
    expect(onSourceSelect).toHaveBeenCalledTimes(1);
    expect(onSourceSelect.mock.calls[0]![0]).toBe(cueClosingSections[0]!.lines[1]!.segments[1]);
  });

  it('an extended segment reaches onSourceSelect by reference with its own fields typed', async () => {
    type Cited = CueSegment & { page: number };
    const cited: Cited = {
      text: 'the design doc',
      role: 'evidence',
      source: 'docs/design',
      page: 4,
    };
    const sections: CueSection<Cited>[] = [
      { kind: 'say', lines: [{ segments: [{ text: 'It is in ', page: 0 }, cited] }] },
    ];
    const onSourceSelect = vi.fn((segment: Cited) => {
      expectTypeOf(segment.page).toEqualTypeOf<number>();
      expectTypeOf(segment).toEqualTypeOf<Cited>();
    });
    render(<CueCard<Cited> sections={sections} onSourceSelect={onSourceSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'the design doc' }));
    expect(onSourceSelect.mock.calls[0]![0]).toBe(cited);
    expect(cited).toEqual({
      text: 'the design doc',
      role: 'evidence',
      source: 'docs/design',
      page: 4,
    });
  });

  it('compact keeps the response, the first maxAnchors anchors and the caution; ask, context and children are left out', () => {
    const { container, rerender } = render(
      <CueCard {...cueCardPropsFactory({ mode: 'compact' })}>
        <a href="#diagram">Diagram</a>
      </CueCard>,
    );
    expect(screen.getByRole('article')).toHaveAttribute('data-mode', 'compact');
    expect(kindsOf(container)).toEqual(['say', 'anchors', 'caution']);
    expect(linesOf(section(container, 'anchors')!)).toHaveLength(3);
    expect(screen.queryByText('Nightly reconciliation catches what slips through')).toBeNull();
    expect(linesOf(section(container, 'say')!)).toHaveLength(2);
    expect(linesOf(section(container, 'caution')!)).toHaveLength(2);
    expect(screen.queryByRole('link', { name: 'Diagram' })).toBeNull();
    rerender(<CueCard {...cueCardPropsFactory({ mode: 'compact', maxAnchors: 1 })} />);
    expect(linesOf(section(container, 'anchors')!).map((line) => line.textContent)).toEqual([
      'Outbox + idempotent consumers',
    ]);
    rerender(<CueCard sections={cueClosingSections} mode="compact" />);
    expect(kindsOf(container)).toEqual(['say']);
  });

  it('detail shows every anchor whatever maxAnchors says, and draws children after the sections', () => {
    const { container } = render(
      <CueCard {...cueCardPropsFactory({ maxAnchors: 1 })}>
        <a href="#diagram">Diagram</a>
      </CueCard>,
    );
    expect(linesOf(section(container, 'anchors')!)).toHaveLength(4);
    expect(kindsOf(container)).toEqual(['say', 'anchors', 'caution', 'context']);
    const link = screen.getByRole('link', { name: 'Diagram' });
    expect(section(container, 'context')!.compareDocumentPosition(link)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('a section with no lines is not drawn', () => {
    const { container } = render(
      <CueCard
        sections={[
          { kind: 'say', lines: [] },
          { kind: 'ask', lines: [{ segments: [{ text: 'Ask this?' }] }] },
        ]}
      />,
    );
    expect(kindsOf(container)).toEqual(['ask']);
  });

  it('pending says Updating under content that stays on show, and Preparing when nothing is ready', () => {
    const { container, rerender } = render(
      <CueCard {...cueCardPropsFactory({ status: 'pending' })} />,
    );
    expect(screen.getByRole('article')).toHaveAttribute('data-status', 'pending');
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Updating…');
    expect(status).toHaveAttribute('data-slot', 'cue-card-status');
    expect(kindsOf(container)).toHaveLength(4);
    expect(section(container, 'context')!.compareDocumentPosition(status)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    rerender(<CueCard sections={[]} status="pending" />);
    expect(screen.getByRole('status')).toHaveTextContent('Preparing response…');
    // Only sections with nothing to draw: nothing is ready either.
    rerender(<CueCard sections={[{ kind: 'say', lines: [] }]} status="pending" />);
    expect(screen.getByRole('status')).toHaveTextContent('Preparing response…');
    // A compact card that filtered everything out has nothing ready.
    rerender(<CueCard sections={[everyKind[2]!]} mode="compact" status="pending" />);
    expect(screen.getByRole('status')).toHaveTextContent('Preparing response…');
    rerender(<CueCard sections={[]} />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('labels override headings and both pending texts, one at a time, keeping the other defaults', () => {
    const { container, rerender } = render(
      <CueCard
        sections={everyKind}
        status="pending"
        labels={{ sections: { say: 'Sag das' }, updating: 'Wird aktualisiert…' }}
      />,
    );
    expect(headingOf(section(container, 'say')!)).toHaveTextContent('Sag das');
    expect(headingOf(section(container, 'ask')!)).toHaveTextContent('Ask');
    expect(screen.getByRole('status')).toHaveTextContent('Wird aktualisiert…');
    rerender(<CueCard sections={[]} status="pending" labels={{ preparing: 'Moment…' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Moment…');
    expect(DEFAULT_CUE_CARD_LABELS.sections).toEqual({
      say: 'Say this',
      anchors: 'Anchors',
      ask: 'Ask',
      caution: 'Careful',
      context: 'Context',
    });
  });

  it('a section label replaces its heading; an empty string, on the section or in labels, draws none', () => {
    const { container } = render(
      <CueCard
        labels={{ sections: { context: '', ask: 'Unused' } }}
        sections={[
          { kind: 'say', label: 'Close with', lines: [{ segments: [{ text: 'Say it.' }] }] },
          { kind: 'ask', label: '', lines: [{ segments: [{ text: 'Ask this?' }] }] },
          { kind: 'caution', label: '', lines: [{ segments: [{ text: 'Avoid that.' }] }] },
          { kind: 'context', lines: [{ segments: [{ text: 'Because of earlier.' }] }] },
          { kind: 'context', label: 'Why', lines: [{ segments: [{ text: 'It closes a gap.' }] }] },
        ]}
      />,
    );
    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('[data-slot="cue-card-section"]'),
    );
    expect(sections.map((node) => headingOf(node)?.textContent ?? null)).toEqual([
      'Close with',
      null,
      null,
      null,
      'Why',
    ]);
    expect(screen.queryByText('Unused')).toBeNull();
    expect(screen.queryByText('Careful')).toBeNull();
  });

  it('forwards its ref, className and other attributes to the article', () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <CueCard ref={ref} sections={everyKind} className="max-w-md" aria-label="Next response" />,
    );
    const card = screen.getByRole('article', { name: 'Next response' });
    expect(ref.current).toBe(card);
    expect(card).toHaveClass('max-w-md', 'flex');
  });

  it('the demo names the pressed source under the card and reports its segment; every variant renders', async () => {
    const onAction = vi.fn();
    const { unmount } = render(<CueCardDemo heard onAction={onAction} />);
    expect(screen.getByText('data consistent across services')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Relay' }));
    expect(onAction).toHaveBeenCalledWith('source', cueTechnicalSections[1]!.lines[2]!.segments[0]);
    expect(screen.getByText('Source: Relay · Staff engineer')).toBeInTheDocument();
    unmount();
    const bare = render(<CueCardDemo sections={cueInferredSections} />);
    await userEvent.click(screen.getByRole('button', { name: 'Relay' }));
    expect(screen.getByText('Source: roles/relay')).toBeInTheDocument();
    bare.unmount();
    for (const variant of cueCardVariants) {
      const { container, unmount: done } = render(
        <CueCard {...cueCardPropsFactory(variant.args)} />,
      );
      expect(container.querySelector('[data-slot="cue-card"]')).toBeInTheDocument();
      done();
    }
  });
});

describe('omni-ui-components/HeardLine', () => {
  const textOf = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('[data-slot="heard-line-text"]')!;

  it('joins its pieces into the sentence, lifts the strong ones, and puts the whole sentence in the tooltip', () => {
    const { container } = render(<HeardLine {...heardLinePropsFactory()} />);
    const whole = 'And how do you keep data consistent across services when one of them is down?';
    const text = textOf(container);
    expect(text.tagName).toBe('P');
    expect(text.textContent).toBe(whole);
    expect(text).toHaveAttribute('title', whole);
    expect(text.children).toHaveLength(3);
    const strong = screen.getByText('data consistent across services');
    expect(strong.className).toContain('font-medium');
    expect(strong.className).toContain('--oui-foreground');
    expect(screen.getByText('And how do you keep', { exact: false }).className).toBe('');
  });

  it('tone ask draws the bar and a green label; plain (the default) draws neither', () => {
    const { container, rerender } = render(<HeardLine {...heardLinePropsFactory()} />);
    const root = container.querySelector<HTMLElement>('[data-slot="heard-line"]')!;
    const label = container.querySelector<HTMLElement>('[data-slot="heard-line-label"]')!;
    expect(root).toHaveAttribute('data-tone', 'ask');
    expect(root.className).toContain('border-l-4');
    expect(label).toHaveTextContent('Follow-up · 11:46');
    expect(label.className).toContain('--oui-tone-success-fg');
    rerender(<HeardLine pieces={[{ text: 'Right.' }]} label="Them · 11:44" />);
    expect(root).toHaveAttribute('data-tone', 'plain');
    expect(root.className).not.toContain('border-l-4');
    expect(container.querySelector('[data-slot="heard-line-label"]')!.className).toContain(
      '--oui-panel-meta-fg',
    );
  });

  it('is cut after two lines by default and after maxLines when given', () => {
    // happy-dom drops the -webkit-box declarations, so the clamp is read from the markup React writes.
    const markup = (maxLines?: number) =>
      renderToStaticMarkup(
        <HeardLine pieces={[{ text: 'A long sentence.' }]} {...(maxLines ? { maxLines } : {})} />,
      );
    expect(markup()).toContain(
      'style="display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2"',
    );
    expect(markup(1)).toContain('-webkit-line-clamp:1');
    expect(markup(4)).toContain('-webkit-line-clamp:4');
    const { container } = render(<HeardLine pieces={[{ text: 'A long sentence.' }]} />);
    expect(textOf(container).className).toContain('overflow-hidden');
  });

  it('draws no label without one, a node label as given, and forwards ref, className and attributes', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container, rerender } = render(
      <HeardLine ref={ref} pieces={[{ text: 'Go on.' }]} className="mb-2" data-testid="heard" />,
    );
    expect(container.querySelector('[data-slot="heard-line-label"]')).toBeNull();
    expect(ref.current).toBe(screen.getByTestId('heard'));
    expect(screen.getByTestId('heard')).toHaveClass('mb-2', 'flex');
    rerender(<HeardLine pieces={[{ text: 'Go on.' }]} label={<time>11:46</time>} />);
    expect(container.querySelector('[data-slot="heard-line-label"] time')).toHaveTextContent(
      '11:46',
    );
    for (const variant of heardLineVariants) {
      const { container: each, unmount } = render(
        <HeardLine {...heardLinePropsFactory(variant.args)} />,
      );
      expect(each.querySelector('[data-slot="heard-line"]')).toBeInTheDocument();
      unmount();
    }
  });
});
