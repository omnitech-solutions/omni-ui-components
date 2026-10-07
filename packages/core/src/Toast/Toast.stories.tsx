import { Toast, type ToastProps } from '@oc-tech/omni-ui-components/Toast';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ToastDemo,
  toastPropsFactory,
  toastVariants,
} from 'factories/omni-ui-components/Toast/Toast.factories';
import type * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta<ToastProps> = {
  title: 'omni-ui-components/Toast',
  component: Toast as unknown as React.ComponentType<ToastProps>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A short status message with an optional <primary>action</primary> (Undo). It is an <primary>&lt;output&gt;</primary> (role `status`, polite), so it is announced without taking focus. It dismisses itself after <primary>duration</primary> (default 3800 ms, paused while hovered or focused) and on Escape; choosing the action runs it and dismisses. The caller owns `open`, or uses <primary>useToast</primary>. `position="absolute"` keeps it inside a layout; `placement` picks the corner.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onAction` | the action button (Undo) is chosen | `(toast: T)` |\n| `onDismiss` | closed with Escape | `(toast: T)` |\n| `onTimeout` | closed itself after `duration` | `(toast: T)` |\n| `onOpenChange` | it closes (any reason) | `(open: false)` |',
      },
    },
  },
  args: {
    ...toastPropsFactory(),
    onOpenChange: fn(),
    onAction: fn(),
    onDismiss: fn(),
    onTimeout: fn(),
  },
  argTypes: {
    open: { control: 'boolean' },
    toast: {
      control: 'object',
      description:
        'The toast item `{ text, actionLabel?, duration?, icon?, ...yours }`; callbacks get it back.',
    },
    onAction: {
      action: 'action',
      description: '(toast): the action button (Undo); not rendered without it.',
    },
    onDismiss: { action: 'dismiss', description: '(toast): closed with Escape.' },
    onTimeout: { action: 'timeout', description: '(toast): closed itself after `duration`.' },
    duration: {
      control: 'number',
      description: 'Milliseconds before it dismisses itself; 0 keeps it. Default 3800.',
    },
    placement: {
      control: 'select',
      options: [
        'bottom-center',
        'bottom-left',
        'bottom-right',
        'top-center',
        'top-left',
        'top-right',
      ],
    },
    position: { control: 'inline-radio', options: ['fixed', 'absolute'] },
    onOpenChange: { action: 'open change', description: 'Asks to close: timer, action or Escape.' },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <div className="relative h-60 w-[520px] rounded-xl border">
          <Story />
        </div>
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<ToastProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('status')).toHaveTextContent('Conversation archived');
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    expect(args.onAction).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Conversation archived' }),
    );
    expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
export const TextOnly: Story = { args: toastVariants[1].args };
export const WithIcon: Story = { args: toastVariants[2].args };
export const TopRight: Story = { args: toastVariants[3].args };
export const BottomLeft: Story = { args: toastVariants[4].args };

/** Raises toasts through `useToast`; a short duration shows the auto-dismiss. */
export const Interactive: Story = {
  render: () => <ToastDemo duration={1500} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Archive/ }));
    expect(canvas.getByRole('status')).toHaveTextContent('Conversation archived');
    await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument(), {
      timeout: 4000,
    });
  },
};
