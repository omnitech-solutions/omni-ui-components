import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AutoComplete } from '@oc-tech/omni-ui-components/AutoComplete';

const meta: Meta<typeof AutoComplete> = {
  title: 'omni-ui-components/AutoComplete',
  component: AutoComplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Autocomplete input built on the <primary>Omni field chrome</primary>. It supports <primary>controlled text entry</primary> with a suggestion list rendered in a popover.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof AutoComplete>;
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <AutoComplete
        label="Assignee"
        value={value}
        onChange={setValue}
        options={[
          { value: 'alex.morgan' },
          { value: 'jamie.chen' },
          { value: 'samir.patel' },
        ]}
      />
    );
  },
};

export const Prefilled: Story = {
  render: () => {
    const [value, setValue] = React.useState('jam');
    return (
      <AutoComplete
        label="Reviewer"
        value={value}
        onChange={setValue}
        options={[{ value: 'jamie.chen' }, { value: 'james.brooks' }, { value: 'jane.miller' }]}
      />
    );
  },
};
