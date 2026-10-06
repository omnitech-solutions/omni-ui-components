import * as React from 'react';

import { cn } from 'lib/utils';
import { IconButton } from '../IconButton';
import { DEFAULT_ATTACHMENT_LABELS, type AttachmentCardProps, type AttachmentItem } from './Attachment.types';
import {
  attachmentCardVariants,
  attachmentErrorClasses,
  attachmentIndeterminateClasses,
  attachmentMetaClasses,
  attachmentNameClasses,
  attachmentProgressBarClasses,
  attachmentProgressTrackClasses,
  attachmentTextClasses,
  attachmentThumbClasses,
} from './Attachment.variants';

/**
 * One attachment: a thumbnail (`previewUrl`) or your icon node, the name, a meta line (kind, or the status text,
 * or the error), and a remove button. Shared by the composer (removable) and a sent message (`readOnly`, or the
 * compact `chip` variant). A card that is `uploading` shows `progress` as a thin bar and cannot be removed;
 * `extracting` says so; `failed` shows `error` (or the `failed` label) in the danger tone and can be removed.
 *
 * Every string comes from `labels` (`Remove {name}`, `Uploading…`, …); the remove glyph is the `removeIcon` node.
 * Slots: `data-slot="attachment" | "attachment-thumb" | "attachment-remove"`; `data-status` carries the state.
 *
 * @example
 * <AttachmentCard item={{ id: '1', name: 'notes.pdf', meta: 'File', icon: <FileText /> }} onRemove={(item) => remove(item.id)} removeIcon={<X />} />
 */
function AttachmentCardInner<T extends AttachmentItem = AttachmentItem>(
    {
      item,
      variant = 'card',
      onRemove,
      onClick,
      removeIcon,
      kindIcons,
      readOnly = false,
      labels: labelsProp,
      className,
      ...rest
    }: AttachmentCardProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { name, kind = 'file', meta, previewUrl, status = 'ready', progress, error } = item;
    const icon = item.icon ?? kindIcons?.[kind];
    const labels = { ...DEFAULT_ATTACHMENT_LABELS, ...labelsProp };
    const removable = Boolean(onRemove) && !readOnly && variant === 'card';
    const busy = status === 'uploading';
    const line =
      status === 'failed' ? (error ?? labels.failed) : status === 'uploading' ? labels.uploading : status === 'extracting' ? labels.extracting : meta;
    const pct = typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : undefined;

    const content = (
      <>
        {variant === 'card' ? (
          <span data-slot="attachment-thumb" className={attachmentThumbClasses}>
            {previewUrl ? <img src={previewUrl} alt="" className="size-full object-cover" /> : icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
          </span>
        ) : icon ? (
          <span aria-hidden="true" className="inline-flex flex-none [&_svg]:size-3.5">
            {icon}
          </span>
        ) : null}
        <span className={attachmentTextClasses}>
          <span className={attachmentNameClasses} title={name}>
            {name}
          </span>
          {variant === 'card' && line ? (
            <span className={status === 'failed' ? attachmentErrorClasses : attachmentMetaClasses} data-slot="attachment-meta">
              {line}
            </span>
          ) : null}
        </span>
      </>
    );

    return (
      <div
        ref={ref}
        role="group"
        aria-label={name}
        data-slot="attachment"
        data-kind={kind}
        data-status={status}
        data-variant={variant}
        aria-busy={busy || status === 'extracting' || undefined}
        className={cn(attachmentCardVariants({ variant, status }), className)}
        {...rest}
      >
        {onClick ? (
          <button
            type="button"
            data-slot="attachment-open"
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={() => void onClick(item)}
          >
            {content}
          </button>
        ) : (
          content
        )}
        {removable ? (
          <IconButton
            variant="ghost"
            iconSize="sm"
            icon={removeIcon ?? <span aria-hidden="true">×</span>}
            label={labels.remove.replace('{name}', name)}
            disabled={busy}
            data-slot="attachment-remove"
            className="size-6 flex-none rounded-md"
            onClick={() => void onRemove?.(item)}
          />
        ) : null}
        {variant === 'card' && busy ? (
          <span data-slot="attachment-progress" className={attachmentProgressTrackClasses}>
            {pct === undefined ? (
              <span className={attachmentIndeterminateClasses} />
            ) : (
              <span
                role="progressbar"
                aria-label={labels.uploading}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                className={attachmentProgressBarClasses}
                style={{ width: `${pct}%` }}
              />
            )}
          </span>
        ) : null}
      </div>
    );
}

export const AttachmentCard = React.forwardRef(AttachmentCardInner) as <T extends AttachmentItem = AttachmentItem>(
  props: AttachmentCardProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
(AttachmentCard as { displayName?: string }).displayName = 'AttachmentCard';
