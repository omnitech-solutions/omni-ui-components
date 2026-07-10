import type { ColorPickerProps } from '@omnitech/omni-ui-core/ColorPicker';
import type { Variant } from '../../internal/support/makeFactory';

export const colorPickerPropsFactory = (overrides: Partial<ColorPickerProps> = {}): ColorPickerProps => ({
  id: 'demo-color',
  label: 'Brand color',
  value: '#5fd3a6',
  layout: 'vertical',
  required: false,
  disabled: false,
  ...overrides,
});

export const colorPickerVariants: Variant<ColorPickerProps>[] = [
  { name: 'Default', args: { label: 'Default', value: '#5fd3a6' } },
  { name: 'Custom presets', args: { label: 'Custom presets', value: '#ff007a', presets: ['#ff007a', '#7b59d6', '#5fd3a6', '#e07a5f'] } },
  { name: 'Empty', args: { label: 'Empty', value: '' } },
  { name: 'Disabled', args: { label: 'Disabled', disabled: true, value: '#808080' } },
  { name: 'Invalid', args: { label: 'Invalid', error: 'Pick a brand color', required: true, value: '' } },
];
