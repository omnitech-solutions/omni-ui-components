import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, GraduationCap } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ActionMenu, type ActionMenuProps } from '@oc-tech/omni-ui-components/ActionMenu';
import { Button } from '@oc-tech/omni-ui-components/Button';
import {
  actionMenuPropsFactory,
  actionMenuVariants,
  answerStyleMenu,
  answerStyleMenuSpec,
  answerStyleOptions,
  captureModeMenu,
  micLostMenu,
  micMenu,
  screenPermissionMenu,
  shortcutsMenu,
} from 'factories/omni-ui-components/ActionMenu/ActionMenu.factories';

/** Story-only: top-level action for the notice's fix button. */
type StoryArgs = ActionMenuProps & { onNoticeAction?: () => void };

/**
 * Renderer with working selection: the menu keeps no state, so the chosen value of each section is held here and fed back
 * through `section.value`, exactly as an app would.
 */
const Renderer: React.FC<StoryArgs> = ({ onNoticeAction, ...props }) => {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const notice = props.notice;
  return (
    <div className="min-h-[640px] p-6">
      <ActionMenu
        {...props}
        sections={props.sections.map((section) => ({ ...section, value: values[section.id] ?? section.value }))}
        onValueChange={(sectionId, itemId) => {
          // A select spanning several groups (answer style) shares one value.
          const owner = props.sections.find((section) => section.id === sectionId);
          const shared = props.sections.filter((section) => section.items.some((item) => item.id === itemId));
          setValues((current) => ({
            ...current,
            ...Object.fromEntries((shared.length ? shared : owner ? [owner] : []).map((s) => [s.id, itemId])),
            [sectionId]: itemId,
          }));
          props.onValueChange?.(sectionId, itemId);
        }}
        notice={
          notice
            ? { ...notice, action: notice.action ? { ...notice.action, onSelect: onNoticeAction ?? notice.action.onSelect } : undefined }
            : undefined
        }
      />
    </div>
  );
};

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/ActionMenu',
  component: ActionMenu as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A popup menu described entirely as <primary>data</primary>: sections of rows with a <primary>fixed check column</primary>, descriptions, shortcut glyphs, danger tone and disabled rows with a visible reason; an optional leading <primary>notice</primary> and trailing <primary>hint</primary>; viewport-aware height with internal scroll; <primary>portal</primary> and <primary>container</primary> for hosted pages. Select mode: give a section a <primary>value</primary> and listen to <primary>onValueChange</primary>. <primary>kind="list"</primary> is a read-only grouped reference list.',
      },
    },
  },
  args: actionMenuPropsFactory({ defaultOpen: true }),
  argTypes: {
    kind: { control: 'inline-radio', options: ['menu', 'list'] },
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
    sideOffset: { control: 'number' },
    collisionPadding: { control: 'number' },
    width: { control: 'text', description: 'px number or any CSS length.' },
    maxHeight: { control: 'text', description: 'Cap on the height; always also capped to the room left in the viewport.' },
    portal: { control: 'boolean', description: "Render in a portal (default) or inside the trigger's DOM." },
    modal: { control: 'boolean' },
    returnFocus: {
      control: 'inline-radio',
      options: ['keyboard', 'always'],
      description: 'Focus after close: keyboard-initiated closes only (default) or always.',
    },
    sections: { control: 'object' },
    notice: { control: 'object' },
    hint: { control: 'object' },
    onSelect: { action: 'row selected', description: "(itemId, item) after the row's own onSelect, once per choice." },
    onValueChange: { action: 'value changed', description: '(sectionId, itemId) once when a single-select row is chosen.' },
    onOpenChange: { action: 'open changed' },
    onNoticeAction: { action: 'notice action', description: 'Story-only: notice.action.onSelect.' },
    trigger: { control: false },
  },
  render: (args) => <Renderer {...args} />,
};
export default meta;

type Story = StoryObj<StoryArgs>;

export const CaptureModes: Story = { args: { ...captureModeMenu } };
export const ScreenPermissionNotice: Story = { args: { ...screenPermissionMenu } };
export const MicListeningDevices: Story = { args: { ...micMenu } };
export const MicLostWithDevices: Story = { args: { ...micLostMenu } };
export const AnswerStyleGrouped: Story = { args: { ...answerStyleMenu } };

export const AnswerStyleScrolling: Story = {
  args: { ...answerStyleMenu, maxHeight: 220 },
  parameters: {
    docs: {
      description: {
        story:
          'The rows scroll inside the menu; the hint row stays pinned. Without `maxHeight` the menu still never exceeds the room left in the viewport.',
      },
    },
  },
};

export const ShortcutsGrouped: Story = {
  args: { ...shortcutsMenu },
  parameters: {
    docs: {
      description: {
        story: '`kind="list"`: a read-only reference list in a Popover dialog; "Clear session memory" is last in the destructive tone.',
      },
    },
  },
};

export const DisabledItemWithReason: Story = {
  args: { ...captureModeMenu },
  parameters: { docs: { description: { story: '"Add screen to this problem" is disabled and states why in its second line.' } } },
};

export const Closed: Story = {
  args: { defaultOpen: false, trigger: <Button variant="outline">Open menu</Button> },
};

export const InsideItsOwnRoot: Story = {
  args: { portal: false },
  parameters: {
    docs: { description: { story: "`portal={false}` keeps the menu in the trigger's DOM (a WKWebView root); `container` targets any element." } },
  },
};

/** A select-style menu: the trigger label shows the chosen value; the check moves. */
const SelectDemo: React.FC<{ onAction?: (name: string, detail?: unknown) => void }> = ({ onAction }) => {
  const [value, setValue] = React.useState('dsa');
  const label = answerStyleOptions.find((option) => option.id === value)?.label;
  return (
    <div className="min-h-[520px] p-6">
      <ActionMenu
        {...answerStyleMenuSpec(value)}
        onValueChange={(_sectionId, id) => {
          setValue(id);
          onAction?.('answer-style:select', id);
        }}
        trigger={
          <Button
            buttonSize="control"
            tone="neutral"
            icon={<GraduationCap />}
            iconAfter={<ChevronDown className="size-4" />}
            labelMaxWidth="var(--oui-control-label-max)"
            data-testid="select-trigger"
          >
            {label}
          </Button>
        }
      />
    </div>
  );
};

export const AnswerStyleSelect: Story = {
  render: (args) => <SelectDemo onAction={(name, detail) => args.onSelect?.(`${name}:${String(detail)}`, { id: String(detail), label: name })} />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByTestId('select-trigger');
    await expect(trigger).toHaveTextContent('Data Structures & Algorithms');
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('menuitemradio', { name: 'System Design' }));
    await waitFor(() => expect(trigger).toHaveTextContent('System Design'));
    await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
    await expect(canvasElement.ownerDocument.activeElement).not.toBe(trigger);
    await userEvent.click(trigger);
    await expect(await body.findByRole('menuitemradio', { name: 'System Design' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Escape}');
  },
};

/**
 * A 330px-high window: the menu is capped to the room left under the trigger (minus the collision padding) and its rows
 * scroll inside, with the hint row pinned. The window is an iframe of the grouped story so the viewport really is short.
 */
export const AnswerStyleShortWindow: Story = {
  render: () => (
    <iframe
      title="Answer style in a 330px window"
      src="iframe.html?id=omni-ui-components-actionmenu--answer-style-grouped&viewMode=story"
      style={{ width: 720, height: 330, border: '1px solid var(--oui-border-field)', borderRadius: 12, margin: 24 }}
    />
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-8">
      {actionMenuVariants.map((variant) => (
        <ActionMenu key={variant.name} {...actionMenuPropsFactory(variant.args)} trigger={<Button variant="outline">{variant.name}</Button>} />
      ))}
    </div>
  ),
};
