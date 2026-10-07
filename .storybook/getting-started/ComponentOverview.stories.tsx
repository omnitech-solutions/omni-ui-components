import * as React from 'react';
import { DynamicForm } from '@oc-tech/omni-ui-components/dynamic-form';
import type { Meta, StoryObj } from '@storybook/react';
import '../internal/support/overview.css';
import source from './ComponentOverview.stories.tsx?raw';
import { buildSourceSnippet } from '../internal/support/sourceSnippet';
import countrySource from '../../packages/core/src/Select/countries.ts?raw';
import factorySupport from '../../packages/core/src/internal/support/makeFactory.ts?raw';
const factorySources = import.meta.glob('../../packages/core/src/**/*.factories.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const snippetDependencies = Object.fromEntries(
  Object.entries(factorySources).map(([path, content]) => [
    path.replace('../../packages/core/src/', 'factories/omni-ui-components/').replace(/\.tsx?$/, ''),
    content,
  ]),
);
snippetDependencies['../../internal/support/makeFactory'] = factorySupport;
snippetDependencies['./countries'] = countrySource;
import { ComponentLink } from '../internal/support/ComponentLink';

import {
  Button,
  Form,
  FormField,
  Checkbox,
  CheckboxGroup,
  Badge,
  Rate,
  Transfer,
  Wizard,
  ListItem,
  clamp,
  isNil,
  ColorPicker,
  CurrencyInput,
  DatePicker,
  DateTimePicker,
  EmailInput,
  FileUpload,
  ActionMenu,
  IconButton,
  Input,
  InputOTP,
  MultiSelect,
  NumberInput,
  PasswordInput,
  PhoneInput,
  Radio,
  RichText,
  Segmented,
  Select,
  Slider,
  Panel,
  SplitButton,
  Steps,
  useFollowLatest,
  Stepper,
  Switch,
  TagInput,
  Textarea,
  TimePicker,
  Typography,
  Tab,
  TabPanel,
  Tabs,
  TabsBar,
  icons,
  FloatButton,
  Divider,
  Flex,
  Col as GridCol,
  Row as GridRow,
  Content,
  Footer,
  Header,
  Sider,
  Space,
  Splitter,
  SplitterPanel,
  Masonry,
  Anchor,
  Breadcrumb,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownTrigger,
  Menu,
  Pagination,
  AutoComplete,
  Cascader,
  Mentions,
  Avatar,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Carousel,
  Collapse,
  Descriptions,
  Empty,
  Image,
  List,
  Popover,
  PopoverContent,
  PopoverTrigger,
  QRCode,
  Statistic,
  Table,
  Tag,
  Timeline,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tour,
  Tree,
  TreeSelect,
  Watermark,
  Alert,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  Popconfirm,
  Progress,
  Result,
  Skeleton,
  Spin,
  Affix,
  App,
  BackTop,
  ConfigProvider,
  Upload,
  Button as OmniButton,
  message,
  notification,
} from '@oc-tech/omni-ui-components';
import { z } from 'zod';
import { CodePanel, InlineCode, SegmentedPill, TableOfContents, type TocItem } from '../internal/support';
import type { Variant } from '@oc-tech/omni-ui-components/internal/support/makeFactory';
import {
  buttonActionVariants,
  buttonPropsFactory,
  buttonSizeVariants,
  buttonStateVariants,
  buttonToneVariants,
  buttonVariants,
} from 'factories/omni-ui-components/Button/Button.factories';
import { actionMenuPropsFactory, actionMenuVariants } from 'factories/omni-ui-components/ActionMenu/ActionMenu.factories';
import { splitButtonPropsFactory, splitButtonVariants } from 'factories/omni-ui-components/SplitButton/SplitButton.factories';
import { NativeToolbarDemo, toolbarLabelledVariants, toolbarVariants } from 'factories/omni-ui-components/Toolbar/Toolbar.factories';
import { SessionBarDemo, sessionBarExamples } from 'factories/omni-ui-components/SessionBar/SessionBar.factories';
import { AttachmentStrip } from '@oc-tech/omni-ui-components/Attachment';
import { attachmentRemoveIcon, attachmentVariants } from 'factories/omni-ui-components/Attachment/Attachment.factories';
import { CommandPopover } from '@oc-tech/omni-ui-components/CommandPopover';
import { commandPopoverPropsFactory, commandPopoverVariants } from 'factories/omni-ui-components/CommandPopover/CommandPopover.factories';
import { ComposerDemo, composerVariants } from 'factories/omni-ui-components/Composer/Composer.factories';
import { DictationBar } from '@oc-tech/omni-ui-components/DictationBar';
import { dictationBarPropsFactory, dictationBarVariants } from 'factories/omni-ui-components/DictationBar/DictationBar.factories';
import { QueuedList } from '@oc-tech/omni-ui-components/QueuedList';
import { queuedListPropsFactory, queuedListVariants } from 'factories/omni-ui-components/QueuedList/QueuedList.factories';
import { ConversationDemo } from 'factories/omni-ui-components/Transcript/Transcript.factories';
import { MarkdownDemo, markdownVariants, ChatReplyShowcase } from 'factories/omni-ui-components/Markdown/Markdown.factories';
import { ConversationTranscriptDemo } from 'factories/omni-ui-components/ConversationTranscript/ConversationTranscript.factories';
import { Sources } from '@oc-tech/omni-ui-components/Sources';
import { sourcesPropsFactory, sourcesVariants } from 'factories/omni-ui-components/Sources/Sources.factories';
import { Suggestions } from '@oc-tech/omni-ui-components/Suggestions';
import { suggestionsPropsFactory, suggestionsVariants } from 'factories/omni-ui-components/Suggestions/Suggestions.factories';
import { Thinking } from '@oc-tech/omni-ui-components/Thinking';
import { thinkingPropsFactory, thinkingVariants } from 'factories/omni-ui-components/Thinking/Thinking.factories';
import { StepTimeline } from '@oc-tech/omni-ui-components/StepTimeline';
import { stepTimelinePropsFactory, stepTimelineVariants } from 'factories/omni-ui-components/StepTimeline/StepTimeline.factories';
import { ErrorCard } from '@oc-tech/omni-ui-components/ErrorCard';
import { errorCardPropsFactory, errorCardVariants } from 'factories/omni-ui-components/ErrorCard/ErrorCard.factories';
import { ApprovalCard } from '@oc-tech/omni-ui-components/ApprovalCard';
import { approvalCardPropsFactory, approvalCardVariants } from 'factories/omni-ui-components/ApprovalCard/ApprovalCard.factories';
import { FeedbackPanel } from '@oc-tech/omni-ui-components/FeedbackPanel';
import { feedbackPanelPropsFactory, feedbackPanelVariants } from 'factories/omni-ui-components/FeedbackPanel/FeedbackPanel.factories';
import { VersionPager } from '@oc-tech/omni-ui-components/VersionPager';
import { versionPagerPropsFactory, versionPagerVariants } from 'factories/omni-ui-components/VersionPager/VersionPager.factories';
import { MessageActions } from '@oc-tech/omni-ui-components/MessageActions';
import { messageActionsPropsFactory, messageActionsVariants } from 'factories/omni-ui-components/MessageActions/MessageActions.factories';
import { SummaryDivider } from '@oc-tech/omni-ui-components/SummaryDivider';
import { summaryDividerPropsFactory, summaryDividerVariants } from 'factories/omni-ui-components/SummaryDivider/SummaryDivider.factories';
import { ConversationList } from '@oc-tech/omni-ui-components/ConversationList';
import { conversationListPropsFactory, conversationListVariants, ConversationListDemo } from 'factories/omni-ui-components/ConversationList/ConversationList.factories';
import { ConversationHeader } from '@oc-tech/omni-ui-components/ConversationHeader';
import { conversationHeaderPropsFactory, conversationHeaderVariants } from 'factories/omni-ui-components/ConversationHeader/ConversationHeader.factories';
import { EmptyStarters } from '@oc-tech/omni-ui-components/EmptyStarters';
import { emptyStartersPropsFactory, emptyStartersVariants } from 'factories/omni-ui-components/EmptyStarters/EmptyStarters.factories';
import { SettingsDialogDemo, settingsDialogVariants } from 'factories/omni-ui-components/SettingsDialog/SettingsDialog.factories';
import { Toast } from '@oc-tech/omni-ui-components/Toast';
import { ToastDemo, toastPropsFactory, toastVariants } from 'factories/omni-ui-components/Toast/Toast.factories';
import { PanelShell } from '@oc-tech/omni-ui-components/PanelShell';
import { ChatShellDemo, panelShellPropsFactory, panelShellVariants } from 'factories/omni-ui-components/PanelShell/PanelShell.factories';
import { PreferencesForm } from '@oc-tech/omni-ui-components/PreferencesForm';
import { PreferencesFormDemo, preferencesFormPropsFactory, preferencesFormVariants } from 'factories/omni-ui-components/PreferencesForm/PreferencesForm.factories';
import { DataPrivacyPanel } from '@oc-tech/omni-ui-components/DataPrivacyPanel';
import { DataPrivacyPanelDemo, dataPrivacyPanelPropsFactory, dataPrivacyPanelVariants } from 'factories/omni-ui-components/DataPrivacyPanel/DataPrivacyPanel.factories';
import { IntegrationList } from '@oc-tech/omni-ui-components/IntegrationList';
import { IntegrationListDemo, integrationListPropsFactory, integrationListVariants } from 'factories/omni-ui-components/IntegrationList/IntegrationList.factories';
import { ShortcutList } from '@oc-tech/omni-ui-components/ShortcutList';
import { shortcutListPropsFactory, shortcutListVariants } from 'factories/omni-ui-components/ShortcutList/ShortcutList.factories';
import { StatusClock } from '@oc-tech/omni-ui-components/StatusClock';
import { statusClockExamples, statusClockPropsFactory } from 'factories/omni-ui-components/StatusClock/StatusClock.factories';
import { NativeAppWindow, nativeAppDefaults } from 'factories/omni-ui-components/showcase/NativeApp/NativeApp.factories';
import { NativePanelsDemo, panelPropsFactory, panelVariants, TranscriptDemo } from 'factories/omni-ui-components/Panel/Panel.factories';
import {
  analysingEntries,
  ComposerExample,
  readyEntries,
  transcriptVariants,
  TranscriptPanel,
} from 'factories/omni-ui-components/Transcript/Transcript.factories';
import { ContextMeter } from '@oc-tech/omni-ui-components/ContextMeter';
import { contextMeterPropsFactory, contextMeterVariants } from 'factories/omni-ui-components/ContextMeter/ContextMeter.factories';
import { DiffReview } from '@oc-tech/omni-ui-components/DiffReview';
import { DiffReviewDemo, diffReviewPropsFactory, diffReviewVariants, sampleChanges } from 'factories/omni-ui-components/DiffReview/DiffReview.factories';
import { ModelMenu } from '@oc-tech/omni-ui-components/ModelPicker';
import { ComposerToolbarDemo, modelPickerPropsFactory, modelPickerVariants } from 'factories/omni-ui-components/ModelPicker/ModelPicker.factories';
import { dividerPropsFactory, dividerVariants } from 'factories/omni-ui-components/Divider/Divider.factories';
import { emptyPropsFactory, emptyVariants } from 'factories/omni-ui-components/Empty/Empty.factories';
import { progressPropsFactory, progressRingVariants, progressVariants } from 'factories/omni-ui-components/Progress/Progress.factories';
import { stepsPropsFactory, stepsVariants } from 'factories/omni-ui-components/Steps/Steps.factories';
import { tagPropsFactory, tagVariants } from 'factories/omni-ui-components/Tag/Tag.factories';
import { checkboxPropsFactory, checkboxVariants } from 'factories/omni-ui-components/Checkbox/Checkbox.factories';
import { colorPickerPropsFactory, colorPickerVariants } from 'factories/omni-ui-components/ColorPicker/ColorPicker.factories';
import { currencyInputPropsFactory, currencyInputVariants } from 'factories/omni-ui-components/CurrencyInput/CurrencyInput.factories';
import { datePickerPropsFactory, datePickerVariants } from 'factories/omni-ui-components/DatePicker/DatePicker.factories';
import { dateTimePickerPropsFactory, dateTimePickerVariants } from 'factories/omni-ui-components/DateTimePicker/DateTimePicker.factories';
import { emailInputPropsFactory, emailInputVariants } from 'factories/omni-ui-components/EmailInput/EmailInput.factories';
import { fileUploadPropsFactory, fileUploadVariants } from 'factories/omni-ui-components/FileUpload/FileUpload.factories';
import {
  iconButtonPropsFactory,
  iconButtonSizeVariants,
  iconButtonStateVariants,
  iconButtonToneVariants,
  iconButtonVariants,
} from 'factories/omni-ui-components/IconButton/IconButton.factories';
import { inputPropsFactory, inputVariants } from 'factories/omni-ui-components/Input/Input.factories';
import { inputOTPPropsFactory, inputOTPVariants } from 'factories/omni-ui-components/InputOTP/InputOTP.factories';
import { multiSelectPropsFactory, multiSelectVariants } from 'factories/omni-ui-components/MultiSelect/MultiSelect.factories';
import { numberInputPropsFactory, numberInputVariants } from 'factories/omni-ui-components/NumberInput/NumberInput.factories';
import { passwordInputPropsFactory, passwordInputVariants } from 'factories/omni-ui-components/PasswordInput/PasswordInput.factories';
import { phoneInputPropsFactory, phoneInputVariants } from 'factories/omni-ui-components/PhoneInput/PhoneInput.factories';
import { radioPropsFactory, radioVariants } from 'factories/omni-ui-components/Radio/Radio.factories';
import { richTextPropsFactory, richTextVariants } from 'factories/omni-ui-components/RichText/RichText.factories';
import { segmentedControlVariants, segmentedPropsFactory, segmentedVariants } from 'factories/omni-ui-components/Segmented/Segmented.factories';
import { selectPropsFactory, selectVariants } from 'factories/omni-ui-components/Select/Select.factories';
import { sliderPropsFactory, sliderVariants } from 'factories/omni-ui-components/Slider/Slider.factories';
import { stepperPropsFactory, stepperVariants } from 'factories/omni-ui-components/Stepper/Stepper.factories';
import { switchPropsFactory, switchVariants } from 'factories/omni-ui-components/Switch/Switch.factories';
import { tagInputPropsFactory, tagInputVariants } from 'factories/omni-ui-components/TagInput/TagInput.factories';
import { textareaPropsFactory, textareaVariants } from 'factories/omni-ui-components/Textarea/Textarea.factories';
import { timePickerPropsFactory, timePickerVariants } from 'factories/omni-ui-components/TimePicker/TimePicker.factories';

interface RowProps {
  id: string;
  index: string;
  name: string;
  code: string;
  children: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ id, index, name, code, children }) => (
  <section id={id} className="pb-overview-row scroll-mt-6 py-8">
    <div className="pb-overview-row-header">
      <SegmentedPill
        segments={[
          {
            content: index,
            tinted: true,
          },
          {
            content: <ComponentLink component={name} />,
            uppercase: true,
          },
          {
            content: <InlineCode code={`<${name} />`} />,
          },
        ]}
      />
    </div>
    <div className="pb-overview-row-preview mt-5">{children}</div>
    <CodePanel code={code} />
  </section>
);

const SectionHeading: React.FC<{
  id: string;
  index: string;
  title: string;
}> = ({ id, index, title }) => (
  <div id={id} className="scroll-mt-6 pt-10 pb-4">
    <div className="text-2xl font-bold text-foreground">
      {index}. {title}
    </div>
  </div>
);

const codeFromVariants = (row: OverviewRowSpec): string => buildSourceSnippet(source, row.source ?? `${row.name}Preview`, snippetDependencies);

type AnyComponent<P> = React.ComponentType<P>;

interface ControlledProps<P extends object> {
  Component: AnyComponent<P>;
  factory: (overrides: Partial<P>) => P;
  args: Partial<P>;
  idSuffix: string;
  valueKey?: keyof P;
}

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function Controlled<P extends object>({ Component, factory, args, idSuffix, valueKey = 'value' as keyof P }: ControlledProps<P>) {
  const initial = (args as Record<string, unknown>)[valueKey as string];
  const [value, setValue] = React.useState(initial);

  React.useEffect(() => {
    setValue(initial);
  }, [initial]);

  const baseId = ((factory(args) as { id?: string }).id ?? 'demo').toString();
  const id = `${baseId}-${idSuffix}`;
  const props = factory({
    ...args,
    id,
    [valueKey]: value,
    onChange: setValue,
  } as Partial<P>);
  return <Component {...props} />;
}

const ButtonPreview: React.FC = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-3">
      {buttonVariants.map((variant) => (
        <Button key={variant.name} {...buttonPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {buttonSizeVariants.map((variant) => (
        <Button key={variant.name} {...buttonPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6" style={{ width: 'fit-content' }}>
      {buttonToneVariants.map((variant) => (
        <Button key={variant.name} {...buttonPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {buttonActionVariants.map((variant) => (
        <Button key={variant.name} {...buttonPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {buttonStateVariants.map((variant) => (
        <Button key={variant.name} {...buttonPropsFactory(variant.args)} />
      ))}
    </div>
  </div>
);

const IconButtonPreview: React.FC = () => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-3">
      {iconButtonVariants.map((variant) => (
        <IconButton key={variant.name} {...iconButtonPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {iconButtonSizeVariants.map((variant) => (
        <IconButton key={variant.name} {...iconButtonPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {iconButtonToneVariants.map((variant) => (
        <IconButton key={variant.name} {...iconButtonPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {iconButtonStateVariants.map((variant) => (
        <IconButton key={variant.name} {...iconButtonPropsFactory(variant.args)} />
      ))}
    </div>
  </div>
);

const SplitButtonPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-x-8 gap-y-5 pt-2">
    {splitButtonVariants.map((variant) => (
      <div key={variant.name} className="flex flex-col items-start gap-2">
        <span className="font-mono text-xs text-muted-foreground">{variant.name}</span>
        <SplitButton {...splitButtonPropsFactory(variant.args)} />
      </div>
    ))}
  </div>
);

const ToolbarPreview: React.FC = () => (
  <div className="flex flex-col gap-4 overflow-x-auto pb-2">
    {[...toolbarVariants, ...toolbarLabelledVariants].map((variant) => (
      <div key={variant.name} className="flex w-max flex-col gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">{variant.name}</span>
        <div className="w-max rounded-xl px-4 py-3.5" style={{ background: '#1a4f96' }}>
          <NativeToolbarDemo {...variant.args} />
        </div>
      </div>
    ))}
  </div>
);

const SessionBarPreview: React.FC = () => (
  <div className="flex flex-col gap-4 overflow-x-auto pb-2">
    {sessionBarExamples.map((variant) => (
      <div key={variant.name} className="flex w-[900px] flex-col gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">{variant.name}</span>
        <div className="rounded-xl p-3" style={{ background: '#1a4f96' }}>
          <SessionBarDemo {...variant.args} />
        </div>
      </div>
    ))}
    <div className="flex w-[330px] flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">330px · wraps, build tag truncates</span>
      <div className="rounded-xl p-3" style={{ background: '#1a4f96' }}>
        <SessionBarDemo devBuild />
      </div>
    </div>
  </div>
);

/** Message parts (W1): one framed preview per component, one block per factory variant. */
const messagePartFrame = (title: string, node: React.ReactNode) => (
  <div key={title} className="flex max-w-[620px] flex-col gap-1.5">
    <span className="font-mono text-xs text-muted-foreground">{title}</span>
    <div className="rounded-xl border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] p-3 text-[color:var(--oui-tone-neutral-fg)]">{node}</div>
  </div>
);
const MessagePartsPreview = (variants: Variant<never>[], render: (args: never) => React.ReactNode): React.FC => {
  const Preview: React.FC = () => <div className="flex flex-col gap-4">{variants.map((variant) => messagePartFrame(variant.name, render(variant.args as never)))}</div>;
  return Preview;
};
const MarkdownPreview = MessagePartsPreview(markdownVariants as Variant<never>[], (args) => <MarkdownDemo {...(args as object)} />);
const SourcesPreview = MessagePartsPreview(sourcesVariants as Variant<never>[], (args) => <Sources {...sourcesPropsFactory(args as object)} />);
const SuggestionsPreview = MessagePartsPreview(suggestionsVariants as Variant<never>[], (args) => <Suggestions {...suggestionsPropsFactory(args as object)} />);
const ThinkingPreview = MessagePartsPreview(thinkingVariants as Variant<never>[], (args) => <Thinking {...thinkingPropsFactory(args as object)} />);
const StepTimelinePreview = MessagePartsPreview(stepTimelineVariants as Variant<never>[], (args) => <StepTimeline {...stepTimelinePropsFactory(args as object)} />);
const ErrorCardPreview = MessagePartsPreview(errorCardVariants as Variant<never>[], (args) => <ErrorCard {...errorCardPropsFactory(args as object)} />);
const ApprovalCardPreview = MessagePartsPreview(approvalCardVariants as Variant<never>[], (args) => <ApprovalCard {...approvalCardPropsFactory(args as object)} />);
const FeedbackPanelPreview = MessagePartsPreview(feedbackPanelVariants as Variant<never>[], (args) => <FeedbackPanel {...feedbackPanelPropsFactory(args as object)} />);
const AttachmentPreview = MessagePartsPreview(attachmentVariants as Variant<never>[], (args) => <AttachmentStrip removeIcon={attachmentRemoveIcon} onRemove={() => undefined} {...(args as { items: never })} />);
const CommandPopoverPreview = MessagePartsPreview(commandPopoverVariants as Variant<never>[], (args) => <CommandPopover {...commandPopoverPropsFactory(args as object)} />);
const DictationBarPreview = MessagePartsPreview(dictationBarVariants as Variant<never>[], (args) => <DictationBar {...dictationBarPropsFactory(args as object)} />);
const QueuedListPreview = MessagePartsPreview(queuedListVariants as Variant<never>[], (args) => <QueuedList {...queuedListPropsFactory(args as object)} />);
const MessageBoxPreview: React.FC = () => (
  <div className="flex max-w-[460px] flex-col gap-6 pt-40">
    <ComposerDemo />
    <ComposerDemo variant="pill" attachments={false} />
  </div>
);
const ConversationPreview: React.FC = () => <ConversationDemo height={560} />;
const VersionPagerPreview = MessagePartsPreview(versionPagerVariants as Variant<never>[], (args) => <VersionPager {...versionPagerPropsFactory(args as object)} />);
const MessageActionsPreview = MessagePartsPreview(messageActionsVariants as Variant<never>[], (args) => <MessageActions {...messageActionsPropsFactory(args as object)} />);
const SummaryDividerPreview = MessagePartsPreview(summaryDividerVariants as Variant<never>[], (args) => <SummaryDivider {...summaryDividerPropsFactory(args as object)} />);
const ChatReplyPreview: React.FC = () => <ChatReplyShowcase />;
const ConversationTranscriptPreview: React.FC = () => <ConversationTranscriptDemo />;

const StatusClockPreview: React.FC = () => (
  <div className="flex flex-wrap gap-4">
    {statusClockExamples.map((variant) => (
      <div key={variant.name} className="flex flex-col gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">{variant.name}</span>
        <div className="rounded-xl px-4 py-3" style={{ background: 'var(--oui-panel-bg)', border: '1px solid var(--oui-panel-border)' }}>
          <StatusClock {...statusClockPropsFactory(variant.args)} />
        </div>
      </div>
    ))}
  </div>
);

const NativeAppPreview: React.FC = () => (
  <div className="flex flex-col gap-4 overflow-x-auto pb-2">
    <span className="font-mono text-xs text-muted-foreground">Showcase / Native App: toolbar, panels and footer together at 900px</span>
    <NativeAppWindow {...nativeAppDefaults} width={900} />
  </div>
);

const PanelPreview: React.FC = () => (
  <div className="flex flex-col gap-6 overflow-x-auto pb-2">
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">
        Board 1d · three panels, nothing analysed / analysing / answer ready, code hidden
      </span>
      <div className="flex w-max flex-col gap-4">
        <NativePanelsDemo state="ready" width={960} />
        <NativePanelsDemo state="analysing" width={960} />
        <NativePanelsDemo state="answer" width={960} />
      </div>
    </div>
    <div className="flex flex-wrap items-start gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">Scrolling · fade, thin scrollbar, stick to bottom, Jump to latest</span>
        <TranscriptDemo />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">Panel configurations (props only)</span>
        <div className="flex flex-wrap gap-3">
          {panelVariants.map((variant) => (
            <div key={variant.name} className="flex h-64 w-72 flex-col gap-1">
              <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
              <div className="flex min-h-0 flex-1 rounded-xl p-2.5" style={{ background: '#1a4f96' }}>
                <Panel {...panelPropsFactory(variant.args)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TranscriptPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">Ready · event chip, hover or focus a bubble to copy</span>
      <TranscriptPanel entries={readyEntries()} height={320} />
    </div>
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">See-through 22% · own message</span>
      <TranscriptPanel entries={analysingEntries()} seeThrough={0.22} height={320} />
    </div>
  </div>
);

const ComposerPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    {[
      { name: 'Empty (send muted)', props: {} },
      { name: 'Typing', props: { initialValue: 'Assume the input is sorted' } },
      { name: 'Dictating (red mic)', props: { dictating: true } },
    ].map((item) => (
      <div key={item.name} className="flex w-[320px] flex-col gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">{item.name}</span>
        <div className="rounded-xl p-3" style={{ background: '#172033' }}>
          <ComposerExample {...item.props} />
        </div>
      </div>
    ))}
  </div>
);

const DiffReviewPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <div className="flex w-[520px] flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">Diff · tabs, context lines, Apply walks the phases</span>
      <DiffReviewDemo />
    </div>
    <div className="flex w-[520px] flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">Checklist · partial apply</span>
      <DiffReviewDemo variant="checklist" />
    </div>
    <div className="flex w-[520px] flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">Applied · no highlighting</span>
      <DiffReview {...diffReviewPropsFactory({ status: 'applied', highlight: undefined, changes: sampleChanges(2) })} />
    </div>
  </div>
);

const ModelPickerPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">Menu · grouped providers, effort</span>
      <div className="w-[340px] rounded-md border bg-popover p-1.5 text-popover-foreground shadow-md">
        <ModelMenu {...modelPickerPropsFactory()} />
      </div>
    </div>
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs text-muted-foreground">Chip + context meter in the composer</span>
      <ComposerToolbarDemo />
    </div>
  </div>
);

const ContextMeterPreview: React.FC = () => (
  <div className="flex flex-wrap items-center gap-6">
    {contextMeterVariants
      .filter((variant) => !variant.name.startsWith('Custom') && !variant.name.startsWith('No summarise'))
      .map((variant) => (
        <div key={variant.name} className="flex flex-col items-center gap-1">
          <ContextMeter {...contextMeterPropsFactory(variant.args)} />
          <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        </div>
      ))}
  </div>
);

const UseFollowLatestPreview: React.FC = () => {
  const [lines, setLines] = React.useState(8);
  const log = useFollowLatest(lines);
  return (
    <div className="flex flex-col items-start gap-2">
      <OmniButton variant="outline" buttonSize="sm" onClick={() => setLines((n) => n + 1)}>
        Add a line
      </OmniButton>
      <div
        ref={log.ref}
        onScroll={log.onScroll}
        onWheel={log.onPersonScroll}
        onTouchMove={log.onPersonScroll}
        onPointerDown={log.onPersonScroll}
        onKeyDown={log.onPersonScroll}
        tabIndex={0}
        className="h-32 w-72 overflow-y-auto rounded-lg border p-2 text-sm"
      >
        {Array.from({ length: lines }, (_, i) => (
          <p key={i}>Line {i + 1}</p>
        ))}
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        following: {String(log.following)} · unseen: {log.unseen}{' '}
        {!log.following ? (
          <OmniButton variant="link" buttonSize="sm" onClick={log.jump}>
            jump to latest
          </OmniButton>
        ) : null}
      </span>
    </div>
  );
};

const ConversationListPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <ConversationListDemo />
    {conversationListVariants.slice(1, 3).map((variant) => (
      <div key={variant.name} className="flex h-[460px] w-[280px] flex-col gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        <div className="min-h-0 flex-1">
          <ConversationList {...conversationListPropsFactory(variant.args)} />
        </div>
      </div>
    ))}
  </div>
);

const ConversationHeaderPreview: React.FC = () => (
  <div className="flex flex-col gap-3">
    {conversationHeaderVariants.map((variant) => (
      <div key={variant.name} className="flex w-[560px] max-w-full flex-col gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        <div className="rounded-xl border">
          <ConversationHeader {...conversationHeaderPropsFactory(variant.args)} />
        </div>
      </div>
    ))}
  </div>
);

const EmptyStartersPreview: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {emptyStartersVariants.map((variant) => (
      <div key={variant.name} className="flex h-80 flex-col gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border">
          <EmptyStarters {...emptyStartersPropsFactory(variant.args)} />
        </div>
      </div>
    ))}
  </div>
);

const SettingsDialogPreview: React.FC = () => (
  <div className="flex flex-col gap-2">
    <span className="font-mono text-[11px] text-muted-foreground">Opens a focus-trapped dialog; arrow keys move between tabs</span>
    <SettingsDialogDemo />
    <span className="font-mono text-[11px] text-muted-foreground">{settingsDialogVariants.length} configurations in the stories</span>
  </div>
);

const ToastPreview: React.FC = () => (
  <div className="flex flex-wrap gap-4">
    <div className="relative h-40 w-[460px] rounded-xl border">
      <ToastDemo />
    </div>
    {toastVariants.slice(0, 3).map((variant) => (
      <div key={variant.name} className="relative h-40 w-[460px] rounded-xl border">
        <Toast {...toastPropsFactory(variant.args)} />
      </div>
    ))}
  </div>
);

const PanelShellPreview: React.FC = () => (
  <div className="flex flex-col gap-4">
    <div className="h-[520px] w-full max-w-[960px]">
      <ChatShellDemo />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {panelShellVariants.slice(0, 2).map((variant) => (
        <div key={variant.name} className="flex h-72 flex-col gap-1">
          <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
          <div className="min-h-0 flex-1">
            <PanelShell {...panelShellPropsFactory(variant.args)} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PreferencesFormPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <PreferencesFormDemo />
    {preferencesFormVariants.slice(1).map((variant) => (
      <div key={variant.name} className="flex w-[420px] flex-col gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        <PreferencesForm {...preferencesFormPropsFactory(variant.args)} />
      </div>
    ))}
  </div>
);

const DataPrivacyPanelPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <DataPrivacyPanelDemo />
    {[dataPrivacyPanelVariants[1], dataPrivacyPanelVariants[4]].map((variant) => (
      <div key={variant.name} className="flex w-[480px] flex-col gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        <DataPrivacyPanel {...dataPrivacyPanelPropsFactory(variant.args)} />
      </div>
    ))}
  </div>
);

const IntegrationListPreview: React.FC = () => (
  <div className="flex flex-wrap items-start gap-6">
    <IntegrationListDemo />
    {integrationListVariants.slice(1).map((variant) => (
      <div key={variant.name} className="flex w-[420px] flex-col gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        <IntegrationList {...integrationListPropsFactory(variant.args)} />
      </div>
    ))}
  </div>
);

const ShortcutListPreview: React.FC = () => (
  <div className="flex flex-wrap gap-8">
    {[{ name: 'Default', args: {} }, ...shortcutListVariants].map((variant) => (
      <div key={variant.name} className="flex w-[360px] flex-col gap-1">
        <span className="font-mono text-[11px] text-muted-foreground">{variant.name}</span>
        <ShortcutList {...shortcutListPropsFactory(variant.args)} />
      </div>
    ))}
  </div>
);

const ActionMenuPreview: React.FC = () => (
  <div className="flex flex-wrap items-center gap-3">
    {actionMenuVariants.map((variant) => (
      <ActionMenu key={variant.name} {...actionMenuPropsFactory(variant.args)} trigger={<OmniButton variant="outline">{variant.name}</OmniButton>} />
    ))}
  </div>
);

function FieldGrid<P extends object>({
  Component,
  factory,
  variants,
  cols = 2,
  valueKey,
}: {
  Component: AnyComponent<P>;
  factory: (overrides: Partial<P>) => P;
  variants: Variant<P>[];
  cols?: 1 | 2;
  valueKey?: keyof P;
}) {
  return (
    <div className={cols === 2 ? 'grid grid-cols-1 gap-4 lg:grid-cols-2' : 'grid grid-cols-1 gap-4'}>
      {variants.map((variant) => (
        <Controlled
          key={variant.name}
          Component={Component}
          factory={factory}
          args={variant.args}
          idSuffix={slug(variant.name)}
          valueKey={valueKey}
        />
      ))}
    </div>
  );
}

const InputPreview = () => <FieldGrid Component={Input} factory={inputPropsFactory} variants={inputVariants} />;
const TextareaPreview = () => <FieldGrid Component={Textarea} factory={textareaPropsFactory} variants={textareaVariants} />;
const EmailInputPreview = () => <FieldGrid Component={EmailInput} factory={emailInputPropsFactory} variants={emailInputVariants} />;
const PasswordInputPreview = () => <FieldGrid Component={PasswordInput} factory={passwordInputPropsFactory} variants={passwordInputVariants} />;
const NumberInputPreview = () => <FieldGrid Component={NumberInput} factory={numberInputPropsFactory} variants={numberInputVariants} />;
const CurrencyInputPreview = () => <FieldGrid Component={CurrencyInput} factory={currencyInputPropsFactory} variants={currencyInputVariants} />;
const PhoneInputPreview = () => <FieldGrid Component={PhoneInput} factory={phoneInputPropsFactory} variants={phoneInputVariants} />;
const InputOTPPreview = () => <FieldGrid Component={InputOTP} factory={inputOTPPropsFactory} variants={inputOTPVariants} />;
const TagInputPreview = () => <FieldGrid Component={TagInput} factory={tagInputPropsFactory} variants={tagInputVariants} />;
const RichTextPreview = () => <FieldGrid Component={RichText} factory={richTextPropsFactory} variants={richTextVariants} cols={1} />;

const SelectPreview = () => <FieldGrid Component={Select} factory={selectPropsFactory} variants={selectVariants} />;
const MultiSelectPreview = () => <FieldGrid Component={MultiSelect} factory={multiSelectPropsFactory} variants={multiSelectVariants} />;
const RadioPreview = () => <FieldGrid Component={Radio} factory={radioPropsFactory} variants={radioVariants} />;
const CheckboxPreview = () => (
  <FieldGrid Component={Checkbox} factory={checkboxPropsFactory} variants={checkboxVariants} valueKey={'checked' as const} />
);
const SwitchPreview = () => <FieldGrid Component={Switch} factory={switchPropsFactory} variants={switchVariants} valueKey={'checked' as const} />;
const SegmentedPreview = () => (
  <FieldGrid Component={Segmented} factory={segmentedPropsFactory} variants={[...segmentedVariants, ...segmentedControlVariants]} />
);

const ProgressPreview: React.FC = () => (
  <div className="flex flex-col gap-4">
    <div className="grid max-w-md gap-3">
      {progressVariants.map((variant) => (
        <Progress key={variant.name} {...progressPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-4">
      {progressRingVariants.map((variant) => (
        <Progress key={variant.name} {...progressPropsFactory(variant.args)} />
      ))}
    </div>
  </div>
);

const EmptyPreview: React.FC = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {emptyVariants.map((variant) => (
      <div key={variant.name} className="flex h-72 flex-col rounded-xl border">
        <Empty {...emptyPropsFactory(variant.args)} />
      </div>
    ))}
  </div>
);

const StepsPreview: React.FC = () => (
  <div className="flex flex-col gap-6">
    {stepsVariants.map((variant) => (
      <Steps key={variant.name} {...stepsPropsFactory(variant.args)} />
    ))}
  </div>
);

const TagPreview: React.FC = () => (
  <div className="flex flex-wrap items-center gap-3">
    {tagVariants.map((variant) => (
      <Tag key={variant.name} {...tagPropsFactory(variant.args)} />
    ))}
  </div>
);

const DividerPreview: React.FC = () => (
  <div className="flex flex-col gap-4">
    <div className="grid max-w-md gap-4">
      {dividerVariants.slice(0, 2).map((variant) => (
        <Divider key={variant.name} {...dividerPropsFactory(variant.args)} />
      ))}
    </div>
    <div className="flex h-9 items-center gap-3">
      {dividerVariants.slice(2).map((variant) => (
        <React.Fragment key={variant.name}>
          <span className="text-xs text-muted-foreground">{variant.name}</span>
          <Divider {...dividerPropsFactory(variant.args)} />
        </React.Fragment>
      ))}
    </div>
  </div>
);

const SliderPreview = () => <FieldGrid Component={Slider} factory={sliderPropsFactory} variants={sliderVariants} />;
const StepperPreview = () => <FieldGrid Component={Stepper} factory={stepperPropsFactory} variants={stepperVariants} />;

const DatePickerPreview = () => <FieldGrid Component={DatePicker} factory={datePickerPropsFactory} variants={datePickerVariants} />;
const TimePickerPreview = () => <FieldGrid Component={TimePicker} factory={timePickerPropsFactory} variants={timePickerVariants} />;
const DateTimePickerPreview = () => <FieldGrid Component={DateTimePicker} factory={dateTimePickerPropsFactory} variants={dateTimePickerVariants} />;

const ColorPickerPreview = () => <FieldGrid Component={ColorPicker} factory={colorPickerPropsFactory} variants={colorPickerVariants} />;
const FileUploadPreview = () => <FieldGrid Component={FileUpload} factory={fileUploadPropsFactory} variants={fileUploadVariants} />;

interface OverviewRowSpec {
  name: string;
  preview: React.ComponentType;
  variants: Variant<unknown>[];
  source?: string;
}

interface OverviewSectionSpec {
  title: string;
  rows: OverviewRowSpec[];
}

const TransferPreview = () => {
  const [targetKeys, setTargetKeys] = React.useState<string[]>(['engineering']);
  return (
    <Transfer
      dataSource={[
        { key: 'finance', title: 'Finance' },
        { key: 'engineering', title: 'Engineering' },
        { key: 'operations', title: 'Operations' },
      ]}
      targetKeys={targetKeys}
      onChange={setTargetKeys}
    />
  );
};
const CheckboxGroupPreview = () => {
  const [value, setValue] = React.useState<string[]>(['email']);
  return (
    <CheckboxGroup
      label="Notifications"
      options={[
        { value: 'email', label: 'Email' },
        { value: 'push', label: 'Push' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};
const WizardPreview = () => (
  <Wizard
    steps={[
      {
        name: 'details',
        label: 'Details',
        content: <p>Enter your details.</p>,
      },
      { name: 'review', label: 'Review', content: <p>Review and finish.</p> },
    ]}
  />
);

const TourPreview = () => {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const steps = [
    { title: 'Welcome', description: 'A guided workspace tour.' },
    { title: 'Review', description: 'Check the review queue.' },
  ];
  return (
    <div>
      <OmniButton
        onClick={() => {
          setCurrent(0);
          setOpen(true);
        }}
      >
        Start tour
      </OmniButton>
      <Tour open={open} current={current} steps={steps} onCurrentChange={setCurrent} onClose={() => setOpen(false)} />
    </div>
  );
};
const TabsPreview = () => (
  <Tabs defaultValue="one" className="w-full">
    <TabsBar>
      <Tab value="one">One</Tab>
      <Tab value="two">Two</Tab>
    </TabsBar>
    <TabPanel value="one" className="p-4">
      First tab
    </TabPanel>
    <TabPanel value="two" className="p-4">
      Second tab
    </TabPanel>
  </Tabs>
);

const previewBox = (children: React.ReactNode) => <div className="min-h-20 rounded-lg border border-border bg-card p-6">{children}</div>;

const previews: Record<string, React.ComponentType> = {
  Icon: () =>
    previewBox(
      <span className="flex items-center gap-3">
        <icons.Sparkles size={28} />
        <span>Sparkles icon</span>
      </span>,
    ),
  Badge: () => (
    <Space>
      <Badge>Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Blocked</Badge>
      <Badge variant="outline">Draft</Badge>
    </Space>
  ),
  Rate: () => (
    <Space>
      <Rate defaultValue={3} />
      <Rate value={4} disabled />
    </Space>
  ),
  Transfer: TransferPreview,
  Wizard: WizardPreview,
  CheckboxGroup: CheckboxGroupPreview,
  Tabs: TabsPreview,
  FloatButton: () => <FloatButton style={{ position: 'static' }}>+</FloatButton>,
  Flex: () => (
    <Flex gap={12} justify="space-between">
      {['Left', 'Middle', 'Right'].map((v) => (
        <div key={v} className="rounded border p-3">
          {v}
        </div>
      ))}
    </Flex>
  ),
  Grid: () => (
    <GridRow gutter={12}>
      {[8, 8, 8].map((span, i) => (
        <GridCol key={i} span={span}>
          <div className="rounded border p-3 text-center">{span}</div>
        </GridCol>
      ))}
    </GridRow>
  ),
  Layout: () => (
    <div className="overflow-hidden rounded border">
      <Header>Header</Header>
      <div className="flex min-h-24">
        <Sider>Side</Sider>
        <Content className="p-4">Content</Content>
      </div>
      <Footer>Footer</Footer>
    </div>
  ),
  Space: () => (
    <Space>
      {['One', 'Two', 'Three'].map((v) => (
        <div key={v} className="rounded border p-3">
          {v}
        </div>
      ))}
    </Space>
  ),
  Splitter: () => (
    <Splitter className="h-32">
      <SplitterPanel className="p-4">Left</SplitterPanel>
      <SplitterPanel className="p-4">Right</SplitterPanel>
    </Splitter>
  ),
  Masonry: () => (
    <Masonry
      columns={{ xs: 1, sm: 2, md: 4 }}
      gutter={16}
      items={[
        { key: 'one', children: <Card className="h-56 p-5">1</Card> },
        { key: 'two', children: <Card className="h-24 p-5">2</Card> },
        { key: 'three', children: <Card className="h-32 p-5">3</Card> },
        { key: 'four', children: <Card className="h-28 p-5">4</Card> },
        {
          key: 'five',
          children: (
            <Card className="h-36 p-5">
              <div className="text-xl font-semibold">I&apos;m Special</div>
              <div className="mt-3 text-muted-foreground">Let&apos;s have a meal</div>
            </Card>
          ),
        },
        { key: 'six', children: <Card className="h-64 p-5">6</Card> },
        { key: 'seven', children: <Card className="h-48 p-5">7</Card> },
        { key: 'eight', children: <Card className="h-36 p-5">8</Card> },
        { key: 'nine', children: <Card className="h-24 p-5">9</Card> },
        { key: 'ten', children: <Card className="h-44 p-5">10</Card> },
      ]}
    />
  ),
  Anchor: () => (
    <Anchor
      items={[
        { href: '#overview', title: 'Overview' },
        { href: '#details', title: 'Details' },
      ]}
    />
  ),
  Breadcrumb: () => <Breadcrumb items={[{ title: 'Home' }, { title: 'Workspace' }, { title: 'Overview' }]} />,
  Dropdown: () => (
    <Dropdown>
      <DropdownTrigger asChild>
        <OmniButton variant="outline">Actions</OmniButton>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>Actions</DropdownLabel>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Archive</DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
  Menu: () => (
    <Menu
      selectedKeys={['home']}
      items={[
        { key: 'home', label: 'Home' },
        { key: 'projects', label: 'Projects' },
        { key: 'settings', label: 'Settings' },
      ]}
    />
  ),
  Pagination: () => <Pagination current={1} total={50} pageSize={10} />,
  AutoComplete: () => (
    <AutoComplete label="Assignee" value="" onChange={() => undefined} options={[{ value: 'Alex Morgan' }, { value: 'Jamie Chen' }]} />
  ),
  Cascader: () => (
    <Cascader
      options={[
        {
          value: 'frontend',
          label: 'Frontend',
          children: [{ value: 'react', label: 'React' }],
        },
      ]}
    />
  ),
  DynamicForm: () => (
    <DynamicForm
      schema={{
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', title: 'Name' }, email: { type: 'string', title: 'Email', format: 'email' } },
      }}
      zodSchema={z.object({ name: z.string().min(1), email: z.string().email().optional() })}
      onSubmit={() => undefined}
    >
      <Button type="submit">Save</Button>
    </DynamicForm>
  ),
  Form: () =>
    previewBox(
      <Form
        zodSchema={z.object({
          name: z.string().min(1),
          email: z.string().email(),
        })}
        formData={{ name: '', email: '' }}
        onSubmit={() => undefined}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="name" required>
            {(field) => <Input label="Name" value={String(field.value ?? '')} onChange={field.onChange} required />}
          </FormField>
          <FormField name="email" required>
            {(field) => <EmailInput label="Email" value={String(field.value ?? '')} onChange={field.onChange} required />}
          </FormField>
        </div>
        <Button type="submit" className="mt-4">
          Save
        </Button>
      </Form>,
    ),
  Mentions: () => <Mentions label="Comment" value="@alex " placeholder="Write a comment..." rows={3} onChange={() => undefined} />,
  Avatar: () => <Avatar fallback="OU" />,
  Calendar: () => <Calendar className="w-full max-w-md" />,
  Card: () => (
    <Card>
      <CardHeader>
        <CardTitle>Project summary</CardTitle>
      </CardHeader>
      <CardContent>Healthy and on schedule.</CardContent>
    </Card>
  ),
  Carousel: () => (
    <Carousel>
      <div className="p-8 text-center">Slide one</div>
      <div className="p-8 text-center">Slide two</div>
    </Carousel>
  ),
  Collapse: () => <Collapse defaultActiveKey="one" items={[{ key: 'one', label: 'Details', children: 'Expandable content' }]} />,
  Descriptions: () => (
    <Descriptions
      items={[
        { key: 'owner', label: 'Owner', children: 'Alex Morgan' },
        { key: 'status', label: 'Status', children: 'Active' },
      ]}
    />
  ),
  Image: () => <Image src="https://placehold.co/240x120" alt="Preview" />,
  List: () => (
    <List>
      {['One', 'Two', 'Three'].map((item) => (
        <ListItem key={item}>{item}</ListItem>
      ))}
    </List>
  ),
  Popover: () => (
    <Popover>
      <PopoverTrigger asChild>
        <OmniButton variant="outline">Hover details</OmniButton>
      </PopoverTrigger>
      <PopoverContent>Additional details</PopoverContent>
    </Popover>
  ),
  QRCode: () => <QRCode value="https://omnitech.dev" />,
  Statistic: () => <Statistic title="Active users" value={128} />,
  Table: () => (
    <Table
      columns={[{ title: 'Name', dataIndex: 'name', key: 'name' }]}
      dataSource={[
        { key: '1', name: 'Alex Morgan' },
        { key: '2', name: 'Jamie Chen' },
      ]}
    />
  ),
  Timeline: () => <Timeline items={[{ children: 'Created' }, { children: 'Reviewed' }, { children: 'Published' }]} />,
  Tooltip: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <OmniButton variant="outline">Hover me</OmniButton>
        </TooltipTrigger>
        <TooltipContent>Helpful context</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  Tour: TourPreview,
  Tree: () => (
    <Tree
      treeData={[
        {
          key: 'workspace',
          title: 'Workspace',
          children: [{ key: 'projects', title: 'Projects' }],
        },
      ]}
    />
  ),
  TreeSelect: () => <TreeSelect label="Location" value="" onChange={() => undefined} treeData={[{ value: 'workspace', title: 'Workspace' }]} />,
  Watermark: () => (
    <Watermark content="INTERNAL">
      <div className="h-24 rounded border p-4">Protected content</div>
    </Watermark>
  ),
  Alert: () => (
    <Alert title="Saved" variant="success">
      Your changes are ready.
    </Alert>
  ),
  Drawer: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <OmniButton variant="outline">Open drawer</OmniButton>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Project settings</DrawerTitle>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  ),
  Message: () => <OmniButton onClick={() => message.success('Message sent')}>Show message</OmniButton>,
  Modal: () => (
    <Modal>
      <ModalTrigger asChild>
        <OmniButton>Open modal</OmniButton>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Confirm action</ModalTitle>
        </ModalHeader>
      </ModalContent>
    </Modal>
  ),
  Notification: () => (
    <OmniButton
      onClick={() =>
        notification.success({
          message: 'Notification sent',
          description: 'The operation completed.',
        })
      }
    >
      Show notification
    </OmniButton>
  ),
  Popconfirm: () => (
    <Popconfirm title="Delete record?" description="This cannot be undone.">
      <OmniButton variant="destructive">Delete</OmniButton>
    </Popconfirm>
  ),
  Result: () => <Result status="success" title="Saved" subTitle="The record was saved successfully." />,
  Skeleton: () => <Skeleton className="h-6 w-48" />,
  Spin: () => (
    <Spin spinning tip="Loading">
      <div className="h-20 rounded border p-4">Content</div>
    </Spin>
  ),
  Affix: () => (
    <Affix offsetTop={0}>
      <div className="rounded border bg-background p-3">Sticky summary</div>
    </Affix>
  ),
  App: () => <App>{previewBox(<span>Application shell</span>)}</App>,
  BackTop: () => <BackTop visibilityHeight={0} style={{ position: 'static' }} />,
  ConfigProvider: () => <ConfigProvider>{previewBox(<span>Configured content</span>)}</ConfigProvider>,
  Upload: () => <Upload />,
  Util: () =>
    previewBox(
      <span>
        <strong>Util</strong> · clamp(12, 0, 10) = {clamp(12, 0, 10)} · isNil(null) = {String(isNil(null))}
      </span>,
    ),
};

const LibraryPreview: React.FC<{ name: string }> = ({ name }) => {
  const Preview = previews[name];
  return Preview ? <Preview /> : previewBox(name);
};

/** Rows with their own preview and factory variants (Show code and the variant list come from them). */
const configuredRows: Record<string, OverviewRowSpec> = {
  Divider: { name: 'Divider', preview: DividerPreview, variants: dividerVariants as Variant<unknown>[] },
  Empty: { name: 'Empty', preview: EmptyPreview, variants: emptyVariants as Variant<unknown>[] },
  Progress: { name: 'Progress', preview: ProgressPreview, variants: [...progressVariants, ...progressRingVariants] as Variant<unknown>[] },
  Steps: { name: 'Steps', preview: StepsPreview, variants: stepsVariants as Variant<unknown>[] },
  Tag: { name: 'Tag', preview: TagPreview, variants: tagVariants as Variant<unknown>[] },
};

const libraryRow = (name: string): OverviewRowSpec =>
  configuredRows[name] ?? {
    name,
    preview: () => <LibraryPreview name={name} />,
    variants: [],
    source: `previews.${name}`,
  };

const TypographyPreview: React.FC = () => (
  <div className="flex flex-col gap-3">
    <Typography.Title>Typography title</Typography.Title>
    <Typography.Paragraph>Typography paragraph content with the current Omni tokens.</Typography.Paragraph>
    <Typography.Text type="secondary">Secondary text</Typography.Text>
    <Typography.Link href="#component-typography">Typography link</Typography.Link>
  </div>
);

const SECTIONS: OverviewSectionSpec[] = [
  {
    title: 'General',
    rows: [
      {
        name: 'Typography',
        preview: TypographyPreview,
        variants: [],
        source: 'TypographyPreview',
      },
      libraryRow('Icon'),
      libraryRow('FloatButton'),
    ],
  },
  {
    title: 'Layout',
    rows: [
      ...['Divider', 'Flex', 'Grid', 'Layout'].map(libraryRow),
      { name: 'Panel', preview: PanelPreview, variants: panelVariants as Variant<unknown>[] },
      { name: 'Transcript', preview: TranscriptPreview, variants: transcriptVariants as Variant<unknown>[] },
      { name: 'Transcript (conversation)', preview: ConversationPreview, variants: [], source: 'ConversationPreview' },
      { name: 'Attachment', preview: AttachmentPreview, variants: attachmentVariants as Variant<unknown>[] },
      { name: 'Composer', preview: MessageBoxPreview, variants: composerVariants as Variant<unknown>[] },
      { name: 'CommandPopover', preview: CommandPopoverPreview, variants: commandPopoverVariants as Variant<unknown>[] },
      { name: 'DictationBar', preview: DictationBarPreview, variants: dictationBarVariants as Variant<unknown>[] },
      { name: 'QueuedList', preview: QueuedListPreview, variants: queuedListVariants as Variant<unknown>[] },
      { name: 'DiffReview', preview: DiffReviewPreview, variants: diffReviewVariants as Variant<unknown>[] },
      { name: 'ModelPicker', preview: ModelPickerPreview, variants: modelPickerVariants as Variant<unknown>[] },
      { name: 'ContextMeter', preview: ContextMeterPreview, variants: contextMeterVariants as Variant<unknown>[] },
      { name: 'useFollowLatest', preview: UseFollowLatestPreview, variants: [], source: 'UseFollowLatestPreview' },
      ...['Space', 'Splitter', 'Masonry'].map(libraryRow),
    ],
  },
  {
    title: 'Navigation',
    rows: ['Anchor', 'Breadcrumb', 'Dropdown', 'Menu', 'Pagination', 'Steps', 'Tabs', 'Wizard'].map(libraryRow),
  },
  {
    title: 'Data entry',
    rows: ['AutoComplete', 'Cascader', 'Form', 'DynamicForm', 'Mentions'].map(libraryRow),
  },
  {
    title: 'Actions',
    rows: [
      {
        name: 'Button',
        preview: ButtonPreview,
        variants: [
          ...buttonVariants,
          ...buttonSizeVariants,
          ...buttonToneVariants,
          ...buttonActionVariants,
          ...buttonStateVariants,
        ] as Variant<unknown>[],
      },
      {
        name: 'IconButton',
        preview: IconButtonPreview,
        variants: [...iconButtonVariants, ...iconButtonSizeVariants, ...iconButtonToneVariants, ...iconButtonStateVariants] as Variant<unknown>[],
      },
      { name: 'SplitButton', preview: SplitButtonPreview, variants: splitButtonVariants as Variant<unknown>[] },
      { name: 'Toolbar', preview: ToolbarPreview, variants: [...toolbarVariants, ...toolbarLabelledVariants] as Variant<unknown>[] },
      { name: 'SessionBar', preview: SessionBarPreview, variants: sessionBarExamples as Variant<unknown>[] },
      { name: 'StatusClock', preview: StatusClockPreview, variants: statusClockExamples as Variant<unknown>[] },
      {
        name: 'Native App (showcase)',
        preview: NativeAppPreview,
        variants: [
          { name: 'Toolbar states (1a)', args: { story: 'Showcase/Native App · Toolbar States' } },
          { name: 'Toolbar variations and open menus (1c)', args: { story: 'Showcase/Native App · Toolbar Variations' } },
          { name: 'Panels in three states (1d)', args: { story: 'Showcase/Native App · Panels In Three States' } },
          { name: 'Footer states (1e)', args: { story: 'Showcase/Native App · Footer States' } },
          { name: 'Window 1180 and 900', args: { story: 'Showcase/Native App · Window 1180, Window 900' } },
        ] as Variant<unknown>[],
        source: 'NativeAppPreview',
      },
      { name: 'ActionMenu', preview: ActionMenuPreview, variants: actionMenuVariants as Variant<unknown>[] },
    ],
  },
  {
    title: 'Message parts',
    rows: [
      { name: 'Markdown', preview: MarkdownPreview, variants: markdownVariants as Variant<unknown>[] },
      { name: 'Sources', preview: SourcesPreview, variants: sourcesVariants as Variant<unknown>[] },
      { name: 'Suggestions', preview: SuggestionsPreview, variants: suggestionsVariants as Variant<unknown>[] },
      { name: 'Thinking', preview: ThinkingPreview, variants: thinkingVariants as Variant<unknown>[] },
      { name: 'StepTimeline', preview: StepTimelinePreview, variants: stepTimelineVariants as Variant<unknown>[] },
      { name: 'ErrorCard', preview: ErrorCardPreview, variants: errorCardVariants as Variant<unknown>[] },
      { name: 'ApprovalCard', preview: ApprovalCardPreview, variants: approvalCardVariants as Variant<unknown>[] },
      { name: 'FeedbackPanel', preview: FeedbackPanelPreview, variants: feedbackPanelVariants as Variant<unknown>[] },
      { name: 'VersionPager', preview: VersionPagerPreview, variants: versionPagerVariants as Variant<unknown>[] },
      { name: 'MessageActions', preview: MessageActionsPreview, variants: messageActionsVariants as Variant<unknown>[] },
      { name: 'SummaryDivider', preview: SummaryDividerPreview, variants: summaryDividerVariants as Variant<unknown>[] },
      {
        name: 'Chat reply (message parts together)',
        preview: ChatReplyPreview,
        variants: [{ name: 'Finished reply, summary steps', args: {} }] as Variant<unknown>[],
        source: 'ChatReplyPreview',
      },
      {
        name: 'ConversationTranscript',
        preview: ConversationTranscriptPreview,
        variants: [{ name: 'The chat reply, composed from props only', args: {} }] as Variant<unknown>[],
        source: 'ConversationTranscriptPreview',
      },
    ],
  },
  {
    title: 'Text inputs',
    rows: [
      {
        name: 'Input',
        preview: InputPreview,
        variants: inputVariants as Variant<unknown>[],
      },
      {
        name: 'Composer (Input + actions)',
        preview: ComposerPreview,
        variants: [
          { name: 'Empty, send muted', args: { actions: 'mic + send', variant: 'panel' } },
          { name: 'Typing', args: { actions: 'mic + send', variant: 'panel', value: 'Assume the input is sorted' } },
        ] as Variant<unknown>[],
        source: 'ComposerPreview',
      },
      {
        name: 'Textarea',
        preview: TextareaPreview,
        variants: textareaVariants as Variant<unknown>[],
      },
      {
        name: 'EmailInput',
        preview: EmailInputPreview,
        variants: emailInputVariants as Variant<unknown>[],
      },
      {
        name: 'PasswordInput',
        preview: PasswordInputPreview,
        variants: passwordInputVariants as Variant<unknown>[],
      },
      {
        name: 'NumberInput',
        preview: NumberInputPreview,
        variants: numberInputVariants as Variant<unknown>[],
      },
      {
        name: 'CurrencyInput',
        preview: CurrencyInputPreview,
        variants: currencyInputVariants as Variant<unknown>[],
      },
      {
        name: 'PhoneInput',
        preview: PhoneInputPreview,
        variants: phoneInputVariants as Variant<unknown>[],
      },
      {
        name: 'InputOTP',
        preview: InputOTPPreview,
        variants: inputOTPVariants as Variant<unknown>[],
      },
      {
        name: 'TagInput',
        preview: TagInputPreview,
        variants: tagInputVariants as Variant<unknown>[],
      },
      {
        name: 'RichText',
        preview: RichTextPreview,
        variants: richTextVariants as Variant<unknown>[],
      },
    ],
  },
  {
    title: 'Selection',
    rows: [
      {
        name: 'Select',
        preview: SelectPreview,
        variants: selectVariants as Variant<unknown>[],
      },
      {
        name: 'MultiSelect',
        preview: MultiSelectPreview,
        variants: multiSelectVariants as Variant<unknown>[],
      },
      {
        name: 'Radio',
        preview: RadioPreview,
        variants: radioVariants as Variant<unknown>[],
      },
      {
        name: 'Checkbox',
        preview: CheckboxPreview,
        variants: checkboxVariants as Variant<unknown>[],
      },
      libraryRow('CheckboxGroup'),
      {
        name: 'Switch',
        preview: SwitchPreview,
        variants: switchVariants as Variant<unknown>[],
      },
      {
        name: 'Segmented',
        preview: SegmentedPreview,
        variants: segmentedVariants as Variant<unknown>[],
      },
      libraryRow('Rate'),
      libraryRow('Transfer'),
    ],
  },
  {
    title: 'Numeric',
    rows: [
      {
        name: 'Slider',
        preview: SliderPreview,
        variants: sliderVariants as Variant<unknown>[],
      },
      {
        name: 'Stepper',
        preview: StepperPreview,
        variants: stepperVariants as Variant<unknown>[],
      },
    ],
  },
  {
    title: 'Date and time',
    rows: [
      {
        name: 'DatePicker',
        preview: DatePickerPreview,
        variants: datePickerVariants as Variant<unknown>[],
      },
      {
        name: 'TimePicker',
        preview: TimePickerPreview,
        variants: timePickerVariants as Variant<unknown>[],
      },
      {
        name: 'DateTimePicker',
        preview: DateTimePickerPreview,
        variants: dateTimePickerVariants as Variant<unknown>[],
      },
    ],
  },
  {
    title: 'Media and misc',
    rows: [
      {
        name: 'ColorPicker',
        preview: ColorPickerPreview,
        variants: colorPickerVariants as Variant<unknown>[],
      },
      {
        name: 'FileUpload',
        preview: FileUploadPreview,
        variants: fileUploadVariants as Variant<unknown>[],
      },
    ],
  },
  {
    title: 'Data display',
    rows: [
      'Avatar',
      'Badge',
      'Calendar',
      'Card',
      'Carousel',
      'Collapse',
      'Descriptions',
      'Empty',
      'Image',
      'List',
      'Popover',
      'QRCode',
      'Statistic',
      'Table',
      'Tag',
      'Timeline',
      'Tooltip',
      'Tour',
      'Tree',
      'TreeSelect',
      'Watermark',
    ].map(libraryRow),
  },
  {
    title: 'Feedback',
    rows: ['Alert', 'Drawer', 'Message', 'Modal', 'Notification', 'Popconfirm', 'Progress', 'Result', 'Skeleton', 'Spin'].map(libraryRow),
  },
  {
    title: 'Other',
    rows: ['Affix', 'App', 'BackTop', 'ConfigProvider', 'Upload', 'Util'].map(libraryRow),
  },
  {
    title: 'Chat shell and settings',
    rows: [
      { name: 'PanelShell', preview: PanelShellPreview, variants: panelShellVariants as Variant<unknown>[] },
      { name: 'ConversationList', preview: ConversationListPreview, variants: conversationListVariants as Variant<unknown>[] },
      { name: 'ConversationHeader', preview: ConversationHeaderPreview, variants: conversationHeaderVariants as Variant<unknown>[] },
      { name: 'EmptyStarters', preview: EmptyStartersPreview, variants: emptyStartersVariants as Variant<unknown>[] },
      { name: 'Toast', preview: ToastPreview, variants: toastVariants as Variant<unknown>[] },
      { name: 'SettingsDialog', preview: SettingsDialogPreview, variants: settingsDialogVariants as Variant<unknown>[] },
      { name: 'PreferencesForm', preview: PreferencesFormPreview, variants: preferencesFormVariants as Variant<unknown>[] },
      { name: 'DataPrivacyPanel', preview: DataPrivacyPanelPreview, variants: dataPrivacyPanelVariants as Variant<unknown>[] },
      { name: 'IntegrationList', preview: IntegrationListPreview, variants: integrationListVariants as Variant<unknown>[] },
      { name: 'ShortcutList', preview: ShortcutListPreview, variants: shortcutListVariants as Variant<unknown>[] },
    ],
  },
];

const sectionId = (title: string) => `section-${slug(title)}`;
const rowId = (name: string) => `component-${slug(name)}`;

const ComponentOverviewPage: React.FC = () => {
  const tocItems: TocItem[] = SECTIONS.flatMap((section) =>
    section.rows.map((row) => ({
      id: rowId(row.name),
      label: row.name,
      group: section.title,
    })),
  );

  return (
    <div className="pb-shell box-border w-full max-w-[100vw] px-8 py-10">
      <div className="pb-overview-layout grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem] xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="pb-overview-main min-w-0">
          <header className="pb-shell-header mb-8 max-w-4xl">
            <h1 className="text-4xl font-semibold text-foreground">Component Overview</h1>
            <p className="mt-3 text-[15px] leading-8 text-muted-foreground">
              Browse the Omni UI component set with the same reference layout used for Table. Each row keeps the component identity, JSX contract,
              live preview, and runnable example code together.
            </p>
          </header>
          {SECTIONS.map((section, sectionIndex) => (
            <React.Fragment key={section.title}>
              <SectionHeading id={sectionId(section.title)} index={String(sectionIndex + 1)} title={section.title} />
              {section.rows.map((row, rowIndex) => {
                const Preview = row.preview;
                return (
                  <Row key={row.name} id={rowId(row.name)} index={`${sectionIndex + 1}.${rowIndex + 1}`} name={row.name} code={codeFromVariants(row)}>
                    <Preview />
                  </Row>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <aside className="hidden md:block">
          <TableOfContents items={tocItems} title="Table of contents" />
        </aside>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Getting Started/Component Overview',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const ComponentOverview: Story = {
  name: 'Component Overview',
  render: () => <ComponentOverviewPage />,
};
