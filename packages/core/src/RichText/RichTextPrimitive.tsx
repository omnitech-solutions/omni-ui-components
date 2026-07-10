import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
} from 'lucide-react';

import { cn } from 'lib/utils';
import { inputVariants } from '../Input/Input.variants';

export interface RichTextPrimitiveProps {
  id?: string;
  name?: string;
  value?: string;
  onChange?: (next: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  'aria-describedby'?: string;
  'data-testid'?: string;
  className?: string;
}

const ToolbarButton: React.FC<{
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ active, onClick, label, children, disabled }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'inline-flex size-7 items-center justify-center rounded-md transition-colors cursor-pointer',
      'border-0 bg-transparent text-[var(--oui-foreground-muted)]',
      'hover:bg-blue-500/10 hover:text-blue-300',
      active && 'bg-blue-500/15 text-blue-300',
      'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--oui-foreground-muted)]',
    )}
  >
    {children}
  </button>
);

const Divider: React.FC = () => <span className="mx-1 h-5 w-px bg-[var(--oui-border-field)]" aria-hidden="true" />;

/** Raw TipTap editor + toolbar (no chrome). */
export const RichTextPrimitive = React.forwardRef<HTMLDivElement, RichTextPrimitiveProps>(
  ({ id, value = '', onChange, placeholder, disabled, required, invalid, readOnly, className, ...rest }, ref) => {
    const testId = rest['data-testid'] ?? id;

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ link: false }),
        Underline,
        Highlight,
        Link.configure({
          openOnClick: false,
          autolink: false,
          linkOnPaste: true,
          HTMLAttributes: { class: 'text-blue-400 underline underline-offset-2', rel: 'noopener noreferrer nofollow', target: '_blank' },
        }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
      ],
      content: value,
      editable: !disabled && !readOnly,
      onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
    });

    React.useEffect(() => {
      if (!editor) return;
      if (editor.getHTML() !== value) editor.commands.setContent(value || '', { emitUpdate: false });
    }, [editor, value]);

    React.useEffect(() => {
      editor?.setEditable(!disabled && !readOnly);
    }, [editor, disabled, readOnly]);

    const promptLink = React.useCallback(() => {
      if (!editor) return;
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }
      const url = window.prompt('Link URL', '');
      if (!url) return;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const rt = disabled || readOnly;

    return (
      <div
        ref={ref}
        data-slot="rich-text"
        data-testid={testId}
        className={cn(inputVariants({ variant: 'bordered', inputSize: 'default' }), 'h-auto flex-col p-0 gap-0', className)}
      >
        <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--oui-border-field)] px-2 py-1.5">
          <ToolbarButton
            label="Heading 1"
            active={editor?.isActive('heading', { level: 1 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={rt}
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            active={editor?.isActive('heading', { level: 2 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={rt}
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            active={editor?.isActive('heading', { level: 3 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={rt}
          >
            <Heading3 className="size-4" />
          </ToolbarButton>
          <Divider />
          <ToolbarButton label="Bold" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} disabled={rt}>
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={rt}>
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()} disabled={rt}>
            <UnderlineIcon className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Strikethrough" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()} disabled={rt}>
            <Strikethrough className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Highlight" active={editor?.isActive('highlight')} onClick={() => editor?.chain().focus().toggleHighlight().run()} disabled={rt}>
            <Highlighter className="size-4" />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            label="Bullet list"
            active={editor?.isActive('bulletList')}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={rt}
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            active={editor?.isActive('orderedList')}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            disabled={rt}
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            active={editor?.isActive('blockquote')}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            disabled={rt}
          >
            <Quote className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Code block"
            active={editor?.isActive('codeBlock')}
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            disabled={rt}
          >
            <Code className="size-4" />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            label="Align left"
            active={editor?.isActive({ textAlign: 'left' })}
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            disabled={rt}
          >
            <AlignLeft className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align center"
            active={editor?.isActive({ textAlign: 'center' })}
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            disabled={rt}
          >
            <AlignCenter className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Align right"
            active={editor?.isActive({ textAlign: 'right' })}
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            disabled={rt}
          >
            <AlignRight className="size-4" />
          </ToolbarButton>
          <Divider />
          <ToolbarButton label="Link" active={editor?.isActive('link')} onClick={promptLink} disabled={rt}>
            <LinkIcon className="size-4" />
          </ToolbarButton>
          <div className="ml-auto flex items-center gap-0.5">
            <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={rt || !editor?.can().undo()}>
              <Undo2 className="size-4" />
            </ToolbarButton>
            <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={rt || !editor?.can().redo()}>
              <Redo2 className="size-4" />
            </ToolbarButton>
          </div>
        </div>
        <EditorContent
          editor={editor}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={rest['aria-describedby']}
          aria-required={required || undefined}
          className={cn(
            'prose prose-sm prose-invert max-w-none min-h-32 px-3 py-2 text-sm text-[var(--oui-foreground)] focus-within:outline-none',
            '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-28',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:text-[var(--oui-foreground-placeholder)]',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none',
            '[&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0',
          )}
        />
      </div>
    );
  },
);
RichTextPrimitive.displayName = 'RichTextPrimitive';
