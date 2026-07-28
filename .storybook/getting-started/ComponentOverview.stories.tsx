import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {
  Button,
  Form,
  FormField,
  Checkbox,
  ColorPicker,
  CurrencyInput,
  DatePicker,
  DateTimePicker,
  EmailInput,
  FileUpload,
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
  Steps,
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
  FloatButton, Divider, Flex, Col as GridCol, Row as GridRow, Content, Footer, Header, Sider, Space, Splitter, SplitterPanel, Masonry,
  Anchor, Breadcrumb, Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownTrigger, Menu, Pagination,
  AutoComplete, Cascader, Mentions, Avatar, Calendar, Card, CardContent, CardHeader, CardTitle, Carousel, Collapse,
  Descriptions, Empty, Image, List, Popover, PopoverContent, PopoverTrigger, QRCode, Statistic, Table, Tag, Timeline, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Tour, Tree, TreeSelect, Watermark,
  Alert, Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, Modal, ModalContent, ModalHeader, ModalTitle, ModalTrigger,
  Popconfirm, Progress, Result, Skeleton, Spin, Affix, App, BackTop, ConfigProvider, Upload, Button as OmniButton,
  message, notification,
} from '@oc-tech/omni-ui-components';
import { z } from 'zod';
import { CodePanel, InlineCode, SegmentedPill, TableOfContents, type TocItem } from '../internal/support';
import type { Variant } from '@oc-tech/omni-ui-components/internal/support/makeFactory';
import { buttonPropsFactory, buttonSizeVariants, buttonVariants } from 'factories/omni-ui-components/Button/Button.factories';
import { checkboxPropsFactory, checkboxVariants } from 'factories/omni-ui-components/Checkbox/Checkbox.factories';
import { colorPickerPropsFactory, colorPickerVariants } from 'factories/omni-ui-components/ColorPicker/ColorPicker.factories';
import { currencyInputPropsFactory, currencyInputVariants } from 'factories/omni-ui-components/CurrencyInput/CurrencyInput.factories';
import { datePickerPropsFactory, datePickerVariants } from 'factories/omni-ui-components/DatePicker/DatePicker.factories';
import { dateTimePickerPropsFactory, dateTimePickerVariants } from 'factories/omni-ui-components/DateTimePicker/DateTimePicker.factories';
import { emailInputPropsFactory, emailInputVariants } from 'factories/omni-ui-components/EmailInput/EmailInput.factories';
import { fileUploadPropsFactory, fileUploadVariants } from 'factories/omni-ui-components/FileUpload/FileUpload.factories';
import { iconButtonPropsFactory, iconButtonSizeVariants, iconButtonVariants } from 'factories/omni-ui-components/IconButton/IconButton.factories';
import { inputPropsFactory, inputVariants } from 'factories/omni-ui-components/Input/Input.factories';
import { inputOTPPropsFactory, inputOTPVariants } from 'factories/omni-ui-components/InputOTP/InputOTP.factories';
import { multiSelectPropsFactory, multiSelectVariants } from 'factories/omni-ui-components/MultiSelect/MultiSelect.factories';
import { numberInputPropsFactory, numberInputVariants } from 'factories/omni-ui-components/NumberInput/NumberInput.factories';
import { passwordInputPropsFactory, passwordInputVariants } from 'factories/omni-ui-components/PasswordInput/PasswordInput.factories';
import { phoneInputPropsFactory, phoneInputVariants } from 'factories/omni-ui-components/PhoneInput/PhoneInput.factories';
import { radioPropsFactory, radioVariants } from 'factories/omni-ui-components/Radio/Radio.factories';
import { richTextPropsFactory, richTextVariants } from 'factories/omni-ui-components/RichText/RichText.factories';
import { segmentedPropsFactory, segmentedVariants } from 'factories/omni-ui-components/Segmented/Segmented.factories';
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
          { content: index, tinted: true, className: 'px-5 py-3 text-base font-semibold text-foreground' },
          { content: name, uppercase: true, className: 'px-5 py-3 text-base font-semibold tracking-[0.12em]' },
          { content: <InlineCode code={`<${name} />`} className="text-[1rem] text-[var(--color-primary)]" />, className: 'px-5 py-3' },
        ]}
        className="inline-flex items-stretch overflow-hidden rounded-2xl border border-[var(--oui-border-field)] text-xs font-mono"
      />
    </div>
    <div className="pb-overview-row-preview mt-5">{children}</div>
    <CodePanel code={code} />
  </section>
);

const SectionHeading: React.FC<{ id: string; index: string; title: string }> = ({ id, index, title }) => (
  <div id={id} className="scroll-mt-6 pt-10 pb-4">
    <div className="text-2xl font-bold text-foreground">
      {index}. {title}
    </div>
  </div>
);

const codeFromVariants = <T,>(
  componentName: string,
  variants: Variant<T>[],
  redactKeys: Array<keyof T> = ['onChange' as keyof T, 'onText' as keyof T],
): string => {
  const head = `import { ${componentName} } from '@oc-tech/omni-ui-components';\n\n`;
  const body = variants
    .map((variant) => {
      const entries = Object.entries(variant.args as Record<string, unknown>).filter(([key]) => !redactKeys.includes(key as keyof T));
      const props = entries
        .map(([key, value]) => {
          if (value === true) return key;
          if (value === false || value == null) return null;
          if (typeof value === 'string') return `${key}="${value}"`;
          if (typeof value === 'number') return `${key}={${value}}`;
          if (value instanceof Date) return `${key}={new Date(${value.getFullYear()}, ${value.getMonth()}, ${value.getDate()})}`;
          if (Array.isArray(value) || typeof value === 'object') return `${key}={/* complex value */}`;
          return `${key}={${String(value)}}`;
        })
        .filter(Boolean)
        .join(' ');
      return `<${componentName}${props ? ` ${props}` : ''} />`;
    })
    .join('\n');
  return head + body;
};

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

  const baseId = ((factory(args).id as string | undefined) ?? 'demo').toString();
  const id = `${baseId}-${idSuffix}`;
  const props = factory({ ...args, id, [valueKey]: value, onChange: setValue } as Partial<P>);
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
        <Controlled key={variant.name} Component={Component} factory={factory} args={variant.args} idSuffix={slug(variant.name)} valueKey={valueKey} />
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
  <FieldGrid
    Component={Checkbox}
    factory={checkboxPropsFactory}
    variants={checkboxVariants}
    valueKey={'checked' as keyof React.ComponentProps<typeof Checkbox>}
  />
);
const SwitchPreview = () => (
  <FieldGrid Component={Switch} factory={switchPropsFactory} variants={switchVariants} valueKey={'checked' as keyof React.ComponentProps<typeof Switch>} />
);
const SegmentedPreview = () => <FieldGrid Component={Segmented} factory={segmentedPropsFactory} variants={segmentedVariants} />;

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
}

interface OverviewSectionSpec {
  title: string;
  rows: OverviewRowSpec[];
}

const StepsPreview = () => <Steps items={[{ title: 'Question' }, { title: 'Solution' }, { title: 'Tests' }]} current={1} />;
const TourPreview = () => {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const steps = [
    { title: 'Welcome', description: 'A guided workspace tour.' },
    { title: 'Review', description: 'Check the review queue.' },
  ];
  return (
    <div>
      <OmniButton onClick={() => { setCurrent(0); setOpen(true); }}>Start tour</OmniButton>
      <Tour open={open} current={current} steps={steps} onCurrentChange={setCurrent} onClose={() => setOpen(false)} />
    </div>
  );
};
const TabsPreview = () => (
  <Tabs defaultValue="one" className="w-full">
    <TabsBar><Tab value="one">One</Tab><Tab value="two">Two</Tab></TabsBar>
    <TabPanel value="one" className="p-4">First tab</TabPanel>
    <TabPanel value="two" className="p-4">Second tab</TabPanel>
  </Tabs>
);

const previewBox = (children: React.ReactNode) => <div className="min-h-20 rounded-lg border border-border bg-card p-6">{children}</div>;

const previews: Record<string, React.ComponentType> = {
  Icon: () => previewBox(<span className="flex items-center gap-3"><icons.Sparkles size={28} /><span>Sparkles icon</span></span>),
  Steps: StepsPreview,
  Tabs: TabsPreview,
  FloatButton: () => <FloatButton style={{ position: 'static' }}>+</FloatButton>,
  Divider: () => <Divider>Divider</Divider>,
  Flex: () => <Flex gap={12} justify="space-between">{['Left', 'Middle', 'Right'].map((v) => <div key={v} className="rounded border p-3">{v}</div>)}</Flex>,
  Grid: () => <GridRow gutter={12}>{[8, 8, 8].map((span, i) => <GridCol key={i} span={span}><div className="rounded border p-3 text-center">{span}</div></GridCol>)}</GridRow>,
  Layout: () => <div className="overflow-hidden rounded border"><Header>Header</Header><div className="flex min-h-24"><Sider>Side</Sider><Content className="p-4">Content</Content></div><Footer>Footer</Footer></div>,
  Space: () => <Space>{['One', 'Two', 'Three'].map((v) => <div key={v} className="rounded border p-3">{v}</div>)}</Space>,
  Splitter: () => <Splitter className="h-32"><SplitterPanel className="p-4">Left</SplitterPanel><SplitterPanel className="p-4">Right</SplitterPanel></Splitter>,
  Masonry: () => (
    <Masonry
      columns={{ xs: 1, sm: 2, md: 4 }}
      gutter={16}
      items={[
        { key: 'one', children: <Card className="h-56 p-5">1</Card> },
        { key: 'two', children: <Card className="h-24 p-5">2</Card> },
        { key: 'three', children: <Card className="h-32 p-5">3</Card> },
        { key: 'four', children: <Card className="h-28 p-5">4</Card> },
        { key: 'five', children: <Card className="h-36 p-5"><div className="text-xl font-semibold">I&apos;m Special</div><div className="mt-3 text-muted-foreground">Let&apos;s have a meal</div></Card> },
        { key: 'six', children: <Card className="h-64 p-5">6</Card> },
        { key: 'seven', children: <Card className="h-48 p-5">7</Card> },
        { key: 'eight', children: <Card className="h-36 p-5">8</Card> },
        { key: 'nine', children: <Card className="h-24 p-5">9</Card> },
        { key: 'ten', children: <Card className="h-44 p-5">10</Card> },
      ]}
    />
  ),
  Anchor: () => <Anchor items={[{ href: '#overview', title: 'Overview' }, { href: '#details', title: 'Details' }]} />,
  Breadcrumb: () => <Breadcrumb items={[{ title: 'Home' }, { title: 'Workspace' }, { title: 'Overview' }]} />,
  Dropdown: () => <Dropdown><DropdownTrigger asChild><OmniButton variant="outline">Actions</OmniButton></DropdownTrigger><DropdownContent><DropdownLabel>Actions</DropdownLabel><DropdownItem>Edit</DropdownItem><DropdownItem>Archive</DropdownItem></DropdownContent></Dropdown>,
  Menu: () => <Menu selectedKeys={['home']} items={[{ key: 'home', label: 'Home' }, { key: 'projects', label: 'Projects' }, { key: 'settings', label: 'Settings' }]} />,
  Pagination: () => <Pagination current={1} total={50} pageSize={10} />,
  AutoComplete: () => <AutoComplete label="Assignee" value="" onChange={() => undefined} options={[{ value: 'Alex Morgan' }, { value: 'Jamie Chen' }]} />,
  Cascader: () => <Cascader options={[{ value: 'frontend', label: 'Frontend', children: [{ value: 'react', label: 'React' }] }]} />,
  Form: () => previewBox(
    <Form
      zodSchema={z.object({ name: z.string().min(1), email: z.string().email() })}
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
      <Button type="submit" className="mt-4">Save</Button>
    </Form>,
  ),
  Mentions: () => (
    <Mentions
      label="Comment"
      value="@alex "
      placeholder="Write a comment..."
      rows={3}
      onChange={() => undefined}
    />
  ),
  Avatar: () => <Avatar fallback="OU" />,
  Calendar: () => <Calendar className="w-full max-w-md" />,
  Card: () => <Card><CardHeader><CardTitle>Project summary</CardTitle></CardHeader><CardContent>Healthy and on schedule.</CardContent></Card>,
  Carousel: () => <Carousel><div className="p-8 text-center">Slide one</div><div className="p-8 text-center">Slide two</div></Carousel>,
  Collapse: () => <Collapse defaultActiveKey="one" items={[{ key: 'one', label: 'Details', children: 'Expandable content' }]} />,
  Descriptions: () => <Descriptions items={[{ key: 'owner', label: 'Owner', children: 'Alex Morgan' }, { key: 'status', label: 'Status', children: 'Active' }]} />,
  Empty: () => <Empty description="No records" />,
  Image: () => <Image src="https://placehold.co/240x120" alt="Preview" />,
  List: () => <List dataSource={['One', 'Two', 'Three']} renderItem={(item) => <List.Item>{item}</List.Item>} />,
  Popover: () => <Popover><PopoverTrigger asChild><OmniButton variant="outline">Hover details</OmniButton></PopoverTrigger><PopoverContent>Additional details</PopoverContent></Popover>,
  QRCode: () => <QRCode value="https://omnitech.dev" />,
  Statistic: () => <Statistic title="Active users" value={128} />,
  Table: () => <Table columns={[{ title: 'Name', dataIndex: 'name', key: 'name' }]} dataSource={[{ key: '1', name: 'Alex Morgan' }, { key: '2', name: 'Jamie Chen' }]} />,
  Tag: () => <Tag>Active</Tag>,
  Timeline: () => <Timeline items={[{ children: 'Created' }, { children: 'Reviewed' }, { children: 'Published' }]} />,
  Tooltip: () => <TooltipProvider><Tooltip><TooltipTrigger asChild><OmniButton variant="outline">Hover me</OmniButton></TooltipTrigger><TooltipContent>Helpful context</TooltipContent></Tooltip></TooltipProvider>,
  Tour: TourPreview,
  Tree: () => <Tree treeData={[{ key: 'workspace', title: 'Workspace', children: [{ key: 'projects', title: 'Projects' }] }]} />,
  TreeSelect: () => <TreeSelect label="Location" value="" onChange={() => undefined} treeData={[{ value: 'workspace', title: 'Workspace' }]} />,
  Watermark: () => <Watermark content="INTERNAL"><div className="h-24 rounded border p-4">Protected content</div></Watermark>,
  Alert: () => <Alert title="Saved" variant="success">Your changes are ready.</Alert>,
  Drawer: () => <Drawer><DrawerTrigger asChild><OmniButton variant="outline">Open drawer</OmniButton></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Project settings</DrawerTitle></DrawerHeader></DrawerContent></Drawer>,
  Message: () => <OmniButton onClick={() => message.success('Message sent')}>Show message</OmniButton>,
  Modal: () => <Modal><ModalTrigger asChild><OmniButton>Open modal</OmniButton></ModalTrigger><ModalContent><ModalHeader><ModalTitle>Confirm action</ModalTitle></ModalHeader></ModalContent></Modal>,
  Notification: () => <OmniButton onClick={() => notification.success({ message: 'Notification sent', description: 'The operation completed.' })}>Show notification</OmniButton>,
  Popconfirm: () => <Popconfirm title="Delete record?" description="This cannot be undone."><OmniButton variant="destructive">Delete</OmniButton></Popconfirm>,
  Progress: () => <Progress percent={64} />,
  Result: () => <Result status="success" title="Saved" subTitle="The record was saved successfully." />,
  Skeleton: () => <Skeleton className="h-6 w-48" />,
  Spin: () => <Spin spinning tip="Loading"><div className="h-20 rounded border p-4">Content</div></Spin>,
  Affix: () => <Affix offsetTop={0}><div className="rounded border bg-background p-3">Sticky summary</div></Affix>,
  App: () => <App>{previewBox(<span>Application shell</span>)}</App>,
  BackTop: () => <BackTop visibilityHeight={0} style={{ position: 'static' }} />,
  ConfigProvider: () => <ConfigProvider>{previewBox(<span>Configured content</span>)}</ConfigProvider>,
  Upload: () => <Upload />,
  Util: () => previewBox(<span><strong>Util</strong> · clamp(12, 0, 10) = 10 · isNil(null) = true</span>),
};

const LibraryPreview: React.FC<{ name: string }> = ({ name }) => {
  const Preview = previews[name];
  return Preview ? <Preview /> : previewBox(name);
};

const libraryRow = (name: string): OverviewRowSpec => ({
  name,
  preview: () => <LibraryPreview name={name} />,
  variants: [],
});

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
    rows: [{ name: 'Typography', preview: TypographyPreview, variants: [] }, libraryRow('Icon'), libraryRow('FloatButton')],
  },
  {
    title: 'Layout',
    rows: ['Divider', 'Flex', 'Grid', 'Layout', 'Space', 'Splitter', 'Masonry'].map(libraryRow),
  },
  {
    title: 'Navigation',
    rows: ['Anchor', 'Breadcrumb', 'Dropdown', 'Menu', 'Pagination', 'Steps', 'Tabs'].map(libraryRow),
  },
  {
    title: 'Data entry',
    rows: ['AutoComplete', 'Cascader', 'Form', 'Mentions'].map(libraryRow),
  },
  {
    title: 'Actions',
    rows: [
      { name: 'Button', preview: ButtonPreview, variants: [...buttonVariants, ...buttonSizeVariants] as Variant<unknown>[] },
      { name: 'IconButton', preview: IconButtonPreview, variants: [...iconButtonVariants, ...iconButtonSizeVariants] as Variant<unknown>[] },
    ],
  },
  {
    title: 'Text inputs',
    rows: [
      { name: 'Input', preview: InputPreview, variants: inputVariants as Variant<unknown>[] },
      { name: 'Textarea', preview: TextareaPreview, variants: textareaVariants as Variant<unknown>[] },
      { name: 'EmailInput', preview: EmailInputPreview, variants: emailInputVariants as Variant<unknown>[] },
      { name: 'PasswordInput', preview: PasswordInputPreview, variants: passwordInputVariants as Variant<unknown>[] },
      { name: 'NumberInput', preview: NumberInputPreview, variants: numberInputVariants as Variant<unknown>[] },
      { name: 'CurrencyInput', preview: CurrencyInputPreview, variants: currencyInputVariants as Variant<unknown>[] },
      { name: 'PhoneInput', preview: PhoneInputPreview, variants: phoneInputVariants as Variant<unknown>[] },
      { name: 'InputOTP', preview: InputOTPPreview, variants: inputOTPVariants as Variant<unknown>[] },
      { name: 'TagInput', preview: TagInputPreview, variants: tagInputVariants as Variant<unknown>[] },
      { name: 'RichText', preview: RichTextPreview, variants: richTextVariants as Variant<unknown>[] },
    ],
  },
  {
    title: 'Selection',
    rows: [
      { name: 'Select', preview: SelectPreview, variants: selectVariants as Variant<unknown>[] },
      { name: 'MultiSelect', preview: MultiSelectPreview, variants: multiSelectVariants as Variant<unknown>[] },
      { name: 'Radio', preview: RadioPreview, variants: radioVariants as Variant<unknown>[] },
      { name: 'Checkbox', preview: CheckboxPreview, variants: checkboxVariants as Variant<unknown>[] },
      { name: 'Switch', preview: SwitchPreview, variants: switchVariants as Variant<unknown>[] },
      { name: 'Segmented', preview: SegmentedPreview, variants: segmentedVariants as Variant<unknown>[] },
    ],
  },
  {
    title: 'Numeric',
    rows: [
      { name: 'Slider', preview: SliderPreview, variants: sliderVariants as Variant<unknown>[] },
      { name: 'Stepper', preview: StepperPreview, variants: stepperVariants as Variant<unknown>[] },
    ],
  },
  {
    title: 'Date and time',
    rows: [
      { name: 'DatePicker', preview: DatePickerPreview, variants: datePickerVariants as Variant<unknown>[] },
      { name: 'TimePicker', preview: TimePickerPreview, variants: timePickerVariants as Variant<unknown>[] },
      { name: 'DateTimePicker', preview: DateTimePickerPreview, variants: dateTimePickerVariants as Variant<unknown>[] },
    ],
  },
  {
    title: 'Media and misc',
    rows: [
      { name: 'ColorPicker', preview: ColorPickerPreview, variants: colorPickerVariants as Variant<unknown>[] },
      { name: 'FileUpload', preview: FileUploadPreview, variants: fileUploadVariants as Variant<unknown>[] },
    ],
  },
  {
    title: 'Data display',
    rows: ['Avatar', 'Calendar', 'Card', 'Carousel', 'Collapse', 'Descriptions', 'Empty', 'Image', 'List', 'Popover', 'QRCode', 'Statistic', 'Table', 'Tag', 'Timeline', 'Tooltip', 'Tour', 'Tree', 'TreeSelect', 'Watermark'].map(libraryRow),
  },
  {
    title: 'Feedback',
    rows: ['Alert', 'Drawer', 'Message', 'Modal', 'Notification', 'Popconfirm', 'Progress', 'Result', 'Skeleton', 'Spin'].map(libraryRow),
  },
  {
    title: 'Other',
    rows: ['Affix', 'App', 'BackTop', 'ConfigProvider', 'Upload', 'Util'].map(libraryRow),
  },
];

const sectionId = (title: string) => `section-${slug(title)}`;
const rowId = (name: string) => `component-${slug(name)}`;

const ComponentOverviewPage: React.FC = () => {
  const tocItems: TocItem[] = SECTIONS.flatMap((section) => section.rows.map((row) => ({ id: rowId(row.name), label: row.name, group: section.title })));

  return (
    <div className="pb-shell box-border w-full max-w-[100vw] px-8 py-10">
      <div className="pb-overview-layout grid gap-8 md:grid-cols-[minmax(0,1fr)_14rem] xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="pb-overview-main min-w-0">
          <header className="pb-shell-header mb-8 max-w-4xl">
            <h1 className="text-4xl font-semibold text-foreground">Component Overview</h1>
            <p className="mt-3 text-[15px] leading-8 text-muted-foreground">
              Browse the Omni UI component set with the same reference layout used for Table. Each row keeps the component identity, JSX contract, live
              preview, and runnable example code together.
            </p>
          </header>
          {SECTIONS.map((section, sectionIndex) => (
            <React.Fragment key={section.title}>
              <SectionHeading id={sectionId(section.title)} index={String(sectionIndex + 1)} title={section.title} />
              {section.rows.map((row, rowIndex) => {
                const Preview = row.preview;
                return (
                  <Row
                    key={row.name}
                    id={rowId(row.name)}
                    index={`${sectionIndex + 1}.${rowIndex + 1}`}
                    name={row.name}
                    code={codeFromVariants(row.name, row.variants)}
                  >
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
