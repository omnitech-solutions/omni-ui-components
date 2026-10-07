import { formOptions, pluck, project, selectOptions } from '../../src/helpers/optionMappers';
import * as publicMappers from '../../helpers/optionMappers';
import * as publicProject from '../../helpers/project';
import * as srcProject from '../../src/helpers/project';

interface Person {
  id: string;
  name: string;
  team: string;
  active: boolean;
}

const people: Person[] = [
  { id: 'p1', name: 'Ada', team: 'Core', active: true },
  { id: 'p2', name: 'Grace', team: 'Ops', active: false },
];

describe('helpers/project', () => {
  it.each([
    ['src', srcProject],
    ['public', publicProject],
  ])('pluck reads a key or calls a selector function (%s)', (_label, mod) => {
    expect(mod.pluck(people[0], 'name')).toBe('Ada');
    expect(mod.pluck(people[0], (p: Person) => `${p.name}@${p.team}`)).toBe('Ada@Core');
  });

  it.each([
    ['src', srcProject],
    ['public', publicProject],
  ])('project maps every item through keys and selectors (%s)', (_label, mod) => {
    const rows = mod.project(people, { value: 'id', label: (p: Person) => p.name.toUpperCase() });
    expect(rows).toEqual([
      { value: 'p1', label: 'ADA' },
      { value: 'p2', label: 'GRACE' },
    ]);
  });

  it('project returns an empty list for no items', () => {
    expect(srcProject.project([], { value: 'id' })).toEqual([]);
  });
});

describe.each([
  ['src', { selectOptions, formOptions, pluck, project }],
  ['public', publicMappers],
])('helpers/optionMappers (%s)', (_label, mod) => {
  it('re-exports pluck and project', () => {
    expect(mod.pluck(people[1], 'team')).toBe('Ops');
    expect(mod.project(people, { v: 'id' })).toEqual([{ v: 'p1' }, { v: 'p2' }]);
  });

  it('selectOptions fills unmapped fields with null/false defaults', () => {
    const [first] = mod.selectOptions(people, { value: 'id', label: 'name' });
    expect(first).toEqual({
      value: 'p1',
      label: 'Ada',
      description: null,
      group: null,
      color: null,
      initials: null,
      avatarUrl: null,
      disabled: false,
    });
  });

  it('selectOptions applies selector functions and ignores undefined selectors', () => {
    const options = mod.selectOptions(people, {
      value: 'id',
      label: 'name',
      group: (p: Person) => p.team,
      disabled: (p: Person) => !p.active,
      description: undefined,
    });
    expect(options.map((o) => [o.value, o.group, o.disabled, o.description])).toEqual([
      ['p1', 'Core', false, null],
      ['p2', 'Ops', true, null],
    ]);
  });

  it('selectOptions with an empty mapping yields blank defaults per item', () => {
    const options = mod.selectOptions(people, {});
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe('');
  });

  it('formOptions defaults to id and name', () => {
    expect(mod.formOptions(people)).toEqual([
      { value: 'p1', label: 'Ada' },
      { value: 'p2', label: 'Grace' },
    ]);
  });

  it('formOptions honours an explicit mapping', () => {
    expect(mod.formOptions(people, { value: 'id', label: (p: Person) => `${p.name} (${p.team})` })).toEqual([
      { value: 'p1', label: 'Ada (Core)' },
      { value: 'p2', label: 'Grace (Ops)' },
    ]);
  });
});
