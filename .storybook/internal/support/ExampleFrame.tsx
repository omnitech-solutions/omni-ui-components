/**
 * @fileoverview
 * `ExampleFrame`: the one way this Storybook draws "an example with its code". A preview box, an optional
 * title and description above it, and the code disclosure attached under it. The overview pages, the docs
 * pages and the standalone story view all draw their examples with it.
 *
 *     <ExampleFrame title="Ghost" code={code}>
 *       <Button variant="ghost">Label</Button>
 *     </ExampleFrame>
 *
 * - `code` is a snippet, a labelled map of snippets (drawn as tabs), or a function called the first time the
 *   code is opened or copied.
 * - `layout` places the example in the box as Storybook's `layout` parameter does.
 * - `defer` mounts the example only when the frame comes within a viewport of the window, behind a placeholder
 *   of `deferHeight` so the page keeps its length and every anchor its place. Once mounted it stays mounted.
 * - `host` is for the story view: the element that already holds the example (Storybook's root) becomes the
 *   preview box, and the header and the code bar are drawn before and after it. Nothing is added inside the
 *   story's own element, so play functions and the accessibility check see the story alone.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import './example.css';
import { CodeDisclosure } from './CodeDisclosure';
import type { ExampleCode } from './exampleStore';

export type ExampleLayout = 'padded' | 'centered' | 'fullscreen';

export interface ExampleFrameProps {
  /** Anchor id of the frame (a table-of-contents target). */
  id?: string;
  /** Small label above the title (the component's name). */
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Replaces the eyebrow and title with a header of the caller's own (the overview pages' pill). */
  header?: React.ReactNode;
  /** Extra content between the description and the preview (chips). */
  meta?: React.ReactNode;
  code?: ExampleCode;
  /** `false` draws no code bar even when there is code. */
  showCode?: boolean;
  defaultOpen?: boolean;
  layout?: ExampleLayout;
  defer?: boolean;
  /** Height reserved for an example that is not mounted yet, in px. */
  deferHeight?: number;
  host?: HTMLElement | null;
  className?: string;
  children?: React.ReactNode;
}

/** True once the element is within a viewport of the window; `far` again whenever it is further away. */
const useNearViewport = (target: React.RefObject<HTMLElement | null>, enabled: boolean) => {
  const observable = enabled && typeof IntersectionObserver !== 'undefined';
  const [seen, setSeen] = React.useState(!observable);
  React.useEffect(() => {
    const element = target.current;
    if (!observable || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setSeen(true);
          element.removeAttribute('data-far');
          element.style.removeProperty('contain-intrinsic-block-size');
        } else if (element.dataset.mounted === 'true') {
          // Far from the window the browser may skip the example's layout and paint, at the height it has now.
          element.style.setProperty(
            'contain-intrinsic-block-size',
            `auto ${Math.round(element.getBoundingClientRect().height)}px`,
          );
          element.setAttribute('data-far', '');
        }
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [observable, target]);
  return seen;
};

const Header: React.FC<
  Pick<ExampleFrameProps, 'eyebrow' | 'title' | 'description' | 'header' | 'meta'>
> = ({ eyebrow, title, description, header, meta }) =>
  header || eyebrow || title || description || meta ? (
    // A plain element, not a header: around a story it would be a second banner landmark on the page.
    <div className="pb-example-header">
      {header}
      {eyebrow ? <div className="pb-example-eyebrow">{eyebrow}</div> : null}
      {title ? <h2 className="pb-example-title">{title}</h2> : null}
      {description ? <div className="pb-example-description">{description}</div> : null}
      {meta}
    </div>
  ) : null;

/** Elements placed before and after the host for as long as the frame is mounted. */
const useHostSlots = (
  host: HTMLElement | null | undefined,
  layout: ExampleLayout,
  bar: boolean,
) => {
  const [slots, setSlots] = React.useState<{ head: HTMLElement; foot: HTMLElement } | null>(null);
  React.useLayoutEffect(() => {
    if (!host) return;
    const head = document.createElement('div');
    const foot = document.createElement('div');
    head.className = 'pb-example-slot';
    foot.className = 'pb-example-slot';
    host.before(head);
    host.after(foot);
    setSlots({ head, foot });
    return () => {
      head.remove();
      foot.remove();
      setSlots(null);
    };
  }, [host]);
  React.useLayoutEffect(() => {
    if (!host) return;
    host.classList.add('pb-example-preview', 'pb-example-host');
    host.setAttribute('data-layout', layout);
    host.toggleAttribute('data-bar', bar);
    return () => {
      host.classList.remove('pb-example-preview', 'pb-example-host');
      host.removeAttribute('data-layout');
      host.removeAttribute('data-bar');
    };
  }, [host, layout, bar]);
  return slots;
};

export const ExampleFrame: React.FC<ExampleFrameProps> = ({
  id,
  eyebrow,
  title,
  description,
  header,
  meta,
  code,
  showCode = true,
  defaultOpen,
  layout = 'padded',
  defer = false,
  deferHeight = 240,
  host,
  className,
  children,
}) => {
  const frame = React.useRef<HTMLElement | null>(null);
  const mounted = useNearViewport(frame, defer && !host);
  const bar = showCode && code !== undefined && code !== '';
  const slots = useHostSlots(host, layout, bar);
  const head = (
    <Header eyebrow={eyebrow} title={title} description={description} header={header} meta={meta} />
  );
  // A frame that is not mounted yet draws no code bar either: a long page is a few elements a row until it is read.
  const foot = bar && mounted ? <CodeDisclosure code={code} defaultOpen={defaultOpen} /> : null;

  if (host !== undefined) {
    return (
      <>
        {slots ? createPortal(head, slots.head) : null}
        {children}
        {slots ? createPortal(foot, slots.foot) : null}
      </>
    );
  }

  return (
    <section
      ref={frame}
      id={id}
      // `sb-unstyled`: on a docs page Storybook's own typography leaves the frame alone.
      className={['pb-example sb-unstyled', className].filter(Boolean).join(' ')}
      data-defer={defer || undefined}
      data-mounted={mounted}
    >
      {head}
      <div
        className="pb-example-preview"
        data-layout={layout}
        data-bar={bar && mounted ? '' : undefined}
      >
        {mounted ? (
          children
        ) : (
          <div
            className="pb-example-placeholder"
            style={{ minHeight: deferHeight }}
            aria-hidden="true"
          />
        )}
      </div>
      {foot}
    </section>
  );
};
