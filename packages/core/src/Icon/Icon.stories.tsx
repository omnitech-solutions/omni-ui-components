import type { Meta, StoryObj } from '@storybook/react';
import { icons } from './Icon';

const meta = {
  title: 'omni-ui-components/Icon',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Re-export of the lucide `icons` map. Icons are passed to components as `ReactNode` props.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** An icon is looked up by name in `icons` and drawn as a component. */
export const Default: Story = {
  render: () => {
    const names = ['Check', 'X', 'Copy', 'Mic', 'Settings', 'Search', 'Trash2', 'Pencil'] as const;
    return (
      <div style={{ display: 'flex', gap: 16, color: 'var(--oui-text, currentColor)' }}>
        {names.map((name) => {
          const Glyph = icons[name];
          return <Glyph key={name} aria-label={name} size={20} />;
        })}
      </div>
    );
  },
};
