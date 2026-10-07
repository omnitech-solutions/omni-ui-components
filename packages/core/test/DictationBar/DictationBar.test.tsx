import '@testing-library/jest-dom';

import { DictationBar } from '@oc-tech/omni-ui-components/DictationBar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dictationBarPropsFactory } from 'factories/omni-ui-components/DictationBar/DictationBar.factories';

describe('omni-ui-components/DictationBar', () => {
  it('shows Listening… until words arrive, then the live transcript, in a polite live region', () => {
    const { rerender } = render(<DictationBar {...dictationBarPropsFactory()} />);
    expect(screen.getByText('Listening…')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    rerender(<DictationBar {...dictationBarPropsFactory({ text: 'hello there' })} />);
    expect(screen.getByText('hello there')).toBeInTheDocument();
    expect(screen.queryByText('Listening…')).toBeNull();
  });
  it('has a 20-bar aria-hidden waveform, a record dot only when stacked', () => {
    const { rerender } = render(<DictationBar {...dictationBarPropsFactory()} />);
    const wave = document.querySelector('[data-slot="dictation-wave"]');
    expect(wave).toHaveAttribute('aria-hidden', 'true');
    expect(wave?.children).toHaveLength(20);
    expect(document.querySelector('[data-slot="dictation-record"]')).not.toBeNull();
    rerender(<DictationBar {...dictationBarPropsFactory({ variant: 'pill', bars: 5 })} />);
    expect(document.querySelector('[data-slot="dictation-record"]')).toBeNull();
    expect(document.querySelector('[data-slot="dictation-wave"]')?.children).toHaveLength(5);
  });
  it('Cancel and Done call back; inactive renders nothing; labels are configurable', async () => {
    const onCancel = vi.fn();
    const onDone = vi.fn();
    const { rerender } = render(
      <DictationBar
        {...dictationBarPropsFactory({ onCancel, onDone, labels: { done: 'Terminé' } })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await userEvent.click(screen.getByRole('button', { name: 'Terminé' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledWith('');
    rerender(<DictationBar active={false} />);
    expect(document.querySelector('[data-slot="dictation-bar"]')).toBeNull();
  });
});
