import '@testing-library/jest-dom';

import { type SuggestionItem, Suggestions } from '@oc-tech/omni-ui-components/Suggestions';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { suggestionsPropsFactory } from 'factories/omni-ui-components/Suggestions/Suggestions.factories';
import { expectTypeOf } from 'vitest';

describe('omni-ui-components/Suggestions', () => {
  it('draws a labelled column of chips with the icon node', () => {
    render(<Suggestions {...suggestionsPropsFactory()} />);
    const group = screen.getByRole('group', { name: 'Follow-up suggestions' });
    expect(group).toHaveAttribute('data-layout', 'column');
    expect(within(group).getAllByRole('button')).toHaveLength(3);
    expect(group.querySelector('svg')).not.toBeNull();
  });

  it('selecting sends the full item, by reference, and its index', async () => {
    const onSelect = vi.fn();
    const props = suggestionsPropsFactory({ onSelect });
    render(<Suggestions {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'What if the array is sorted?' }));
    expect(onSelect.mock.calls[0]![0]).toBe(props.items[1]);
    expect(onSelect.mock.calls[0]![1]).toBe(1);
  });

  it('an extended suggestion reaches onSelect and renderItem by reference; its extra fields are typed', async () => {
    type Followup = SuggestionItem & { prompt: string };
    const items: Followup[] = [{ id: 'a', label: 'Show a test', prompt: 'Write a test for it' }];
    const onSelect = vi.fn((item: Followup) => {
      expectTypeOf(item.prompt).toEqualTypeOf<string>();
    });
    render(
      <Suggestions<Followup>
        items={items}
        onSelect={onSelect}
        renderItem={(item) => <i>{item.prompt}</i>}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Write a test for it' }));
    expect(onSelect.mock.calls[0]![0]).toBe(items[0]);
  });

  it('disabled blocks selection; wrap layout and label are config; empty renders nothing', async () => {
    const onSelect = vi.fn();
    const { container, rerender } = render(
      <Suggestions
        {...suggestionsPropsFactory({
          onSelect,
          disabled: true,
          layout: 'wrap',
          label: 'Next',
        })}
      />,
    );
    await userEvent.click(screen.getAllByRole('button')[0]!);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Next' })).toHaveAttribute('data-layout', 'wrap');
    rerender(<Suggestions items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing without onSelect', () => {
    const { container } = render(<Suggestions items={[{ id: 'a', label: 'a' }]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
