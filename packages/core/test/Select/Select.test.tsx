import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/* cmdk auto-scrolls the focused option; jsdom has no scrollIntoView. */
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
  /* Radix Popover uses pointer capture in its outside-click guard. */
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { Select, type SelectProps, type SelectSize, type SelectVariant } from '@oc-tech/omni-ui-components/Select';

const baseOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
];

const renderSelect = (overrides: Partial<SelectProps> = {}) => render(<Select data-testid="s" options={baseOptions} {...overrides} />);

/* The combobox renders BOTH a Popover-trigger <button> (visible) and a
 * hidden native <select> (for form data + tests). `screen.getByTestId('s')`
 * resolves to the trigger button; `s-popover` resolves to the popover
 * content; `s-option-XX` resolves to a CommandItem inside the popover. */

describe('omni-ui-components/Select', () => {
  describe('trigger shape — variants × sizes', () => {
    const variants: SelectVariant[] = ['ghost', 'bordered'];
    const sizes: SelectSize[] = ['sm', 'default', 'md', 'lg'];
    describe.each(variants)('variant=%s', (variant) => {
      it.each(sizes)('renders the trigger button at size=%s', (size) => {
        renderSelect({ variant, selectSize: size });
        const el = screen.getByTestId('s');
        expect(el).toBeInTheDocument();
        expect(el.tagName).toBe('BUTTON');
        expect(el).toHaveAttribute('data-variant', variant);
        expect(el).toHaveAttribute('data-select-size', size);
      });
    });
  });

  describe('label / description / error chrome', () => {
    it('renders the label when provided', () => {
      renderSelect({ label: 'Country' });
      expect(screen.getByText('Country')).toBeInTheDocument();
    });

    it('renders the description when no error is present', () => {
      renderSelect({ description: 'where your team is based' });
      expect(screen.getByText('where your team is based')).toBeInTheDocument();
    });

    it('suppresses description when an error is shown', () => {
      renderSelect({ description: 'helper', error: 'required' });
      expect(screen.queryByText('helper')).not.toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('required');
    });
  });

  describe('a11y attributes', () => {
    it('flags aria-invalid when error is present', () => {
      renderSelect({ error: 'required' });
      expect(screen.getByTestId('s')).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-required when required', () => {
      renderSelect({ required: true });
      expect(screen.getByTestId('s')).toHaveAttribute('aria-required', 'true');
    });

    it('exposes aria-haspopup=listbox on the trigger', () => {
      renderSelect();
      expect(screen.getByTestId('s')).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('toggles aria-expanded when the popover opens', async () => {
      const user = userEvent.setup();
      renderSelect();
      const trigger = screen.getByTestId('s');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('binds the label to the trigger via htmlFor / id', () => {
      renderSelect({ id: 'country', label: 'Country' });
      const trigger = screen.getByTestId('s');
      expect(trigger).toHaveAttribute('id', 'country');
      expect(screen.getByText('Country').closest('label')).toHaveAttribute('for', 'country');
    });
  });

  describe('trigger label', () => {
    it('shows placeholder when value is empty', () => {
      renderSelect({ placeholder: 'Select country…' });
      expect(screen.getByTestId('s')).toHaveTextContent('Select country…');
    });

    it('shows the selected option label when a value is set', () => {
      renderSelect({ value: 'CA' });
      expect(screen.getByTestId('s')).toHaveTextContent('Canada');
    });

    it('sets data-placeholder when value is empty', () => {
      renderSelect();
      expect(screen.getByTestId('s')).toHaveAttribute('data-placeholder', 'true');
    });

    it('drops data-placeholder when a value is selected', () => {
      renderSelect({ value: 'US' });
      expect(screen.getByTestId('s')).not.toHaveAttribute('data-placeholder');
    });
  });

  describe('popover + selection', () => {
    it('opens the popover when the trigger is clicked', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByTestId('s'));
      expect(screen.getByTestId('s-popover')).toBeInTheDocument();
    });

    it('lists every option as a CommandItem inside the popover', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByTestId('s'));
      const popover = screen.getByTestId('s-popover');
      baseOptions.forEach((opt) => {
        expect(within(popover).getByText(opt.label)).toBeInTheDocument();
      });
    });

    it('calls onChange with the picked value', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      renderSelect({ onChange: handleChange });
      await user.click(screen.getByTestId('s'));
      await user.click(screen.getByTestId('s-option-CA'));
      expect(handleChange).toHaveBeenCalledWith('CA');
    });

    it('closes the popover after selection', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByTestId('s'));
      await user.click(screen.getByTestId('s-option-CA'));
      expect(screen.queryByTestId('s-popover')).not.toBeInTheDocument();
    });

    it('does NOT render the search input by default', async () => {
      const user = userEvent.setup();
      renderSelect();
      await user.click(screen.getByTestId('s'));
      expect(within(screen.getByTestId('s-popover')).queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });

    it('renders the search input when searchable=true', async () => {
      const user = userEvent.setup();
      renderSelect({ searchable: true });
      await user.click(screen.getByTestId('s'));
      expect(within(screen.getByTestId('s-popover')).getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('renders an empty state when searchable + search filters everything', async () => {
      const user = userEvent.setup();
      renderSelect({ searchable: true });
      await user.click(screen.getByTestId('s'));
      const input = within(screen.getByTestId('s-popover')).getByPlaceholderText(/search/i);
      await user.type(input, 'qqqzzz');
      expect(within(screen.getByTestId('s-popover')).getByText(/no results/i)).toBeInTheDocument();
    });

    it('marks the currently-selected option with data-current', async () => {
      const user = userEvent.setup();
      renderSelect({ value: 'CA' });
      await user.click(screen.getByTestId('s'));
      expect(screen.getByTestId('s-option-CA')).toHaveAttribute('data-current', 'true');
      expect(screen.getByTestId('s-option-US')).not.toHaveAttribute('data-current');
    });
  });

  describe('hidden native <select> mirror', () => {
    it('reflects the controlled value in the hidden <select>', () => {
      renderSelect({ value: 'UK' });
      const native = document.querySelector('select') as HTMLSelectElement;
      expect(native.value).toBe('UK');
    });

    it('renders one <option> per entry plus the placeholder', () => {
      renderSelect({ placeholder: 'Select…' });
      const native = document.querySelector('select');
      expect(native?.querySelectorAll('option')).toHaveLength(baseOptions.length + 1);
    });
  });

  describe('disabled state', () => {
    it('renders the trigger as disabled when disabled is true', () => {
      renderSelect({ disabled: true });
      expect(screen.getByTestId('s')).toBeDisabled();
    });

    it('does not open the popover when disabled', async () => {
      const user = userEvent.setup();
      renderSelect({ disabled: true });
      await user.click(screen.getByTestId('s'));
      expect(screen.queryByTestId('s-popover')).not.toBeInTheDocument();
    });
  });
});
