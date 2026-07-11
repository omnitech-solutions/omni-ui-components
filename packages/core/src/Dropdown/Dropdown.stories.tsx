import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@omnitech/omni-ui-core/Button';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownShortcut,
  DropdownTrigger,
} from '@omnitech/omni-ui-core/Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'omni-ui-components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Menu trigger and content primitives for <primary>action lists, item menus, and contextual controls</primary>. Built on the <primary>shared Omni dropdown-menu wrappers</primary>.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown>;
export const Default: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>Record actions</DropdownLabel>
        <DropdownItem>
          Edit
          <DropdownShortcut>E</DropdownShortcut>
        </DropdownItem>
        <DropdownItem>
          Archive
          <DropdownShortcut>A</DropdownShortcut>
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const WithDestructiveAction: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="outline">More</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>Project</DropdownLabel>
        <DropdownItem>Rename</DropdownItem>
        <DropdownSeparator />
        <DropdownItem className="text-destructive">Delete</DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};

export const Grouped: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>View</DropdownLabel>
        <DropdownItem>Overview</DropdownItem>
        <DropdownItem>Activity</DropdownItem>
        <DropdownSeparator />
        <DropdownLabel>Manage</DropdownLabel>
        <DropdownItem>Permissions</DropdownItem>
        <DropdownItem>Export</DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
};
