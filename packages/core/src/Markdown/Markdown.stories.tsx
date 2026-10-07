import type { Meta, StoryObj } from '@storybook/react';
import {
  ChatReplyShowcase,
  type ChatReplyShowcaseProps,
  MarkdownDemo,
  type MarkdownDemoProps,
  SAMPLE_REPLY,
} from 'factories/omni-ui-components/Markdown/Markdown.factories';
import type * as React from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

type StoryArgs = MarkdownDemoProps;

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/Markdown',
  component: MarkdownDemo as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "Renders a reply's markdown (react-markdown + GFM) in the library's look. Headings are styled blocks, links open in a new tab with `noopener noreferrer`, <primary>fenced code</primary> becomes a block with a language header, a copy control and optional highlighting (`highlight`, e.g. the library's `highlightLines`, the same look as the Transcript). <primary>citations</primary> turn `[n]` into a pill only for numbers that exist, never in code, and call `onCite(n)`. <primary>streaming</primary> closes an open fence, backtick or `**` for display and draws the `cursor`. Copy is a callback plus the controlled `copiedCode`. Strings are in `labels`; any element is replaceable through `components`.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onCite` | a citation pill is chosen (pill drawn only with it) | `(source: T)`: the full item from `sources`, or `{ n }` when only `citations` numbers were given |\n| `onCopy` | a code block's copy control is chosen (control drawn only with it) | `(code: string, language?: string)` |\n| `onLinkClick` | a link is clicked (it still opens in a new tab) | `(href: string)` |",
      },
    },
  },
  args: {
    text: SAMPLE_REPLY,
    citations: [1, 2],
    streaming: false,
    codeLineNumbers: false,
    wrapCode: false,
    onAction: fn(),
  },
  argTypes: {
    text: { control: 'text', description: 'The markdown source.' },
    citations: {
      control: 'object',
      description: 'Source numbers that may become pills.',
    },
    streaming: {
      control: 'boolean',
      description: 'Close open fences and show the cursor.',
    },
    codeLineNumbers: { control: 'boolean', description: 'Number code lines.' },
    wrapCode: { control: 'boolean', description: 'Wrap long code lines.' },
    labels: {
      control: 'object',
      description: 'Partial { codeFallbackLanguage, copy, copied, cite }.',
    },
    onAction: {
      action: 'markdown',
      description: 'Story-only: reports cite and copy.',
    },
  },
};
export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A full reply: heading, emphasis, list, highlighted TypeScript block, table, link, citations `[1]` `[2]`; the invented `[9]` stays text.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open source 2' }));
    await expect(args.onAction).toHaveBeenCalledWith('cite', 2);
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Copied' })).toBeVisible());
  },
};

export const Streaming: Story = {
  args: {
    streaming: true,
    text: 'Try this:\n\n```ts\nconst seen = new Map<number, number>();\nfor (const value of',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Half-streamed text: the open fence is closed for display, so the code stays one block, and the cursor follows.',
      },
    },
  },
};

export const LineNumbersWrapped: Story = {
  args: { codeLineNumbers: true, wrapCode: true },
};

/** The owner's overview of the message parts, together. */
export const ChatReply: StoryObj<ChatReplyShowcaseProps> = {
  render: (args) => <ChatReplyShowcase {...args} />,
  args: { phase: 'done', timeline: 'summary' },
  argTypes: {
    phase: {
      control: 'inline-radio',
      options: ['done', 'streaming'],
      description: 'Finished reply, or one still streaming.',
    },
    timeline: {
      control: 'inline-radio',
      options: ['summary', 'rail'],
      description: 'Step timeline variant.',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'A whole assistant turn from the message-part components only: summary divider, steps, thinking, markdown with code and citations (a pill opens its source), sources, approval, actions with a version pager, the feedback panel (thumbs down), follow-ups and the Stopped banner.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('button', { name: 'Open source 1' })[0]!);
    await expect(canvas.getByRole('group', { name: 'Two Sum notes' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Bad reply' }));
    await expect(canvas.getByRole('group', { name: 'What went wrong?' })).toBeVisible();
  },
};

export const ChatReplyStreaming: StoryObj<ChatReplyShowcaseProps> = {
  render: (args) => <ChatReplyShowcase {...args} />,
  args: { phase: 'streaming', timeline: 'rail' },
  parameters: {
    docs: {
      description: {
        story:
          'Streaming: the rail timeline, the Thinking spinner and a cursor after the half-written code.',
      },
    },
  },
};
