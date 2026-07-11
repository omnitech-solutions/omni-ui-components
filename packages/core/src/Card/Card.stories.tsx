import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@omnitech/omni-ui-core/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@omnitech/omni-ui-core/Card';

const meta: Meta<typeof Card> = {
  title: 'omni-ui-components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Composable <primary>bordered content container</primary> with <primary>optional header, description, body, and footer regions</primary>.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Quarterly Summary</CardTitle>
        <CardDescription>Performance snapshot for the current reporting period.</CardDescription>
      </CardHeader>
      <CardContent>
        Revenue is up 12.4% month over month, while churn remains below target.
      </CardContent>
      <CardFooter className="justify-end">
        <Button buttonSize="sm">View report</Button>
      </CardFooter>
    </Card>
  ),
};

export const Compact: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Compact card</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">Smaller card composition for dense layouts.</CardContent>
    </Card>
  ),
};
