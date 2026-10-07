import type { TableColumn } from '../../src/Table/Table.types';

export interface Person {
  id: number;
  name: string;
  role: string;
  age: number;
  salary: number;
  joined: string;
  nickname?: string;
  children?: Person[];
}

export const people: Person[] = [
  { id: 1, name: 'Ada', role: 'Engineer', age: 36, salary: 120000, joined: '2020-03-05' },
  { id: 2, name: 'Grace', role: 'Admiral', age: 45, salary: 150000, joined: '2018-11-20' },
  { id: 3, name: 'Linus', role: 'Engineer', age: 28, salary: 98000, joined: '2022-01-15' },
  { id: 4, name: 'Margaret', role: 'Manager', age: 52, salary: 180000, joined: '2015-07-01' },
];

export const baseColumns: TableColumn<Person>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'role', title: 'Role', dataIndex: 'role' },
  { key: 'age', title: 'Age', dataIndex: 'age' },
];

export const bodyNames = (container: HTMLElement, columnKey = 'name'): string[] =>
  Array.from(container.querySelectorAll(`tbody td[data-column-key="${columnKey}"]`)).map((cell) => cell.textContent ?? '');
