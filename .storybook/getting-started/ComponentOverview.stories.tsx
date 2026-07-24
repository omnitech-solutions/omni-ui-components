import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import {
  Button,
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
  Stepper,
  Switch,
  TagInput,
  Textarea,
  TimePicker,
} from '@oc-tech/omni-ui-components';
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

const SECTIONS: OverviewSectionSpec[] = [
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
