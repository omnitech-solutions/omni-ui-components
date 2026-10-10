import '@testing-library/jest-dom';

import { RichText } from '@oc-tech/omni-ui-components/RichText';
import { render, waitFor } from '@testing-library/react';

/** The editor's editable area (its `role="textbox"` element), once the editor has mounted. */
const editable = () =>
  waitFor(() => {
    const node = document.querySelector<HTMLElement>('.ProseMirror[role="textbox"]');
    expect(node).not.toBeNull();
    return node as HTMLElement;
  });

describe('omni-ui-components/RichText', () => {
  it('names the editable area by the label, and it carries the required state and the description', async () => {
    const warn = vi.spyOn(console, 'warn');
    render(<RichText id="notes" label="Notes" description="Markdown is fine" required />);
    const textbox = await editable();
    await waitFor(() => expect(textbox).toHaveAccessibleName('Notes'));
    expect(textbox).toHaveAttribute('aria-required', 'true');
    expect(textbox).toHaveAttribute('aria-multiline', 'true');
    expect(textbox).toHaveAccessibleDescription('Markdown is fine');
    // The required state is on the textbox, not on the element around it.
    expect(document.getElementById('notes')).not.toHaveAttribute('aria-required');
    // Underline comes with the starter kit: it is not registered a second time.
    expect(warn.mock.calls.flat().join(' ')).not.toMatch(/Duplicate extension names/);
    warn.mockRestore();
  });

  it('without a label the placeholder names it', async () => {
    render(<RichText placeholder="Write a reply" />);
    const textbox = await editable();
    await waitFor(() => expect(textbox).toHaveAccessibleName('Write a reply'));
  });
});
