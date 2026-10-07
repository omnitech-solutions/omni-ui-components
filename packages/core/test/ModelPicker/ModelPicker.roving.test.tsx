import '@testing-library/jest-dom';

import { ModelMenu } from '@oc-tech/omni-ui-components';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { modelPickerPropsFactory } from 'factories/omni-ui-components/ModelPicker/ModelPicker.factories';

const rowList = () => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="model-row"]'));
const stops = () => rowList().filter((row) => row.getAttribute('tabindex') === '0');

describe('omni-ui-components/ModelPicker roving tabindex', () => {
  const { models, selectedId } = modelPickerPropsFactory();

  it('has one tab stop among the rows, the selected one', () => {
    render(<ModelMenu models={models} selectedId={selectedId} />);
    expect(rowList().length).toBeGreaterThan(2);
    expect(stops()).toHaveLength(1);
    expect(stops()[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('falls back to the first row when nothing is selected', () => {
    render(<ModelMenu models={models} />);
    expect(stops()).toEqual([rowList()[0]]);
  });

  it('Up and Down move across rows (and provider sections), wrapping; Home and End jump', async () => {
    render(<ModelMenu models={models} selectedId={selectedId} />);
    stops()[0].focus();
    const all = rowList();
    const at = all.indexOf(stops()[0]);
    await userEvent.keyboard('{ArrowDown}');
    expect(all[(at + 1) % all.length]).toHaveFocus();
    expect(stops()).toEqual([all[(at + 1) % all.length]]);
    await userEvent.keyboard('{End}');
    expect(all[all.length - 1]).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(all[0]).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(all[all.length - 1]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(all[0]).toHaveFocus();
  });

  it('Tab leaves the rows for the effort control; Enter and Space pick the focused row', async () => {
    const onPick = vi.fn();
    render(<ModelMenu models={models} selectedId={selectedId} onPick={onPick} />);
    stops()[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    const focused = document.activeElement as HTMLElement;
    await userEvent.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    expect(onPick).toHaveBeenCalledTimes(2);
    await userEvent.tab();
    expect(rowList().includes(document.activeElement as HTMLElement)).toBe(false);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(focused);
  });
});
