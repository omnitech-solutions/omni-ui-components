import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { Cascader, type CascaderOption } from '../../src/Cascader/Cascader';

const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [{ value: 'west-lake', label: 'West Lake' }],
      },
      { value: 'ningbo', label: 'Ningbo', disabled: true },
    ],
  },
  { value: 'beijing', label: 'Beijing' },
];

describe('omni-ui-components/Cascader', () => {
  it('lists only leaf options, labelled with their parent path', () => {
    render(<Cascader aria-label="Region" options={options} />);
    const labels = screen.getAllByRole('option').map((o) => o.textContent);
    // Parent segments use their labels (not their values).
    expect(labels).toEqual(['Zhejiang / Hangzhou / West Lake', 'Zhejiang / Ningbo', 'Beijing']);
  });

  it('reports the full value path and every option along it', () => {
    const onChange = vi.fn();
    render(<Cascader aria-label="Region" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'west-lake' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    const [path, selected] = onChange.mock.calls[0];
    expect(path).toEqual(['zhejiang', 'hangzhou', 'west-lake']);
    expect(selected.map((o: CascaderOption) => o.value)).toEqual(['zhejiang', 'hangzhou', 'west-lake']);
    expect(selected[0]).toBe(options[0]);
    expect(selected[1]).toBe(options[0].children![0]);
  });

  it('reports a single-element path for a top-level leaf', () => {
    const onChange = vi.fn();
    render(<Cascader aria-label="Region" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'beijing' } });
    expect(onChange).toHaveBeenCalledWith(['beijing'], [options[1]]);
  });

  it('does nothing when the value matches no leaf', () => {
    const onChange = vi.fn();
    render(<Cascader aria-label="Region" options={options} onChange={onChange} />);
    const select = screen.getByLabelText('Region') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'nowhere' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not throw without an onChange handler', () => {
    render(<Cascader aria-label="Region" options={options} />);
    expect(() => fireEvent.change(screen.getByLabelText('Region'), { target: { value: 'beijing' } })).not.toThrow();
  });

  it('selects the last element of value or defaultValue and disables disabled leaves', () => {
    const { unmount } = render(<Cascader aria-label="Region" options={options} value={['zhejiang', 'hangzhou', 'west-lake']} onChange={() => undefined} />);
    expect((screen.getByLabelText('Region') as HTMLSelectElement).value).toBe('west-lake');
    expect(screen.getByRole('option', { name: 'Zhejiang / Ningbo' })).toBeDisabled();
    unmount();

    render(<Cascader aria-label="Region" options={options} defaultValue={['beijing']} />);
    expect((screen.getByLabelText('Region') as HTMLSelectElement).value).toBe('beijing');
  });

  it('forwards the ref', () => {
    const ref = { current: null as HTMLSelectElement | null };
    render(<Cascader ref={ref} aria-label="Region" options={options} />);
    expect(ref.current).toBe(screen.getByLabelText('Region'));
  });
});
