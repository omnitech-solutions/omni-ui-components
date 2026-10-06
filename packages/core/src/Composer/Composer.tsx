// Why this is not an `Input` variation: `Input` / `InputPrimitive` render a single-line `<input>`. A composer needs a
// `<textarea>` that auto-grows to a max height, keeps newlines (Shift+Enter) and pairs Enter with send while staying IME
// safe, plus ArrowUp recall on an empty draft. An `<input>` cannot express any of these, and `Input`'s `actions` slot only
// sits beside the field. The composer reuses the panel Input's background/see-through tokens instead of forking its look.
import * as React from 'react';

import { cn } from 'lib/utils';
import { AttachmentStrip, acceptAttribute, useAttachmentDrop, type AttachmentItem } from '../Attachment';
import { attachmentDropOverlayClasses } from '../Attachment/Attachment.variants';
import { DEFAULT_ATTACHMENT_LABELS } from '../Attachment/Attachment.types';
import { DictationBar } from '../DictationBar';
import { IconButton } from '../IconButton';
import { useHoldToTalk } from '../lib';
import { useControllableState } from '../lib/use-controllable-state';
import { QueuedList, type QueuedItem } from '../QueuedList';
import { DEFAULT_COMPOSER_LABELS, sendStateOf, type ComposerApi, type ComposerProps } from './Composer.types';
import { composerBoxVariants, composerHintClasses, composerRoundClasses, composerTextareaClasses } from './Composer.variants';
import { SendButton } from './SendButton';

/** Assigns a value to a ref of either kind. */
const setRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
};

/**
 * Omni Composer: the message box of a chat. An auto-growing `<textarea>` (to `maxHeight`, default 200) in a box that
 * follows `--oui-panel-see-through`, with slots and optional built-in parts around it.
 *
 * Keys (ported from the original): Enter sends when `sendOnEnter` (Shift+Enter is a newline, and IME composition is
 * never interrupted); ArrowUp on an empty draft recalls the last prompt through `onRecallPrevious`; Escape stops a
 * running reply. A popover (see `useCommandTrigger`) is given first refusal through `onBeforeKeyDown`.
 *
 * The host owns the draft: `onSubmit(value, attachments)` is only called, so saving host state first (the original's
 * `prepareSend`) happens inside it, and nothing here clears `value`. While `streaming`, the send button reads Stop with an
 * empty draft and Queue with one (`onQueue`).
 *
 * Optional built-in parts, each present only when its callback is: attachments (`onFiles` turns on drop with an
 * overlay, paste and `openPicker`; `attachmentItems` draws the strip, `onRemoveAttachment` / `onAttachmentClick`), queued rows
 * (`queued`, `onRemoveQueued`), triggers (`triggers` + `onTrigger`) and dictation (`onDictationStart` shows the mic,
 * `dictationKey` adds hold-to-talk, the bar replaces the field while `dictating`).
 *
 * Variants: `stacked` (field over a toolbar row) and `pill` (one row). Slots: `above`, `attachments`, `popover`,
 * `leading`/`toolbar`/`trailing` (nodes, or functions of {@link ComposerApi}), `dictation`, `hint`. Every string is in
 * `labels`; every icon a node. Slots: `data-slot="composer" | "composer-box" | "composer-input"`.
 *
 * @example
 * <Composer value={text} onChange={setText} onSubmit={({ value, attachments }) => send(value, attachments)} onStop={stop} streaming={busy} sendIcon={<ArrowUp />} stopIcon={<Square />} />
 */
function ComposerInner<A extends AttachmentItem = AttachmentItem, Q extends QueuedItem = QueuedItem>(
    {
      value: valueProp,
      defaultValue = '',
      onChange,
      onSubmit,
      onQueue,
      onStop,
      onRecallPrevious,
      onFocus,
      onBlur,
      streaming = false,
      placeholder,
      sendOnEnter = true,
      maxHeight = 200,
      variant = 'stacked',
      disabled = false,
      stopOnEscape = true,
      attachmentItems,
      onRemoveAttachment,
      onAttachmentClick,
      attachmentRemoveIcon,
      attachmentKindIcons,
      onFiles,
      onReject,
      fileLimits,
      queued,
      onRemoveQueued,
      queuedIcon,
      queuedRemoveIcon,
      triggers,
      onTrigger,
      onDictationStart,
      onDictationFinish,
      onDictationCancel,
      dictationText = '',
      dictationKey,
      dictating: dictatingProp,
      micIcon,
      dictationCancelIcon,
      dictationDoneIcon,
      onBeforeKeyDown,
      onPaste,
      inputRef,
      textareaProps,
      leading,
      toolbar,
      trailing,
      attachments,
      above,
      popover,
      dictation,
      hint,
      sendIcon,
      stopIcon,
      queueIcon,
      showSend = true,
      labels: labelsProp,
      attachmentLabels,
      queuedLabels,
      className,
      ...rest
    }: ComposerProps<A, Q>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) {
    const labels = { ...DEFAULT_COMPOSER_LABELS, ...labelsProp };
    const [value, setValue] = useControllableState<string>(valueProp, defaultValue, onChange);
    const [listening, setListening] = useControllableState<boolean>(dictatingProp, false);
    const area = React.useRef<HTMLTextAreaElement | null>(null);
    const [rootEl, setRootEl] = React.useState<HTMLDivElement | null>(null);
    const caretToEnd = React.useRef(false);
    const items: A[] = attachmentItems ?? [];
    const hasText = value.trim().length > 0;
    const hasDraft = hasText || items.length > 0;
    const canQueue = Boolean(onQueue);
    const state = sendStateOf({ streaming, hasDraft, canQueue });

    // [STATE] Files: one allowlist for drop, paste and the picker; only when the host listens (`onFiles`).
    const drop = useAttachmentDrop({ ...fileLimits, current: items.length, onFiles, onReject, disabled: disabled || !onFiles });
    const api: ComposerApi = { openPicker: drop.openPicker, focus: () => area.current?.focus() };
    const slot = (node: React.ReactNode | ((api: ComposerApi) => React.ReactNode)) => (typeof node === 'function' ? node(api) : node);

    // [STATE] Grow with the content up to maxHeight, then scroll inside; shrink again when text is deleted.
    React.useLayoutEffect(() => {
      const element = area.current;
      if (!element) return;
      element.style.height = 'auto';
      element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
      element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden';
      // A recalled prompt puts the caret at the end, as the original focusInput does.
      if (caretToEnd.current) {
        caretToEnd.current = false;
        element.setSelectionRange(value.length, value.length);
      }
    }, [value, maxHeight]);

    // [STATE] Triggers: tell the host when one starts, changes or ends (so it can open its own popover).
    const lastTrigger = React.useRef<string>('');
    React.useEffect(() => {
      if (!onTrigger || !triggers) return;
      let hit: { id: string; query: string } | null = null;
      for (const trigger of triggers) {
        const match = trigger.pattern.exec(value);
        if (match) {
          hit = { id: trigger.id, query: match[1] ?? '' };
          break;
        }
      }
      const key = hit ? `${hit.id}\u0000${hit.query}` : '';
      if (key === lastTrigger.current) return;
      lastTrigger.current = key;
      onTrigger({ trigger: hit?.id ?? null, query: hit?.query ?? '' });
    }, [value, triggers, onTrigger]);

    const submit = () => {
      // [GUARD] A running reply with nothing typed: the button is Stop (absent without onStop).
      if (streaming && !hasText) {
        void onStop?.();
        return;
      }
      if (!hasText || disabled) return;
      // A draft typed while a reply runs is queued when the host listens for that; otherwise it is an ordinary submit.
      if (streaming && onQueue) void onQueue({ value, attachments: items });
      else void onSubmit?.({ value, attachments: items });
    };

    const startDictation = () => {
      if (!onDictationStart || listening) return;
      setListening(true);
      void onDictationStart();
    };
    const finishDictation = () => {
      if (!listening) return;
      setListening(false);
      void onDictationFinish?.(dictationText);
      setTimeout(() => area.current?.focus(), 0);
    };
    const cancelDictation = () => {
      setListening(false);
      void onDictationCancel?.();
      setTimeout(() => area.current?.focus(), 0);
    };
    useHoldToTalk({ code: dictationKey ?? '', enabled: Boolean(onDictationStart && dictationKey) && !disabled, active: listening, onStart: startDictation, onFinish: finishDictation });

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // [GUARD] An open popover owns the arrows, Enter, Tab and Escape.
      if (onBeforeKeyDown?.(event) === true) return;
      if (event.key === 'Enter' && !event.shiftKey && sendOnEnter && !event.nativeEvent.isComposing) {
        event.preventDefault();
        submit();
        return;
      }
      // Up on an empty box brings back the last thing you sent.
      if (event.key === 'ArrowUp' && value === '' && onRecallPrevious) {
        const last = onRecallPrevious();
        if (last) {
          event.preventDefault();
          caretToEnd.current = true;
          setValue(last);
        }
        return;
      }
      if (event.key === 'Escape' && stopOnEscape && streaming && onStop) {
        event.preventDefault();
        void onStop();
      }
    };

    const bar = dictation ?? (listening ? (
      <DictationBar
        text={dictationText}
        variant={variant}
        cancelIcon={dictationCancelIcon}
        doneIcon={dictationDoneIcon}
        onCancel={cancelDictation}
        onDone={finishDictation}
      />
    ) : null);

    const field = bar ?? (
      <textarea
        ref={(node) => {
          area.current = node;
          setRef(inputRef, node);
        }}
        data-slot="composer-input"
        aria-label={labels.message}
        rows={1}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className={composerTextareaClasses}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => onFocus?.()}
        onBlur={() => onBlur?.()}
        onPaste={(event) => {
          if (onFiles) drop.onPaste(event);
          if (!event.defaultPrevented) onPaste?.(event);
        }}
        {...textareaProps}
      />
    );

    const showSendButton = showSend && (state === 'streaming' ? Boolean(onStop) : Boolean(onSubmit) || (state === 'queue' && canQueue));
    const actions = bar ? null : (
      <>
        {onDictationStart ? (
          <IconButton
            variant="ghost"
            iconSize="md"
            icon={micIcon ?? <span aria-hidden="true">●</span>}
            label={labels.dictate}
            data-slot="composer-mic"
            className={composerRoundClasses}
            onClick={startDictation}
          />
        ) : null}
        {slot(trailing)}
        {showSendButton ? (
          <SendButton state={state} sendIcon={sendIcon ?? <span aria-hidden="true">↑</span>} stopIcon={stopIcon} queueIcon={queueIcon} labels={labels} onClick={submit} />
        ) : null}
      </>
    );

    const dropLabel = { ...DEFAULT_ATTACHMENT_LABELS, ...attachmentLabels }.dropHere;
    const { ref: pickerRef, ...pickerProps } = drop.inputProps;

    return (
      <div
        ref={(node) => {
          setRootEl(node);
          setRef(ref, node);
        }}
        data-slot="composer"
        data-variant={variant}
        data-streaming={streaming ? 'true' : undefined}
        data-dragging={drop.dragging ? 'true' : undefined}
        className={cn('relative flex min-w-0 flex-col gap-2', className)}
        {...(onFiles ? drop.dropProps : {})}
        {...rest}
      >
        {above}
        {queued && queued.length > 0 ? <QueuedList items={queued} icon={queuedIcon} removeIcon={queuedRemoveIcon} onRemove={onRemoveQueued} labels={queuedLabels} /> : null}
        {items.length > 0 ? (
          <AttachmentStrip items={items} onRemove={onRemoveAttachment} onClick={onAttachmentClick} removeIcon={attachmentRemoveIcon} kindIcons={attachmentKindIcons} labels={attachmentLabels} />
        ) : null}
        {attachments}
        {typeof popover === 'function' ? popover({ anchor: rootEl }) : popover}
        <div data-slot="composer-box" className={composerBoxVariants({ variant, disabled })}>
          {variant === 'pill' ? (
            <>
              {bar ? null : slot(leading)}
              {field}
              {bar ? null : slot(toolbar)}
              {actions}
            </>
          ) : (
            <>
              {field}
              {bar ? null : (
                <div data-slot="composer-toolbar" className="flex min-w-0 items-center gap-1.5">
                  {slot(leading)}
                  {slot(toolbar)}
                  <div className="flex-1" />
                  {actions}
                </div>
              )}
            </>
          )}
        </div>
        {hint ? (
          <div data-slot="composer-hint" className={composerHintClasses}>
            {hint}
          </div>
        ) : null}
        {onFiles ? <input ref={pickerRef} aria-label="Attach files" {...pickerProps} accept={acceptAttribute(fileLimits?.accept)} /> : null}
        {drop.dragging ? (
          <div data-slot="attachment-drop-overlay" role="status" className={attachmentDropOverlayClasses}>
            {dropLabel}
          </div>
        ) : null}
      </div>
    );
}

export const Composer = React.forwardRef(ComposerInner) as <A extends AttachmentItem = AttachmentItem, Q extends QueuedItem = QueuedItem>(
  props: ComposerProps<A, Q> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
(Composer as { displayName?: string }).displayName = 'Composer';
