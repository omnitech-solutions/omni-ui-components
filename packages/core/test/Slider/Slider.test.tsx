import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

beforeAll(() => {
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { Slider, type SliderProps } from '@omnitech/omni-ui-core/Slider';

const renderSlider = (overrides: Partial<SliderProps> = {}) => render(<Slider data-testid="s" label="Volume" min={0} max={100} value={35} {...overrides} />);

describe('omni-ui-components/Slider', () => {
  describe('shape', () => {
    it('renders the radix slider root with the label', () => {
      renderSlider();
      expect(document.querySelector('[data-slot="slider"]')).toBeInTheDocument();
      expect(screen.getByText('Volume')).toBeInTheDocument();
    });

    it('renders a single thumb for a number value', () => {
      renderSlider({ value: 50 });
      const thumbs = document.querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs.length).toBe(1);
    });

    it('renders two thumbs for a range value', () => {
      renderSlider({ value: [20, 80], label: 'Price' });
      const thumbs = document.querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs.length).toBe(2);
    });

    it('shows the current value next to the label by default', () => {
      renderSlider({ value: 42, valueSuffix: '%' });
      expect(screen.getByText('42%')).toBeInTheDocument();
    });

    it('hides the inline value when showValue=false', () => {
      renderSlider({ value: 42, showValue: false });
      expect(document.querySelector('[data-slot="slider-value"]')).not.toBeInTheDocument();
    });

    it('formats range values with a separator', () => {
      renderSlider({ value: [10, 90], valueSuffix: 'px', label: 'Range' });
      expect(screen.getByText('10px – 90px')).toBeInTheDocument();
    });
  });

  describe('aria + state', () => {
    it('flags aria-invalid on the slider root when error is present', () => {
      renderSlider({ error: 'too low' });
      expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('aria-invalid', 'true');
    });

    it('exposes the radix role=slider thumb', () => {
      renderSlider();
      const thumb = document.querySelector('[role="slider"]') as HTMLElement;
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '100');
      expect(thumb).toHaveAttribute('aria-valuenow', '35');
    });

    it('renders a required asterisk on the label when required', () => {
      renderSlider({ required: true });
      expect(screen.getByText('Volume').parentElement?.textContent).toContain('*');
    });

    it('renders disabled when disabled=true', () => {
      renderSlider({ disabled: true });
      const root = document.querySelector('[data-slot="slider"]');
      expect(root).toHaveAttribute('data-disabled');
    });
  });
});
