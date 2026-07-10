import '@testing-library/jest-dom';
import * as React from 'react';
import { z } from 'zod';
import type { RJSFSchema, UiSchema, WidgetProps } from '@rjsf/utils';

import { DynamicForm } from 'dynamic-form';
import { renderDynamicForm, screen } from './testing/renderDynamicForm';

const buildSpyWidget = (counts: Record<string, number>) => {
  const SpyTextWidget = (props: WidgetProps) => {
    const id = props.id || 'unknown';
    counts[id] = (counts[id] ?? 0) + 1;
    return <input data-testid={id} value={(props.value as string | undefined) ?? ''} onChange={(e) => props.onChange(e.target.value)} />;
  };
  SpyTextWidget.displayName = 'SpyTextWidget';
  return SpyTextWidget;
};

const schema: RJSFSchema = {
  type: 'object',
  properties: {
    a: { type: 'string', title: 'A' },
    b: { type: 'string', title: 'B' },
    c: { type: 'string', title: 'C' },
    d: { type: 'string', title: 'D' },
  },
};
const uiSchema: UiSchema = {
  a: { 'ui:widget': 'text' },
  b: { 'ui:widget': 'text' },
  c: { 'ui:widget': 'text' },
  d: { 'ui:widget': 'text' },
};
const zodSchema = z.object({ a: z.string(), b: z.string(), c: z.string(), d: z.string() });

describe('DynamicForm memoization', () => {
  it('typing in one field re-renders only that field; siblings skip', async () => {
    const counts: Record<string, number> = {};
    const widgets = { text: buildSpyWidget(counts), TextWidget: buildSpyWidget(counts) };
    const { user } = renderDynamicForm({
      schema,
      uiSchema,
      zodSchema,
      formData: { a: '', b: '', c: '', d: '' },
      widgets,
    });
    const initial = { ...counts };
    await user.type(screen.getByTestId('root_a'), 'x');
    const delta = (id: string) => (counts[id] ?? 0) - (initial[id] ?? 0);
    expect(delta('root_a')).toBeGreaterThanOrEqual(1);
    expect(delta('root_b')).toBe(0);
    expect(delta('root_c')).toBe(0);
    expect(delta('root_d')).toBe(0);
  });

  it('FieldTemplate (chrome) for siblings does not re-render either', async () => {
    const widgetCounts: Record<string, number> = {};
    const chromeCounts: Record<string, number> = {};
    const SpyWidget = buildSpyWidget(widgetCounts);
    const SpyFieldTemplate = (props: any) => {
      const id = props.id || 'unknown';
      chromeCounts[id] = (chromeCounts[id] ?? 0) + 1;
      return <div data-chrome-id={id}>{props.children}</div>;
    };
    const widgets = { text: SpyWidget, TextWidget: SpyWidget };
    const templates = { FieldTemplate: SpyFieldTemplate };
    const { user } = renderDynamicForm({
      schema,
      uiSchema,
      zodSchema,
      formData: { a: '', b: '', c: '', d: '' },
      widgets,
      templates: templates as any,
    });
    const initialChrome = { ...chromeCounts };
    await user.type(screen.getByTestId('root_a'), 'hi');
    expect((chromeCounts['root_b'] ?? 0) - (initialChrome['root_b'] ?? 0)).toBe(0);
    expect((chromeCounts['root_c'] ?? 0) - (initialChrome['root_c'] ?? 0)).toBe(0);
    expect((chromeCounts['root_d'] ?? 0) - (initialChrome['root_d'] ?? 0)).toBe(0);
  });

  it('parent re-render with unrelated prop changes does NOT re-render any field', async () => {
    const widgetCounts: Record<string, number> = {};
    const SpyWidget = buildSpyWidget(widgetCounts);
    const widgets = { text: SpyWidget, TextWidget: SpyWidget };
    const stableFormData = { a: '', b: '', c: '', d: '' };
    const Harness = () => {
      const [tick, setTick] = React.useState(0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const onSubmit = React.useCallback(() => undefined, [tick]);
      return (
        <>
          <button data-testid="bump" onClick={() => setTick((t) => t + 1)}>
            bump {tick}
          </button>
          {React.createElement(DynamicForm, { schema, uiSchema, zodSchema, formData: stableFormData, widgets, onSubmit })}
        </>
      );
    };
    const { render } = await import('@testing-library/react');
    const user = (await import('@testing-library/user-event')).default.setup();
    const { getByTestId } = render(<Harness />);
    const initial = { ...widgetCounts };
    await user.click(getByTestId('bump'));
    await user.click(getByTestId('bump'));
    await user.click(getByTestId('bump'));
    expect((widgetCounts['root_a'] ?? 0) - (initial['root_a'] ?? 0)).toBe(0);
    expect((widgetCounts['root_b'] ?? 0) - (initial['root_b'] ?? 0)).toBe(0);
    expect((widgetCounts['root_c'] ?? 0) - (initial['root_c'] ?? 0)).toBe(0);
    expect((widgetCounts['root_d'] ?? 0) - (initial['root_d'] ?? 0)).toBe(0);
  });

  it('same-content formData passed by new reference does NOT re-render (deep-equality)', async () => {
    const widgetCounts: Record<string, number> = {};
    const SpyWidget = buildSpyWidget(widgetCounts);
    const widgets = { text: SpyWidget, TextWidget: SpyWidget };
    const Harness = () => {
      const [tick, setTick] = React.useState(0);
      const freshFormData = { a: '', b: '', c: '', d: '' };
      return (
        <>
          <button data-testid="bump" onClick={() => setTick((t) => t + 1)}>
            bump {tick}
          </button>
          {React.createElement(DynamicForm, {
            schema,
            uiSchema,
            zodSchema,
            formData: freshFormData,
            widgets,
            onSubmit: () => undefined,
          })}
        </>
      );
    };
    const { render } = await import('@testing-library/react');
    const user = (await import('@testing-library/user-event')).default.setup();
    const { getByTestId } = render(<Harness />);
    const initial = { ...widgetCounts };
    await user.click(getByTestId('bump'));
    await user.click(getByTestId('bump'));
    expect((widgetCounts['root_a'] ?? 0) - (initial['root_a'] ?? 0)).toBe(0);
    expect((widgetCounts['root_b'] ?? 0) - (initial['root_b'] ?? 0)).toBe(0);
  });

  it('typing many characters bounds sibling renders to zero', async () => {
    const counts: Record<string, number> = {};
    const widgets = { text: buildSpyWidget(counts), TextWidget: buildSpyWidget(counts) };
    const { user } = renderDynamicForm({
      schema,
      uiSchema,
      zodSchema,
      formData: { a: '', b: '', c: '', d: '' },
      widgets,
    });
    const initial = { ...counts };
    await user.type(screen.getByTestId('root_a'), 'hello');
    expect((counts['root_b'] ?? 0) - (initial['root_b'] ?? 0)).toBe(0);
    expect((counts['root_c'] ?? 0) - (initial['root_c'] ?? 0)).toBe(0);
    expect((counts['root_d'] ?? 0) - (initial['root_d'] ?? 0)).toBe(0);
  });
});
