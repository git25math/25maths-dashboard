import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Highlighter, Quote, Minus, Undo2, Redo2,
  Link as LinkIcon, Unlink,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ensureHtml } from '../lib/htmlUtils';

/* Platform-aware shortcut labels */
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const mod = isMac ? '⌘' : 'Ctrl+';

interface TipTapEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function TipTapEditor({
  content,
  onUpdate,
  editable = true,
  placeholder = 'Start typing...',
  className,
  debounceMs = 1000,
}: TipTapEditorProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHtml = useRef<string | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [docText, setDocText] = useState('');

  const flush = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingHtml.current !== null) {
      onUpdateRef.current(pendingHtml.current);
      pendingHtml.current = null;
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-indigo-600 hover:underline cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: ensureHtml(content),
    editable,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      pendingHtml.current = html;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        pendingHtml.current = null;
        onUpdateRef.current(html);
      }, debounceMs);
    },
    onTransaction: ({ editor: ed }) => {
      setDocText(ed.state.doc.textContent);
    },
  });

  const wordCount = useMemo(() => {
    const chars = docText.length;
    const words = docText.trim() ? docText.trim().split(/\s+/).length : 0;
    return { words, characters: chars };
  }, [docText]);

  /* Link helpers */
  const openLinkInput = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes('link').href || '';
    setLinkUrl(existing);
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor]);

  // Sync editable prop
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Sync external content changes (e.g. transcription completes)
  const prevContentRef = useRef(content);
  useEffect(() => {
    if (!editor) return;
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      const html = ensureHtml(content);
      if (editor.getHTML() !== html) {
        editor.commands.setContent(html);
      }
    }
  }, [editor, content]);

  // Flush on unmount (avoid losing edits when collapsing)
  useEffect(() => {
    return () => flush();
  }, [flush]);

  if (!editor) return null;

  return (
    <div className={cn('border border-slate-200 rounded-xl overflow-hidden', className)}>
      {/* Toolbar — hidden when not editable */}
      {editable && (
        <div className="flex items-center gap-0.5 p-1.5 bg-slate-50 border-b border-slate-200 flex-wrap">
          {/* Format group */}
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title={`Bold (${mod}B)`}><Bold size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title={`Italic (${mod}I)`}><Italic size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title={`Underline (${mod}U)`}><UnderlineIcon size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title={`Strikethrough (${mod}⇧X)`}><Strikethrough size={15} /></ToolBtn>

          <Sep />

          {/* Headings */}
          <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1"><Heading1 size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"><Heading3 size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()} title="Paragraph"><Pilcrow size={15} /></ToolBtn>

          <Sep />

          {/* Lists */}
          <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered size={15} /></ToolBtn>

          <Sep />

          {/* Alignment */}
          <ToolBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left"><AlignLeft size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center"><AlignCenter size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right"><AlignRight size={15} /></ToolBtn>

          <Sep />

          {/* Other */}
          <ToolBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title={`Highlight (${mod}⇧H)`}><Highlighter size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title={`Blockquote (${mod}⇧B)`}><Quote size={15} /></ToolBtn>
          <ToolBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus size={15} /></ToolBtn>
          <ToolBtn active={editor.isActive('link')} onClick={openLinkInput} title={`Link (${mod}K)`}><LinkIcon size={15} /></ToolBtn>

          <Sep />

          {/* Undo / Redo */}
          <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title={`Undo (${mod}Z)`} disabled={!editor.can().undo()}><Undo2 size={15} /></ToolBtn>
          <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title={`Redo (${mod}⇧Z)`} disabled={!editor.can().redo()}><Redo2 size={15} /></ToolBtn>
        </div>
      )}

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
          <LinkIcon size={14} className="text-slate-400 shrink-0" />
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
              if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); editor.chain().focus().run(); }
            }}
            placeholder="Paste or type a URL…"
            className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
          />
          <button
            type="button"
            onClick={applyLink}
            className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors"
          >
            Apply
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={removeLink}
              title="Remove link"
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Unlink size={14} />
            </button>
          )}
        </div>
      )}

      <EditorContent editor={editor} className="tiptap" />

      {/* Bubble Menu — appears on text selection */}
      {editable && editor && (
        <BubbleMenu editor={editor} className="tiptap-bubble-menu flex items-center gap-0.5 p-1 bg-white rounded-xl shadow-lg border border-slate-200">
          <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title={`Bold (${mod}B)`}><Bold size={14} /></ToolBtn>
          <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title={`Italic (${mod}I)`}><Italic size={14} /></ToolBtn>
          <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title={`Underline (${mod}U)`}><UnderlineIcon size={14} /></ToolBtn>
          <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title={`Strikethrough (${mod}⇧X)`}><Strikethrough size={14} /></ToolBtn>
          <div className="w-px h-4 bg-slate-200 mx-0.5" />
          <ToolBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title={`Highlight (${mod}⇧H)`}><Highlighter size={14} /></ToolBtn>
          <ToolBtn active={editor.isActive('link')} onClick={openLinkInput} title={`Link (${mod}K)`}><LinkIcon size={14} /></ToolBtn>
        </BubbleMenu>
      )}

      {/* Floating Menu — appears on empty lines */}
      {editable && editor && (
        <FloatingMenu
          editor={editor}
          shouldShow={({ state }) => {
            const { $from } = state.selection;
            const node = $from.node();
            return node.type.name === 'paragraph' && node.content.size === 0;
          }}
          className="tiptap-floating-menu flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 py-1 min-w-[200px]"
        >
          <SlashItem icon={<Heading1 size={16} />} label="Heading 1" description="Large heading" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <SlashItem icon={<Heading2 size={16} />} label="Heading 2" description="Medium heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <SlashItem icon={<Heading3 size={16} />} label="Heading 3" description="Small heading" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
          <SlashItem icon={<List size={16} />} label="Bullet List" description="Unordered list" onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <SlashItem icon={<ListOrdered size={16} />} label="Numbered List" description="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <SlashItem icon={<Quote size={16} />} label="Blockquote" description="Indented quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <SlashItem icon={<Minus size={16} />} label="Divider" description="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        </FloatingMenu>
      )}

      {/* Word count footer */}
      {editable && (
        <div className="flex justify-end px-4 py-1.5 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-400">
            {wordCount.words} words · {wordCount.characters} characters
          </span>
        </div>
      )}
    </div>
  );
}

/* --- small helpers --- */

function ToolBtn({ active, onClick, title, disabled, children }: {
  active: boolean; onClick: () => void; title: string; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-lg text-slate-500 transition-all',
        active
          ? 'bg-white text-indigo-600 shadow-sm'
          : 'hover:bg-white hover:text-indigo-600',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5" />;
}

function SlashItem({ icon, label, description, onClick }: {
  icon: React.ReactNode; label: string; description: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors w-full"
    >
      <span className="text-slate-400">{icon}</span>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-400">{description}</span>
      </span>
    </button>
  );
}
