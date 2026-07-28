import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../Card';
import { Masonry } from './Masonry';

const meta = { title: 'omni-ui-components/Masonry', component: Masonry } satisfies Meta<typeof Masonry>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Masonry columns={{ xs: 1, sm: 2, md: 4 }} gutter={16} items={[
      { key: 1, children: <Card className="h-56 p-5">1</Card> },
      { key: 2, children: <Card className="h-24 p-5">2</Card> },
      { key: 3, children: <Card className="h-32 p-5">3</Card> },
      { key: 4, children: <Card className="h-28 p-5">4</Card> },
      { key: 5, children: <Card className="h-40 p-5"><strong>I&apos;m Special</strong><p className="mt-2 text-muted-foreground">Let&apos;s have a meal</p></Card> },
      { key: 6, children: <Card className="h-64 p-5">6</Card> },
      { key: 7, children: <Card className="h-48 p-5">7</Card> },
      { key: 8, children: <Card className="h-36 p-5">8</Card> },
    ]} />
  ),
};

export const ItemRender: StoryObj<typeof meta> = {
  render: () => <Masonry columns={3} gutter={[12, 20]} items={[{ key: 'a', data: 'Alpha' }, { key: 'b', data: 'Beta' }, { key: 'c', data: 'Gamma' }]} itemRender={(item) => <Card className="p-4">{item.data}</Card>} />,
};
