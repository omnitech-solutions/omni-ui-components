import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TagInput, type TagInputProps } from '@oc-tech/omni-ui-components/TagInput';

const Controlled: React.FC<Partial<TagInputProps>> = (props) => {
  const [value, setValue] = React.useState<string[]>(props.value ?? []);
  return <TagInput data-testid="t" label="Tags" {...props} value={value} onChange={setValue} />;
};

describe('omni-ui-components/TagInput', () => {
  it('renders existing chips', () => {
    render(<Controlled value={['react', 'tailwind']} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('tailwind')).toBeInTheDocument();
  });

  it('adds a chip on Enter', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByPlaceholderText('Add tag…');
    await user.type(input, 'new-chip{Enter}');
    expect(screen.getByText('new-chip')).toBeInTheDocument();
  });

  it('adds a chip on comma', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const input = screen.getByPlaceholderText('Add tag…');
    await user.type(input, 'chip-1,');
    expect(screen.getByText('chip-1')).toBeInTheDocument();
  });

  it('removes a chip when its X button is clicked', async () => {
    const user = userEvent.setup();
    render(<Controlled value={['x', 'y']} />);
    await user.click(screen.getByLabelText('Remove x'));
    expect(screen.queryByText('x')).not.toBeInTheDocument();
    expect(screen.getByText('y')).toBeInTheDocument();
  });

  it('does not add duplicates', async () => {
    const user = userEvent.setup();
    render(<Controlled value={['react']} />);
    await user.type(screen.getByRole('textbox'), 'react{Enter}');
    expect(screen.getAllByText('react').length).toBe(1);
  });

  it('respects maxItems', async () => {
    const user = userEvent.setup();
    render(<Controlled value={['a', 'b']} maxItems={2} />);
    await user.type(screen.getByRole('textbox'), 'c{Enter}');
    expect(screen.queryByText('c')).not.toBeInTheDocument();
  });
});
