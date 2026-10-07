import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import {
  ConversationTranscriptDemo,
  type ConversationTranscriptDemoProps,
} from 'factories/omni-ui-components/ConversationTranscript/ConversationTranscript.factories';

const meta: Meta<ConversationTranscriptDemoProps> = {
  title: 'omni-ui-components/ConversationTranscript',
  component: ConversationTranscriptDemo as unknown as React.ComponentType<ConversationTranscriptDemoProps>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The conversation view with the chat parts already composed, from props only: <primary>turns</primary> go in and each reply is drawn with its step timeline, reasoning, markdown with code and citations, sources, actions with a version pager and thumbs, the feedback panel, follow-ups, approvals, the error with Retry, the Stopped banner and summary dividers. A part is drawn only when its data or its callback is given, so a read-only view is simply one without callbacks. For another arrangement use `Transcript` and its `slots`. Every callback receives the full item you passed in, by reference: `onCite(source, turn)`, `onDecideApproval(approval, decision, turn)`, `onSubmitFeedback(turn, feedback)`. Icons are nodes in `icons`; strings are in `labels`, `transcriptLabels` and `partLabels`.",
      },
    },
  },
  args: { phase: 'done', onAction: fn() },
  argTypes: {
    phase: { control: 'inline-radio', options: ['done', 'streaming'], description: 'Finished reply, or one still streaming.' },
  },
};
export default meta;

type Story = StoryObj<ConversationTranscriptDemoProps>;

export const ChatReply: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The reply of `markdown--chat-reply` with no composition code: one component, the turns and the callbacks. A citation pill opens its source and a thumbs down opens the feedback panel.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('button', { name: 'Open source 1' })[0]!);
    await expect(canvas.getByRole('group', { name: 'Two Sum notes' })).toBeVisible();
    await expect(args.onAction).toHaveBeenCalledWith('cite', 1);
    // Both turns carry a thumbs down; the Two Sum reply is the last turn, so scope to its button.
    await userEvent.click(canvas.getAllByRole('button', { name: 'Bad reply' }).at(-1)!);
    await expect(canvas.getByRole('group', { name: 'What went wrong?' })).toBeVisible();
  },
};

export const Streaming: Story = {
  args: { phase: 'streaming' },
  parameters: {
    docs: { description: { story: 'The same reply while it streams: running steps, the Thinking spinner, half-written code and a cursor.' } },
  },
};
