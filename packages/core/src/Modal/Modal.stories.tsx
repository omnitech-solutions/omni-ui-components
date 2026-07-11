import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@omnitech/omni-ui-core/Button';
import { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from '@omnitech/omni-ui-core/Modal';

const meta: Meta<typeof Modal> = {
  title: 'omni-ui-components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Dialog surface for focused confirmation, editing, and interruption flows. Use Modal when the user must complete or acknowledge a blocking task before returning to the page. Stories use trigger-driven previews so the component behaves like production.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Open modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirm publish</ModalTitle>
          <ModalDescription>This will make the current draft visible to all workspace members.</ModalDescription>
        </ModalHeader>
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-[var(--oui-border-field)] bg-background/70 p-4">
            <div className="text-sm font-semibold">Publishing checklist</div>
            <div className="mt-1 text-sm text-[var(--oui-foreground-muted)]">
              The release notes, approval status, and audience targeting have all been validated for this change.
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Publish</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="destructive">Delete record</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Delete record</ModalTitle>
          <ModalDescription>This action permanently removes the record and cannot be undone.</ModalDescription>
        </ModalHeader>
        <div className="space-y-3 px-6 py-5 text-sm">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-950">
            This record is linked to 12 audit events and 3 open tasks. Deleting it will detach those references.
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const FormLayout: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Use a modal for short, blocking edits when the user should stay anchored to the current page context.',
      },
    },
  },
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="outline">Edit access</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Edit access rules</ModalTitle>
          <ModalDescription>Adjust who can review, approve, and publish changes for this workspace.</ModalDescription>
        </ModalHeader>
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-[var(--oui-border-field)] bg-background/70 p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--oui-foreground-muted)]">Approver group</div>
            <div className="mt-1 text-sm font-medium">Operations leadership</div>
          </div>
          <div className="rounded-lg border border-[var(--oui-border-field)] bg-background/70 p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--oui-foreground-muted)]">Change window</div>
            <div className="mt-1 text-sm font-medium">Weekdays, 8:00 AM to 6:00 PM</div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary">Cancel</Button>
          <Button>Save changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};
