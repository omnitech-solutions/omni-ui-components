import '@testing-library/jest-dom';
import * as React from 'react';
import { z } from 'zod';
import type { RJSFSchema } from '@rjsf/utils';

import { renderDynamicForm } from './testing/renderDynamicForm';

/* -------------------------------------------------------------------------- */
/* Helpers — extract the grid structure produced by ObjectFieldTemplate         */
/* -------------------------------------------------------------------------- */

interface RowSpan {
  fields: string[];
  spans: number[];
  cols: number;
}

const extractRows = (): RowSpan[] => {
  const rjsf = document.querySelector('.rjsf');
  if (!rjsf) return [];
  /* The outer object renders a flex column of grid rows. The address /
   * contact_info subobjects each have their own flex+grid stack. We grab
   * the deepest grid that contains <input>/<textarea> elements. */
  const grids = Array.from(rjsf.querySelectorAll('div[style*="display: grid"]')) as HTMLElement[];
  return grids.map((g) => {
    const cols = (g.style.gridTemplateColumns.match(/repeat\((\d+)/) ?? [undefined, '0'])[1];
    const cells = Array.from(g.children) as HTMLElement[];
    return {
      cols: Number(cols),
      fields: cells.map((c) => c.querySelector<HTMLElement>('input,textarea')?.getAttribute('id')?.split('_').pop() ?? ''),
      spans: cells.map((c) => {
        const m = c.style.gridColumn.match(/span (\d+)/);
        return m ? Number(m[1]) : 1;
      }),
    };
  });
};

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

const flatScalarSchema: RJSFSchema = {
  type: 'object',
  properties: {
    a: { type: 'string', title: 'A' },
    b: { type: 'string', title: 'B' },
    c: { type: 'string', title: 'C' },
  },
};

const nestedSchema: RJSFSchema = {
  type: 'object',
  properties: {
    contact_info: {
      type: 'object',
      title: 'Contact info',
      properties: {
        full_name: { type: 'string', title: 'Full name' },
        email: { type: 'string', title: 'Email' },
      },
    },
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        label: { type: 'string', title: 'Label' },
        city: { type: 'string', title: 'City' },
      },
    },
  },
};

describe('ObjectFieldTemplate — default layout (no ui:rows)', () => {
  it('pairs flat scalar properties into 2-per-row by default', () => {
    renderDynamicForm({
      schema: flatScalarSchema,
      zodSchema: z.object({ a: z.string(), b: z.string(), c: z.string() }) as never,
      formData: { a: '', b: '', c: '' },
    });
    const rows = extractRows();
    // 2-col grid, two rows: [a, b] and [c]
    expect(rows.length).toBe(2);
    expect(rows[0].fields).toEqual(['a', 'b']);
    expect(rows[1].fields).toEqual(['c']);
    expect(rows[0].cols).toBe(2);
  });

  it('stacks rows of object subschemas (does NOT pair them)', () => {
    renderDynamicForm({
      schema: nestedSchema,
      zodSchema: z.object({
        contact_info: z.object({ full_name: z.string(), email: z.string() }),
        address: z.object({ label: z.string(), city: z.string() }),
      }) as never,
      formData: { contact_info: { full_name: '', email: '' }, address: { label: '', city: '' } },
    });
    const rows = extractRows();
    /* Outer grid: contact_info and address each span every column (1 each),
     * NOT paired into one row. */
    const outerCellSpans = rows[0].spans;
    /* The first grid row only contains the contact_info subobject (its
     * own nested grid is a separate row in extractRows). */
    expect(outerCellSpans[0]).toBe(rows[0].cols);
  });
});

describe('ObjectFieldTemplate — explicit ui:rows', () => {
  it('honors string rows ([name, name])', () => {
    renderDynamicForm({
      schema: flatScalarSchema,
      uiSchema: { 'ui:rows': [['a', 'b'], ['c']] } as never,
      zodSchema: z.object({ a: z.string(), b: z.string(), c: z.string() }) as never,
      formData: { a: '', b: '', c: '' },
    });
    const rows = extractRows();
    expect(rows[0].fields).toEqual(['a', 'b']);
    expect(rows[1].fields).toEqual(['c']);
    expect(rows[1].spans).toEqual([1]);
  });

  it('honors object cells with span ({ value, span })', () => {
    renderDynamicForm({
      schema: flatScalarSchema,
      uiSchema: { 'ui:rows': [['a', 'b'], [{ value: 'c', span: 2 }]] } as never,
      zodSchema: z.object({ a: z.string(), b: z.string(), c: z.string() }) as never,
      formData: { a: '', b: '', c: '' },
    });
    const rows = extractRows();
    expect(rows[0].cols).toBe(2);
    expect(rows[1].spans).toEqual([2]);
  });

  it('falls back gracefully when a row references a missing property', () => {
    expect(() =>
      renderDynamicForm({
        schema: flatScalarSchema,
        uiSchema: { 'ui:rows': [['a', 'nope']] } as never,
        zodSchema: z.object({ a: z.string(), b: z.string(), c: z.string() }) as never,
        formData: { a: '', b: '', c: '' },
      }),
    ).not.toThrow();
  });
});

describe('ObjectFieldTemplate — trailing properties not in ui:rows', () => {
  it('appends them as one-per-row after the declared rows', () => {
    renderDynamicForm({
      schema: flatScalarSchema,
      uiSchema: { 'ui:rows': [['a']] } as never,
      zodSchema: z.object({ a: z.string(), b: z.string(), c: z.string() }) as never,
      formData: { a: '', b: '', c: '' },
    });
    const rows = extractRows();
    /* Declared: [a] — Trailing: [b], [c] */
    expect(rows.length).toBe(3);
    expect(rows[0].fields).toEqual(['a']);
    expect(rows[1].fields).toEqual(['b']);
    expect(rows[2].fields).toEqual(['c']);
  });
});
