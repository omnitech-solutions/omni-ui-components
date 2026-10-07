import { cn } from 'lib/utils';
import * as React from 'react';
import { Button } from '../Button';
import { Tag } from '../Tag';
import type { ApprovalCardProps, ApprovalItem, ApprovalLabels } from './ApprovalCard.types';
import { approvalBadgeClasses, approvalCardVariants } from './ApprovalCard.variants';

/** English strings of {@link ApprovalCard}. */
export const DEFAULT_APPROVAL_LABELS: ApprovalLabels = {
  region: 'Approval needed',
  deny: 'Deny',
  always: 'Always allow in this chat',
  once: 'Allow once',
  allowedOnce: 'Allowed once',
  alwaysAllowed: (tool) =>
    tool
      ? `Always allowed for ${tool} in this conversation`
      : 'Always allowed in this conversation',
  denied: 'Denied · nothing was run',
};

/**
 * Omni ApprovalCard: the model asks to do something that needs the person's permission. A badge, title, optional
 * description and tags, then (while `pending`) Deny, a standing permission and Allow once, all calling
 * `onDecide(decision)`; once answered the buttons give way to one resolved line (`once`, `always`, `denied`).
 * The card is a labelled `section`. Buttons are disabled while `busy`.
 *
 * Slots: `data-slot="approval-card" | "approval-deny" | "approval-always" | "approval-once" | "approval-resolved"`.
 *
 * @example
 * <ApprovalCard title="Run the code?" tool="runCode" tags={['runCode', 'sandboxed']} icons={{ badge: <Shield /> }}
 *   onDecide={(decision) => resolve(decision)} />
 */
const ApprovalCardImpl = React.forwardRef<HTMLElement, ApprovalCardProps>(
  (
    {
      approval,
      title: titleProp,
      description: descriptionProp,
      tags: tagsProp,
      tool: toolProp,
      status = 'pending',
      onDecide,
      busy = false,
      icons,
      labels: labelOverrides,
      autoFocus = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const labels = { ...DEFAULT_APPROVAL_LABELS, ...labelOverrides };
    const title = titleProp ?? approval?.title;
    const description = descriptionProp ?? approval?.description;
    const tags = tagsProp ?? approval?.tags;
    const tool = toolProp ?? approval?.tool;
    // The item handed to `onDecide`: the host's own object when given (by reference), else one built from the props.
    const item = approval ?? ({ id: 'approval', title, description, tags, tool } as ApprovalItem);
    const waiting = busy;
    const denyButton = React.useRef<HTMLButtonElement | null>(null);
    // [SAFETY] Land on Deny, never on an Allow button, so a stray Enter or Space cannot grant permission; only on mount.
    React.useEffect(() => {
      if (autoFocus) denyButton.current?.focus();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const resolved: Record<'once' | 'always' | 'denied', [React.ReactNode, string]> = {
      once: [icons?.once, labels.allowedOnce],
      always: [icons?.always, labels.alwaysAllowed(tool)],
      denied: [icons?.denied, labels.denied],
    };
    return (
      <section
        ref={ref}
        aria-label={labels.region}
        data-slot="approval-card"
        data-status={status}
        className={cn(approvalCardVariants({ status }), className)}
        {...rest}
      >
        <div className="flex gap-3">
          {icons?.badge ? (
            <span aria-hidden="true" data-slot="approval-badge" className={approvalBadgeClasses}>
              {icons.badge}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="text-sm font-semibold">{title}</div>
            {description ? (
              <div className="text-[13px] text-[color:var(--oui-panel-meta-fg)]">{description}</div>
            ) : null}
            {tags && tags.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((tag, index) => (
                  <Tag
                    key={tag}
                    mono={index === 0}
                    className="min-h-0 rounded-md px-1.5 py-0.5 text-[11.5px] font-normal text-[color:var(--oui-panel-meta-fg)] shadow-none"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {status === 'pending' ? (
          onDecide ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                ref={denyButton}
                variant="outline"
                buttonSize="sm"
                disabled={waiting}
                data-slot="approval-deny"
                onClick={() => onDecide('deny', item)}
              >
                {labels.deny}
              </Button>
              <Button
                variant="outline"
                buttonSize="sm"
                disabled={waiting}
                data-slot="approval-always"
                onClick={() => onDecide('always', item)}
              >
                {labels.always}
              </Button>
              <Button
                buttonSize="sm"
                disabled={waiting}
                data-slot="approval-once"
                onClick={() => onDecide('once', item)}
              >
                {labels.once}
              </Button>
            </div>
          ) : null
        ) : (
          <div
            role="status"
            data-slot="approval-resolved"
            className="flex items-center gap-1.5 border-t border-solid border-[color:var(--oui-panel-divider)] pt-2.5 text-[12.5px] text-[color:var(--oui-panel-meta-fg)]"
          >
            {resolved[status][0] ? (
              <span aria-hidden="true" className="inline-flex flex-none [&_svg]:size-4">
                {resolved[status][0]}
              </span>
            ) : null}
            {resolved[status][1]}
          </div>
        )}
      </section>
    );
  },
);
ApprovalCardImpl.displayName = 'ApprovalCard';

/** Generic over the item type: an extended item reaches every callback and slot by reference. */
export const ApprovalCard = ApprovalCardImpl as unknown as <T extends ApprovalItem = ApprovalItem>(
  props: ApprovalCardProps<T> & React.RefAttributes<HTMLElement>,
) => React.ReactElement | null;
