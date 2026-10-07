import { cn } from 'lib/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { ActionMenu } from '../ActionMenu';
import { ControlBadge } from '../internal/support/ControlBadge';
import { toneTintClasses } from '../internal/support/controlTone';
import { hitAreaEnd, hitAreaStart, hitAreaY } from '../internal/support/hitArea';
import { Progress } from '../Progress';
import { useToolbarSize } from '../Toolbar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import type { SplitButtonProps } from './SplitButton.types';

const SEGMENT =
  'inline-flex items-center justify-center text-inherit outline-none cursor-pointer transition-colors ' +
  'hover:bg-[color-mix(in_srgb,currentColor_8%,transparent)] focus-visible:outline-none ' +
  '[&_svg]:pointer-events-none [&_svg]:shrink-0 aria-disabled:cursor-not-allowed disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Omni SplitButton: a main action and a caret that opens an ActionMenu, sharing
 * ONE border (the caret has no border of its own, a 1px divider in the border
 * colour separates the halves). The whole control carries a `tone`; `status`
 * puts a badge at its top-right; `state="analysing"` swaps the icon for the
 * progress ring. The main half can be disabled (with a reason) while the caret
 * stays usable. Every callback is a prop.
 *
 * @example
 * <SplitButton
 *   tone="accent"
 *   main={{ label: 'Capture', icon: <Monitor />, tooltip: 'Auto · re-analyses when the screen changes', onPress: capture }}
 *   menu={{ label: 'Capture options', sections, onSelect: choose }}
 *   onOpenChange={reserveRoom}
 * />
 */
export const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  (
    {
      main,
      segments,
      caret,
      menu,
      tone,
      status,
      size,
      open,
      defaultOpen,
      onOpenChange,
      openMenuOn = [],
      className,
      'data-testid': testId,
    },
    ref,
  ) => {
    const toolbarSize = useToolbarSize();
    const resolvedSize = size ?? toolbarSize ?? 'control';
    const labelled = resolvedSize === 'control-labelled';
    const inlineLabel = Boolean(main.labelInline) && !labelled;
    const analysing = main.state === 'analysing';
    const resolvedTone = tone ?? (analysing ? 'accent' : 'neutral');

    const [internalOpen, setInternalOpen] = React.useState(Boolean(defaultOpen));
    const controlled = open !== undefined;
    const isOpen = controlled ? open : internalOpen;
    const setOpen = (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    const badgeDescriptionId = React.useId();
    const mainReasoned = Boolean(main.disabledReason);
    const caretReasoned = Boolean(caret?.disabledReason);
    const mainTip = mainReasoned ? main.disabledReason : main.tooltip;
    const hasMainTip =
      mainTip !== undefined && mainTip !== null && mainTip !== false && mainTip !== '';

    const handleMainClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // aria-disabled keeps the button hoverable for the tooltip, so the click is swallowed here.
      if (mainReasoned) {
        event.preventDefault();
        return;
      }
      main.onPress?.(event);
    };

    const mainButton = (
      <button
        type="button"
        data-slot="split-button-main"
        data-state={analysing ? 'analysing' : undefined}
        data-disabled={mainReasoned ? '' : undefined}
        data-testid={main['data-testid']}
        aria-label={main.label}
        aria-pressed={main.pressed}
        aria-busy={analysing ? true : undefined}
        aria-disabled={mainReasoned ? true : undefined}
        aria-describedby={status?.description ? badgeDescriptionId : undefined}
        disabled={mainReasoned ? undefined : main.disabled}
        title={hasMainTip ? undefined : main.label}
        className={cn(
          SEGMENT,
          'relative rounded-l-[calc(var(--oui-control-radius)-1px)]',
          !labelled && `${hitAreaStart} [--oui-hit-base:34px]`,
          labelled
            ? 'min-w-[58px] flex-col gap-[3px] px-1'
            : inlineLabel
              ? 'min-w-[var(--oui-control-height)] gap-2 px-3 text-[15px]'
              : 'min-w-[var(--oui-control-height)]',
          '[&_svg]:size-[var(--oui-control-icon)]',
          'aria-pressed:bg-[color:var(--oui-tone-accent-bg)] aria-pressed:text-[color:var(--oui-tone-accent-fg)]',
        )}
        onClick={handleMainClick}
        onContextMenu={
          openMenuOn.includes('contextmenu')
            ? (event) => {
                event.preventDefault();
                setOpen(true);
              }
            : undefined
        }
        onKeyDown={
          openMenuOn.includes('arrowdown')
            ? (event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setOpen(true);
                }
              }
            : undefined
        }
      >
        <span data-slot="split-button-icon" className="inline-flex">
          {analysing ? (
            <Progress shape="ring" tone="accent" size={20} aria-hidden="true" />
          ) : (
            main.icon
          )}
        </span>
        {/* Same size and height as the IconButton badge (--oui-badge-size / --oui-badge-offset), anchored to the main segment's top-right corner but inset on the right so it never crosses into the caret half. */}
        {status ? (
          <ControlBadge
            slot="split-button-status"
            className="right-0"
            tone={status.tone}
            label={status.label}
            description={status.description}
            descriptionId={badgeDescriptionId}
          />
        ) : null}
        {inlineLabel ? (
          <span data-slot="split-button-inline-label" className="leading-none">
            {main.caption ?? main.label}
          </span>
        ) : null}
        {labelled ? (
          <span data-slot="split-button-caption" className="text-[10.5px] leading-none">
            {main.caption ?? main.label}
          </span>
        ) : null}
      </button>
    );

    const mainTipContent = hasMainTip ? (
      <>
        {mainTip}
        {!mainReasoned && main.shortcut?.length ? (
          <span className="ml-1.5 font-mono text-xs opacity-70">{main.shortcut.join('')}</span>
        ) : null}
      </>
    ) : null;

    const mainNode = hasMainTip ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{mainButton}</TooltipTrigger>
          <TooltipContent container={menu.container}>{mainTipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      mainButton
    );

    const segmentNodes = (segments ?? []).map((segment) => {
      const button = (
        <button
          key={segment.id}
          type="button"
          data-slot="split-button-segment"
          data-segment={segment.id}
          data-testid={segment['data-testid']}
          aria-label={segment.label}
          aria-pressed={segment.pressed}
          disabled={segment.disabled}
          title={segment.tooltip ? undefined : segment.label}
          className={cn(
            SEGMENT,
            'relative w-[var(--oui-control-height)] border-l border-inherit [&_svg]:size-[var(--oui-control-icon)]',
            !labelled && `${hitAreaY} [--oui-hit-base:34px]`,
            'aria-pressed:bg-[color:var(--oui-tone-accent-bg)] aria-pressed:text-[color:var(--oui-tone-accent-fg)]',
          )}
          onClick={(event) => segment.onPress?.(segment, event)}
        >
          {segment.icon}
        </button>
      );
      if (!segment.tooltip) return button;
      return (
        <TooltipProvider key={segment.id}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent container={menu.container}>
              {segment.tooltip}
              {segment.shortcut?.length ? (
                <span className="ml-1.5 font-mono text-xs opacity-70">
                  {segment.shortcut.join('')}
                </span>
              ) : null}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });

    const caretClass = cn(
      SEGMENT,
      !labelled && `${hitAreaEnd} [--oui-hit-base:34px] [--oui-hit-left:-1px]`,
      'w-[var(--oui-control-caret)] rounded-r-[calc(var(--oui-control-radius)-1px)] border-l border-inherit text-[color:var(--oui-foreground-muted)] [&_svg]:size-4',
    );
    const caretLabel = caret?.label ?? 'More options';
    const caretButton = (
      <button
        type="button"
        data-slot="split-button-caret"
        data-testid={caret?.['data-testid']}
        aria-label={caretLabel}
        aria-disabled={caretReasoned ? true : undefined}
        className={caretClass}
        onClick={caretReasoned ? (event) => event.preventDefault() : undefined}
      >
        <ChevronDown />
      </button>
    );

    let caretNode: React.ReactNode;
    if (caretReasoned) {
      caretNode = (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{caretButton}</TooltipTrigger>
            <TooltipContent container={menu.container}>{caret?.disabledReason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else if (caret?.tooltip) {
      caretNode = (
        <TooltipProvider>
          <Tooltip>
            <ActionMenu
              {...menu}
              open={isOpen}
              onOpenChange={setOpen}
              trigger={<TooltipTrigger asChild>{caretButton}</TooltipTrigger>}
            />
            <TooltipContent container={menu.container}>{caret.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      caretNode = (
        <ActionMenu {...menu} open={isOpen} onOpenChange={setOpen} trigger={caretButton} />
      );
    }

    return (
      <div
        ref={ref}
        data-slot="split-button"
        data-tone={resolvedTone}
        data-size={resolvedSize}
        data-testid={testId}
        className={cn(
          'relative box-border inline-flex shrink-0 items-stretch rounded-[var(--oui-control-radius)] border',
          // One ring around the whole control (never one half) for keyboard focus.
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50',
          labelled ? 'h-[var(--oui-control-height-labelled)]' : 'h-[var(--oui-control-height)]',
          // Tint colours the border, surface and text; hover tint is handled per segment.
          toneTintClasses[resolvedTone].replace(/hover:\S+/g, '').trim(),
          className,
        )}
      >
        {mainNode}
        {segmentNodes}
        {caretNode}
      </div>
    );
  },
);
SplitButton.displayName = 'SplitButton';
