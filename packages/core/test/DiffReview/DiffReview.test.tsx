import '@testing-library/jest-dom';

import {
  type DiffChange,
  DiffReview,
  type DiffReviewActionContext,
  type DiffReviewStatus,
  diffRows,
  diffStats,
  highlightLines,
} from '@oc-tech/omni-ui-components';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CODE_CHANGE,
  DIFF_REVIEW_STATUSES,
  DiffReviewDemo,
  diffReviewPropsFactory,
  diffReviewVariants,
  longChange,
  phaseActions,
  sampleChanges,
} from 'factories/omni-ui-components/DiffReview/DiffReview.factories';

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;
const buttons = () => within(slot('diff-review-footer')).queryAllByRole('button');
const names = () => buttons().map((button) => button.textContent);

describe('omni-ui-components/DiffReview', () => {
  describe('diffStats', () => {
    it('counts added and removed lines', () => {
      expect(diffStats('a\nb\nc', 'a\nB\nc\nd')).toEqual({ added: 2, removed: 1 });
    });
    it('is zero for equal text and counts every line of a new file', () => {
      expect(diffStats('same', 'same')).toEqual({ added: 0, removed: 0 });
      expect(diffStats('', 'a\nb\nc')).toEqual({ added: 3, removed: 0 });
    });
  });

  describe('diffRows', () => {
    const before = Array.from({ length: 10 }, (_, i) => `l${i}`).join('\n');
    const after = before.replace('l1', 'L1').replace('l8', 'L8');
    const kinds = (rows: ReturnType<typeof diffRows>) => rows.map((row) => row.kind);

    it('keeps one line of context around each change and a gap row between distant changes', () => {
      expect(kinds(diffRows(before, after))).toEqual([
        'context',
        'remove',
        'add',
        'context',
        'gap',
        'context',
        'remove',
        'add',
        'context',
      ]);
    });
    it('contextLines widens the window and closes the gap when it is large enough', () => {
      expect(kinds(diffRows(before, after, { contextLines: 3 }))).not.toContain('gap');
      expect(kinds(diffRows(before, after, { contextLines: 0 }))).toEqual([
        'remove',
        'add',
        'gap',
        'remove',
        'add',
      ]);
    });
    it('gives plain tokens without a highlighter and class tokens with one', () => {
      const plain = diffRows('const a = 1;', 'const a = 2;');
      expect(plain[0]).toEqual({ kind: 'remove', tokens: [{ text: 'const a = 1;' }] });
      const colored = diffRows('const a = 1;', 'const a = 2;', {
        highlight: highlightLines,
        language: 'ts',
      });
      expect(
        (colored[0] as { tokens: { className?: string }[] }).tokens.some((token) =>
          token.className?.includes('hljs-keyword'),
        ),
      ).toBe(true);
    });
  });

  describe('card', () => {
    it('is a region with a title, a summary with the totals and one tab per change', () => {
      render(<DiffReview {...diffReviewPropsFactory()} />);
      expect(screen.getByRole('region', { name: 'Proposed change' })).toHaveAttribute(
        'data-slot',
        'diff-review',
      );
      expect(screen.getByText(/3 surfaces · \+\d+ −\d+/)).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getByRole('tab', { name: /Code/ })).toHaveTextContent(/\+\d+/);
    });

    it.each(DIFF_REVIEW_STATUSES)(
      'shows the %s pill and its footer note',
      (status: DiffReviewStatus) => {
        render(<DiffReview {...diffReviewPropsFactory({ status })} />);
        const expected = {
          pending: 'Not applied',
          preview: 'Previewing',
          applied: 'Applied',
          rejected: 'Rejected',
          reverted: 'Rolled back',
          conflicted: 'Not applied',
        }[status];
        expect(slot('diff-review-status')).toHaveTextContent(expected);
        expect(slot('diff-review-status')).toHaveAttribute('data-status', status);
        expect(slot('diff-review-note').textContent).not.toContain('{product}');
      },
    );

    it('fills {product} in the notes and lets a note prop replace them', () => {
      const { rerender } = render(
        <DiffReview {...diffReviewPropsFactory({ status: 'applied', product: 'Studio' })} />,
      );
      expect(slot('diff-review-note')).toHaveTextContent('Applied to Studio');
      rerender(
        <DiffReview
          {...diffReviewPropsFactory({ status: 'conflicted', note: 'Edited elsewhere' })}
        />,
      );
      expect(slot('diff-review-note')).toHaveTextContent('Edited elsewhere');
    });

    it('takes every string from labels', () => {
      render(
        <DiffReview
          {...diffReviewPropsFactory({
            labels: { title: 'Cambio propuesto', statuses: { pending: 'Sin aplicar' } as never },
          })}
        />,
      );
      expect(screen.getByText('Cambio propuesto')).toBeInTheDocument();
      expect(screen.getByText('Sin aplicar')).toBeInTheDocument();
    });

    it('renders the fallback node when there are no changes', () => {
      render(
        <DiffReview
          {...diffReviewPropsFactory({ changes: [], fallback: <code>raw patch</code> })}
        />,
      );
      expect(slot('diff-review-fallback')).toHaveTextContent('raw patch');
      expect(screen.queryByRole('tablist')).toBeNull();
      expect(screen.getByText('Review before applying')).toBeInTheDocument();
    });
  });

  describe('diff variant', () => {
    it('shows the active change as a tabpanel labelled by its tab, with +/− signs and a gap row for a long diff', () => {
      render(<DiffReview {...diffReviewPropsFactory({ changes: [longChange()] })} />);
      const panel = screen.getByRole('tabpanel');
      expect(panel).toHaveAttribute('aria-labelledby', screen.getByRole('tab').id);
      expect(screen.getByRole('separator', { name: 'Unchanged lines hidden' })).toHaveTextContent(
        '⋯',
      );
      expect(within(panel).getAllByText('+').length).toBe(2);
      expect(within(panel).getAllByText('−').length).toBe(2);
    });

    it('colours tokens through the highlight prop and not without it', () => {
      const { rerender, container } = render(
        <DiffReview {...diffReviewPropsFactory({ changes: [CODE_CHANGE] })} />,
      );
      expect(container.querySelector('.hljs-keyword')).not.toBeNull();
      rerender(
        <DiffReview
          {...diffReviewPropsFactory({ changes: [CODE_CHANGE], highlight: undefined })}
        />,
      );
      expect(container.querySelector('.hljs-keyword')).toBeNull();
    });

    it('switches tab on click and reports it', async () => {
      const onTabChange = vi.fn();
      render(<DiffReview {...diffReviewPropsFactory({ onTabChange })} />);
      await userEvent.click(screen.getByRole('tab', { name: /Tests/ }));
      expect(screen.getByRole('tab', { name: /Tests/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('keeps a contained interval');
      expect(onTabChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'tests' }));
    });

    it('moves between tabs with the arrow keys, wrapping, Home and End, with a roving tabindex', async () => {
      render(<DiffReview {...diffReviewPropsFactory()} />);
      const [notes, code, tests] = screen.getAllByRole('tab');
      notes!.focus();
      expect(notes).toHaveAttribute('tabindex', '0');
      expect(code).toHaveAttribute('tabindex', '-1');
      await userEvent.keyboard('{ArrowRight}');
      expect(code).toHaveFocus();
      expect(code).toHaveAttribute('aria-selected', 'true');
      await userEvent.keyboard('{End}');
      expect(tests).toHaveFocus();
      await userEvent.keyboard('{ArrowRight}');
      expect(notes).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      expect(tests).toHaveFocus();
      await userEvent.keyboard('{Home}');
      expect(notes).toHaveFocus();
    });
  });

  describe('checklist variant', () => {
    const checklist = (extra = {}) =>
      diffReviewPropsFactory({
        variant: 'checklist',
        actions: phaseActions({ status: 'pending', variant: 'checklist', onApply: vi.fn() }),
        ...extra,
      });

    it('lists a toggle per change, all on, and labels Apply by the selection', async () => {
      render(<DiffReview {...checklist()} />);
      const toggles = screen.getAllByRole('button', { pressed: true });
      expect(toggles).toHaveLength(3);
      expect(screen.getByText('3 proposed changes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Apply all' })).toBeEnabled();
      await userEvent.click(screen.getByRole('button', { name: 'Code' }));
      expect(screen.getByRole('button', { name: 'Code' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Apply 2' })).toBeInTheDocument();
    });

    it('says Apply both for two changes and disables Apply with none ticked', async () => {
      render(<DiffReview {...checklist({ changes: sampleChanges(2) })} />);
      expect(screen.getByRole('button', { name: 'Apply both' })).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Notes' }));
      await userEvent.click(screen.getByRole('button', { name: 'Code' }));
      expect(screen.getByRole('button', { name: 'Apply 0' })).toBeDisabled();
    });

    it('applies only the ticked ids and reports each tick', async () => {
      const onApply = vi.fn();
      const onSelectionChange = vi.fn();
      render(
        <DiffReview
          {...checklist({
            actions: phaseActions({ status: 'pending', variant: 'checklist', onApply }),
            onSelectionChange,
          })}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Notes' }));
      expect(
        onSelectionChange.mock.lastCall![0].map((change: { id: string }) => change.id),
      ).toEqual(['code', 'tests']);
      await userEvent.click(screen.getByRole('button', { name: 'Apply 2' }));
      expect(onApply.mock.calls[0]![0].selected.map((change: { id: string }) => change.id)).toEqual(
        ['code', 'tests'],
      );
    });

    it('locks the toggles once the proposal is no longer pending, and falls back to tabs for a single change', () => {
      const { rerender } = render(<DiffReview {...checklist({ status: 'applied' })} />);
      for (const toggle of screen.getAllByRole('button', { pressed: true }))
        expect(toggle).toBeDisabled();
      rerender(<DiffReview {...checklist({ changes: sampleChanges(1) })} />);
      expect(slot('diff-review')).toHaveAttribute('data-variant', 'diff');
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('phaseActions', () => {
    const all = {
      onApply: vi.fn(),
      onReject: vi.fn(),
      onPreview: vi.fn(),
      onStopPreview: vi.fn(),
      onUndo: vi.fn(),
      onRestore: vi.fn(),
    };
    const labelsOf = (
      status: DiffReviewStatus,
      variant: 'diff' | 'checklist' = 'diff',
      handlers = all,
    ) => {
      const { unmount } = render(
        <DiffReview
          {...diffReviewPropsFactory({
            status,
            variant,
            actions: phaseActions({ status, variant, ...handlers }),
          })}
        />,
      );
      const result = names();
      unmount();
      return result;
    };

    it('reproduces the phase table', () => {
      expect(labelsOf('pending')).toEqual(['Reject', 'Preview in app', 'Apply']);
      expect(labelsOf('pending', 'checklist')).toEqual(['Discard', 'Preview', 'Apply all']);
      expect(labelsOf('preview')).toEqual(['Stop preview', 'Apply']);
      expect(labelsOf('applied')).toEqual(['Undo']);
      expect(labelsOf('rejected')).toEqual(['Restore proposal']);
      expect(labelsOf('reverted')).toEqual(['Re-apply']);
      expect(labelsOf('conflicted')).toEqual([]);
    });

    it('leaves out the buttons whose handler is missing', () => {
      expect(labelsOf('pending', 'diff', { ...all, onPreview: undefined as never })).toEqual([
        'Reject',
        'Apply',
      ]);
      expect(labelsOf('applied', 'diff', { onApply: vi.fn() } as never)).toEqual([]);
    });

    it('disables everything while working', () => {
      render(
        <DiffReview
          {...diffReviewPropsFactory({
            actions: phaseActions({ status: 'pending', working: true, ...all }),
          })}
        />,
      );
      for (const button of buttons()) expect(button).toBeDisabled();
    });
  });

  describe('demo wiring', () => {
    it('walks pending → applied → rolled back → applied', async () => {
      render(<DiffReviewDemo />);
      await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
      expect(slot('diff-review-status')).toHaveTextContent('Applied');
      await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
      expect(slot('diff-review-status')).toHaveTextContent('Rolled back');
      await userEvent.click(screen.getByRole('button', { name: 'Re-apply' }));
      expect(slot('diff-review-status')).toHaveTextContent('Applied');
    });
  });

  it('does not render an action without a handler', () => {
    render(
      <DiffReview
        {...diffReviewPropsFactory({ actions: [{ key: 'x', label: 'Ghost' } as never] })}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Ghost' })).toBeNull();
  });

  describe('callbacks', () => {
    it('action onClick gets the ticked changes and the context', async () => {
      const onClick = vi.fn();
      render(
        <DiffReview
          {...diffReviewPropsFactory({
            variant: 'checklist',
            actions: [{ key: 'go', label: 'Go', onClick }],
          })}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Tests' }));
      await userEvent.click(screen.getByRole('button', { name: 'Go' }));
      const changes = sampleChanges();
      expect(onClick).toHaveBeenCalledWith({
        changes: expect.any(Array),
        selected: [
          expect.objectContaining({ id: 'notes' }),
          expect.objectContaining({ id: 'code' }),
        ],
        variant: 'checklist',
        status: 'pending',
      });
      expect(onClick.mock.calls[0]![0].changes).toHaveLength(changes.length);
    });

    it('selection works controlled: the ids come from the prop and the change is reported', async () => {
      const onSelectionChange = vi.fn();
      render(
        <DiffReview
          {...diffReviewPropsFactory({
            variant: 'checklist',
            selectedIds: ['notes'],
            onSelectionChange,
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Notes' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Code' })).toHaveAttribute('aria-pressed', 'false');
      await userEvent.click(screen.getByRole('button', { name: 'Code' }));
      expect(
        onSelectionChange.mock.lastCall![0].map((change: { id: string }) => change.id),
      ).toEqual(['notes', 'code']);
      expect(screen.getByRole('button', { name: 'Code' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('the tab works controlled and reports the change', async () => {
      const onTabChange = vi.fn();
      render(<DiffReview {...diffReviewPropsFactory({ activeId: 'code', onTabChange })} />);
      expect(screen.getByRole('tab', { name: /Code/ })).toHaveAttribute('aria-selected', 'true');
      await userEvent.click(screen.getByRole('tab', { name: /Notes/ }));
      expect(onTabChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'notes' }));
      expect(screen.getByRole('tab', { name: /Code/ })).toHaveAttribute('aria-selected', 'true');
    });
  });

  it("passes the caller's own change objects to every callback, extra fields intact (generic over the item)", async () => {
    type Owned = DiffChange & { owner: string };
    const changes: Owned[] = sampleChanges().map((change, index) => ({
      ...change,
      owner: `owner-${index}`,
    }));
    const onClick = vi.fn((context: DiffReviewActionContext<Owned>) => {
      // Compile-time: the extra field is visible on the full change.
      const owner: string = context.selected[0]!.owner;
      return owner;
    });
    const onTabChange = vi.fn((change: Owned) => change.owner);
    const onSelectionChange = vi.fn((selected: Owned[]) => selected.length);
    render(
      <DiffReview<Owned>
        changes={changes}
        variant="checklist"
        actions={[{ key: 'go', label: 'Go', onClick }]}
        onTabChange={onTabChange}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Code' }));
    expect(onSelectionChange.mock.calls[0]![0]).toEqual([changes[0], changes[2]]);
    expect(onSelectionChange.mock.calls[0]![0][0]).toBe(changes[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Go' }));
    const context = onClick.mock.calls[0]![0];
    expect(context.changes).toBe(changes);
    expect(context.selected[0]).toBe(changes[0]);
    expect(context.selected[1]).toBe(changes[2]);
    expect(onClick).toHaveReturnedWith('owner-0');
    const { unmount } = render(<DiffReview<Owned> changes={changes} onTabChange={onTabChange} />);
    await userEvent.click(screen.getAllByRole('tab', { name: /Tests/ })[0]!);
    expect(onTabChange.mock.calls[0]![0]).toBe(changes[2]);
    unmount();
  });

  it('every documented variant renders', () => {
    for (const variant of diffReviewVariants) {
      const { unmount } = render(<DiffReview {...diffReviewPropsFactory(variant.args)} />);
      expect(slot('diff-review')).toBeInTheDocument();
      unmount();
    }
  });
});
