import type { RegistryWidgetsType } from '@rjsf/utils';
import { AutoCompleteWidget } from '../widgets/AutoCompleteWidget';
import { CalendarWidget } from '../widgets/CalendarWidget';
import { CascaderWidget } from '../widgets/CascaderWidget';
import { CheckboxesWidget } from '../widgets/CheckboxesWidget';
import { CheckboxWidget } from '../widgets/CheckboxWidget';
import { ColorWidget } from '../widgets/ColorWidget';
import { ComboboxWidget } from '../widgets/ComboboxWidget';
import { ComposerWidget } from '../widgets/ComposerWidget';
import { CurrencyWidget } from '../widgets/CurrencyWidget';
import { DateTimeWidget } from '../widgets/DateTimeWidget';
import { DateWidget } from '../widgets/DateWidget';
import { DerivedTextWidget } from '../widgets/DerivedTextWidget';
import { FeedbackReasonsWidget } from '../widgets/FeedbackReasonsWidget';
import { FileUploadWidget } from '../widgets/FileUploadWidget';
import { HiddenWidget } from '../widgets/HiddenWidget';
import { IconToolbarWidget } from '../widgets/IconToolbarWidget';
import { InputOTPWidget } from '../widgets/InputOTPWidget';
import { MentionsWidget } from '../widgets/MentionsWidget';
import { ModelPickerWidget } from '../widgets/ModelPickerWidget';
import { MultiSelectWidget } from '../widgets/MultiSelectWidget';
import { NumberInputWidget } from '../widgets/NumberInputWidget';
import { PasswordWidget } from '../widgets/PasswordWidget';
import { PhoneWidget } from '../widgets/PhoneWidget';
import { RadioWidget } from '../widgets/RadioWidget';
import { RangeWidget } from '../widgets/RangeWidget';
import { RatingWidget } from '../widgets/RatingWidget';
import { RichTextWidget } from '../widgets/RichTextWidget';
import { SegmentedWidget } from '../widgets/SegmentedWidget';
import { SelectWidget } from '../widgets/SelectWidget';
import { StepperWidget } from '../widgets/StepperWidget';
import { SwitchWidget } from '../widgets/SwitchWidget';
import { TagInputWidget } from '../widgets/TagInputWidget';
import { TextareaWidget } from '../widgets/TextareaWidget';
import { TextWidget } from '../widgets/TextWidget';
import { TimeWidget } from '../widgets/TimeWidget';
import { TransferWidget } from '../widgets/TransferWidget';
import { TreeSelectWidget } from '../widgets/TreeSelectWidget';

/**
 * The library's widget registry. Every widget is registered under ONE clear `ui:widget` name (`rating`), under
 * its component name (`RatingWidget`), and under any RJSF default name it replaces (`UpDownWidget`,
 * `FileWidget`), so a schema with no `ui:widget` still gets the library's control. The names, the schema each
 * binds to, its options and its stored value are listed in `widgetCatalog` (and drawn on the DynamicForm docs
 * page); a test keeps the two in step.
 *
 * @example
 * import { appWidgets } from '@oc-tech/omni-ui-components/dynamic-form';
 * const widgets = { ...appWidgets, signature: SignatureWidget };
 */
export const appWidgets: RegistryWidgetsType = {
  text: TextWidget,
  TextWidget,
  EmailWidget: TextWidget,
  URLWidget: TextWidget,
  email: TextWidget,
  url: TextWidget,
  password: PasswordWidget,
  PasswordWidget,
  textarea: TextareaWidget,
  TextareaWidget,
  select: SelectWidget,
  SelectWidget,
  combobox: ComboboxWidget,
  ComboboxWidget,
  multiSelect: MultiSelectWidget,
  MultiSelectWidget,
  radio: RadioWidget,
  RadioWidget,
  checkbox: CheckboxWidget,
  CheckboxWidget,
  checkboxes: CheckboxesWidget,
  CheckboxesWidget,
  switch: SwitchWidget,
  SwitchWidget,
  segmented: SegmentedWidget,
  SegmentedWidget,
  range: RangeWidget,
  RangeWidget,
  stepper: StepperWidget,
  StepperWidget,
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
  date: DateWidget,
  DateWidget,
  calendar: CalendarWidget,
  CalendarWidget,
  dateTime: DateTimeWidget,
  DateTimeWidget,
  time: TimeWidget,
  TimeWidget,
  color: ColorWidget,
  ColorWidget,
  file: FileUploadWidget,
  FileUploadWidget,
  FileWidget: FileUploadWidget,
  richText: RichTextWidget,
  RichTextWidget,
  rating: RatingWidget,
  RatingWidget,
  autocomplete: AutoCompleteWidget,
  AutoCompleteWidget,
  mentions: MentionsWidget,
  MentionsWidget,
  cascader: CascaderWidget,
  CascaderWidget,
  treeSelect: TreeSelectWidget,
  TreeSelectWidget,
  transfer: TransferWidget,
  TransferWidget,
  feedbackReasons: FeedbackReasonsWidget,
  FeedbackReasonsWidget,
  composer: ComposerWidget,
  ComposerWidget,
  modelPicker: ModelPickerWidget,
  ModelPickerWidget,
  hidden: HiddenWidget,
  HiddenWidget,
  derivedText: DerivedTextWidget,
  DerivedTextWidget,
  iconToolbar: IconToolbarWidget,
  IconToolbarWidget,
};
