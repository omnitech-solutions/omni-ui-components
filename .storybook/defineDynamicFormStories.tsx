import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DynamicFormStoryShell } from './DynamicFormStoryShell';
import { buildDynamicFormSnippet } from './snippets/dynamicFormSnippet';
import type { FormFixture } from 'factories/dynamic-form/DynamicForm/DynamicForm.factories';

export type SubmitMode = 'resolve' | 'reject' | 'slow';

export interface DynamicFormStoryArgs<TFormData> {
  fixture: string;
  title?: string;
  submitLabel?: string;
  prefilled?: boolean;
  formData?: Partial<TFormData>;
  disabled?: boolean;
  readOnly?: boolean;
  onSubmitMode?: SubmitMode;
  autoSubmit?: boolean;
}

export interface DynamicFormStoryDocs {
  name: string;
  whenToUse?: string;
  accessibility?: string;
}

export interface DefineDynamicFormStoriesConfig<TFormData> {
  title: string;
  fixtures: Record<string, () => FormFixture<TFormData>>;
  titles?: Record<string, string>;
  submitLabels?: Record<string, string>;
  defaultArgs?: Partial<DynamicFormStoryArgs<TFormData>>;
  argTypes?: Record<string, unknown>;
  docs?: DynamicFormStoryDocs;
  stories: Record<string, Partial<DynamicFormStoryArgs<TFormData>>>;
}

export interface DefineDynamicFormStoriesResult<TFormData> {
  title: string;
  parameters: Meta<DynamicFormStoryArgs<TFormData>>['parameters'];
  argTypes: Meta<DynamicFormStoryArgs<TFormData>>['argTypes'];
  defaultArgs: DynamicFormStoryArgs<TFormData>;
  render: (args: DynamicFormStoryArgs<TFormData>) => React.ReactElement;
  stories: Record<string, Partial<DynamicFormStoryArgs<TFormData>>>;
}

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

function DynamicFormStoryRenderer<TFormData>(props: {
  fixtures: DefineDynamicFormStoriesConfig<TFormData>['fixtures'];
  titles?: Record<string, string>;
  submitLabels?: Record<string, string>;
  args: DynamicFormStoryArgs<TFormData>;
}) {
  const { fixtures, titles, submitLabels, args } = props;
  const fixture = React.useMemo(() => fixtures[args.fixture](), [fixtures, args.fixture]);
  const onSubmit = React.useMemo(() => buildOnSubmit(args.onSubmitMode), [args.onSubmitMode]);
  const formData = args.prefilled || args.formData ? ({ ...fixture.defaults, ...(args.formData ?? {}) } as TFormData) : undefined;
  const title = args.title ?? titles?.[args.fixture] ?? args.fixture;
  const submitLabel = args.submitLabel ?? submitLabels?.[args.fixture];
  return (
    <DynamicFormStoryShell
      fixture={fixture}
      title={title}
      formData={formData}
      onSubmit={onSubmit}
      disabled={args.disabled}
      readOnly={args.readOnly}
      submitLabel={submitLabel}
      autoSubmit={args.autoSubmit}
    />
  );
}

/**
 * Declarative DynamicForm-story factory. Mirrors `defineFormStories` so the
 * Storybook controls (fixture select, prefilled, disabled, readOnly,
 * onSubmitMode, autoSubmit) work the same way across vanilla Form and
 * DynamicForm stories. The `Show code` panel pulls from the live fixture
 * via `buildDynamicFormSnippet`.
 */
export function defineDynamicFormStories<TFormData>(config: DefineDynamicFormStoriesConfig<TFormData>): DefineDynamicFormStoriesResult<TFormData> {
  const fixtureKeys = Object.keys(config.fixtures);

  const parameters: Meta<DynamicFormStoryArgs<TFormData>>['parameters'] = {
    layout: 'padded',
    docs: {
      description: config.docs
        ? {
            component: [config.docs.whenToUse, config.docs.accessibility ? `\n### Accessibility\n${config.docs.accessibility}` : ''].filter(Boolean).join('\n'),
          }
        : undefined,
      source: {
        language: 'tsx',
        transform: (_code: string, ctx: { args: DynamicFormStoryArgs<TFormData> }) => {
          const fixture = config.fixtures[ctx.args.fixture]?.();
          if (!fixture) return _code;
          const submitLabel = ctx.args.submitLabel ?? config.submitLabels?.[ctx.args.fixture];
          return buildDynamicFormSnippet(fixture, { submitLabel });
        },
      },
    },
  };

  const argTypes: Meta<DynamicFormStoryArgs<TFormData>>['argTypes'] = {
    fixture: {
      control: 'select',
      options: fixtureKeys,
      description: 'Which fixture to render — switches schema + uiSchema + zodSchema + defaults.',
    },
    title: { control: 'text', description: 'Heading shown above the form card.' },
    submitLabel: { control: 'text', description: 'Submit button label.' },
    prefilled: { control: 'boolean', description: 'Seed the form with fixture defaults (merged with `formData`).' },
    formData: { control: 'object', description: 'Custom prefilled overrides.' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    onSubmitMode: {
      control: 'inline-radio',
      options: ['resolve', 'reject', 'slow'] satisfies SubmitMode[],
      description: '`resolve` (default) / `reject` (api error) / `slow` (1.5s).',
    },
    autoSubmit: { control: 'boolean', description: 'Auto-click Submit on mount.' },
    ...config.argTypes,
  };

  const defaultArgs: DynamicFormStoryArgs<TFormData> = {
    fixture: fixtureKeys[0],
    prefilled: false,
    disabled: false,
    readOnly: false,
    onSubmitMode: 'resolve',
    autoSubmit: false,
    ...config.defaultArgs,
  } as DynamicFormStoryArgs<TFormData>;

  const render = (args: DynamicFormStoryArgs<TFormData>) => (
    <DynamicFormStoryRenderer fixtures={config.fixtures} titles={config.titles} submitLabels={config.submitLabels} args={args} />
  );

  return {
    title: config.title,
    parameters,
    argTypes,
    defaultArgs,
    render,
    stories: config.stories,
  };
}
