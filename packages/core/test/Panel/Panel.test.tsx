import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, within } from '@testing-library/react';

import { Panel, type PanelProps } from '@oc-tech/omni-ui-components/Panel';
import { Button } from '@oc-tech/omni-ui-components/Button';
import { Tag } from '@oc-tech/omni-ui-components/Tag';
import { NativePanelsDemo, panelPropsFactory, panelVariants, TranscriptDemo } from 'factories/omni-ui-components/Panel/Panel.factories';

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('omni-ui-components/Panel', () => {
  describe('semantics', () => {
    it('is a region named by its title', () => {
      render(<Panel title="Answer">body</Panel>);
      const region = screen.getByRole('region', { name: 'Answer' });
      expect(region.tagName).toBe('SECTION');
      expect(region).toHaveAttribute('data-slot', 'panel');
    });

    it('`as` changes the element and keeps the region role and name', () => {
      render(
        <Panel title="Code" as="aside">
          x
        </Panel>,
      );
      const region = screen.getByRole('region', { name: 'Code' });
      expect(region.tagName).toBe('ASIDE');
    });

    it('aria-labelledby overrides the title as the region name', () => {
      render(
        <>
          <h2 id="other">Another name</h2>
          <Panel title="Answer" aria-labelledby="other" />
        </>,
      );
      expect(screen.getByRole('region', { name: 'Another name' })).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Answer' })).toBeNull();
    });

    it('exposes data-slot hooks for the panel, header, body and dock', () => {
      render(
        <Panel title="Answer" dock="dock">
          body
        </Panel>,
      );
      for (const name of ['panel', 'panel-header', 'panel-body', 'panel-dock']) expect(slot(name)).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('is the 40px header token with a 1px separator and holds title, subtitle, meta and actions in that order', () => {
      render(
        <Panel title="Answer" subtitle="S2 · 10:57" meta="Last capture 08:33" actions={<Button>Stop</Button>}>
          body
        </Panel>,
      );
      const header = slot('panel-header');
      expect(header).toHaveClass('h-[var(--oui-panel-header-height)]', 'border-b');
      const order = Array.from(header.querySelectorAll('[data-slot^="panel-"]')).map((el) => el.getAttribute('data-slot'));
      expect(order).toEqual(['panel-title', 'panel-subtitle', 'panel-header-end', 'panel-meta', 'panel-actions']);
      expect(within(slot('panel-actions')).getByRole('button', { name: 'Stop' })).toBeInTheDocument();
    });

    it('has only a title when nothing else is given (no empty meta or actions slots)', () => {
      render(<Panel title="Code">body</Panel>);
      expect(slot('panel-meta')).toBeNull();
      expect(slot('panel-actions')).toBeNull();
      expect(slot('panel-subtitle')).toBeNull();
    });

    it('meta accepts nodes such as Tag chips and sits right-aligned before the actions', () => {
      render(
        <Panel
          title="Answer"
          meta={
            <>
              <Tag mono>O(n) time</Tag>
              <Tag mono>O(n) space</Tag>
            </>
          }
        />,
      );
      expect(within(slot('panel-meta')).getByText('O(n) time')).toBeInTheDocument();
      expect(within(slot('panel-meta')).getByText('O(n) space')).toBeInTheDocument();
      expect(slot('panel-header-end')).toHaveClass('ml-auto');
    });

    it("actions are the caller's Buttons with their own callbacks", async () => {
      const onStop = vi.fn();
      render(<Panel title="Answer" actions={<Button onClick={onStop}>Stop</Button>} />);
      await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
      expect(onStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('body', () => {
    it('fills the rest, can shrink, scrolls inside and never overflows horizontally', () => {
      render(<Panel title="Answer">body</Panel>);
      const body = slot('panel-body');
      expect(body).toHaveClass('flex-1', 'min-h-0', 'overflow-y-auto', 'overflow-x-hidden');
      expect(slot('panel')).toHaveClass('flex', 'flex-col', 'overflow-hidden', 'min-h-0');
    });

    it('never positions anything absolutely or fixed (the jump pill is sticky inside the body)', () => {
      render(
        <Panel title="Answer" dock="dock" scroll={{ stickToBottom: true, fade: true }}>
          body
        </Panel>,
      );
      const classes = Array.from(slot('panel').querySelectorAll('*')).map((el) => el.className.toString());
      classes.push(slot('panel').className);
      expect(classes.join(' ')).not.toMatch(/(^|\s)(absolute|fixed)(\s|$)/);
    });

    it('bodyPadding and bodyClassName shape the body', () => {
      render(
        <Panel title="Answer" bodyPadding="md" bodyClassName="gap-2">
          body
        </Panel>,
      );
      expect(slot('panel-body')).toHaveClass('px-5', 'py-4', 'gap-2');
    });
  });

  describe('dock', () => {
    it('is absent without a dock prop', () => {
      render(<Panel title="Answer">body</Panel>);
      expect(slot('panel-dock')).toBeNull();
    });

    it('renders only when provided, after the body, inside the panel, with a 1px top separator', () => {
      render(
        <Panel title="Answer" dock={<Button>Apply</Button>}>
          body
        </Panel>,
      );
      const dock = slot('panel-dock');
      expect(slot('panel').contains(dock)).toBe(true);
      expect(slot('panel-body').compareDocumentPosition(dock) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(dock).toHaveClass('border-t', 'flex-none');
      expect(within(dock).getByRole('button', { name: 'Apply' })).toBeInTheDocument();
    });

    it('treats null and false as no dock', () => {
      const { rerender } = render(<Panel title="Answer" dock={null} />);
      expect(slot('panel-dock')).toBeNull();
      rerender(<Panel title="Answer" dock={false} />);
      expect(slot('panel-dock')).toBeNull();
    });
  });

  describe('empty state', () => {
    const empty: PanelProps['empty'] = {
      title: 'Nothing analysed yet',
      description: 'Capture to start.',
      action: { label: 'Capture screen', onClick: () => undefined },
    };

    it('renders the tile Empty in the body when there are no children, with its action inside the body', async () => {
      const onClick = vi.fn();
      render(
        <Panel
          title="Answer"
          empty={{
            ...empty,
            action: {
              label: 'Capture screen',
              shortcut: ['⌘', '⇧', 'S'],
              onClick,
            },
          }}
        />,
      );
      const body = slot('panel-body');
      expect(within(body).getByText('Nothing analysed yet')).toBeInTheDocument();
      expect(body.querySelector('[data-slot="empty-tile"]')).toHaveClass('size-10');
      await userEvent.click(within(body).getByRole('button', { name: /Capture screen/ }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('is replaced by the children when there are some', () => {
      render(
        <Panel title="Answer" empty={empty}>
          real content
        </Panel>,
      );
      expect(screen.getByText('real content')).toBeInTheDocument();
      expect(screen.queryByText('Nothing analysed yet')).toBeNull();
    });

    it('treats null, false and an empty list of children as an empty body', () => {
      render(
        <Panel title="Answer" empty={empty}>
          {null}
          {false}
          {[]}
        </Panel>,
      );
      expect(screen.getByText('Nothing analysed yet')).toBeInTheDocument();
    });

    it('without `empty` the body is simply blank', () => {
      render(<Panel title="Answer" />);
      expect(slot('panel-body')).toBeEmptyDOMElement();
    });
  });

  describe('layout props', () => {
    it('shares the row by default: flex 1 1 0 with min-width 0', () => {
      render(<Panel title="Answer" />);
      expect(slot('panel').style.flex).toMatch(/^1 1 0(px)?$/);
      expect(slot('panel').style.minWidth).toMatch(/^0(px)?$/);
    });

    it('width keeps a fixed basis and minWidth keeps the floor (transcript 330 min 300)', () => {
      render(<Panel title="Transcript" width={330} minWidth={300} />);
      const style = slot('panel').style;
      expect(style.flex).toBe('0 0 330px');
      expect(style.minWidth).toBe('300px');
    });

    it('accepts CSS lengths and a flex override', () => {
      render(<Panel title="Answer" width="20rem" minWidth="10rem" flex="2 1 0" />);
      const style = slot('panel').style;
      expect(style.flex).toMatch(/^2 1 0(px)?$/);
      expect(style.minWidth).toBe('10rem');
    });

    it('a row of the transcript and two shared panels keeps the 330 / equal split in its styles', () => {
      render(
        <div style={{ display: 'flex' }}>
          <Panel title="Transcript" width={330} minWidth={300} />
          <Panel title="Answer" />
          <Panel title="Code" />
        </div>,
      );
      const [a, b, c] = screen.getAllByRole('region').map((el) => (el as HTMLElement).style.flex);
      expect([a, b, c]).toEqual(['0 0 330px', '1 1 0px', '1 1 0px']);
    });

    it('className and style pass through to the root', () => {
      render(<Panel title="Answer" className="custom" style={{ height: 200 }} data-testid="p" />);
      expect(screen.getByTestId('p')).toHaveClass('custom');
      expect(screen.getByTestId('p')).toHaveStyle({ height: '200px' });
    });
  });

  describe('see-through token', () => {
    const MIX = 'color-mix(in_srgb,var(--oui-panel-';
    const classOf = (name: string) => slot(name).className;

    it('mixes the see-through token into the panel, header and dock BACKGROUNDS', () => {
      render(
        <Panel title="Answer" dock="dock">
          body
        </Panel>,
      );
      expect(classOf('panel')).toContain(`${MIX}bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)`);
      expect(classOf('panel-header')).toContain(`${MIX}header-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)`);
      expect(classOf('panel-dock')).toContain(`${MIX}dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)`);
    });

    it('applies it to nothing but backgrounds: no opacity utility anywhere, text and borders use the plain tokens', () => {
      render(
        <Panel title="Answer" subtitle="S2" meta="meta" actions={<Button>Stop</Button>} dock="dock" scroll={{ fade: true, stickToBottom: true }}>
          body text
        </Panel>,
      );
      const all = [slot('panel'), ...Array.from(slot('panel').querySelectorAll('*'))].map((el) => el.className.toString()).join(' ');
      // The only see-through consumer is the three background classes (see-through is never combined with text or border colours).
      const consumers = all.split(/\s+/).filter((c) => c.includes('--oui-panel-see-through'));
      expect(consumers).toHaveLength(3);
      consumers.forEach((c) => expect(c.startsWith('bg-[color:color-mix(')).toBe(true));
      expect(all).not.toMatch(/(^|\s)opacity-/);
      expect(classOf('panel')).toContain('border-[color:var(--oui-panel-border)]');
      expect(slot('panel-title').className).not.toContain('see-through');
      expect(slot('panel-meta').className).toContain('text-[color:var(--oui-panel-meta-fg)]');
    });

    it('is a CSS variable that can be set on any ancestor (it is read on the surface itself)', () => {
      render(
        <div style={{ ['--oui-panel-see-through' as string]: 0.22 }} data-testid="stage">
          <Panel title="Answer">body</Panel>
        </div>,
      );
      expect(screen.getByTestId('stage').style.getPropertyValue('--oui-panel-see-through')).toBe('0.22');
      expect(classOf('panel')).toContain('var(--oui-panel-see-through,1)');
    });

    it('the tokens are defined for light and dark with see-through defaulting to 1', async () => {
      const { default: css } = await import('../../src/styles/tokens.css?raw');
      for (const token of [
        '--oui-panel-bg',
        '--oui-panel-header-bg',
        '--oui-panel-dock-bg',
        '--oui-panel-border',
        '--oui-panel-see-through',
        '--oui-panel-header-height',
        '--oui-panel-fade',
        '--oui-panel-scrollbar-size',
      ]) {
        expect(css).toContain(`${token}:`);
      }
      expect(css).toMatch(/--oui-panel-see-through:\s+1;/);
      expect(css).toMatch(/--oui-panel-header-height:\s+40px;/);
      expect(css).toMatch(/--oui-panel-fade:\s+28px;/);
      const dark = css.slice(css.indexOf('[data-theme="dark"]'));
      expect(dark).toMatch(/--oui-panel-bg:\s+#172033;/);
      expect(dark).toMatch(/--oui-panel-border:\s+#24314a;/);
    });
  });

  describe('scroll: fade and thin scrollbar', () => {
    it('adds the 28px top fade mask only when asked', () => {
      const { rerender } = render(<Panel title="Answer" scroll={{ fade: true }} />);
      expect(slot('panel-body').className).toContain('mask-image:linear-gradient(to_bottom,transparent_0,#000_var(--oui-panel-fade))');
      expect(slot('panel-body')).toHaveAttribute('data-fade', 'true');
      rerender(<Panel title="Answer" />);
      expect(slot('panel-body').className).not.toContain('mask-image');
    });

    it('adds the thin scrollbar only when asked', () => {
      const { rerender } = render(<Panel title="Answer" scroll={{ thinScrollbar: true }} />);
      expect(slot('panel-body').className).toContain('scrollbar-width:thin');
      expect(slot('panel-body').className).toContain('--oui-panel-scrollbar-size');
      rerender(<Panel title="Answer" scroll={{}} />);
      expect(slot('panel-body').className).not.toContain('scrollbar-width');
    });
  });

  describe('scroll: stick to the bottom and the jump pill', () => {
    /** The body's scroll geometry is faked (happy-dom has no layout). */
    const withGeometry = (_lines?: number) => {
      const body = slot('panel-body');
      // Ten faked pixels per rendered line, read live so a re-render with more lines grows the box.
      Object.defineProperty(body, 'scrollHeight', {
        configurable: true,
        get: () => 1000 + body.querySelectorAll('p').length * 10,
      });
      Object.defineProperty(body, 'clientHeight', {
        configurable: true,
        value: 400,
      });
      return body;
    };
    const lines = (n: number) => Array.from({ length: n }, (_, i) => <p key={i}>line {i}</p>);
    const scrollUp = (body: HTMLElement) => {
      fireEvent.wheel(body);
      body.scrollTop = 0;
      fireEvent.scroll(body);
    };

    it('follows the newest content and shows no pill at the end', () => {
      const { rerender } = render(
        <Panel title="Chat" scroll={{ stickToBottom: true }}>
          {lines(3)}
        </Panel>,
      );
      const body = withGeometry(4);
      rerender(
        <Panel title="Chat" scroll={{ stickToBottom: true }}>
          {lines(4)}
        </Panel>,
      );
      expect(body.scrollTop).toBe(1040);
      expect(body).toHaveAttribute('data-following', 'true');
      expect(screen.queryByRole('button', { name: /Jump to latest/ })).toBeNull();
    });

    it('shows the pill once the person scrolls up, with the missed count when content arrives', () => {
      const { rerender } = render(
        <Panel title="Chat" scroll={{ stickToBottom: true }}>
          {lines(3)}
        </Panel>,
      );
      const body = withGeometry(3);
      scrollUp(body);
      expect(screen.getByRole('button', { name: 'Jump to latest' })).toBeInTheDocument();
      expect(screen.queryByText('2 new')).toBeNull();
      rerender(
        <Panel title="Chat" scroll={{ stickToBottom: true }}>
          {lines(5)}
        </Panel>,
      );
      expect(screen.getByRole('button', { name: 'Jump to latest, 2 new' })).toHaveTextContent('2 new');
      expect(body.scrollTop).toBe(0);
    });

    it('sits in the body (sticky, zero height, bottom-right) and takes no space', () => {
      render(
        <Panel title="Chat" scroll={{ stickToBottom: true }}>
          {lines(3)}
        </Panel>,
      );
      scrollUp(withGeometry(3));
      const holder = slot('panel-jump');
      expect(slot('panel-body').contains(holder)).toBe(true);
      expect(holder).toHaveClass('sticky', 'h-0', 'justify-end');
    });

    it('choosing the pill scrolls to the end, calls onJumpToLatest once and hides the pill', async () => {
      const onJumpToLatest = vi.fn();
      const props = { stickToBottom: true, onJumpToLatest };
      const { rerender } = render(
        <Panel title="Chat" scroll={props}>
          {lines(3)}
        </Panel>,
      );
      const body = withGeometry(3);
      scrollUp(body);
      rerender(
        <Panel title="Chat" scroll={props}>
          {lines(4)}
        </Panel>,
      );
      withGeometry(4);
      await userEvent.click(screen.getByRole('button', { name: /Jump to latest/ }));
      expect(onJumpToLatest).toHaveBeenCalledTimes(1);
      expect(body.scrollTop).toBe(1040);
      expect(screen.queryByRole('button', { name: /Jump to latest/ })).toBeNull();
      expect(body).toHaveAttribute('data-following', 'true');
    });

    it('follows again after the jump', async () => {
      const props = { stickToBottom: true };
      const { rerender } = render(
        <Panel title="Chat" scroll={props}>
          {lines(3)}
        </Panel>,
      );
      const body = withGeometry(3);
      scrollUp(body);
      await userEvent.click(screen.getByRole('button', { name: /Jump to latest/ }));
      rerender(
        <Panel title="Chat" scroll={props}>
          {lines(4)}
        </Panel>,
      );
      withGeometry(4);
      rerender(
        <Panel title="Chat" scroll={props}>
          {lines(5)}
        </Panel>,
      );
      expect(body.scrollTop).toBe(1050);
    });

    it('jumpLabel, missedLabel and an explicit `lines` count are configurable', () => {
      const scroll = {
        stickToBottom: true,
        lines: 3,
        jumpLabel: 'Latest',
        missedLabel: (n: number) => `${n} unread`,
      };
      const { rerender } = render(
        <Panel title="Chat" scroll={scroll}>
          x
        </Panel>,
      );
      const body = withGeometry(3);
      scrollUp(body);
      expect(screen.getByRole('button', { name: 'Latest' })).toBeInTheDocument();
      rerender(
        <Panel title="Chat" scroll={{ ...scroll, lines: 7 }}>
          x
        </Panel>,
      );
      expect(screen.getByRole('button', { name: 'Latest, 4 unread' })).toBeInTheDocument();
    });

    it('without stickToBottom there is no pill and no following state', () => {
      render(
        <Panel title="Chat" scroll={{ fade: true }}>
          {lines(3)}
        </Panel>,
      );
      const body = slot('panel-body');
      scrollUp(body);
      expect(body).not.toHaveAttribute('data-following');
      expect(screen.queryByRole('button', { name: /Jump to latest/ })).toBeNull();
    });
  });

  describe('keyboard', () => {
    it('focus order is header action, then the scrolling body, then the dock', async () => {
      const user = userEvent.setup();
      render(
        <Panel title="Answer" actions={<Button>Stop</Button>} dock={<Button>Apply</Button>} scroll={{ fade: true }}>
          body
        </Panel>,
      );
      await user.tab();
      expect(screen.getByRole('button', { name: 'Stop' })).toHaveFocus();
      await user.tab();
      expect(slot('panel-body')).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus();
    });

    it('the scrolling body is a named group a keyboard user can reach; a non-scroll body is not a tab stop', () => {
      const { rerender } = render(
        <Panel title="Answer" scroll={{ fade: true }}>
          body
        </Panel>,
      );
      expect(slot('panel-body')).toHaveAttribute('tabindex', '0');
      expect(screen.getByRole('group', { name: 'Answer' })).toBe(slot('panel-body'));
      rerender(<Panel title="Answer">body</Panel>);
      expect(slot('panel-body')).not.toHaveAttribute('tabindex');
    });

    it('with a pill showing, the pill follows the body content in tab order', async () => {
      const user = userEvent.setup();
      render(
        <Panel title="Chat" scroll={{ stickToBottom: true }} dock={<Button>Send</Button>}>
          <p>line</p>
        </Panel>,
      );
      const body = slot('panel-body');
      fireEvent.wheel(body);
      Object.defineProperty(body, 'scrollHeight', {
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(body, 'clientHeight', {
        configurable: true,
        value: 400,
      });
      body.scrollTop = 0;
      fireEvent.scroll(body);
      await user.tab();
      expect(body).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: /Jump to latest/ })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Send' })).toHaveFocus();
    });
  });

  describe('board 1d states (factories)', () => {
    it.each(panelVariants.map((v) => [v.name, v] as const))('%s renders as a named region', (_name, variant) => {
      render(<Panel {...panelPropsFactory(variant.args)} />);
      expect(screen.getByRole('region', { name: variant.args.title as string })).toBeInTheDocument();
    });

    it('ready: right-aligned meta, empty tile with the capture action inside the body', () => {
      render(<Panel {...panelPropsFactory(panelVariants[0].args)} />);
      expect(slot('panel-meta')).toHaveTextContent('Last capture 08:33 · no question found');
      expect(
        within(slot('panel-body')).getByRole('button', {
          name: /Capture screen/,
        }),
      ).toBeInTheDocument();
    });

    it('analysing: Stop in the header, the To apply dock at the bottom', () => {
      render(<Panel {...panelPropsFactory(panelVariants[2].args)} />);
      expect(within(slot('panel-header')).getByRole('button', { name: /Stop/ })).toBeInTheDocument();
      expect(slot('panel-subtitle')).toHaveTextContent('S2 · 10:57');
      const dock = slot('panel-dock');
      expect(dock).toHaveTextContent('To apply · 1');
      for (const name of ['Add screenshot', 'Clear', 'Apply']) expect(within(dock).getByRole('button', { name })).toBeInTheDocument();
    });

    it('answer ready: complexity chips in the meta', () => {
      render(<Panel {...panelPropsFactory(panelVariants[3].args)} />);
      expect(within(slot('panel-meta')).getByText('O(n) time')).toBeInTheDocument();
      expect(within(slot('panel-meta')).getByText('O(n) space')).toBeInTheDocument();
    });

    it('code waiting uses the hourglass copy', () => {
      render(<Panel {...panelPropsFactory(panelVariants[1].args)} />);
      expect(screen.getByText('Starts automatically after the approach.')).toBeInTheDocument();
    });
  });

  describe('Native App panels row', () => {
    it.each([
      ['ready', 3],
      ['analysing', 3],
      ['answer', 2],
    ] as const)('%s state renders %i panels, the transcript at 330 (min 300)', (state, count) => {
      render(<NativePanelsDemo state={state} />);
      const regions = screen.getAllByRole('region');
      expect(regions).toHaveLength(count);
      expect((regions[0] as HTMLElement).style.flex).toBe('0 0 330px');
      expect((regions[0] as HTMLElement).style.minWidth).toBe('300px');
      regions.slice(1).forEach((panel) => expect((panel as HTMLElement).style.flex).toMatch(/^1 1 0(px)?$/));
    });

    it('sets the see-through token and the row width from props', () => {
      render(<NativePanelsDemo seeThrough={0.22} width={900} />);
      const row = screen.getByTestId('native-panels');
      expect(row.style.getPropertyValue('--oui-panel-see-through')).toBe('0.22');
      expect(row).toHaveStyle({ width: '900px' });
    });

    it('reports the analysing callbacks', async () => {
      const onAction = vi.fn();
      render(<NativePanelsDemo state="analysing" onAction={onAction} />);
      for (const [name, action] of [
        [/Stop/, 'stop'],
        ['Add screenshot', 'add-screenshot'],
        ['Clear', 'clear'],
        ['Apply', 'apply'],
      ] as const) {
        await userEvent.click(screen.getByRole('button', { name }));
        expect(onAction).toHaveBeenLastCalledWith(action);
      }
    });
  });

  describe('transcript demo (controlled)', () => {
    it('appends a message when one arrives; at the end it follows and shows no pill', async () => {
      render(<TranscriptDemo initial={3} />);
      const before = screen.getAllByText(/Mic ·|Assume|Just kick/).length;
      await userEvent.click(screen.getByTestId('add-message'));
      expect(screen.getAllByText(/Mic ·|Assume|Just kick/).length).toBeGreaterThan(before - 1);
      expect(document.querySelectorAll('[data-slot="transcript-speech"],[data-slot="transcript-message"]').length).toBe(4);
      expect(screen.queryByRole('button', { name: /Jump to latest/ })).toBeNull();
    });

    it('scrolled up when a message arrives: pill with the count; clicking it calls back, hides it and follows again', async () => {
      const onAction = vi.fn();
      render(<TranscriptDemo initial={3} onAction={onAction} />);
      const body = slot('panel-body');
      Object.defineProperty(body, 'scrollHeight', {
        configurable: true,
        get: () => 1000 + document.querySelectorAll('[data-slot="transcript-speech"],[data-slot="transcript-message"]').length * 10,
      });
      Object.defineProperty(body, 'clientHeight', {
        configurable: true,
        value: 400,
      });
      fireEvent.wheel(body);
      body.scrollTop = 0;
      fireEvent.scroll(body);
      await userEvent.click(screen.getByTestId('add-messages'));
      const pill = screen.getByRole('button', { name: /Jump to latest/ });
      expect(pill).toHaveTextContent('3 new');
      await userEvent.click(pill);
      expect(onAction).toHaveBeenCalledWith('jump');
      expect(screen.queryByRole('button', { name: /Jump to latest/ })).toBeNull();
      expect(body.scrollTop).toBe(1060);
      await userEvent.click(screen.getByTestId('add-message'));
      expect(body.scrollTop).toBe(1070);
    });
  });
});

describe('Panel scroll.threshold', () => {
  it('keeps following within the threshold: 150px from the end stays at the end with 200 but shows the pill with the default', () => {
    const setup = (threshold?: number) => {
      const { container, unmount } = render(
        <Panel title="T" scroll={{ stickToBottom: true, lines: 3, threshold }}>
          <div>a</div>
        </Panel>,
      );
      const body = container.querySelector('[data-slot="panel-body"]') as HTMLElement;
      Object.defineProperty(body, 'scrollHeight', { configurable: true, value: 1000 });
      Object.defineProperty(body, 'clientHeight', { configurable: true, value: 400 });
      Object.defineProperty(body, 'scrollTop', { configurable: true, writable: true, value: 450 });
      fireEvent.wheel(body);
      fireEvent.scroll(body);
      const pill = screen.queryByRole('button', { name: 'Jump to latest' });
      unmount();
      return Boolean(pill);
    };
    expect(setup()).toBe(true);
    expect(setup(200)).toBe(false);
  });
});
