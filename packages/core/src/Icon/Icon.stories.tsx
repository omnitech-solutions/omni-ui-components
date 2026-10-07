import type { Meta, StoryObj } from '@storybook/react';
import { icons } from './Icon';

const NAMES = ['Check', 'X', 'Copy', 'Mic', 'Settings', 'Search', 'Trash2', 'Pencil'] as const;

const meta = {
  title: 'omni-ui-components/Icon',
  parameters: {
    docs: {
      description: {
        component:
          'Re-export of the lucide `icons` map. Icons are passed to components as `ReactNode` props.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 16, color: 'var(--oui-text, currentColor)' }}>
      {NAMES.map((name) => {
        const Glyph = icons[name];
        return <Glyph key={name} aria-label={name} size={20} />;
      })}
    </div>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
