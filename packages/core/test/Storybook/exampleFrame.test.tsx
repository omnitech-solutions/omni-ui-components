import '@testing-library/jest-dom';

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { componentNameOf } from '../../../../.storybook/internal/support/componentName';
import { ExampleFrame } from '../../../../.storybook/internal/support/ExampleFrame';
import {
  recordRenderedSource,
  registerExample,
  resolveExampleCode,
  useExampleRecord,
} from '../../../../.storybook/internal/support/exampleStore';
import { storySourceToExample } from '../../../../.storybook/internal/support/storySource';
import { activeItemId } from '../../../../.storybook/internal/support/TableOfContents';

const show = () => screen.getByRole('button', { name: 'Show code' });

describe('Storybook ExampleFrame', () => {
  it('draws the example with its title and description, and one code bar of library buttons', () => {
    render(
      <ExampleFrame eyebrow="Button" title="Ghost" description="A quiet action." code="<Button />">
        <span>the example</span>
      </ExampleFrame>,
    );
    expect(screen.getByRole('heading', { name: 'Ghost' })).toBeInTheDocument();
    expect(screen.getByText('A quiet action.')).toBeInTheDocument();
    expect(screen.getByText('the example')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((each) => each.textContent)).toEqual(['Show code', 'Copy code']);
    // The library's own Button, ghost and small.
    for (const button of buttons) {
      expect(button).toHaveAttribute('data-slot', 'button');
      expect(button).toHaveAttribute('data-variant', 'ghost');
      expect(button).toHaveAttribute('data-button-size', 'sm');
    }
    expect(show()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('region', { name: 'Example code' })).not.toBeInTheDocument();
  });

  it('has no code bar without code, or with showCode={false}', () => {
    const { rerender } = render(<ExampleFrame title="Plain">x</ExampleFrame>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(
      <ExampleFrame title="Plain" code="<a />" showCode={false}>
        x
      </ExampleFrame>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(
      <ExampleFrame title="Plain" code="">
        x
      </ExampleFrame>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('asks a code function for the code on first open only, formats it, and hides it again', async () => {
    const code = vi.fn(async () => 'const a = {b:1}\nexport const Example = () => <i>x</i>');
    render(<ExampleFrame code={code}>x</ExampleFrame>);
    expect(code).not.toHaveBeenCalled();
    await userEvent.click(show());
    const region = await screen.findByRole('region', { name: 'Example code' });
    await waitFor(() => expect(region).toHaveTextContent('const a = { b: 1 };'));
    expect(screen.getByRole('button', { name: 'Hide code' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Hide code' }));
    expect(screen.queryByRole('region', { name: 'Example code' })).not.toBeInTheDocument();
    await userEvent.click(show());
    await screen.findByRole('region', { name: 'Example code' });
    expect(code).toHaveBeenCalledTimes(1);
  });

  it('leaves printed JSX as it is (no added semicolon) and says so when code cannot be loaded', async () => {
    const { unmount } = render(<ExampleFrame code={'<Button>\n  Save\n</Button>'}>x</ExampleFrame>);
    await userEvent.click(show());
    const region = await screen.findByRole('region', { name: 'Example code' });
    await waitFor(() => expect(region.textContent).toBe('<Button>\n  Save\n</Button>'));
    unmount();
    render(<ExampleFrame code={() => Promise.reject(new Error('gone'))}>x</ExampleFrame>);
    await userEvent.click(show());
    expect(
      await screen.findByText('The code for this example could not be loaded.'),
    ).toBeInTheDocument();
  });

  it('copies the code with its one copy control, without opening it', async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ExampleFrame code={() => 'const a = 1'}>x</ExampleFrame>);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('const a = 1;'));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.queryByRole('region', { name: 'Example code' })).not.toBeInTheDocument();
  });

  it('draws a labelled map of snippets as tabs and copies the chosen one', async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(
      <ExampleFrame code={{ Skeleton: 'const a = 1;', Spinner: 'const b = 2;' }}>x</ExampleFrame>,
    );
    await userEvent.click(show());
    const tabs = await screen.findAllByRole('tab');
    expect(tabs.map((each) => each.textContent)).toEqual(['Skeleton', 'Spinner']);
    expect(screen.getByRole('region', { name: 'Example code' })).toHaveTextContent('const a = 1;');
    await userEvent.click(screen.getByRole('tab', { name: 'Spinner' }));
    await waitFor(() =>
      expect(screen.getByRole('region', { name: 'Example code' })).toHaveTextContent(
        'const b = 2;',
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('const b = 2;'));
  });

  it('places the example by its layout', () => {
    const { container, rerender } = render(<ExampleFrame layout="centered">x</ExampleFrame>);
    const preview = () => container.querySelector('.pb-example-preview');
    expect(preview()).toHaveAttribute('data-layout', 'centered');
    rerender(<ExampleFrame>x</ExampleFrame>);
    expect(preview()).toHaveAttribute('data-layout', 'padded');
  });

  describe('defer', () => {
    let notify: (intersecting: boolean) => void = () => undefined;
    const observed: Element[] = [];
    beforeEach(() => {
      observed.length = 0;
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
            notify = (isIntersecting) => callback([{ isIntersecting }]);
          }
          observe(element: Element) {
            observed.push(element);
          }
          disconnect() {}
        },
      );
    });
    afterEach(() => vi.unstubAllGlobals());

    it('keeps the anchor and a placeholder of the reserved height until the frame is near the window, then stays mounted', () => {
      const { container } = render(
        <ExampleFrame id="component-button" defer deferHeight={180} code="<a />" title="Button">
          <span>the example</span>
        </ExampleFrame>,
      );
      const frame = container.querySelector('#component-button') as HTMLElement;
      expect(observed).toEqual([frame]);
      expect(screen.getByRole('heading', { name: 'Button' })).toBeInTheDocument();
      expect(screen.queryByText('the example')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(container.querySelector('.pb-example-placeholder')).toHaveStyle({
        minHeight: '180px',
      });
      act(() => notify(true));
      expect(screen.getByText('the example')).toBeInTheDocument();
      expect(show()).toBeInTheDocument();
      // Far from the window again: still mounted, and the browser may skip its layout at the height it has.
      act(() => notify(false));
      expect(screen.getByText('the example')).toBeInTheDocument();
      expect(frame).toHaveAttribute('data-far');
      act(() => notify(true));
      expect(frame).not.toHaveAttribute('data-far');
    });
  });

  describe('host (the story view)', () => {
    it('makes the host the preview box and draws the header and the code bar outside it', () => {
      const root = document.createElement('div');
      root.id = 'storybook-root';
      document.body.append(root);
      const { unmount } = render(
        <ExampleFrame host={root} eyebrow="Button" title="Ghost" code="<a />" layout="centered">
          <button type="button">Save</button>
        </ExampleFrame>,
        { container: root },
      );
      // The story's own element holds the story alone: a play function finds one button.
      expect(within(root).getAllByRole('button')).toHaveLength(1);
      expect(root).toHaveClass('pb-example-preview');
      expect(root).toHaveAttribute('data-layout', 'centered');
      expect(root.previousElementSibling).toHaveTextContent('ButtonGhost');
      expect(
        within(root.nextElementSibling as HTMLElement).getByRole('button', { name: 'Show code' }),
      ).toBeInTheDocument();
      unmount();
      expect(root).not.toHaveClass('pb-example-preview');
      expect(root).not.toHaveAttribute('data-layout');
      expect(document.querySelectorAll('.pb-example-slot')).toHaveLength(0);
      root.remove();
    });
  });
});

describe('Storybook example code', () => {
  it('takes the first that exists: registered, parameters.example, hand-written, printed from args, the story source', () => {
    const parameters = {
      example: { code: 'from exampleDocs' },
      docs: { source: { code: 'hand-written', originalSource: '{ render: () => <A /> }' } },
    };
    expect(resolveExampleCode({ code: 'registered', rendered: '<A />' }, parameters)).toBe(
      'registered',
    );
    expect(resolveExampleCode({ rendered: '<A />' }, parameters)).toBe('from exampleDocs');
    expect(resolveExampleCode({ rendered: '<A />' }, { docs: parameters.docs })).toBe(
      'hand-written',
    );
    expect(
      resolveExampleCode({ rendered: '<A b />' }, { docs: { source: { originalSource: '{}' } } }),
    ).toBe('<A b />');
    expect(
      resolveExampleCode({}, { docs: { source: { originalSource: '{ render: () => (<A />) }' } } }),
    ).toBe('<A />');
    expect(resolveExampleCode({}, undefined)).toBeUndefined();
  });

  it('a story registers what its frame shows, and the printed JSX is kept beside it', () => {
    const seen: unknown[] = [];
    const Probe = () => {
      seen.push(useExampleRecord('table--sorting'));
      return null;
    };
    render(<Probe />);
    act(() => recordRenderedSource('table--sorting', '<Table />'));
    act(() => registerExample('table--sorting', { title: 'Sorting', code: 'const columns = [];' }));
    expect(seen.at(-1)).toEqual({
      rendered: '<Table />',
      title: 'Sorting',
      code: 'const columns = [];',
    });
    const count = seen.length;
    // The same values again publish nothing.
    act(() => registerExample('table--sorting', { title: 'Sorting', code: 'const columns = [];' }));
    expect(seen).toHaveLength(count);
  });

  it('reduces a story as written to the example it renders', () => {
    expect(
      storySourceToExample(
        '{\n  render: () => (\n    <App>\n      <div className="p-4">It\'s a shell (really)</div>\n    </App>\n  ),\n  play: async () => {}\n}',
      ),
    ).toBe('<App>\n  <div className="p-4">It\'s a shell (really)</div>\n</App>');
    // As Storybook prints a story: JSX with no brackets around it, and other properties after it.
    expect(storySourceToExample('{\n  render: () => <Rate defaultValue={3} />\n}')).toBe(
      '<Rate defaultValue={3} />',
    );
    expect(
      storySourceToExample(
        '{\n  render: () => <div className="p-4">\n      <Affix offsetTop={0}>Sticky, with a comma</Affix>\n    </div>,\n  play: async ({\n    canvasElement\n  }) => {}\n}',
      ),
    ).toBe('<div className="p-4">\n  <Affix offsetTop={0}>Sticky, with a comma</Affix>\n</div>');
    expect(
      storySourceToExample(
        '{\n  render: args => {\n    const [on, setOn] = React.useState(false);\n    return <Switch {...args} checked={on} onChange={setOn} />;\n  }\n}',
      ),
    ).toBe(
      'const Example = args => {\n  const [on, setOn] = React.useState(false);\n  return <Switch {...args} checked={on} onChange={setOn} />;\n};',
    );
    // `render` after other properties.
    expect(
      storySourceToExample(
        '{\n  parameters: {\n    layout: \'padded\'\n  },\n  render: () => <Row tone="danger" />,\n  play: async () => {}\n}',
      ),
    ).toBe('<Row tone="danger" />');
    expect(storySourceToExample("{\n  args: { children: 'OR' }\n}")).toBe(
      "{\n  args: { children: 'OR' }\n}",
    );
  });

  it('names a component as it is written in JSX, through memo and forwardRef', () => {
    const Inner = React.forwardRef<HTMLDivElement>(function ButtonInner(_props, ref) {
      return <div ref={ref} />;
    });
    expect(componentNameOf(React.memo(Inner))).toBe('Button');
    const Named = React.forwardRef<HTMLDivElement>((_props, ref) => <div ref={ref} />);
    Named.displayName = 'TabsBar';
    expect(componentNameOf(React.memo(Named))).toBe('TabsBar');
    expect(componentNameOf('div')).toBe('div');
    expect(componentNameOf(React.Fragment)).toBe('React.Fragment');
    expect(componentNameOf(function TableImpl() {})).toBe('Table');
    expect(componentNameOf({})).toBe('Component');
  });
});

describe('Storybook table of contents', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }].map((each) => ({
    ...each,
    label: each.id,
  }));
  it('marks the first item at the top of the page, then the last section that reached the reading line', () => {
    expect(activeItemId(items, (id) => ({ a: 300, b: 900, c: 1500 })[id])).toBe('a');
    expect(activeItemId(items, (id) => ({ a: -400, b: 100, c: 700 })[id])).toBe('b');
    expect(activeItemId(items, (id) => ({ a: -900, b: -400, c: 40 })[id])).toBe('c');
    // A section that is not in the page is passed over.
    expect(activeItemId(items, (id) => ({ a: -900, c: 40 })[id as 'a' | 'c'])).toBe('c');
    expect(activeItemId([], () => 0)).toBeUndefined();
  });
});
