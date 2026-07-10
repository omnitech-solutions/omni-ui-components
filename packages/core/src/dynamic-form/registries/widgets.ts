import type { RegistryWidgetsType } from '@rjsf/utils';

import { TextWidget } from '../widgets/TextWidget';
import { TextareaWidget } from '../widgets/TextareaWidget';
import { SelectWidget } from '../widgets/SelectWidget';
import { RadioWidget } from '../widgets/RadioWidget';
import { CheckboxWidget } from '../widgets/CheckboxWidget';
import { CheckboxesWidget } from '../widgets/CheckboxesWidget';
import { IconToolbarWidget } from '../widgets/IconToolbarWidget';
import { RangeWidget } from '../widgets/RangeWidget';
import { SegmentedWidget } from '../widgets/SegmentedWidget';
import { StepperWidget } from '../widgets/StepperWidget';
import { SwitchWidget } from '../widgets/SwitchWidget';
import { DateWidget } from '../widgets/DateWidget';
import { ComboboxWidget } from '../widgets/ComboboxWidget';
import { NumberInputWidget } from '../widgets/NumberInputWidget';
import { CurrencyWidget } from '../widgets/CurrencyWidget';
import { PhoneWidget } from '../widgets/PhoneWidget';
import { InputOTPWidget } from '../widgets/InputOTPWidget';
import { TagInputWidget } from '../widgets/TagInputWidget';
import { TimeWidget } from '../widgets/TimeWidget';
import { ColorWidget } from '../widgets/ColorWidget';
import { FileUploadWidget } from '../widgets/FileUploadWidget';
import { DateTimeWidget } from '../widgets/DateTimeWidget';
import { MultiSelectWidget } from '../widgets/MultiSelectWidget';
import { HiddenWidget } from '../widgets/HiddenWidget';
import { RichTextWidget } from '../widgets/RichTextWidget';
import { DerivedTextWidget } from '../widgets/DerivedTextWidget';

/**
 * App-level RJSF widget registry. The single `TextWidget` handles every
 * string-like type (text, email, password, url, tel, …) by reading the
 * `<input type="…">` value from `schema.format` / `props.type`. Routing
 * `EmailWidget` / `PasswordWidget` / `URLWidget` to the same component
 * keeps the bordered look consistent with the bare `TextWidget` — the
 * `@rjsf/shadcn` defaults used different chrome.
 *
 * @example
 * import { appWidgets } from 'dynamic-form';
 * const merged = { ...appWidgets, currency: CurrencyWidget };
 */
export const appWidgets: RegistryWidgetsType = {
  text: TextWidget,
  TextWidget,
  EmailWidget: TextWidget,
  PasswordWidget: TextWidget,
  URLWidget: TextWidget,
  email: TextWidget,
  password: TextWidget,
  url: TextWidget,
  textarea: TextareaWidget,
  TextareaWidget,
  select: SelectWidget,
  SelectWidget,
  radio: RadioWidget,
  RadioWidget,
  CheckboxWidget,
  checkbox: CheckboxWidget,
  CheckboxesWidget,
  checkboxes: CheckboxesWidget,
  iconToolbar: IconToolbarWidget,
  IconToolbarWidget,
  range: RangeWidget,
  RangeWidget,
  segmented: SegmentedWidget,
  SegmentedWidget,
  stepper: StepperWidget,
  StepperWidget,
  switch: SwitchWidget,
  SwitchWidget,
  date: DateWidget,
  DateWidget,
  dateTime: DateTimeWidget,
  DateTimeWidget,
  multiSelect: MultiSelectWidget,
  MultiSelectWidget,
  hidden: HiddenWidget,
  HiddenWidget,
  richText: RichTextWidget,
  RichTextWidget,
  combobox: ComboboxWidget,
  ComboboxWidget,
  numberInput: NumberInputWidget,
  NumberInputWidget,
  UpDownWidget: NumberInputWidget,
  currency: CurrencyWidget,
  CurrencyWidget,
  phone: PhoneWidget,
  PhoneWidget,
  TelWidget: PhoneWidget,
  otp: InputOTPWidget,
  InputOTPWidget,
  tags: TagInputWidget,
  TagInputWidget,
  time: TimeWidget,
  TimeWidget,
  color: ColorWidget,
  ColorWidget,
  file: FileUploadWidget,
  FileUploadWidget,
  FileWidget: FileUploadWidget,
  derivedText: DerivedTextWidget,
  DerivedTextWidget,
};
