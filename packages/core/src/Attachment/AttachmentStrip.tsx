import { cn } from 'lib/utils';
import * as React from 'react';
import {
  type AttachmentItem,
  type AttachmentStripProps,
  DEFAULT_ATTACHMENT_LABELS,
} from './Attachment.types';
import { attachmentStripVariants } from './Attachment.variants';
import { AttachmentCard } from './AttachmentCard';

/**
 * The row of attachments above a field. One horizontally scrolling row by default (`layout="scroll"`), so a long
 * list never pushes the textarea down; `wrap` lets read-only chips wrap in a sent message. Renders nothing when
 * `items` is empty. The row is a labelled group (`labels.strip`, default `Selected files`) and each card its own group.
 * Slot: `data-slot="attachment-strip"`.
 *
 * @example
 * <AttachmentStrip items={items} onRemove={(item) => remove(item.id)} removeIcon={<X />} />
 */
function AttachmentStripInner<T extends AttachmentItem = AttachmentItem>(
  {
    items,
    onRemove,
    onClick,
    removeIcon,
    kindIcons,
    readOnly,
    layout = 'scroll',
    variant = 'card',
    labels: labelsProp,
    className,
    ...rest
  }: AttachmentStripProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const labels = { ...DEFAULT_ATTACHMENT_LABELS, ...labelsProp };
  if (items.length === 0) return null;
  return (
    <div
      ref={ref}
      role="group"
      aria-label={labels.strip}
      data-slot="attachment-strip"
      className={cn(
        attachmentStripVariants({
          layout: variant === 'chip' && layout === 'scroll' ? 'wrap' : layout,
        }),
        className,
      )}
      {...rest}
    >
      {items.map((item) => (
        <AttachmentCard
          key={item.id}
          item={item}
          variant={variant}
          onRemove={onRemove}
          onClick={onClick}
          removeIcon={removeIcon}
          kindIcons={kindIcons}
          readOnly={readOnly}
          labels={labelsProp}
        />
      ))}
    </div>
  );
}

export const AttachmentStrip = React.forwardRef(AttachmentStripInner) as <
  T extends AttachmentItem = AttachmentItem,
>(
  props: AttachmentStripProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
(AttachmentStrip as { displayName?: string }).displayName = 'AttachmentStrip';
