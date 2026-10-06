import * as React from 'react';

import { cn } from 'lib/utils';
import { TokenLines } from '../Highlight/TokenLines';
import { IconButton } from '../IconButton';
import { Tag } from '../Tag';
import { codeBlockId, parseFencedBlocks } from './Transcript.blocks';
import {
  transcriptBubbleVariants,
  transcriptCodeBlockClasses,
  transcriptCodeHeaderClasses,
  transcriptCodeTextClasses,
  transcriptCopyClasses,
  transcriptLabelToneClasses,
} from './Transcript.variants';
import type { TranscriptBlock, TranscriptBubbleEntry, TranscriptCodeBlock, TranscriptEntry, TranscriptProps } from './Transcript.types';

/**
 * Omni Transcript: a config-driven live log of `entries` (speech, your own message, event chips) meant to be the
 * child of a {@link Panel}. It does not scroll or follow anything itself: give the Panel
 * `scroll={{ stickToBottom: true, lines: entries.length }}` (a single child counts as one line) and it sticks to the
 * newest entry. Short logs sit at the bottom of the body. Empty state is the Panel's `empty` config.
 *
 * Every string is plain data (labels, times, texts); icons are nodes you pass in (`copyIcon`, an event's `icon`).
 * Copy is a callback plus controlled state: `onCopy(entry)` fires, you write the clipboard and set `copiedId`;
 * the control then reads `copiedLabel`. Text stays selectable and the copy control never takes the selection.
 *
 * Slots: `data-slot="transcript" | "transcript-speech" | "transcript-message" | "transcript-event" | "transcript-copy"`.
 *
 * @example
 * <Panel title="Transcript & chat" bodyPadding="sm" scroll={{ stickToBottom: true, lines: entries.length }}>
 *   <Transcript entries={entries} copyIcon={<Copy />} copiedIcon={<Check />} onCopy={copy} copiedId={copied} />
 * </Panel>
 */
export const Transcript = React.forwardRef<HTMLDivElement, TranscriptProps>(
  (
    {
      entries,
      onCopy,
      copiedId,
      copyIcon,
      copiedIcon,
      copyLabel = 'Copy',
      copiedLabel = 'Copied',
      editedLabel = 'edited',
      fences = false,
      onCopyCode,
      copyCodeLabel = 'Copy code',
      copiedCodeLabel = 'Copied',
      wrapCode = false,
      renderCode,
      highlight,
      codeLineNumbers = false,
      className,
      'aria-label': ariaLabel = 'Transcript',
      ...rest
    },
    ref,
  ) => {
    const copyable = Boolean(onCopy) && copyIcon !== undefined && copyIcon !== null;

    const copyControl = (entry: TranscriptBubbleEntry) => {
      if (!copyable) return null;
      const copied = copiedId === entry.id;
      return (
        <IconButton
          variant="ghost"
          iconSize="sm"
          icon={copied && copiedIcon ? copiedIcon : copyIcon}
          label={copied ? copiedLabel : copyLabel}
          data-slot="transcript-copy"
          data-copied={copied ? 'true' : undefined}
          className={transcriptCopyClasses}
          // Keeps the text selection (and the caret) where it is: the click still fires.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onCopy?.(entry)}
        />
      );
    };

    /** Explicit blocks win; with `fences`, fenced code in `text` becomes blocks; otherwise the text is one plain run. */
    const blocksOf = (entry: TranscriptBubbleEntry): TranscriptBlock[] | null => {
      if (entry.blocks) return entry.blocks;
      if (fences && entry.text.includes('```')) return parseFencedBlocks(entry.text);
      return null;
    };

    const codeControl = (entry: TranscriptBubbleEntry, block: TranscriptCodeBlock, index: number) => {
      if (!onCopyCode || copyIcon === undefined || copyIcon === null) return null;
      const copied = copiedId === codeBlockId(entry.id, index);
      return (
        <IconButton
          variant="ghost"
          iconSize="sm"
          icon={copied && copiedIcon ? copiedIcon : copyIcon}
          label={copied ? copiedCodeLabel : copyCodeLabel}
          data-slot="transcript-code-copy"
          data-copied={copied ? 'true' : undefined}
          className="size-6 rounded-md select-none"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onCopyCode(block, entry, index)}
        />
      );
    };

    const renderBlocks = (entry: TranscriptBubbleEntry, blocks: TranscriptBlock[]) =>
      blocks.map((block, index) =>
        block.type === 'text' ? (
          <span key={index} data-slot="transcript-text" className="whitespace-pre-wrap">
            {block.text}
          </span>
        ) : (
          <div key={index} data-slot="transcript-code" className={transcriptCodeBlockClasses}>
            <div data-slot="transcript-code-header" className={transcriptCodeHeaderClasses}>
              <span className="min-w-0 truncate">{block.title ?? block.language ?? ''}</span>
              {codeControl(entry, block, index)}
            </div>
            <pre
              tabIndex={0}
              aria-label={block.title ?? (block.language ? `${block.language} code` : 'Code')}
              className={cn(transcriptCodeTextClasses, wrapCode ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre')}
            >
              <code>
                {renderCode ? (
                  renderCode(block)
                ) : highlight ? (
                  <TokenLines lines={highlight(block.code, block.language)} lineNumbers={codeLineNumbers} />
                ) : (
                  block.code
                )}
              </code>
            </pre>
          </div>
        ),
      );

    const renderEntry = (entry: TranscriptEntry) => {
      if (entry.kind === 'event') {
        return (
          <div
            key={entry.id}
            data-slot="transcript-event"
            className="flex flex-none items-center justify-center gap-1.5 text-xs text-[color:var(--oui-panel-meta-fg)]"
          >
            {entry.icon ? (
              <span aria-hidden="true" className="inline-flex flex-none [&_svg]:size-3.5">
                {entry.icon}
              </span>
            ) : null}
            <span className="min-w-0 truncate">{entry.text}</span>
          </div>
        );
      }
      const blocks = blocksOf(entry);
      if (entry.kind === 'message') {
        return (
          <div
            key={entry.id}
            data-slot="transcript-message"
            data-has-code={blocks?.some((block) => block.type === 'code') ? 'true' : undefined}
            className={cn(transcriptBubbleVariants({ kind: 'message' }), blocks?.some((block) => block.type === 'code') && 'max-w-full self-stretch')}
          >
            {blocks ? renderBlocks(entry, blocks) : entry.text}
            {copyControl(entry)}
          </div>
        );
      }
      return (
        <div
          key={entry.id}
          data-slot="transcript-speech"
          data-interim={entry.interim ? 'true' : undefined}
          className={transcriptBubbleVariants({ kind: 'speech', interim: Boolean(entry.interim) })}
        >
          <span className="flex items-center gap-1.5 text-[11.5px] leading-[1.3]">
            <span data-slot="transcript-label" className={transcriptLabelToneClasses[entry.tone ?? 'success']}>
              {entry.speaker} · {entry.time}
            </span>
            {entry.edited ? (
              <Tag
                data-slot="transcript-edited"
                className="min-h-0 rounded border-[color:var(--oui-panel-divider)] bg-transparent px-1.5 py-0 text-[10.5px] leading-[1.5] font-normal text-[color:var(--oui-panel-meta-fg)] shadow-none"
              >
                {editedLabel}
              </Tag>
            ) : null}
          </span>
          {blocks ? renderBlocks(entry, blocks) : <span>{entry.text}</span>}
          {copyControl(entry)}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        role="log"
        aria-label={ariaLabel}
        data-slot="transcript"
        className={cn('mt-auto flex min-w-0 flex-none flex-col gap-2', className)}
        {...rest}
      >
        {entries.map(renderEntry)}
      </div>
    );
  },
);
Transcript.displayName = 'Transcript';
