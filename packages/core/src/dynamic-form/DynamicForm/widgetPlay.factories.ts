import { expect, userEvent, waitFor } from 'storybook/test';
import { focusFieldIn } from '../lib/widgetKit';

/**
 * For a story's `play`: puts focus in a field the way a host does (by its key), so the rest of the play can
 * drive the control from the keyboard alone. Throws when the field cannot take focus.
 */
export const focusStoryField = (canvasElement: HTMLElement, key = 'f'): HTMLElement => {
  if (!focusFieldIn(canvasElement, key))
    throw new Error(`The field "${key}" could not take focus.`);
  return canvasElement.ownerDocument.activeElement as HTMLElement;
};

/** The wrapper the field template draws around a field, by key. */
export const storyField = (canvasElement: HTMLElement, key = 'f'): HTMLElement =>
  canvasElement.querySelector(`[data-field-id="root_${key}"]`) as HTMLElement;

/**
 * A `play` for any widget story: the first field of the form is reached by key, holds focus on a control that is
 * not disabled, lets focus leave with Tab and takes it back with Shift+Tab. It proves the control is a keyboard
 * stop; what each key then does to the value is tested per widget in `dynamic-form/test`.
 */
export const playKeyboardReach = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const field = canvasElement.querySelector(
    '[data-field-id]:not([data-field-id="root"])',
  ) as HTMLElement;
  const key = (field.getAttribute('data-field-id') ?? '').replace(/^root_/, '').split('_');
  const control = focusStoryField(canvasElement, key.join('.'));
  await expect(field.contains(control)).toBe(true);
  await expect(control).not.toBeDisabled();
  await userEvent.tab();
  await expect(canvasElement.ownerDocument.activeElement).not.toBe(control);
  await userEvent.tab({ shift: true });
  await expect(field.contains(canvasElement.ownerDocument.activeElement)).toBe(true);
};

const firstField = (canvasElement: HTMLElement) => {
  const field = canvasElement.querySelector(
    '[data-field-id]:not([data-field-id="root"])',
  ) as HTMLElement;
  const key = (field.getAttribute('data-field-key') ?? '').toString();
  return { field, control: focusStoryField(canvasElement, key) };
};

/** A text-like widget: focus by key, type, and the control holds what was typed. */
export const playKeyboardType =
  (text: string) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const { control } = firstField(canvasElement);
    await userEvent.keyboard(text);
    await expect((control as HTMLInputElement).value).toContain(text);
  };

/** A boolean widget: focus by key, Space flips `aria-checked`, Space again flips it back. */
export const playKeyboardToggle = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { control } = firstField(canvasElement);
  const before = control.getAttribute('aria-checked');
  await userEvent.keyboard(' ');
  await expect(control.getAttribute('aria-checked')).not.toBe(before);
  await userEvent.keyboard(' ');
  await expect(control.getAttribute('aria-checked')).toBe(before);
};

/** A radio group: focus by key lands on an option; a held arrow key moves to the next option and chooses it. */
export const playKeyboardArrows = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { field, control } = firstField(canvasElement);
  const active = () => canvasElement.ownerDocument.activeElement as HTMLElement;
  // Held, as a person holds it: the group moves focus a tick after keydown and chooses while the key is down.
  await userEvent.keyboard('{ArrowDown>}');
  await waitFor(() => expect(active()).not.toBe(control));
  await userEvent.keyboard('{/ArrowDown}');
  await expect(field.contains(active())).toBe(true);
  await waitFor(() => expect(active()).toHaveAttribute('aria-checked', 'true'));
};

/** A list behind a trigger: Enter opens it, an arrow key and Enter pick, the list closes and the trigger shows the pick. */
export const playKeyboardPick = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { control } = firstField(canvasElement);
  const before = control.textContent;
  await userEvent.keyboard('{Enter}');
  await expect(control).toHaveAttribute('aria-expanded', 'true');
  await userEvent.keyboard('{ArrowDown}{Enter}');
  await expect(control).toHaveAttribute('aria-expanded', 'false');
  await expect(control.textContent).not.toBe(before);
};

/** A slider: focus by key lands on the thumb, and an arrow key moves the value. */
export const playKeyboardSlide = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const { control } = firstField(canvasElement);
  const before = control.getAttribute('aria-valuenow');
  await userEvent.keyboard('{ArrowRight}');
  await waitFor(() => expect(control.getAttribute('aria-valuenow')).not.toBe(before));
};
