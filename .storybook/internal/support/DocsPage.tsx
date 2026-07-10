import * as React from 'react';
import { Controls, Description, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';

const splitTitle = (title: string | undefined) => {
  if (!title) return { section: 'Components', name: 'Component' };
  const parts = title.split('/').filter(Boolean);
  const name = parts.at(-1) ?? 'Component';
  const section = parts.slice(0, -1).join(' / ') || 'Components';
  return { section, name };
};

const inferSummary = (title: string | undefined) => {
  const { name, section } = splitTitle(title);
  if (section === 'Getting Started') return `${name} reference and usage guidance.`;
  if (section.includes('dynamic-form')) return `${name} schema-driven behavior, examples, and props.`;
  return `${name} states, props, and live examples.`;
};

export const DocsPage: React.FC = () => {
  const resolved = useOf('meta', ['meta']) as {
    preparedMeta?: {
      title?: string;
      parameters?: { docs?: { description?: { component?: string } } };
      argTypes?: Record<string, unknown>;
    };
  };

  const title = resolved.preparedMeta?.title;
  const { section, name } = splitTitle(title);
  const description = resolved.preparedMeta?.parameters?.docs?.description?.component;
  const hasDescription = typeof description === 'string' && description.trim().length > 0;
  const propCount = Object.keys(resolved.preparedMeta?.argTypes ?? {}).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:px-8">
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-background-alt px-6 py-5 md:px-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="rounded-full bg-[var(--oui-primary-1)] px-2.5 py-1 text-[var(--oui-primary-7)]">{section}</span>
            <span className="rounded-full border border-border px-2.5 py-1">{propCount} props</span>
          </div>
          <div className="docs-page-title [&_h1]:m-0 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-normal [&_h1]:text-foreground">
            <Title>{name}</Title>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <Subtitle>{title}</Subtitle>
          </div>
          <div className="docs-page-description mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
            {hasDescription ? <Description /> : <p>{inferSummary(title)}</p>}
          </div>
        </div>
        <div className="grid gap-4 px-6 py-5 md:grid-cols-3 md:px-8">
          <div className="rounded-md border border-border bg-card-translucent p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Primary use</div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Interactive example with the current component args.
            </div>
          </div>
          <div className="rounded-md border border-border bg-card-translucent p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Controls</div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Update props live and inspect the rendered output.
            </div>
          </div>
          <div className="rounded-md border border-border bg-card-translucent p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Coverage</div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Additional states and variants are listed below.
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Preview</div>
        <Primary />
      </section>

      <section className="rounded-lg border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Props</div>
        <Controls />
      </section>

      <section className="rounded-lg border border-border bg-card px-6 py-6 shadow-sm md:px-8">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">More examples</div>
        <Stories includePrimary={false} />
      </section>
    </div>
  );
};
