import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmptyStarters } from '@oc-tech/omni-ui-components/EmptyStarters';
import { emptyStartersPropsFactory, emptyStartersVariants, sampleStarters } from 'factories/omni-ui-components/EmptyStarters/EmptyStarters.factories';

describe('omni-ui-components/EmptyStarters', () => {
  it('renders the heading, the description and one card per starter with title and subtitle', () => {
    render(<EmptyStarters {...emptyStartersPropsFactory()} />);
    expect(screen.getByRole('heading', { name: 'What are we working on?' })).toBeInTheDocument();
    expect(screen.getByText('Ask anything, or pick a starter.')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Suggested prompts' }).querySelectorAll('[data-slot="empty-starter"]')).toHaveLength(sampleStarters().length);
    expect(screen.getByText('Spoken in 60 seconds')).toBeInTheDocument();
  });

  it('chooses a starter: onStart gets the prompt and the starter', async () => {
    const onStart = jest.fn();
    render(<EmptyStarters {...emptyStartersPropsFactory({ onStart })} />);
    await userEvent.click(screen.getByRole('button', { name: /Solve a coding question/ }));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({ title: 'Solve a coding question', prompt: 'Solve Two Sum in TypeScript' }));
  });

  it('has no card group without starters, and a subtitle-less card still renders', () => {
    const { rerender } = render(<EmptyStarters {...emptyStartersPropsFactory({ starters: [] })} />);
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    rerender(<EmptyStarters {...emptyStartersPropsFactory({ starters: [{ title: 'Mock interview', prompt: '/mock' }] })} />);
    expect(screen.getByRole('button', { name: 'Mock interview' })).toBeInTheDocument();
  });

  it('applies the column count and translates the group name', () => {
    render(<EmptyStarters {...emptyStartersPropsFactory({ columns: 3, labels: { starters: 'Sugerencias' } })} />);
    const group = screen.getByRole('group', { name: 'Sugerencias' });
    expect(group).toHaveClass('sm:grid-cols-3');
  });

  it('renders every factory variant', () => {
    emptyStartersVariants.forEach((variant) => {
      const { unmount } = render(<EmptyStarters {...emptyStartersPropsFactory(variant.args)} />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
      unmount();
    });
  });
});
