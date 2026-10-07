import '@testing-library/jest-dom';

import { PreferencesForm } from '@oc-tech/omni-ui-components/PreferencesForm';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  preferencesFormPropsFactory,
  preferencesFormVariants,
  sampleMemories,
} from 'factories/omni-ui-components/PreferencesForm/PreferencesForm.factories';

describe('omni-ui-components/PreferencesForm', () => {
  it('shows the instructions in a labelled textarea capped at 4000', () => {
    render(<PreferencesForm {...preferencesFormPropsFactory()} />);
    const field = screen.getByLabelText('Custom instructions');
    expect(field).toHaveValue('Answer in short bullet points. Say the complexity out loud.');
    expect(field).toHaveAttribute('maxlength', '4000');
    expect(screen.getByText('Added to every conversation. Keep it short.')).toBeInTheDocument();
  });

  it('onChange fires on every keystroke with the new text', () => {
    const onChange = jest.fn();
    render(<PreferencesForm {...preferencesFormPropsFactory({ instructions: '', onChange })} />);
    const field = screen.getByLabelText('Custom instructions');
    fireEvent.change(field, { target: { value: 'B' } });
    fireEvent.change(field, { target: { value: 'Be brief' } });
    expect(onChange).toHaveBeenNthCalledWith(1, 'B');
    expect(onChange).toHaveBeenNthCalledWith(2, 'Be brief');
  });

  it('replaces the field when the instructions change from outside', () => {
    const { rerender } = render(
      <PreferencesForm {...preferencesFormPropsFactory({ instructions: 'one' })} />,
    );
    rerender(<PreferencesForm {...preferencesFormPropsFactory({ instructions: 'two' })} />);
    expect(screen.getByLabelText('Custom instructions')).toHaveValue('two');
  });

  it('onMemoryToggle fires with the new value', async () => {
    const onMemoryToggle = jest.fn();
    render(<PreferencesForm {...preferencesFormPropsFactory({ onMemoryToggle })} />);
    const toggle = screen.getByRole('switch', { name: 'Memory' });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(onMemoryToggle).toHaveBeenCalledWith(false);
  });

  it('onForget fires with the full memory item, by reference', async () => {
    const onForget = jest.fn();
    const memories = sampleMemories();
    render(<PreferencesForm {...preferencesFormPropsFactory({ memories, onForget })} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Forget: Prefers TypeScript over JavaScript' }),
    );
    expect(onForget).toHaveBeenCalledTimes(1);
    expect(onForget.mock.calls[0][0]).toBe(memories[0]);
  });

  it('the empty list says so; no memories prop hides the section; loading shows only Loading…', () => {
    const { rerender } = render(
      <PreferencesForm {...preferencesFormPropsFactory({ memories: [] })} />,
    );
    expect(
      screen.getByText('No memories yet. Say “remember that…” in any chat.'),
    ).toBeInTheDocument();
    rerender(<PreferencesForm {...preferencesFormPropsFactory(preferencesFormVariants[1].args)} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    rerender(<PreferencesForm {...preferencesFormPropsFactory(preferencesFormVariants[3].args)} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByLabelText('Custom instructions')).not.toBeInTheDocument();
  });

  it('translates labels', () => {
    render(
      <PreferencesForm
        {...preferencesFormPropsFactory({
          labels: { instructionsTitle: 'Instrucciones', memorySwitch: 'Memoria' },
        })}
      />,
    );
    expect(screen.getByLabelText('Instrucciones')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Memoria' })).toBeInTheDocument();
  });
});
