import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FormStoryShell } from './FormStoryShell';
import { buildFormSnippet } from './snippets/formSnippet';
import type { FormFixture } from 'factories/omni-ui-components/Form/Form.factories';

/* -------------------------------------------------------------------------- */
/* Config shapes                                                               */
/* -------------------------------------------------------------------------- */

export type SubmitMode = 'resolve' | 'reject' | 'slow';

export interface FormStoryArgs<TFormData> {
  fixture: string;
  prefilled?: boolean;
  formData?: Partial<TFormData>;
  disabled?: boolean;
  readOnly?: boolean;
  onSubmitMode?: SubmitMode;
  autoSubmit?: boolean;
}

export interface FormStoryDocs {
  name: string;
  whenToUse?: string;
  accessibility?: string;
}

export interface DefineFormStoriesConfig<TFormData> {
  title: string;
  fixtures: Record<string, () => FormFixture<TFormData>>;
  defaultArgs?: Partial<FormStoryArgs<TFormData>>;
  argTypes?: Record<string, unknown>;
  docs?: FormStoryDocs;
  stories: Record<string, Partial<FormStoryArgs<TFormData>>>;
}

export interface DefineFormStoriesResult<TFormData> {
  title: string;
  parameters: Meta<FormStoryArgs<TFormData>>['parameters'];
  argTypes: Meta<FormStoryArgs<TFormData>>['argTypes'];
  defaultArgs: FormStoryArgs<TFormData>;
  render: (args: FormStoryArgs<TFormData>) => React.ReactElement;
  stories: Record<string, Partial<FormStoryArgs<TFormData>>>;
  play: Record<string, StoryObj['play']>;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const buildOnSubmit = (mode: SubmitMode | undefined) => {
  switch (mode) {
    case 'reject':
      return async () => {
        throw new Error('Server unavailable (demo)');
      };
    case 'slow':
      return async () => {
        await sleep(1500);
      };
    default:
      return () => undefined;
  }
};

/* -------------------------------------------------------------------------- */
/* Renderer                                                                    */
/* -------------------------------------------------------------------------- */

function FormStoryRenderer<TFormData>(props: { fixtures: DefineFormStoriesConfig<TFormData>['fixtures']; args: FormStoryArgs<TFormData> }) {
  const { fixtures, args } = props;
  const fixture = React.useMemo(() => fixtures[args.fixture](), [fixtures, args.fixture]);
  const onSubmit = React.useMemo(() => buildOnSubmit(args.onSubmitMode), [args.onSubmitMode]);
  const formData = args.prefilled || args.formData ? ({ ...fixture.initial, ...(args.formData ?? {}) } as TFormData) : undefined;
  return (
    <FormStoryShell fixture={fixture} formData={formData} onSubmit={onSubmit} disabled={args.disabled} readOnly={args.readOnly} autoSubmit={args.autoSubmit} />
  );
}

/* -------------------------------------------------------------------------- */
/* defineFormStories                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Declarative Form-story factory. Returns a flat config that the consuming
 * `*.stories.tsx` plugs into a literal `export default meta` + literal
 * `export const X: StoryObj = { args: config.stories.X }` set — keeping the
 * CSF static analyser happy while letting each story be a one-liner.
 *
 * @example
 * const config = defineFormStories({
 *   title: 'omni-ui-components/Form',
 *   fixtures: { address: addressFormFactory },
 *   stories: { AddAddress: {}, ValidationErrors: { autoSubmit: true } },
 * });
 * const meta: Meta = { title: config.title, ...config };
 * export default meta;
 * export const AddAddress: StoryObj = { args: config.stories.AddAddress };
 * export const ValidationErrors: StoryObj = { args: config.stories.ValidationErrors, play: config.play.ValidationErrors };
 */
export function defineFormStories<TFormData>(config: DefineFormStoriesConfig<TFormData>): DefineFormStoriesResult<TFormData> {
  const fixtureKeys = Object.keys(config.fixtures);

  const parameters: Meta<FormStoryArgs<TFormData>>['parameters'] = {
    layout: 'padded',
    docs: {
      description: config.docs
        ? {
            component: [config.docs.whenToUse, config.docs.accessibility ? `\n### Accessibility\n${config.docs.accessibility}` : ''].filter(Boolean).join('\n'),
          }
        : undefined,
      source: {
        language: 'tsx',
        /* Plugin transform: regenerate the snippet from the live fixture +
         * per-story args so Show Code reflects the actual rendered tree. */
        transform: (_code: string, ctx: { args: FormStoryArgs<TFormData> }) => {
          const fixture = config.fixtures[ctx.args.fixture]?.();
          if (!fixture) return _code;
          return buildFormSnippet(fixture, { formData: ctx.args.formData });
        },
      },
    },
  };

  const argTypes: Meta<FormStoryArgs<TFormData>>['argTypes'] = {
    fixture: {
      control: 'select',
      options: fixtureKeys,
      description: 'Which fixture to render — switch schema + rows live.',
    },
    prefilled: { control: 'boolean', description: 'Seed the form with fixture defaults (merged with `formData`).' },
    formData: { control: 'object', description: 'Custom prefilled overrides.' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    onSubmitMode: {
      control: 'inline-radio',
      options: ['resolve', 'reject', 'slow'] satisfies SubmitMode[],
      description: '`resolve` (default) / `reject` (api error) / `slow` (1.5s).',
    },
    autoSubmit: { control: 'boolean', description: 'Auto-click Submit on mount (play function).' },
    ...config.argTypes,
  };

  const defaultArgs: FormStoryArgs<TFormData> = {
    fixture: fixtureKeys[0],
    prefilled: false,
    disabled: false,
    readOnly: false,
    onSubmitMode: 'resolve',
    autoSubmit: false,
    ...config.defaultArgs,
  } as FormStoryArgs<TFormData>;

  const render = (args: FormStoryArgs<TFormData>) => <FormStoryRenderer fixtures={config.fixtures} args={args} />;

  /* `autoSubmit` is handled inside `FormStoryShell` via a `useEffect` — no
   * dependency on the Storybook play addon. `play` is exposed as a no-op map
   * so consuming `*.stories.tsx` files don't need conditional spreads. */
  const play: Record<string, StoryObj['play']> = {};

  return {
    title: config.title,
    parameters,
    argTypes,
    defaultArgs,
    render,
    stories: config.stories,
    play,
  };
}
