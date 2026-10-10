import '@testing-library/jest-dom';

import {
  DEFAULT_TREE_SELECT_LABELS,
  TreeSelect,
  type TreeSelectNode,
  TreeSelectPrimitive,
  type TreeSelectPrimitiveProps,
} from '@oc-tech/omni-ui-components/TreeSelect';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

interface PlaceNode extends TreeSelectNode {
  code: string;
  children?: PlaceNode[];
}

const ontario: PlaceNode = { value: 'ontario', title: 'Ontario', code: 'CA-ON' };
const quebec: PlaceNode = { value: 'quebec', title: 'Quebec', code: 'CA-QC', disabled: true };
const canada: PlaceNode = {
  value: 'canada',
  title: 'Canada',
  code: 'CA',
  children: [ontario, quebec],
};
const ireland: PlaceNode = { value: 'ireland', title: 'Ireland', code: 'IE' };
const europe: PlaceNode = { value: 'europe', title: 'Europe', code: 'EU', children: [ireland] };
const remote: PlaceNode = { value: 'remote', title: 'Remote', code: 'XX' };
const places: PlaceNode[] = [europe, canada, remote];

const renderPrimitive = (overrides: Partial<TreeSelectPrimitiveProps<PlaceNode>> = {}) =>
  render(
    <TreeSelectPrimitive<PlaceNode>
      {...({
        id: 'place',
        'aria-label': 'Place',
        treeData: places,
        ...overrides,
      } as TreeSelectPrimitiveProps<PlaceNode>)}
    />,
  );

const trigger = () => screen.getByRole('combobox');
const item = (name: string) => screen.getByRole('treeitem', { name });
const itemNames = () => screen.getAllByRole('treeitem').map((element) => element.textContent);

describe('omni-ui-components/TreeSelect', () => {
  describe('trigger', () => {
    it('is a combobox button that announces a tree popup and carries the id', () => {
      renderPrimitive();
      expect(trigger().tagName).toBe('BUTTON');
      expect(trigger()).toHaveAttribute('id', 'place');
      expect(trigger()).toHaveAttribute('aria-haspopup', 'tree');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger()).toHaveAttribute('data-slot', 'tree-select-trigger');
      expect(trigger()).toHaveAccessibleName('Place');
    });

    it('shows the default placeholder, a labels override, then the placeholder prop', () => {
      const { rerender } = renderPrimitive();
      expect(trigger()).toHaveTextContent(DEFAULT_TREE_SELECT_LABELS.placeholder);
      expect(trigger()).toHaveAttribute('data-placeholder', 'true');
      rerender(
        <TreeSelectPrimitive treeData={places} labels={{ placeholder: 'Pick from labels' }} />,
      );
      expect(trigger()).toHaveTextContent('Pick from labels');
      rerender(
        <TreeSelectPrimitive
          treeData={places}
          labels={{ placeholder: 'Pick from labels' }}
          placeholder="Choose a place"
        />,
      );
      expect(trigger()).toHaveTextContent('Choose a place');
    });

    it('shows the title of a nested value and no placeholder flag', () => {
      renderPrimitive({ value: 'ontario' });
      expect(trigger()).toHaveTextContent('Ontario');
      expect(trigger()).not.toHaveAttribute('data-placeholder');
    });

    it('shows the placeholder for a value that is not in the tree', () => {
      renderPrimitive({ value: 'nowhere', placeholder: 'Choose' });
      expect(trigger()).toHaveTextContent('Choose');
    });

    it('applies variant, size and className through inputVariants', () => {
      renderPrimitive({ variant: 'ghost', inputSize: 'lg', className: 'mine' });
      expect(trigger().className).toContain('h-[var(--oui-field-height-xl)]');
      expect(trigger().className).toContain('bg-transparent');
      expect(trigger()).toHaveClass('mine');
    });

    it('forwards the ref to the trigger (object and callback refs)', () => {
      const objectRef = React.createRef<HTMLButtonElement>();
      const { unmount } = render(<TreeSelectPrimitive ref={objectRef} treeData={places} />);
      expect(objectRef.current).toBe(trigger());
      unmount();
      const callbackRef = jest.fn();
      render(<TreeSelectPrimitive ref={callbackRef} treeData={places} />);
      expect(callbackRef).toHaveBeenCalledWith(trigger());
    });

    it('uses data-testid for the trigger and its parts, falling back to the id', async () => {
      const user = userEvent.setup();
      const { unmount } = renderPrimitive({ 'data-testid': 'ts', defaultValue: 'remote' });
      expect(screen.getByTestId('ts')).toBe(trigger());
      await user.click(trigger());
      expect(screen.getByTestId('ts-tree')).toHaveAttribute('role', 'tree');
      expect(screen.getByTestId('ts-option-remote')).toHaveAttribute(
        'data-slot',
        'tree-select-item',
      );
      unmount();
      renderPrimitive();
      expect(screen.getByTestId('place')).toBe(trigger());
    });

    it('draws no test ids when neither id nor data-testid is given', async () => {
      const user = userEvent.setup();
      render(<TreeSelectPrimitive treeData={places} defaultValue="remote" allowClear />);
      await user.click(trigger());
      expect(screen.getByRole('tree')).not.toHaveAttribute('data-testid');
      expect(item('Remote')).not.toHaveAttribute('data-testid');
      expect(screen.getByRole('button', { name: 'Clear selection' })).not.toHaveAttribute(
        'data-testid',
      );
    });
  });

  describe('tree roles', () => {
    it('opens a tree of treeitems with level, position and expanded state', async () => {
      const user = userEvent.setup();
      renderPrimitive({ defaultExpandAll: true });
      await user.click(trigger());
      const tree = screen.getByRole('tree', { name: 'Place' });
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
      expect(trigger()).toHaveAttribute('aria-controls', tree.id);
      expect(tree).not.toHaveAttribute('aria-multiselectable');
      expect(itemNames()).toEqual(['Europe', 'Ireland', 'Canada', 'Ontario', 'Quebec', 'Remote']);
      expect(item('Europe')).toHaveAttribute('aria-level', '1');
      expect(item('Europe')).toHaveAttribute('aria-expanded', 'true');
      expect(item('Europe')).toHaveAttribute('aria-posinset', '1');
      expect(item('Europe')).toHaveAttribute('aria-setsize', '3');
      expect(item('Ontario')).toHaveAttribute('aria-level', '2');
      expect(item('Ontario')).not.toHaveAttribute('aria-expanded');
      expect(item('Quebec')).toHaveAttribute('aria-disabled', 'true');
      expect(item('Quebec')).not.toHaveAttribute('aria-selected');
      expect(item('Remote')).toHaveAttribute('aria-selected', 'false');
    });

    it('names the tree from labels when the control has no name, or by aria-labelledby', async () => {
      const user = userEvent.setup();
      const { unmount } = render(
        <TreeSelectPrimitive treeData={places} labels={{ tree: 'Places' }} />,
      );
      await user.click(trigger());
      expect(screen.getByRole('tree', { name: 'Places' })).toBeInTheDocument();
      unmount();
      render(
        <>
          <span id="outside">Outside name</span>
          <TreeSelectPrimitive treeData={places} aria-labelledby="outside" />
        </>,
      );
      await user.click(trigger());
      expect(screen.getByRole('tree', { name: 'Outside name' })).toBeInTheDocument();
      expect(trigger()).toHaveAccessibleName('Outside name');
    });

    it('says so when there is nothing to choose', async () => {
      const user = userEvent.setup();
      renderPrimitive({ treeData: [], labels: { empty: 'Nothing here' } });
      await user.click(trigger());
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
      expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    });

    it('portals the popover into the given container', async () => {
      const user = userEvent.setup();
      const host = document.createElement('div');
      document.body.appendChild(host);
      renderPrimitive({ container: host });
      await user.click(trigger());
      expect(within(host).getByRole('tree')).toBeInTheDocument();
      host.remove();
    });
  });

  describe('expansion', () => {
    it('opens only the ancestors of the current value by default', async () => {
      const user = userEvent.setup();
      renderPrimitive({ defaultValue: 'ontario' });
      await user.click(trigger());
      expect(itemNames()).toEqual(['Europe', 'Canada', 'Ontario', 'Quebec', 'Remote']);
      expect(item('Ontario')).toHaveAttribute('aria-selected', 'true');
      expect(item('Ontario')).toHaveFocus();
    });

    it('starts all collapsed with no value, and honours defaultExpandedKeys', async () => {
      const user = userEvent.setup();
      const { unmount } = renderPrimitive();
      await user.click(trigger());
      expect(itemNames()).toEqual(['Europe', 'Canada', 'Remote']);
      unmount();
      renderPrimitive({ defaultExpandedKeys: ['europe'], defaultExpandAll: true });
      await user.click(trigger());
      expect(itemNames()).toEqual(['Europe', 'Ireland', 'Canada', 'Remote']);
    });

    it('toggles a parent with its marker without choosing it', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const onExpandedChange = jest.fn();
      renderPrimitive({ onChange, onExpandedChange });
      await user.click(trigger());
      await user.click(screen.getByTestId('place-toggle-europe'));
      expect(itemNames()).toEqual(['Europe', 'Ireland', 'Canada', 'Remote']);
      expect(onExpandedChange).toHaveBeenLastCalledWith(['europe'], europe);
      expect(onExpandedChange.mock.calls[0][1]).toBe(europe);
      await user.click(screen.getByTestId('place-toggle-europe'));
      expect(itemNames()).toEqual(['Europe', 'Canada', 'Remote']);
      expect(onExpandedChange).toHaveBeenLastCalledWith([], europe);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('treats the marker of a leaf as part of the row', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ onChange });
      await user.click(trigger());
      await user.click(screen.getByTestId('place-toggle-remote'));
      expect(onChange).toHaveBeenCalledWith('remote', remote);
    });

    it('follows controlled expandedKeys and still reports the request', async () => {
      const user = userEvent.setup();
      const onExpandedChange = jest.fn();
      const { rerender } = renderPrimitive({ expandedKeys: [], onExpandedChange });
      await user.click(trigger());
      await user.keyboard('{ArrowRight}');
      expect(onExpandedChange).toHaveBeenCalledWith(['europe'], europe);
      expect(itemNames()).toEqual(['Europe', 'Canada', 'Remote']);
      rerender(
        <TreeSelectPrimitive<PlaceNode>
          id="place"
          aria-label="Place"
          treeData={places}
          expandedKeys={['europe']}
          onExpandedChange={onExpandedChange}
        />,
      );
      expect(itemNames()).toEqual(['Europe', 'Ireland', 'Canada', 'Remote']);
    });
  });

  describe('single mode', () => {
    it('commits a click, closes, shows the title and returns focus (uncontrolled)', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const onOpenChange = jest.fn();
      renderPrimitive({ onChange, onOpenChange });
      await user.click(trigger());
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      await user.click(item('Remote'));
      expect(onChange).toHaveBeenCalledWith('remote', remote);
      expect(onChange.mock.calls[0][1]).toBe(remote);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(screen.queryByRole('tree')).not.toBeInTheDocument();
      expect(trigger()).toHaveTextContent('Remote');
      expect(trigger()).toHaveFocus();
    });

    it('keeps showing a controlled value until the owner changes it', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const { rerender } = renderPrimitive({ value: 'remote', onChange });
      await user.click(trigger());
      await user.click(item('Canada'));
      expect(onChange).toHaveBeenCalledWith('canada', canada);
      expect(trigger()).toHaveTextContent('Remote');
      rerender(
        <TreeSelectPrimitive<PlaceNode>
          id="place"
          aria-label="Place"
          treeData={places}
          value="canada"
          onChange={onChange}
        />,
      );
      expect(trigger()).toHaveTextContent('Canada');
    });

    it('cannot choose a disabled node by pointer or keyboard', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ onChange, defaultExpandAll: true });
      await user.click(trigger());
      await user.click(item('Quebec'));
      expect(item('Quebec')).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('with selectableParents off, a parent opens and closes instead of being chosen', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ onChange, selectableParents: false });
      await user.click(trigger());
      expect(item('Europe')).not.toHaveAttribute('aria-selected');
      await user.click(item('Europe'));
      expect(itemNames()).toEqual(['Europe', 'Ireland', 'Canada', 'Remote']);
      await user.keyboard('{Enter}');
      expect(itemNames()).toEqual(['Europe', 'Canada', 'Remote']);
      expect(onChange).not.toHaveBeenCalled();
      await user.keyboard(' {ArrowDown}{Enter}');
      expect(onChange).toHaveBeenCalledWith('ireland', ireland);
    });

    it('writes the value to a hidden input when named', () => {
      const { container } = renderPrimitive({ name: 'place', value: 'remote' });
      const hidden = container.querySelectorAll('input[type="hidden"][name="place"]');
      expect(hidden).toHaveLength(1);
      expect(hidden[0]).toHaveValue('remote');
    });
  });

  describe('multiple mode', () => {
    it('checks nodes independently, stays open and reports nodes by reference', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ mode: 'multiple', onChange, defaultExpandAll: true });
      await user.click(trigger());
      expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
      expect(item('Canada')).toHaveAttribute('aria-checked', 'false');
      expect(item('Canada')).not.toHaveAttribute('aria-selected');
      await user.click(item('Canada'));
      expect(onChange).toHaveBeenLastCalledWith(['canada'], [canada]);
      expect(onChange.mock.calls[0][1][0]).toBe(canada);
      expect(item('Canada')).toHaveAttribute('aria-checked', 'true');
      expect(item('Ontario')).toHaveAttribute('aria-checked', 'false');
      await user.click(item('Remote'));
      expect(onChange).toHaveBeenLastCalledWith(['canada', 'remote'], [canada, remote]);
      expect(trigger()).toHaveTextContent('Canada, Remote');
      await user.click(item('Canada'));
      expect(onChange).toHaveBeenLastCalledWith(['remote'], [remote]);
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('follows a controlled list and drops values that are not in the tree from the nodes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ mode: 'multiple', value: ['ireland', 'gone'], onChange });
      expect(trigger()).toHaveTextContent('Ireland');
      await user.click(trigger());
      expect(item('Ireland')).toHaveFocus();
      await user.click(item('Remote'));
      expect(onChange).toHaveBeenCalledWith(['ireland', 'gone', 'remote'], [ireland, remote]);
      expect(item('Remote')).toHaveAttribute('aria-checked', 'false');
    });

    it('gives a disabled node no checked state and writes one hidden input per value', async () => {
      const user = userEvent.setup();
      const { container } = renderPrimitive({
        mode: 'multiple',
        name: 'places',
        defaultValue: ['ireland', 'remote'],
        defaultExpandAll: true,
      });
      expect(container.querySelectorAll('input[type="hidden"][name="places"]')).toHaveLength(2);
      await user.click(trigger());
      expect(item('Quebec')).not.toHaveAttribute('aria-checked');
    });
  });

  describe('keyboard', () => {
    it('opens from the trigger with Enter, Space, ArrowDown and ArrowUp, focusing the first item', async () => {
      const user = userEvent.setup();
      renderPrimitive();
      for (const key of ['{Enter}', ' ', '{ArrowDown}', '{ArrowUp}']) {
        trigger().focus();
        await user.keyboard(key);
        expect(item('Europe')).toHaveFocus();
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('tree')).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();
      }
    });

    it('ignores other keys on the trigger', async () => {
      const user = userEvent.setup();
      renderPrimitive();
      trigger().focus();
      await user.keyboard('a{ArrowRight}');
      expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    });

    it('moves with the arrows, Home and End, expanding and collapsing parents', async () => {
      const user = userEvent.setup();
      renderPrimitive();
      trigger().focus();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      expect(item('Europe')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(item('Europe')).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(item('Canada')).toHaveFocus();
      expect(item('Canada')).toHaveAttribute('tabindex', '0');
      expect(item('Europe')).toHaveAttribute('tabindex', '-1');
      await user.keyboard('{ArrowRight}');
      expect(item('Canada')).toHaveAttribute('aria-expanded', 'true');
      expect(item('Canada')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(item('Ontario')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(item('Ontario')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(item('Canada')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(item('Canada')).toHaveAttribute('aria-expanded', 'false');
      await user.keyboard('{End}');
      expect(item('Remote')).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(item('Remote')).toHaveFocus();
      await user.keyboard('{Home}');
      expect(item('Europe')).toHaveFocus();
      await user.keyboard('x');
      expect(item('Europe')).toHaveFocus();
    });

    it('Enter commits and closes in single mode', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ onChange });
      trigger().focus();
      await user.keyboard('{ArrowDown}{End}{Enter}');
      expect(onChange).toHaveBeenCalledWith('remote', remote);
      expect(screen.queryByRole('tree')).not.toBeInTheDocument();
      expect(trigger()).toHaveFocus();
    });

    it('Space toggles and stays open in multiple mode', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ mode: 'multiple', onChange });
      trigger().focus();
      await user.keyboard('{ArrowDown} {End}{Enter}');
      expect(onChange).toHaveBeenLastCalledWith(['europe', 'remote'], [europe, remote]);
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('Tab closes back to the trigger', async () => {
      const user = userEvent.setup();
      renderPrimitive();
      trigger().focus();
      await user.keyboard('{ArrowDown}{Tab}');
      expect(screen.queryByRole('tree')).not.toBeInTheDocument();
      expect(trigger()).toHaveFocus();
    });
  });

  describe('open state', () => {
    it('opens at first render with defaultOpen', () => {
      renderPrimitive({ defaultOpen: true });
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('follows a controlled open and reports the request to close', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      renderPrimitive({ open: true, onOpenChange });
      await user.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });
  });

  describe('clear', () => {
    it('clears a single value, reports no node and focuses the trigger', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({ allowClear: true, defaultValue: 'remote', onChange });
      await user.click(screen.getByRole('button', { name: 'Clear selection' }));
      expect(onChange).toHaveBeenCalledWith('', undefined);
      expect(trigger()).toHaveAttribute('data-placeholder', 'true');
      expect(trigger()).toHaveFocus();
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
    });

    it('clears a list and takes its name from labels', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      renderPrimitive({
        mode: 'multiple',
        allowClear: true,
        defaultValue: ['remote'],
        onChange,
        labels: { clear: 'Remove all' },
      });
      await user.click(screen.getByTestId('place-clear'));
      expect(screen.queryByRole('button', { name: 'Remove all' })).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledWith([], []);
    });

    it('is not drawn while disabled, read-only or empty', () => {
      const { rerender } = renderPrimitive({ allowClear: true });
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
      rerender(<TreeSelectPrimitive treeData={places} allowClear value="remote" readOnly />);
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
      rerender(<TreeSelectPrimitive treeData={places} allowClear value="remote" disabled />);
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('disabled: cannot be opened', async () => {
      const user = userEvent.setup();
      renderPrimitive({ disabled: true, defaultOpen: true });
      expect(trigger()).toBeDisabled();
      await user.click(trigger());
      expect(screen.queryByRole('tree')).not.toBeInTheDocument();
    });

    it('read-only: focusable and announced, but the popover does not open', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      renderPrimitive({ readOnly: true, value: 'remote', onOpenChange });
      expect(trigger()).toHaveAttribute('aria-readonly', 'true');
      await user.tab();
      expect(trigger()).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      await user.click(trigger());
      expect(screen.queryByRole('tree')).not.toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(trigger()).toHaveTextContent('Remote');
    });

    it('required and invalid are announced on the trigger', () => {
      const { rerender } = renderPrimitive();
      expect(trigger()).not.toHaveAttribute('aria-required');
      expect(trigger()).not.toHaveAttribute('aria-invalid');
      rerender(<TreeSelectPrimitive treeData={places} required invalid />);
      expect(trigger()).toHaveAttribute('aria-required', 'true');
      expect(trigger()).toHaveAttribute('aria-invalid', 'true');
      expect(trigger().className).toContain('aria-invalid:border-[var(--oui-border-invalid)]');
    });

    it('passes aria-describedby through', () => {
      renderPrimitive({ 'aria-describedby': 'hint' });
      expect(trigger()).toHaveAttribute('aria-describedby', 'hint');
    });

    it('accepts caller icons', async () => {
      const user = userEvent.setup();
      renderPrimitive({
        defaultValue: 'remote',
        allowClear: true,
        chevronIcon: <i data-testid="chevron" />,
        toggleIcon: <i data-testid="toggle" />,
        checkIcon: <i data-testid="check" />,
        clearIcon: <i data-testid="clear" />,
      });
      await user.click(trigger());
      expect(screen.getByTestId('chevron')).toBeInTheDocument();
      expect(screen.getByTestId('clear')).toBeInTheDocument();
      expect(screen.getByTestId('check')).toBeInTheDocument();
      expect(screen.getAllByTestId('toggle')).toHaveLength(3);
    });
  });

  describe('chrome layer', () => {
    it('stays compatible with the overview usage', () => {
      render(
        <TreeSelect
          label="Location"
          value=""
          onChange={() => undefined}
          treeData={[{ value: 'workspace', title: 'Workspace' }]}
        />,
      );
      expect(screen.getByLabelText('Location')).toBe(trigger());
    });

    it('labels the trigger and the tree, and a click on the label focuses the trigger', async () => {
      const user = userEvent.setup();
      render(<TreeSelect id="loc" label="Location" treeData={places} />);
      expect(trigger()).toHaveAttribute('id', 'loc');
      expect(trigger()).toHaveAccessibleName('Location');
      await user.click(trigger());
      expect(screen.getByRole('tree', { name: 'Location' })).toBeInTheDocument();
    });

    it('keeps a caller aria-labelledby and works without a label', () => {
      const { rerender } = render(
        <>
          <span id="own">Own name</span>
          <TreeSelect label="Location" aria-labelledby="own" treeData={places} />
        </>,
      );
      expect(trigger()).toHaveAccessibleName('Own name');
      rerender(<TreeSelect aria-label="Bare" treeData={places} />);
      expect(trigger()).toHaveAccessibleName('Bare');
      expect(trigger()).not.toHaveAttribute('aria-labelledby');
    });

    it('describes the trigger by the description, joined with a caller id', () => {
      render(
        <TreeSelect
          id="loc"
          label="Location"
          description="Where the team is"
          aria-describedby="extra"
          treeData={places}
        />,
      );
      expect(screen.getByText('Where the team is')).toHaveAttribute('id', 'loc-description');
      expect(trigger()).toHaveAttribute('aria-describedby', 'extra loc-description');
    });

    it('shows the error as an alert and marks the trigger invalid', () => {
      render(<TreeSelect id="loc" label="Location" error="Choose a location" treeData={places} />);
      expect(screen.getByRole('alert')).toHaveTextContent('Choose a location');
      expect(trigger()).toHaveAttribute('aria-invalid', 'true');
      expect(trigger()).toHaveAttribute('aria-describedby', 'loc-error');
    });

    it('marks a required field on the label and the trigger', () => {
      render(<TreeSelect label="Location" required treeData={places} />);
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(trigger()).toHaveAttribute('aria-required', 'true');
    });

    it('lays out horizontally and forwards the ref', () => {
      const ref = React.createRef<HTMLButtonElement>();
      const { container } = render(
        <TreeSelect ref={ref} label="Location" layout="horizontal" treeData={places} />,
      );
      expect(container.querySelector('[data-layout="horizontal"]')).toBeInTheDocument();
      expect(ref.current).toBe(trigger());
    });

    it('hands an extended node back by reference, in both modes', async () => {
      const user = userEvent.setup();
      const onSingle = jest.fn<void, [string, PlaceNode | undefined]>();
      const { unmount } = render(
        <TreeSelect<PlaceNode> label="Location" treeData={places} onChange={onSingle} />,
      );
      await user.click(trigger());
      await user.click(item('Remote'));
      expect(onSingle.mock.calls[0][1]).toBe(remote);
      expect(onSingle.mock.calls[0][1]?.code).toBe('XX');
      unmount();
      const onMultiple = jest.fn<void, [string[], PlaceNode[]]>();
      render(
        <TreeSelect<PlaceNode>
          mode="multiple"
          label="Location"
          treeData={places}
          onChange={onMultiple}
        />,
      );
      await user.click(trigger());
      await user.click(item('Europe'));
      expect(onMultiple.mock.calls[0][1][0]).toBe(europe);
    });
  });
});
