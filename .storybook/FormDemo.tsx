import * as React from 'react';

import { ChevronDown, ChevronUp, Copy, FileText, Trash2, X } from 'lucide-react';
import {
  Checkbox,
  CheckboxGroup,
  ColorPicker,
  CurrencyInput,
  DatePicker,
  EmailInput,
  FileUpload,
  InputOTP,
  PasswordInput,
  PhoneInput,
  TagInput,
  TimePicker,
  Form,
  FormActions,
  FormField,
  FormRow,
  IconButton,
  Input,
  Radio,
  Segmented,
  Select,
  Slider,
  Stepper,
  Textarea,
} from '@oc-tech/omni-ui-components';
import type {
  FieldDef,
  FormFixture,
  FormRow as FormRowEntry,
  FormRowDef,
  FormSectionHeading,
  FormToolbarAction,
  FormToolbarRow,
} from '@oc-tech/omni-ui-components/Form/Form.types';
import type { FormProps } from '@oc-tech/omni-ui-components/Form/Form.types';

const TOOLBAR_ICONS = {
  trash: Trash2,
  copy: Copy,
  'move-up': ChevronUp,
  'move-down': ChevronDown,
  x: X,
} as const;

const renderToolbarAction = (action: FormToolbarAction, idx: number) => {
  const Icon = TOOLBAR_ICONS[action.icon];
  return <IconButton key={`${action.icon}-${idx}`} aria-label={action.label} title={action.label} variant={action.variant} icon={<Icon />} />;
};

const isSectionHeading = (r: FormRowEntry): r is FormSectionHeading => !Array.isArray(r) && (r as FormSectionHeading).kind === 'heading';
const isToolbarRow = (r: FormRowEntry): r is FormToolbarRow => !Array.isArray(r) && (r as FormToolbarRow).kind === 'toolbar';

const normalizeRow = <T extends string>(row: FieldDef<T>[] | FormRowDef<T>): FormRowDef<T> => (Array.isArray(row) ? { fields: row } : row);

export interface FormDemoProps<TFormData> extends Partial<Omit<FormProps<TFormData>, 'zodSchema' | 'children' | 'formData' | 'onSubmit'>> {
  fixture: FormFixture<TFormData>;
  formData?: TFormData;
  onSubmit?: FormProps<TFormData>['onSubmit'];
  submitLabel?: string;
  /** Replace the default submit button with custom action buttons. */
  actions?: React.ReactNode;
}

/**
 * Data-driven Form renderer used by stories and tests. Given a
 * {@link FormFixture}, wires every field via {@link FormField} +
 * {@link Input}, lays out via {@link FormRow}, finishes with
 * {@link FormActions} + submit.
 *
 * @example
 * const fixture = addressFormFactory({ label: 'HQ' });
 * <FormDemo fixture={fixture} onSubmit={(v) => save(v)} />
 */
export function FormDemo<TFormData>({
  fixture,
  formData,
  onSubmit = () => undefined,
  onError,
  onChange,
  disabled,
  readOnly,
  submitLabel,
  actions,
  className,
}: FormDemoProps<TFormData>) {
  return (
    <Form
      zodSchema={fixture.schema}
      formData={formData ?? fixture.initial}
      onSubmit={onSubmit}
      onError={onError}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
      className={className ?? 'flex w-full flex-col gap-6'}
    >
      {fixture.rows.map((rawRow, rowIndex) => {
        if (isSectionHeading(rawRow)) {
          return (
            <div key={`heading-${rowIndex}`} className={rowIndex === 0 ? '' : 'mt-2'}>
              <h3 className="text-base font-semibold text-foreground">{rawRow.title}</h3>
              {rawRow.description ? <p className="mt-1 text-sm text-muted-foreground">{rawRow.description}</p> : null}
            </div>
          );
        }
        if (isToolbarRow(rawRow)) {
          return (
            <div key={`toolbar-${rowIndex}`} className="flex flex-col gap-2">
              {rawRow.label ? <span className="text-sm font-medium text-foreground">{rawRow.label}</span> : null}
              {rawRow.description ? <p className="text-xs text-muted-foreground">{rawRow.description}</p> : null}
              <div className="inline-flex items-center gap-1 self-start rounded-md border border-[var(--oui-border-field)] p-1">
                {rawRow.actions.map((action, idx) => renderToolbarAction(action, idx))}
              </div>
            </div>
          );
        }
        const row = normalizeRow(rawRow);
        return (
          <FormRow key={rowIndex} cols={row.cols}>
            {row.fields.map((field) => (
              <FormField key={field.name} name={field.name} required={field.required}>
                {({ id, value, onChange: oc, onBlur, error, required, disabled: d, readOnly: r }) => {
                  if (field.type === 'textarea') {
                    return (
                      <Textarea
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        rows={field.rows ?? 5}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={oc}
                        onBlur={onBlur}
                        error={error}
                        disabled={d}
                        readOnly={r}
                      />
                    );
                  }
                  if (field.type === 'otp') {
                    return (
                      <InputOTP
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'tags') {
                    return (
                      <TagInput
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        required={required}
                        value={(value as string[] | undefined) ?? []}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'time') {
                    return (
                      <TimePicker
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'color') {
                    return (
                      <ColorPicker
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        required={required}
                        value={(value as string | undefined) ?? '#3b82f6'}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'file') {
                    return (
                      <FileUpload
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        required={required}
                        value={(value as File[] | undefined) ?? []}
                        onChange={(next) => oc(next.map((f) => f.name))}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'password') {
                    return (
                      <PasswordInput
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={(next) => oc(next)}
                        onBlur={onBlur}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'email') {
                    return (
                      <EmailInput
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={oc}
                        onBlur={onBlur}
                        error={error}
                        disabled={d}
                        readOnly={r}
                      />
                    );
                  }
                  if (field.type === 'phone') {
                    return (
                      <PhoneInput
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'currency') {
                    return (
                      <CurrencyInput
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        required={required}
                        value={typeof value === 'number' ? value : null}
                        onChange={(next) => oc(next ?? undefined)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'date') {
                    const isoToDate = (s: unknown): Date | null => {
                      if (typeof s !== 'string' || !s) return null;
                      const d = new Date(`${s}T00:00:00`);
                      return Number.isNaN(d.getTime()) ? null : d;
                    };
                    const toIso = (d: Date): string => {
                      const yyyy = d.getFullYear();
                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                      const dd = String(d.getDate()).padStart(2, '0');
                      return `${yyyy}-${mm}-${dd}`;
                    };
                    return (
                      <DatePicker
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        required={required}
                        value={isoToDate(value)}
                        onChange={(next) => oc(next instanceof Date ? toIso(next) : '')}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'stepper') {
                    return (
                      <Stepper
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        unit={field.valueSuffix}
                        icon={<FileText />}
                        required={required}
                        value={typeof value === 'number' ? value : (field.min ?? 0)}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'range') {
                    return (
                      <Slider
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        valueSuffix={field.valueSuffix}
                        required={required}
                        value={typeof value === 'number' ? value : (field.min ?? 0)}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'checkbox') {
                    return (
                      <Checkbox
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        required={required}
                        checked={Boolean(value)}
                        onChange={(c) => oc(c)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'checkboxes') {
                    return (
                      <CheckboxGroup
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        orientation={field.orientation ?? 'vertical'}
                        options={field.options ?? []}
                        required={required}
                        value={(value as string[] | undefined) ?? []}
                        onChange={(next) => oc(next)}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'segmented') {
                    return (
                      <Segmented
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        options={field.options ?? []}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={oc}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'radio') {
                    return (
                      <Radio
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        orientation={field.orientation ?? 'vertical'}
                        options={field.options ?? []}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={oc}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  if (field.type === 'select') {
                    return (
                      <Select
                        id={id}
                        label={field.label}
                        description={field.description}
                        layout={field.layout ?? 'vertical'}
                        placeholder={field.placeholder}
                        options={field.options ?? []}
                        required={required}
                        value={(value as string | undefined) ?? ''}
                        onChange={oc}
                        onBlur={onBlur}
                        error={error}
                        disabled={d || r}
                      />
                    );
                  }
                  return (
                    <Input
                      id={id}
                      label={field.label}
                      description={field.description}
                      type={field.type ?? 'text'}
                      layout={field.layout ?? 'vertical'}
                      placeholder={field.placeholder}
                      required={required}
                      value={(value as string | undefined) ?? ''}
                      onChange={oc}
                      onBlur={onBlur}
                      error={error}
                      disabled={d}
                      readOnly={r}
                    />
                  );
                }}
              </FormField>
            ))}
          </FormRow>
        );
      })}
      {actions !== undefined || submitLabel || fixture.submitLabel ? (
        <FormActions>
          {actions ?? (
            <button
              type="submit"
              disabled={disabled || readOnly}
              className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitLabel ?? fixture.submitLabel}
            </button>
          )}
        </FormActions>
      ) : null}
    </Form>
  );
}
