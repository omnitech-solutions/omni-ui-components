import { Button } from '@oc-tech/omni-ui-components';
import {
  DynamicForm,
  type DynamicFormHandle,
  type FormError,
  type OmniRjsfFormContext,
} from '@oc-tech/omni-ui-components/dynamic-form';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import * as React from 'react';
import { z } from 'zod';

interface Profile {
  name: string;
  email?: string;
  experience?: { role?: string };
}

const schema: RJSFSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name', description: 'As it appears on the document.' },
    email: { type: 'string', title: 'Email', format: 'email' },
    experience: {
      type: 'object',
      title: 'Experience',
      description: 'The most recent role.',
      properties: { role: { type: 'string', title: 'Role' } },
    },
  },
};
const uiSchema: UiSchema = { experience: { 'ui:options': { collapsible: true } } };
const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().optional(),
  experience: z.object({ role: z.string().optional() }).optional(),
}) as unknown as z.ZodType<Profile>;

/**
 * What a host does around a schema form, with no function and no node in the schema: it owns the values and may
 * change them at any time, opens and closes a section, shows a status beside a section and a field, focuses a
 * field by its key, hears which field has focus, and shows what the server answered.
 */
export function HostControlExample() {
  const form = React.useRef<DynamicFormHandle>(null);
  const [profile, setProfile] = React.useState<Profile>({ name: 'Ada', email: '' });
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState('none');
  const [serverErrors, setServerErrors] = React.useState<FormError[]>();

  const formContext: Omit<OmniRjsfFormContext, 'derived'> = {
    optionSets: {},
    actions: {},
    locale: 'en',
    sections: {
      experience: {
        open,
        meta: profile.experience?.role ? '1 entry' : 'No entry',
        status: profile.experience?.role
          ? { tone: 'success', label: 'Complete' }
          : { tone: 'warning', label: 'Incomplete' },
      },
    },
    onSectionOpenChange: (_key, next) => setOpen(next),
    fieldStatus: profile.email ? {} : { email: { tone: 'muted', label: 'Optional' } },
  };

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button buttonSize="sm" onClick={() => form.current?.focusField('email')}>
          Focus email
        </Button>
        <Button
          buttonSize="sm"
          onClick={() => {
            setOpen(true);
            setProfile((current) => ({ ...current, experience: { role: 'Engineer' } }));
          }}
        >
          Load a role
        </Button>
      </div>
      <DynamicForm<Profile & Record<string, unknown>, Profile>
        apiRef={form}
        idPrefix="profile"
        schema={schema}
        uiSchema={uiSchema}
        zodSchema={profileSchema}
        formData={profile as Profile & Record<string, unknown>}
        formContext={{ ...formContext, derived: {} }}
        serverErrors={serverErrors}
        onChange={setProfile}
        onFieldFocus={setFocused}
        onFieldBlur={() => setFocused('none')}
        onSubmit={() =>
          setServerErrors([
            { path: ['email'], message: 'This address is already in use', source: 'api' },
          ])
        }
      >
        <Button type="submit">Save</Button>
      </DynamicForm>
      <output data-testid="focused-field" className="text-xs text-[var(--oui-foreground-muted)]">
        Field with focus: {focused}
      </output>
    </div>
  );
}
