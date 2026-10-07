import '@testing-library/jest-dom';

import { FeedbackPanel, type FeedbackReason } from '@oc-tech/omni-ui-components/FeedbackPanel';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { feedbackPanelPropsFactory } from 'factories/omni-ui-components/FeedbackPanel/FeedbackPanel.factories';
import { expectTypeOf } from 'vitest';

describe('omni-ui-components/FeedbackPanel', () => {
  it('shows the heading and a pressed-state chip per reason', () => {
    render(<FeedbackPanel {...feedbackPanelPropsFactory({ defaultSelected: ['too-long'] })} />);
    expect(screen.getByRole('group', { name: 'What went wrong?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Too long' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Incorrect' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('toggles reasons; Send reports the chosen items in the order chosen, by reference', async () => {
    const onSubmit = vi.fn();
    const onSelectedChange = vi.fn();
    const props = feedbackPanelPropsFactory({ onSubmit, onSelectedChange });
    render(<FeedbackPanel {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Too long' }));
    await userEvent.click(screen.getByRole('button', { name: 'Incorrect' }));
    await userEvent.click(screen.getByRole('button', { name: 'Too long' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
    expect(onSelectedChange.mock.lastCall![0]).toEqual([props.reasons[0]]);
    expect(onSelectedChange.mock.lastCall![0][0]).toBe(props.reasons[0]);
    expect(onSubmit).toHaveBeenCalledWith({ reasons: [props.reasons[0]] });
    expect(onSubmit.mock.calls[0]![0].reasons[0]).toBe(props.reasons[0]);
  });

  it('Cancel calls onCancel; Send can be disabled; labels are config', async () => {
    const onCancel = vi.fn();
    render(
      <FeedbackPanel
        {...feedbackPanelPropsFactory({
          onCancel,
          submitDisabled: true,
          labels: { cancel: 'Abbrechen', title: 'Was war falsch?' },
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(onCancel).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send feedback' })).toBeDisabled();
    expect(screen.getByRole('group', { name: 'Was war falsch?' })).toBeInTheDocument();
  });

  it('is controlled by selected ids', () => {
    render(<FeedbackPanel {...feedbackPanelPropsFactory({ selected: ['incorrect'] })} />);
    expect(screen.getByRole('button', { name: 'Incorrect' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('buttons are not drawn without their callbacks', () => {
    render(
      <FeedbackPanel
        {...feedbackPanelPropsFactory({ onSubmit: undefined, onCancel: undefined })}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Send feedback' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
  });

  it('onToggle reports the full reason item and whether it is now chosen', async () => {
    const onToggle = vi.fn();
    const props = feedbackPanelPropsFactory({ onToggle });
    render(<FeedbackPanel {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Too long' }));
    await userEvent.click(screen.getByRole('button', { name: 'Too long' }));
    expect(onToggle.mock.calls).toEqual([
      [props.reasons[2], true],
      [props.reasons[2], false],
    ]);
    expect(onToggle.mock.calls[0]![0]).toBe(props.reasons[2]);
  });

  it('withNote draws a note field and submit carries the note; without it there is no note key', async () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <FeedbackPanel {...feedbackPanelPropsFactory({ onSubmit, withNote: true })} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Incorrect' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Anything else? (optional)' }),
      '  wrong answer ',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ note: 'wrong answer' });
    rerender(<FeedbackPanel {...feedbackPanelPropsFactory({ onSubmit })} />);
    expect(screen.queryByRole('textbox')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
    expect(onSubmit.mock.lastCall![0]).not.toHaveProperty('note');
  });

  it('onSelectedChange fires in controlled mode too', async () => {
    const onSelectedChange = vi.fn();
    const props = feedbackPanelPropsFactory({ selected: [], onSelectedChange });
    render(<FeedbackPanel {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Incorrect' }));
    expect(onSelectedChange).toHaveBeenCalledWith([props.reasons[0]]);
  });

  it('extended reasons reach every callback by reference; their extra fields are typed', async () => {
    type Reason = FeedbackReason & { severity: number };
    const reasons: Reason[] = [
      { id: 'wrong', label: 'Wrong', severity: 3 },
      { id: 'long', label: 'Long', severity: 1 },
    ];
    const onToggle = vi.fn((reason: Reason) => {
      expectTypeOf(reason.severity).toEqualTypeOf<number>();
    });
    const onSubmit = vi.fn((feedback: { reasons: Reason[]; note?: string }) => {
      expectTypeOf(feedback.reasons[0]!.severity).toEqualTypeOf<number>();
    });
    render(<FeedbackPanel<Reason> reasons={reasons} onToggle={onToggle} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Wrong' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
    expect(onToggle.mock.calls[0]![0]).toBe(reasons[0]);
    expect(onSubmit.mock.calls[0]![0].reasons[0]).toBe(reasons[0]);
  });
});
