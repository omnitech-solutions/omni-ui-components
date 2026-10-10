---
title: "Dynamic form widget coverage: which components the schema-driven form can use, which it cannot, and what to add first"
slug: dynamic-form-widget-coverage
type: brief
status: draft
created_at: 2026-10-10
updated_at: 2026-10-10
authors: ["claude"]
tags: [dynamic-form, widgets, forms, storybook, accessibility]
related_adrs: []
---

# Dynamic form widget coverage (audit only, no source changed)

Audited 2026-10-10 on `master` at `f208942`, against the source under `packages/core/src/` and the index of the
owner's running Storybook (`http://localhost:6006/index.json`: 1,044 entries, 862 stories, 182 docs pages).
Serves OBJ-2 (generate forms from a schema, "using the same field components as a hand-built form"), OBJ-1
(cover the screens teams build) and OBJ-3 (keyboard and screen reader).

The owner's request: find the components that exist in the library but are not exposed as widgets the dynamic
form can use, with the library's philosophy understood first.

## A. Summary

The dynamic form is already wide. It registers 26 widgets under 61 names, 1 display field and 3 templates plus
5 buttons, and 21 of the library's 30 value-holding input components are reachable from a schema. The gap is
smaller than expected, and most of it is not "missing widgets":

- **9 components have no widget**: Rate, AutoComplete, PasswordInput (its reveal toggle), EmailInput, Calendar,
  Cascader, TreeSelect, Transfer, Mentions. Only the first three should become widgets now. Four of the others are
  stubs that do not yet meet the library's own rules, and two add nothing a registered widget does not already give.
- **4 components are wired for only part of what they do**: FileUpload (the widget submits file names and says
  so on screen), Slider (one thumb, not a range), Segmented (single choice, not multiple), DatePicker (one date,
  not a range).
- **The contract every widget shares has four holes**, and these matter more than any new widget: descriptions and
  errors are not tied to the control for a screen reader, read-only is drawn as disabled for 21 of 23 editable
  widgets, a section's title and description are never drawn, and the pieces a consumer needs to write or type
  their own widget are not exported from the `./dynamic-form` entry point.
- **Interview Studio does not use `DynamicForm` or `Form` at all.** It has 82 hand-written `<input>`, `<textarea>`
  and `<select>` elements in 28 files. Every kind of input it hand-builds already has a widget, except real file
  values. So what the app needs first is the contract fixes and the file value, not more widgets.

Recommended order (section H): contract fixes, file values, password, rating, the three "second mode" bindings,
autocomplete, date range. Do not add Cascader, Transfer, TreeSelect, Mentions, Calendar, a code or Markdown
editor, or any chat component as a widget.

## B. The philosophy, stated back

No ADR records these rules yet (`bionic/adrs/` holds ADR-0000 only). They are written down in the working
records and visible in the code; each line below names where.

### B.1 What a component must be

| Rule | In my words | Where it is recorded |
|---|---|---|
| Generic | A component knows nothing about the app that uses it: no app or server types, no product name, no business navigation. Lists are generic over an item type the app extends, and callbacks hand back the app's own item. | `bionic/inbox/lib-completion-plan.md` section 2, rules 1, 5, 7; `bionic/journal/2026-10.md` (2026-10-06 and 2026-10-07 entries: "prop-driven, label-driven", "configuration-driven") |
| Driven by props and configuration | Behaviour comes from typed props and data, not from children the app must hand-assemble or from a context bus. A variation is a prop value (`tone`, `appearance`, `variant`, `size`), not a new component. | `lib-completion-plan.md` rules 1, 8; `bionic/research/references/native-app-control-variations.md` |
| Typed | Each component has a `*.types.ts`; value callbacks receive the value (`onChange(next: string)`), not a DOM event; controlled and uncontrolled both work. | `lib-completion-plan.md` rules 2, 5, 8; every `*Primitive` props type |
| Themed by tokens | Colour, radius, spacing and motion come from `--oui-*` tokens, declared per theme root so any subtree can be light or dark. No raw colours. The primary is a fill, never text. | `bionic/research/references/theme-contract.md`; `lib-completion-plan.md` rule 9; OBJ-5 |
| Safe inside a host | One stylesheet in one cascade layer, no reset, no element selector that reaches the host; every component root carries `data-slot`. | `bionic/research/references/css-delivery.md` |
| Accessible | Keyboard and screen reader operable; the a11y check runs over every story. A control that cannot carry `aria-required` gets a hidden "Required" hint. | OBJ-3; `packages/core/src/lib/FieldShell.tsx` |
| Words belong to the app | Every user-visible string goes through a `labels` prop with exported defaults. Icons are `ReactNode` props, never an icon-name list. | `lib-completion-plan.md` rules 3, 4 |
| Documented by real code | One folder per component with factories, stories, a row on the Component Overview and tests; "Show code" is what a consumer writes. | `lib-completion-plan.md` rule 2; `bionic/briefs/BRIEF-storybook-audit.md`; OBJ-6 |
| Simple | No pending state, no `onError`, no async helper inside components; an absent callback means the control is not drawn. | `lib-completion-plan.md` rules 5, 6 |

### B.2 The two-layer input, which is what makes widgets possible

Every proper input is two components (`Switch/Switch.tsx` and `Switch/SwitchPrimitive.tsx` are the pattern):

| Layer | What it is | Who uses it |
|---|---|---|
| `XPrimitive` | The bare control. Props: `id`, `name`, `value` (or `checked`), `onChange(next)`, `disabled`, `required`, `invalid`, usually `aria-describedby` and `aria-label`, sometimes `readOnly`. No label, no help, no error text. | The dynamic form's widgets. |
| `X` | The primitive inside the shared field chrome (`lib/FieldShell.tsx`, `useFieldChrome`): `label`, `description`, `error`, the red required mark, the hidden "Required" hint, `layout: 'vertical' \| 'horizontal'`, ids for `aria-describedby`, error with `role="alert"`. | A hand-built form, through `FormField`. |

A component with no `XPrimitive` cannot be a widget without work, because the form's own template draws the
label, help and error around it.

### B.3 What the dynamic form is

`DynamicForm` (`packages/core/src/dynamic-form/DynamicForm/DynamicForm.tsx`, exported from
`@oc-tech/omni-ui-components/dynamic-form`) is a thin face on react-jsonschema-form v6 (`@rjsf/shadcn`, `@rjsf/utils`,
`@rjsf/validator-ajv8`), placed inside the library's own `Form`:

- `Form` owns the one `<form>` element, the state (`@tanstack/react-form`) and the submit rule. RJSF renders as a
  `div` inside it and its own submit button is switched off; the app passes its submit button as `children`.
- **Validation is in two steps.** AJV checks the JSON Schema while the person types and shows errors under the
  field. On submit, Zod (`zodSchema`, required) parses the data: success calls `onSubmit(parsed)`; failure is mapped
  back to the fields and also sent to `onError` with `source: 'zod'`; a throw or rejection from `onSubmit` goes to
  `onError` with `source: 'api'`. The form never shows an error list of its own (`showErrorList={false}`).
- **Three registries**, each merged as `@rjsf/shadcn` defaults, then the library's (`appWidgets`, `appFields`,
  `appTemplates`), then the app's own (`widgets`, `fields`, `templates` props). The app can add or replace any one.
- **`formContext`** carries what is not form data (`lib/formContext.ts`): `optionSets` (lists for selects),
  `actions` (named links), `derived` (values computed from the data, read-only) and `locale`. Its two rules:
  `derived` is a pure function of the data, and nothing in it is submitted.
- **`AppFormSchema`** (`appFormSchema.ts`) is the one object a feature exports per form: `id`, `schema`, `uiSchema`,
  `zodSchema`, defaults, its own widgets/fields/templates, `formContext`, and `toFormData` / `toSubmitPayload`.
  This is how an app is meant to stay free of hand-built forms: the form is data in one module, and the screen
  renders `<DynamicForm {...formSchema} />` with a submit button.

### B.4 What a widget is

A widget is the adapter between RJSF's `WidgetProps` and one `XPrimitive`. The contract, read from the 26 that exist:

| Part | Contract today | Source |
|---|---|---|
| Selection | `uiSchema.<field>['ui:widget'] = '<name>'`, or by RJSF's own default for the schema type and format (the library registers RJSF's names too: `TextWidget`, `EmailWidget`, `DateWidget`, `UpDownWidget`, `FileWidget`...). | `registries/widgets.ts` |
| Value in | `props.value` cast to the primitive's type, with an empty fallback (`''`, `[]`, `null`, `min`). | each widget |
| Value out | `useStableRjsfCallbacks(props, transform)`: stable `onChange`, `onBlur`, `onFocus`; the transform maps the primitive's value to the stored one (a `Date` to `YYYY-MM-DD`, `null` to `undefined`, `''` to `ui:emptyValue`). | `lib/useStableRjsfCallbacks.ts` |
| Bounds | From the schema, not the uiSchema: `minimum`, `maximum`, `multipleOf` (`rangeSpec`), `maxLength`, `enum` / `oneOf` (as `options.enumOptions`), `items` for arrays. | Number, Range, Stepper, Text, Select widgets |
| Options | `ui:options.*`, read defensively with a type check and a default; a wrong type is ignored. | each widget |
| Lists that are not in the schema | `ui:options.optionSetKey` names a list in `formContext.optionSets` (grouped, with avatar, colour, description). | Select, Combobox |
| Label, help, error | Not the widget's job. `FieldTemplate` draws the label (`for` = the widget's `id`), the red `*`, the description, the errors and `ui:help`. A boolean is the one exception: the checkbox draws its own label beside the box. | `templates/FieldTemplate.tsx`, `widgets/CheckboxWidget` |
| Error state | `invalid={Boolean(rawErrors?.length)}`; the primitive paints the invalid border and sets `aria-invalid`. | every widget |
| Required | `required` passed to the primitive; for a boolean, only when the schema demands `true`. | every widget |
| Disabled, read-only | `disabled` is set when the field is disabled or read-only, in all but Text and Textarea, which pass `readOnly`. | every widget (see D.3) |
| Size on the page | Not the widget's job: `ui:rows` on the parent object. | `templates/ObjectFieldTemplate.tsx` |
| Proof | A `*.factories.ts` with fixtures, a `*.stories.tsx` built by `defineDynamicFormStories` (so "Show code" is the schema, uiSchema and `<DynamicForm>` call), a docs page, a test in `dynamic-form/test/`. | `.storybook/defineDynamicFormStories.tsx` |

### B.5 Fields and templates, and how they differ from widgets

| Thing | What it is for | What the library has |
|---|---|---|
| Widget | One value, one control. Chosen by `ui:widget`. | 26 (section D.1) |
| Field | A whole schema node, including ones with no single value or no value at all. Chosen by `ui:field`. | `staticPanel`: display text from `formContext.derived`, never submitted |
| Template | The furniture around widgets and fields: the label row, the grid of an object, array rows, buttons. Not chosen per field; replaced per form. | `FieldTemplate`, `ObjectFieldTemplate`, `WrapIfAdditionalTemplate`, 5 buttons; the rest comes from `@rjsf/shadcn` (section D.2) |

### B.6 The form's variants

| Variant | How it is asked for | Story |
|---|---|---|
| Hand-built or from a schema | `Form` + `FormField` + `FormRow` + `FormActions`, or `DynamicForm`. Same submit rule, same `FormError`. | `omni-ui-components/Form`, `dynamic-form/DynamicForm` |
| Empty, prefilled | `formData` | KitchenSink, AddAddress, AutomationTextFields |
| Disabled, read-only | `disabled`, `readOnly` on the form; `ui:disabled`, `ui:readonly` per field | Disabled, ReadOnly |
| Invalid, server error, slow submit | Zod failure, `onSubmit` rejects, `onSubmit` pending | ValidationErrors, ApiError, AsyncSubmit |
| Columns | `ui:rows: [['a','b'], [{ value: 'notes', span: 2 }]]`; with none, plain fields pair two to a row | `DynamicForm.layout.test.tsx` |
| Collapsible section | `ui:options.collapsible: true \| { title, defaultOpen }` on an object | `dynamic-form/Templates/Enhancements` |
| Free key and value rows | `additionalProperties` | `DynamicForm.wrap-if-additional.test.tsx` |
| Label on the left, sizes, the panel look | Exist on every hand-built field (`layout="horizontal"`, `inputSize`, `variant: 'bordered' \| 'panel' \| 'ghost'`). **Not reachable from a schema.** | none |

### B.7 What the library deliberately does not do

- It does not fetch, upload, save or navigate. Lists, links and computed values come in through `formContext`.
- It does not own pending or error state outside a field (`lib-completion-plan.md` rule 5): the app shows the
  server error and the spinner.
- It does not ship a reset, restyle the host, or follow `prefers-color-scheme` (`css-delivery.md`, `theme-contract.md`).
- It does not put app words in components (`labels` props), and it does not invent a second form state: one
  `<form>`, one submit rule.
- It does not hand-edit `bionic/arch/` or `bionic/code/`.

## C. Component inventory

130 component folders are exported from `packages/core/src/index.ts` (the same set is split across the `./native`,
`./chat` and `./highlight` entry points; `./dynamic-form` is separate). Counts by kind: input 22, selection 9,
form 3, action 4, navigation 12, layout 15, overlay 6, feedback 11, display 21, data 1, chat 26.
**35 hold a value a person edits**: 31 inputs and selections (30 distinct: `Upload` is a second name for
`FileUpload`) and 4 chat composites. Story and docs counts are from the running Storybook's index; test files are
those under `packages/core/test/<Component>/`.

Every component has a docs page and stories except `Highlight` (a function, no stories). Ten have no test folder:
Alert, BackTop, Cascader, Drawer, Dropdown, Icon, Masonry, MultiSelect, Upload, Util. (`bionic/objectives.md` OBJ-6
still says 85 components and 14 without tests; both numbers are out of date.)

| Component | Kind | Editable value | Bare control (`*Primitive`) | Stories | Docs page | Test files |
|---|---|---|---|---|---|---|
| AutoComplete | input | string | no | 2 | yes | 1 |
| Calendar | input | Date / range (react-day-picker props) | no | 2 | yes | 1 |
| ColorPicker | input | string #rrggbb | ColorPickerPrimitive | 4 | yes | 1 |
| CurrencyInput | input | number or null | CurrencyInputPrimitive | 6 | yes | 1 |
| DatePicker | input | Date, or {from,to}, or null | DatePickerPrimitive | 6 | yes | 2 |
| DateTimePicker | input | string (local ISO) | DateTimePickerPrimitive | 5 | yes | 1 |
| EmailInput | input | string | EmailInputPrimitive | 4 | yes | 1 |
| FileUpload | input | File[] | FileUploadPrimitive | 5 | yes | 1 |
| Input | input | string | InputPrimitive | 11 | yes | 2 |
| InputOTP | input | string | InputOTPPrimitive | 5 | yes | 1 |
| Mentions | input | string | no | 2 | yes | 1 |
| NumberInput | input | number or null | NumberInputPrimitive | 6 | yes | 2 |
| PasswordInput | input | string | PasswordInputPrimitive | 5 | yes | 1 |
| PhoneInput | input | string | PhoneInputPrimitive | 5 | yes | 2 |
| Rate | input | number | no | 2 | yes | 1 |
| RichText | input | string (HTML) | RichTextPrimitive | 4 | yes | 1 |
| Slider | input | number or number[] | SliderPrimitive | 8 | yes | 1 |
| Stepper | input | number | StepperPrimitive | 10 | yes | 1 |
| TagInput | input | string[] | TagInputPrimitive | 5 | yes | 1 |
| Textarea | input | string | TextareaPrimitive | 10 | yes | 2 |
| TimePicker | input | string HH:MM | TimePickerPrimitive | 5 | yes | 1 |
| Upload | input | File[] (alias of FileUpload) | no | 1 | yes | 0 |
| Cascader | selection | string[] (path) | no | 1 | yes | 0 |
| Checkbox | selection | boolean; group: string[] | CheckboxGroupPrimitive, CheckboxPrimitive | 13 | yes | 2 |
| MultiSelect | selection | string[] | MultiSelectPrimitive | 6 | yes | 0 |
| Radio | selection | string | RadioPrimitive | 9 | yes | 1 |
| Segmented | selection | string, or string[] in multiple mode | SegmentedPrimitive | 12 | yes | 2 |
| Select | selection | string | SelectPrimitive | 12 | yes | 2 |
| Switch | selection | boolean | SwitchPrimitive | 5 | yes | 1 |
| Transfer | selection | string[] | no | 2 | yes | 1 |
| TreeSelect | selection | string | no | 2 | yes | 1 |
| Form | form | no | no | 13 | yes | 4 |
| PreferencesForm | form | composite (text + switch) | no | 6 | yes | 1 |
| Wizard | form | no | no | 5 | yes | 1 |
| Button | action | no | no | 23 | yes | 2 |
| FloatButton | action | no | no | 2 | yes | 1 |
| IconButton | action | no | no | 16 | yes | 2 |
| SplitButton | action | no | no | 18 | yes | 3 |
| ActionMenu | navigation | no | no | 13 | yes | 3 |
| Anchor | navigation | no | no | 2 | yes | 1 |
| BackTop | navigation | no | no | 1 | yes | 0 |
| Breadcrumb | navigation | no | no | 2 | yes | 1 |
| CommandPopover | navigation | no | no | 6 | yes | 2 |
| Dropdown | navigation | no | no | 3 | yes | 0 |
| Menu | navigation | no | no | 3 | yes | 1 |
| Pagination | navigation | no | no | 3 | yes | 1 |
| Steps | navigation | no | no | 3 | yes | 1 |
| Tabs | navigation | no | no | 4 | yes | 1 |
| Toolbar | navigation | no | no | 11 | yes | 1 |
| Tour | navigation | no | no | 2 | yes | 1 |
| Affix | layout | no | no | 2 | yes | 1 |
| App | layout | no | no | 2 | yes | 1 |
| Card | layout | no | no | 2 | yes | 1 |
| Collapse | layout | no | no | 6 | yes | 1 |
| ConfigProvider | layout | no | no | 2 | yes | 1 |
| Divider | layout | no | no | 4 | yes | 2 |
| Flex | layout | no | no | 2 | yes | 1 |
| Grid | layout | no | no | 2 | yes | 1 |
| Layout | layout | no | no | 2 | yes | 1 |
| Masonry | layout | no | no | 2 | yes | 0 |
| Panel | layout | no | no | 12 | yes | 1 |
| PanelShell | layout | no | no | 7 | yes | 4 |
| Space | layout | no | no | 2 | yes | 1 |
| Splitter | layout | no | no | 9 | yes | 1 |
| Theming | layout | no | no | 3 | yes | 1 |
| Drawer | overlay | no | no | 3 | yes | 0 |
| Modal | overlay | no | no | 3 | yes | 1 |
| Popconfirm | overlay | no | no | 2 | yes | 1 |
| Popover | overlay | no | no | 2 | yes | 1 |
| SettingsDialog | overlay | no | no | 7 | yes | 3 |
| Tooltip | overlay | no | no | 2 | yes | 2 |
| Alert | feedback | no | no | 6 | yes | 0 |
| Empty | feedback | no | no | 6 | yes | 2 |
| ErrorCard | feedback | no | no | 3 | yes | 1 |
| Message | feedback | no | no | 1 | yes | 1 |
| Notification | feedback | no | no | 1 | yes | 1 |
| Progress | feedback | no | no | 6 | yes | 2 |
| Result | feedback | no | no | 2 | yes | 1 |
| Skeleton | feedback | no | no | 2 | yes | 1 |
| Spin | feedback | no | no | 2 | yes | 1 |
| StreamStatus | feedback | no | no | 7 | yes | 1 |
| Toast | feedback | no | no | 6 | yes | 2 |
| Avatar | display | no | no | 3 | yes | 1 |
| Badge | display | no | no | 5 | yes | 1 |
| Carousel | display | no | no | 2 | yes | 1 |
| CueCard | display | no | no | 11 | yes | 1 |
| Descriptions | display | no | no | 4 | yes | 1 |
| Highlight | display | no | no | 0 | no | 1 |
| Icon | display | no | no | 1 | yes | 0 |
| Image | display | no | no | 2 | yes | 1 |
| List | display | no | no | 2 | yes | 1 |
| Markdown | display | no | no | 5 | yes | 1 |
| OutlineList | display | no | no | 10 | yes | 1 |
| QRCode | display | no | no | 2 | yes | 1 |
| SessionBar | display | no | no | 7 | yes | 1 |
| Statistic | display | no | no | 2 | yes | 1 |
| StatusClock | display | no | no | 6 | yes | 1 |
| Tag | display | no | no | 8 | yes | 2 |
| Timeline | display | no | no | 2 | yes | 1 |
| Tree | display | no | no | 3 | yes | 1 |
| Typography | display | no | no | 4 | yes | 1 |
| Util | display | no | no | 1 | yes | 0 |
| Watermark | display | no | no | 2 | yes | 1 |
| Table | data | no | no | 57 | yes | 12 |
| ApprovalCard | chat | no | no | 5 | yes | 2 |
| Attachment | chat | no | no | 9 | yes | 1 |
| Composer | chat | string (draft) | no | 13 | yes | 2 |
| ContextMeter | chat | no | no | 9 | yes | 2 |
| ConversationHeader | chat | no | no | 8 | yes | 1 |
| ConversationList | chat | no | no | 8 | yes | 2 |
| ConversationTranscript | chat | no | no | 2 | yes | 1 |
| DataPrivacyPanel | chat | no | no | 8 | yes | 1 |
| DictationBar | chat | no | no | 5 | yes | 1 |
| DiffReview | chat | no | no | 10 | yes | 1 |
| EmptyStarters | chat | no | no | 4 | yes | 1 |
| FeedbackPanel | chat | composite (reasons + text) | no | 3 | yes | 2 |
| IntegrationList | chat | no | no | 6 | yes | 1 |
| MessageActions | chat | no | no | 4 | yes | 2 |
| MessageMenu | chat | no | no | 5 | yes | 1 |
| ModelPicker | chat | model id + effort | no | 10 | yes | 3 |
| ModelsSettings | chat | no | no | 5 | yes | 1 |
| QueuedList | chat | no | no | 3 | yes | 1 |
| ShortcutList | chat | no | no | 3 | yes | 1 |
| Sources | chat | no | no | 3 | yes | 1 |
| StepTimeline | chat | no | no | 7 | yes | 1 |
| Suggestions | chat | no | no | 3 | yes | 1 |
| SummaryDivider | chat | no | no | 3 | yes | 1 |
| Thinking | chat | no | no | 4 | yes | 1 |
| Transcript | chat | no | no | 29 | yes | 5 |
| VersionPager | chat | no | no | 3 | yes | 1 |

"Bare control" is the `*Primitive` export a widget needs. The 10 value-holding components with "no" there are the
ones section E has to deal with: AutoComplete, Calendar, Mentions, Rate, Upload (an alias), Cascader, Transfer,
TreeSelect, and the composites.

## D. What the dynamic form registers today

### D.1 Widgets (26 components, 61 registered names)

Each widget has a docs page and stories under `dynamic-form/widgets/<Name>` (95 stories in all, none with a `play`
function). "Own test" is a file in `packages/core/src/dynamic-form/test/` that selects the widget by name.

| `ui:widget` (also registered as) | Schema it binds to | Stored value | `ui:options` it reads | Library control | Stories | Own test |
|---|---|---|---|---|---|---|
| `text` (`TextWidget`, `email`, `password`, `url`, `EmailWidget`, `PasswordWidget`, `URLWidget`) | `string`; `format` email, uri, date, date-time, time set the input type | string | `inputType`, `commitOnEnter`, `emptyValue` | `InputPrimitive` | 6 | yes |
| `textarea` | `string` | string | `rows` (default 5) | `TextareaPrimitive` | 6 | yes |
| `select` | `string` with `enum` / `oneOf`; an array of those is handed to `multiSelect` | string | `optionSetKey`, `footerActionKey`, `searchable`, `placeholder` | `SelectPrimitive` | 8 | yes |
| `combobox` | as `select` | string | `optionSetKey`, `footerActionKey`, `placeholder` | `SelectPrimitive` with `searchable` | 5 | yes |
| `multiSelect` | `array` of `enum` / `oneOf`, `uniqueItems` | string[] | `searchable` | `MultiSelectPrimitive` | 3 | no |
| `radio` | `string` with `enum` / `oneOf` | string | `inline`, `optionDescriptions`, `enumDisabled` | `RadioPrimitive` | 6 | yes |
| `checkbox` | `boolean` (the RJSF default for it) | boolean | `label: false` | `CheckboxPrimitive` | 3 | yes |
| `checkboxes` | `array` of `enum` / `oneOf` | string[] | `inline`, `optionDescriptions`, `enumDisabled` | `CheckboxGroupPrimitive` | 6 | yes |
| `switch` | `boolean` | boolean | none | `SwitchPrimitive` | 3 | yes |
| `segmented` | `string` with `enum` / `oneOf` | string | `enumDisabled` | `SegmentedPrimitive` (single mode) | 3 | yes |
| `range` | `number` / `integer` with `minimum`, `maximum`, `multipleOf` | number | `step` | `SliderPrimitive` (one thumb) | 5 | yes |
| `stepper` | `integer` / `number` | number | `step`, `unit`, `unitPlural`, `icon: 'fileText'` | `StepperPrimitive` | 4 | yes |
| `numberInput` (`UpDownWidget`) | `number` / `integer` | number, empty is `undefined` | `decimals`, `thousandSeparator`, `prefix`, `suffix` | `NumberInputPrimitive` | 3 | no |
| `currency` | `number` | number, empty is `undefined` | `currency` (default USD), `locale` | `CurrencyInputPrimitive` | 3 | no |
| `phone` (`TelWidget`) | `string` | string | `defaultDialCode` | `PhoneInputPrimitive` | 3 | no |
| `otp` | `string`, `maxLength` | string | `length` (default 6) | `InputOTPPrimitive` | 3 | no |
| `tags` | `array` of `string` | string[] | `maxItems` | `TagInputPrimitive` | 3 | no |
| `date` (`DateWidget`) | `string`, `format: 'date'` | `YYYY-MM-DD` | none | `DatePickerPrimitive`, `mode="single"` | 3 | yes |
| `dateTime` (`DateTimeWidget`) | `string`, `format: 'date-time'` | local ISO string | none | `DateTimePickerPrimitive` | 2 | no |
| `time` (`TimeWidget`) | `string`, `format: 'time'` | `HH:MM` | none | `TimePickerPrimitive` | 3 | no |
| `color` (`ColorWidget`) | `string`, `format: 'color'` | `#rrggbb` | none | `ColorPickerPrimitive` | 3 | no |
| `file` (`FileWidget`) | `string`, or `array` for several | **file name(s) only** | `mode: 'name'` (without it a notice is drawn instead), `accept`, `maxSize`, `maxFiles` | `FileUploadPrimitive` | 3 | no |
| `richText` | `string` | HTML string | none | `RichTextPrimitive` (TipTap) | 2 | no |
| `hidden` (`HiddenWidget`) | any scalar | unchanged | none | a native hidden input | 1 | no |
| `derivedText` | any; never read or written | none | `derivedKey`, `tone` | a `div` in the widget | 3 | yes |
| `iconToolbar` | any; never read or written | none | `actions: [{ icon, label, variant, onClick }]` | a row of `IconButton` | 2 | yes |

23 of the 26 let a person edit a value. 14 have their own test, 12 do not (they are still rendered by
`pnpm test:storybook` and by the showcase tests). `HiddenWidget` has no factories file.

### D.2 Fields and templates

| Name | Selected by | Options | Built from | Stories | Tests |
|---|---|---|---|---|---|
| `StaticPanelField` (`staticPanel`) | `ui:field: 'staticPanel'` | `panelKey` (one large line), `lines` (keys of `formContext.derived`) | plain `div`s | Templates/Enhancements: StaticPanel | `DynamicForm.static-panel.test.tsx` |
| `FieldTemplate` | every field | `labelActionKey` (a link from `formContext.actions` beside the label) | its own label, `*`, description; errors and help from `@rjsf/shadcn` | LabelActionLink, LabelActionSpan | `FieldTemplate.test.tsx`, `DynamicForm.field-label-action.test.tsx` |
| `ObjectFieldTemplate` | every object | `ui:rows`, `ui:options.collapsible` | inline CSS grid; a hand-made toggle button | CollapsibleClosed, CollapsibleOpen | `DynamicForm.layout.test.tsx`, `DynamicForm.collapsible-section.test.tsx` |
| `WrapIfAdditionalTemplate` | `additionalProperties` rows | none | a native input with `inputVariants`, the registered Remove button | none of its own | `DynamicForm.wrap-if-additional.test.tsx` |
| `SubmitButton`, `CopyButton`, `MoveUpButton`, `MoveDownButton`, `RemoveButton` | arrays and the (switched-off) RJSF submit | `ui:submitButtonOptions` | library `Button` and `IconButton` | KitchenSink (array rows) | `SubmitButton.test.tsx`, `DynamicForm.icon-button.test.tsx` |
| Everything else: array template and its rows, `AddButton`, title and description, field error and help, the `oneOf` / `anyOf` chooser, the grid, `AltDateWidget`, `AltDateTimeWidget`, `RatingWidget` | RJSF defaults | n/a | **`@rjsf/shadcn`, not this library's components** | KitchenSink shows "Add Item" | none here |

`ClearButton` is written in `templates/ButtonTemplates/index.tsx` and is not in the registry.

### D.3 Where the shared contract falls short

These apply to every widget, present and future, so they come before the gap table.

| # | Finding | Evidence | Effect |
|---|---|---|---|
| C1 | No widget passes `aria-describedby`. The description, the error and the help are drawn by the template but not tied to the control. | No occurrence of `aria-describedby` or `ariaDescribedByIds` under `packages/core/src/dynamic-form/`; every one of the 22 primitives accepts it (directly, or through the native input props it extends). The hand-built path wires it in `useFieldChrome`. | A screen reader user does not hear the help or the error when the field takes focus (OBJ-3). The a11y check does not catch this: it is not an axe rule. |
| C2 | Read-only is drawn as disabled. 21 of 23 editable widgets set `disabled` when the field is read-only. | Each widget; `ColorPicker`, `DateTimePicker`, `FileUpload`, `NumberInput`, `RichText`, `TagInput` and `TimePicker` primitives already take `readOnly`. | A read-only form is dimmed, cannot be focused or copied from, and is not announced as read-only. |
| C3 | An object's `title` and `description` are never drawn unless the section is collapsible. | `ObjectFieldTemplate.tsx` returns the grid only; the KitchenSink schema has "Contact info", "Billing plan" with descriptions, and the capture `storybook-audit/desktop/dynamic-form-dynamicform--kitchen-sink.png` shows neither. The hand-built fixture has `kind: 'heading'` rows (10 uses). | A long form has no section headings and no `fieldset` / `legend` grouping. |
| C4 | The widget author's kit is private. `./dynamic-form` exports `DynamicForm`, `DynamicFormProps`, `AppFormSchema`, `FormError`, `appWidgets`, `appFields`, `appTemplates` only. | `dynamic-form/index.ts`. The stories import `dynamic-form/lib/formContext` by a path the package `exports` map does not offer. | An app cannot type its `formContext` (`OmniRjsfFormContext`, `OmniSelectOption`, `OmniRjsfAction`), cannot reuse `useStableRjsfCallbacks` or `buildFormContext`, and cannot wrap one library widget. |
| C5 | Two field chromes. `FieldTemplate` re-draws label, `*`, description and error instead of using `FieldShell`. | `templates/FieldTemplate.tsx` against `lib/FieldShell.tsx`. | The schema form has no horizontal layout, no hidden "Required" hint, no `role="alert"` on errors, and will drift from the hand-built look. OBJ-2's "same field components" is true of the controls and not of what surrounds them. |
| C6 | Size and look cannot be set from a schema. No widget passes `inputSize`, `variant` or a layout. | Section B.6, last row. | A dense form, or one inside a `Panel`, cannot be made with `DynamicForm`. |
| C7 | Fixed English in widgets and templates: "Select ...", "Find ...", "Search...", "Additional Fields", the file notice. | `SelectWidget`, `ComboboxWidget`, `ObjectFieldTemplate`, `FileUploadWidget` | Against the `labels` rule (B.1). |
| C8 | There is no page that lists the widgets, the schema that selects each and its options. | The DynamicForm docs page is one paragraph and eight stories. | OBJ-6: a developer must read the registry source. Section D.1 of this brief is that table. |

## E. The gap table

### E.1 Value-holding components with no widget

Effort: S is up to half a day, M about a day, L two days or more, each including factories, stories and tests.

| Component | State today | Should it be a widget? | Schema and `ui:widget` | Options | Value mapping | Validation and error | What it lacks to qualify | Stories and tests needed | Effort |
|---|---|---|---|---|---|---|---|---|---|
| **Rate** | Works. Stars are buttons with `aria-pressed`. | **Yes.** A score is a common business field and RJSF v6 already has the name. | `integer`, `minimum: 0` or `1`, `maximum` = number of stars. `rating`, also `RatingWidget`. | `count` (default from `maximum`, else 5) | number to number; clicking the current star again clears to `undefined` when not required | `minimum` / `maximum` by AJV; `invalid` ring on the group | No `RatePrimitive` / chrome split, no `id`, `name`, `required`, `invalid`, `readOnly`, `aria-describedby`; a radio group with arrow keys, not pressed buttons; star colours are Tailwind `amber-400`, not tokens; no `data-slot`; no factories; `starLabel` should sit in a `labels` prop | Component: default, value, disabled, read-only, invalid, 10 stars, keyboard test. Widget: plain, prefilled, required, disabled, read-only; test for value, clear, bounds | M |
| **PasswordInput** | Works. The reveal toggle lives in the chrome component, so the primitive has none. | **Yes.** `password` is registered today and silently gives a plain input with no toggle. | `string`; `ui:widget: 'password'`, and `PasswordWidget` | `toggleable` (default true), `autocomplete: 'current-password' \| 'new-password'` | string to string | as `text` | Move the toggle into `PasswordInputPrimitive` (or a small inner part both layers use) and give its two labels a `labels` prop | Widget: plain, toggled, disabled, read-only, invalid; test that the toggle switches the type and keeps focus | S |
| **AutoComplete** | Works; proper `combobox` / `listbox` roles. Chrome only (it calls `FieldShell` itself). | **Yes.** It is the one control for "free text with suggestions"; `select` cannot accept a new value. | `string` with `examples` (JSON Schema's own keyword for suggestions), or a list by key. `autocomplete` | `optionSetKey`, `placeholder` | string to string, `''` to `emptyValue` | as `text`; a value outside the suggestions is valid by design | Split out `AutoCompletePrimitive`; no factories file; 2 stories | Component: factories, empty list, long list, keyboard. Widget: from `examples`, from an option set, disabled, invalid; test typing a new value and picking one | M |
| **EmailInput** | Works: `InputPrimitive` with `type`, `inputMode`, `autoComplete`, a placeholder. | **No new widget.** `email` already reaches `TextWidget` with `type="email"`. | n/a | Add `autocomplete` and `inputMode` to `text`, defaulted from `format` | n/a | n/a | Nothing | One more `TextWidget` story and test | S |
| **Calendar** | A pass-through to `react-day-picker`; its props are that library's. | **No.** It is the panel inside `DatePicker`. If an always-open calendar is wanted later, make it `ui:options.inline` on `date`. | n/a | n/a | n/a | n/a | Not a library-typed component: no `value` / `onChange(next)` of its own | n/a | none |
| **Cascader** | A stub: a native `<select>` listing every leaf as "A / B / C". No tokens, no `data-slot`, no keyboard beyond the browser's, 1 story, 0 tests. | **Not yet.** The data shape (a path, `string[]`) is a real one, but there is no component to wrap. Until it is built, a grouped `select` (`optionSetKey` with `group`) covers two levels. | later: `array` of `string`; `cascader` | later: `optionSetKey` to a tree | path to `string[]` | each segment must exist in the tree (Zod) | Everything in B.1 and B.2 | Build the component first | L |
| **TreeSelect** | 24 lines: flattens a tree into `Select` options with leading spaces. | **No.** As a widget it is `select` with indented labels. Do it with an option set. | n/a | n/a | n/a | n/a | It is not a tree control (no expand, no parent and child selection) | n/a | none |
| **Transfer** | A stub: two boxes of native checkboxes and "<", ">" buttons. No tokens on the controls, no labels, no `disabled`. | **No, for now.** It stores `string[]` from a fixed list, exactly what `multiSelect` and `checkboxes` store. Worth a widget only for long lists, after the component is real. | later: `array` of `enum`; `transfer` | later: titles of the two lists | keys to `string[]` | `minItems` / `maxItems` | Everything in B.1 and B.2; unnamed buttons | Build the component first | L |
| **Mentions** | A stub: a `Textarea` that ignores its `options`. | **No.** There is nothing to bind. | n/a | n/a | n/a | n/a | The feature itself | n/a | none |
| **Upload** | A second export name for `FileUpload`. | **No.** Covered by `file`. | n/a | n/a | n/a | n/a | n/a | n/a | none |

### E.2 Components wired for only part of what they do

| Component | What the widget leaves out | Should it be bound? | Schema and `ui:widget` | Options | Value mapping | Validation and error | What is missing | Stories and tests | Effort |
|---|---|---|---|---|---|---|---|---|---|
| **FileUpload** | Real values. The widget submits `file.name`, and without `mode: 'name'` it draws a notice saying it is not wired. | **Yes, first.** A form with an attachment cannot be built from a schema today. | `string` with `format: 'data-url'` (RJSF's own convention), or any type the app validates with Zod; `array` for several. `file` | `mode: 'file'` (the `File` object goes into the form data and the app uploads it in `onSubmit`), `'data-url'` (small files, a string, pure JSON), `'name'` (today's); `accept`, `maxSize`, `maxFiles` | `File[]` to `File` or `File[]`; or to data-URL strings | Size, count and type are checked in the primitive and reported through its `onError`: route that message to the field's error instead of dropping it | The primitive is controlled by `File[]`, so a data-URL or a stored value cannot be shown as "already attached"; `readOnly` exists and is not passed | Widget: single, several, too large, wrong type, prefilled, read-only; tests for each mode and each refusal | M |
| **Slider** | Two thumbs. `SliderPrimitive` takes `number[]`; `RangeWidget` forces one number. Also `showValue`, `valueSuffix`. | **Yes.** | `array`, `items: { type: 'number', minimum, maximum }`, `minItems: 2`, `maxItems: 2`. `range` (same name; the schema type decides) | `step`, `showValue`, `valueSuffix`, `minStepsBetweenThumbs` | `number[]` to `number[]` | AJV on items; Zod for "from is not after to" | The value read-out lives in the chrome `Slider`, not the primitive; each thumb needs its own name ("From", "To") through `labels` | Widget: range, range with read-out, disabled; test both thumbs and bounds | S |
| **Segmented** | Multiple choice (`mode="multiple"`, `string[]`), and the `control` appearance. | **Yes.** | `array`, `uniqueItems`, `items.enum` / `oneOf`. `segmented` (same name; the schema type decides) | `appearance: 'pill' \| 'control'`; `minActive` read from `minItems` | `string[]` to `string[]` | `minItems` / `maxItems` | Icons cannot come from JSON (rule: icons are nodes). Text-only options from a schema; an app that wants icons registers its own widget | Widget: multiple, at the floor, control appearance; test toggling and the floor | S |
| **DatePicker** | A range (`mode="range"`, `{ from, to }`), and `min`, `max`, `placeholder`, `formatOptions` in single mode. | **Yes, as a field**, because the value is an object, and RJSF gives objects to fields, not widgets. | `object` with `from` and `to`, each `string`, `format: 'date'`. `ui:field: 'dateRange'` | `min`, `max`, `placeholder`; the same three on `date` and `dateTime` | `{ from: Date, to: Date }` to `{ from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }` | Required on each end; Zod for order; one error line under the control | Nothing in the component. The field has to draw its own label through the shared chrome (see C5) | Field: empty, prefilled, min and max, disabled, invalid; test both ends and clearing. Widget: `date` with min and max | M |

### E.3 Value-holding components that should not be widgets

| Component | Why not |
|---|---|
| Composer, ModelPicker, FeedbackPanel, PreferencesForm | Chat parts with their own callbacks and words (`./chat` entry point). They are whole surfaces, not one field of a record. `PreferencesForm` is itself a small hand-built form and is a candidate to be rebuilt on `DynamicForm` once C1 to C6 are fixed, which would be the library's own proof of OBJ-2. |
| Pagination, Tabs, Collapse, Steps, Wizard, Table selection, Splitter sizes | Their "value" is where the person is, not data to submit. See section F for their role around a form. |
| A Markdown editor, a code editor | Neither exists. `Markdown` and `Highlight` only display. Do not add one as a form widget: `textarea` for Markdown, and an app that needs an editor registers its own widget through `widgets`. |

### E.4 The reverse: widgets and templates that wrap something not exported

| Widget or template | What it draws | Standalone component it could use | Note |
|---|---|---|---|
| `iconToolbar` | A bordered row of `IconButton`s from a fixed list of five icon names; `onClick` functions sit inside `ui:options` | `Toolbar` | Not a value and not serialisable; breaks the "icons are nodes" rule. It reads as a demo. Recommend moving it out of `appWidgets` into the stories, or replacing it with a named-action field that resolves from `formContext.actions`. |
| `derivedText` | A `div`; the success tone is Tailwind `text-emerald-500`, not a token | `Typography` (it has tone tokens since `4d956f5`) | Token rule. |
| `staticPanel` | `div`s with fixed type sizes | `Statistic` or `Descriptions` | Fine as a field; should use a library part. |
| `combobox` | `SelectPrimitive` with `searchable` | none needed | The same as `select` with `searchable: true`. Keep one; document the other as an alias. |
| `hidden` | A native hidden input | none needed | Fine. |
| Collapsible section | A hand-made button and `hidden` | `Collapse` | Two disclosure looks in one library. |
| `WrapIfAdditionalTemplate` key input | A native input styled with `inputVariants` | `InputPrimitive` | The comment explains why (uncontrolled rename); acceptable. |
| Select footer action | Calls `window.location.assign(href)` | n/a | The library navigates, which B.7 says it does not; `FieldTemplate`'s own comment says "the widget itself owns no business navigation". Render an anchor, or call a handler the app supplies. |
| `color` | Shows `#3b82f6` when the field has no value | n/a | The screen shows a value the data does not hold. |

Widgets missing a test of their own: `multiSelect`, `numberInput`, `currency`, `phone`, `otp`, `tags`, `dateTime`,
`time`, `color`, `file`, `richText`, `hidden` (12). All 26 have stories and a docs page. No widget story has a `play`
function, so the Storybook test run proves they render, not that they store the right value.

## F. Non-input components the form could use in other roles

| Role | Library component | Wired today? | Recommendation |
|---|---|---|---|
| Rows and columns | `FormRow` (hand-built); `ui:rows` (schema) | Yes, twice, with matching gaps | Keep. |
| Section with a heading | `Typography`, `Divider`, `Card`, `Panel` | **No** (C3) | Draw `title` and `description` in `ObjectFieldTemplate` inside a `fieldset` / `legend`. One option: `ui:options.section: 'plain' \| 'card'`. |
| Section that opens and closes | `Collapse` | Partly: own button, not `Collapse` | Use `Collapse` (it has `size`, `tone`, `description`). |
| Label, help, error around a field | `FieldShell` | **No** (C5) | Make `FieldTemplate` render through `FieldShell`. |
| Array of rows (add, remove, reorder) | `IconButton`, `Button`, `List` | Partly: four row buttons are the library's; the template and "Add Item" are `@rjsf/shadcn`'s | Register an `ArrayFieldTemplate` and `AddButton` built from library parts; register the existing `ClearButton`. |
| Array as a grid of line items | `Table` | No | Not now: large, and an app can pass its own field. |
| Steps or wizard over one schema | `Wizard`, `Steps` | No. `Wizard` takes `steps` with `canAdvance` and its own content | Later, and by ADR: it needs a rule for validating one step, which the two-step validation in B.3 does not have. |
| Tabs over one schema | `Tabs` | No | Same decision as the wizard; do not do both ways. |
| Read-only view of a record | `Descriptions` | No. Read-only is disabled controls (C2) | First fix C2. A `Descriptions` view from the same schema is a good second step and needs each widget to say how its value prints. |
| Form-level error | `Alert` | No, on purpose: `onError` gives the list to the app | Keep; show the pattern in a story. |
| Submit row | `FormActions`, `Button` | Yes, as `children` | Keep. |
| Help beside a label | `Tooltip`, `Popover` | No; `ui:help` is a line under the field | Not needed yet. |
| Loading | `Skeleton`, `Spin` | No | The app's concern (B.7). |
| In a dialog or a drawer | `Modal`, `Drawer` | By composition | Keep; C6 (sizes) matters here. |
| Computed text in a form | `Typography`, `Statistic` | Own markup in `derivedText` and `staticPanel` | Use the library parts. |

## G. How Interview Studio uses forms today (read-only look)

Repository `omnitech-interview-answers-generator`, which takes the library as a vendored tarball of `0.1.0`.

| Measure | Count |
|---|---|
| Files that import the library | 64 |
| Uses of `DynamicForm` or `Form` | **0** |
| Library inputs imported | `Textarea` 6, `Input` 5, `Select` 5, `FileUpload` 2, `SegmentedPrimitive` 2, `Checkbox` 1 |
| Hand-written native inputs | **82 in 28 files**: 25 text, 18 `textarea`, 22 `select`, 4 checkbox, 3 file, 2 number, 2 radio, 1 `datetime-local`, 1 search, 4 hidden |
| Largest single file | `products/presentation/src/frontend/index.tsx`, 28 |

Forms that are plain records and could be one schema each: the interview card
(`products/interview/src/frontend/studio/home/interview-card.tsx`: company, role, when, minutes, format, topics), the
new-document dialog (`studio/documents/new-document-dialog.tsx`: a choice of cards with a title and a sub-line,
company, role, job description, an experience select, in three numbered steps), the behavioural setup card, the
new-question form, the rehearsal set-up, and the presentation product's settings.

| What these forms need | Widget that gives it | State |
|---|---|---|
| Text, long text | `text`, `textarea` | Ready |
| Choice from a list the app loads (profiles, models, stages) | `select` with `optionSetKey` | Ready; needs C4 to be typed |
| Cards with a title and a sub-line, one chosen | `radio` with `optionDescriptions` | Ready |
| Chips, one chosen (interview stage) | `segmented` | Ready |
| Date and time | `dateTime` | Ready; no `min` / `max` |
| Minutes, 5 to 600 | `numberInput` or `stepper` | Ready |
| Comma-separated topics | `tags` | Ready |
| Checkbox, switch | `checkbox`, `switch` | Ready |
| A file (templates, screenshots) | `file` | **Not ready** (E.2) |
| Two fields side by side, a wide one below | `ui:rows` | Ready |
| Section headings ("1 ...", "3 - Interview") | none | **Not ready** (C3) |
| Dense look inside dark panels and dialogs | none | **Not ready** (C6) |
| Help text heard by a screen reader | none | **Not ready** (C1) |

So the app is not held back by missing widgets. It is held back by the contract, and by the fact that nothing has
yet shown `DynamicForm` working in it.

## H. Recommended order

| # | Addition | Why now | Smallest generic API | Effort |
|---|---|---|---|---|
| 1 | Tie help and errors to the control (C1) | Accessibility, every widget | One helper beside `useStableRjsfCallbacks` that returns `aria-describedby` from RJSF's `ariaDescribedByIds(id)`; each widget spreads it. | S |
| 2 | Real read-only (C2) | The ReadOnly story is wrong today | Pass `readOnly={readonly}` where the primitive has it; add `readOnly` to the rest over time; keep `disabled` only for `disabled`. | S to M |
| 3 | Section headings (C3) | Any form longer than one group | `ObjectFieldTemplate` draws `title` / `description` in `fieldset` / `legend`; `ui:options.section: 'plain' \| 'card'`; `collapsible` through `Collapse`. | S |
| 4 | Export the kit (C4) | An app cannot type its own form without it | From `./dynamic-form`: `OmniRjsfFormContext`, `OmniSelectOption`, `OmniRjsfAction`, `buildFormContext`, `useStableRjsfCallbacks`, and each widget by name. | S |
| 5 | File values (E.2) | The one input Interview Studio hand-builds that has no working widget | `ui:options.mode: 'file' \| 'data-url' \| 'name'`; refusals shown as the field's error. No upload in the library. | M |
| 6 | Size, look and label side from the schema (C5, C6) | Forms inside panels and dialogs | Root `ui:options: { fieldSize, fieldVariant, fieldLayout }`, read once and handed down in `formContext`; `FieldTemplate` renders through `FieldShell`. Worth an ADR: it settles "one field chrome". | M |
| 7 | `password` with its toggle | Registered name that under-delivers | `PasswordWidget`; `toggleable`. | S |
| 8 | `rating` | A real component with no binding; RJSF already has the name | `RatePrimitive` + `Rate`; `ui:widget: 'rating'`; `count`. | M |
| 9 | Second modes: `range` on an array, `segmented` on an array | The primitives already do it | No new names: the schema type picks the mode. | S each |
| 10 | `autocomplete` | Free text with suggestions has no widget | `AutoCompletePrimitive`; options from `examples` or `optionSetKey`. | M |
| 11 | `dateRange` field; `min` / `max` on `date`, `dateTime` | Reporting and booking screens | `ui:field: 'dateRange'` on `{ from, to }`. | M |
| 12 | A widget reference page and missing tests | OBJ-6 | One docs page generated from the registry (name, schema, options, value); a test for each of the 12; one `play` per widget story that types and checks the stored value. | M |
| 13 | Rebuild `PreferencesForm` on `DynamicForm`, then one Interview Studio form (the interview card) | Proof that the philosophy holds in an app | No new API; anything it needs that is missing is the next gap. | M |
| later | Array template from library parts; wizard or tabs over a schema; `Descriptions` read-only view | Each needs a decision first | ADR each. | L |

Items 1 to 4 are small, touch no public behaviour a consumer relies on, and should land before any new widget,
because every new widget would otherwise copy the same holes.

### What not to add

- **Cascader, Transfer, TreeSelect, Mentions** as widgets: three are stubs and one is a re-labelled `Select`.
  Either build the component to the standard in B.1 first or remove it from the overview; binding a stub would
  make the schema form the place people discover it does not work.
- **Calendar, Upload, EmailInput** as separate widgets: each is already reachable (`date`, `file`, `email`).
- **Chat composites, a code editor, a Markdown editor, a `Table` line-item editor**: app-level, through the
  `widgets` and `fields` props.
- **More action widgets like `iconToolbar`**: a widget holds a value. Actions belong to the app's `children` or to a
  named-action field.
- **Upload, fetch or async option loading inside a widget**: lists come through `formContext.optionSets`, files leave
  through `onSubmit`.
- **A second way to select a widget** (a `type` list like the story-only `FieldDef` in `Form/Form.types.ts`): JSON
  Schema plus uiSchema is the one description; the `FieldDef` rows and `.storybook/FormDemo.tsx` renderer stay a
  Storybook aid.

## I. Not checked, and what could not be determined

- **Nothing was rendered for this audit.** The browser pane refused `localhost:6006`, so the DynamicForm docs page
  was read from its source (`DynamicForm.stories.tsx`, `defineDynamicFormStories.tsx`) and the index, and C3 was
  confirmed from yesterday's capture in `storybook-audit/`. The index answered and the docs page returned 200.
- **`@rjsf/shadcn`'s exact widget and template list** was taken from RJSF v6's documentation, not from the installed
  package (the audit did not read `node_modules`). Whether it ships `RatingWidget`, and which array templates,
  should be confirmed before item 8 and the array work.
- **Screen reader behaviour** for C1 and C2 was reasoned from the markup, not heard.
- **A `number` field with no `ui:widget`** falls to `TextWidget`, which draws `type="text"`; whether RJSF's number
  field turns what is typed back into a number in every case was not run.
- **`formContext.locale`** is declared and nothing reads it (`currency` reads `ui:options.locale`). Whether it is
  planned or left over is not recorded.
- **Which of the app's 82 native inputs are true record forms** and which are one-off controls (a search box, a
  crop editor) was sampled in six files, not classified one by one.
- **Effort figures** are estimates from reading the code, not from a spike.
- No tests, build or `pnpm verify` were run: no source changed. This brief is not yet listed in `bionic/index.md`
  or `bionic/log.md` (the task was limited to this one file).
