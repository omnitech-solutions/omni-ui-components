import { fieldsFromRows } from '@oc-tech/omni-ui-components';

describe('fieldsFromRows', () => {
  it('flattens FieldDef[][] rows into a flat field list', () => {
    const rows = [
      [
        { name: 'a', label: 'A' },
        { name: 'b', label: 'B' },
      ],
      [{ name: 'c', label: 'C' }],
    ];
    expect(fieldsFromRows(rows).map((f) => f.name)).toEqual(['a', 'b', 'c']);
  });

  it('flattens FormRowDef rows ({ fields }) the same way', () => {
    const rows = [
      { fields: [{ name: 'a', label: 'A' }] },
      {
        fields: [
          { name: 'b', label: 'B' },
          { name: 'c', label: 'C' },
        ],
      },
    ];
    expect(fieldsFromRows(rows).map((f) => f.name)).toEqual(['a', 'b', 'c']);
  });

  it('skips section-heading rows', () => {
    const rows = [
      { kind: 'heading' as const, title: 'Section A' },
      [{ name: 'a', label: 'A' }],
      { kind: 'heading' as const, title: 'Section B' },
      [{ name: 'b', label: 'B' }],
    ];
    expect(fieldsFromRows(rows).map((f) => f.name)).toEqual(['a', 'b']);
  });

  it('returns an empty array for no rows', () => {
    expect(fieldsFromRows([])).toEqual([]);
  });

  it('preserves field metadata (label / required / type)', () => {
    const rows = [[{ name: 'email', label: 'Email', type: 'email' as const, required: true }]];
    const [field] = fieldsFromRows(rows);
    expect(field).toEqual({ name: 'email', label: 'Email', type: 'email', required: true });
  });
});
