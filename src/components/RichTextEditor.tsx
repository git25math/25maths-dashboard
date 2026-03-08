import React, { useState, useRef, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Sigma, 
  Eye, 
  Edit3, 
  List, 
  ListOrdered,
  Code
} from 'lucide-react';
import { cn } from '../lib/utils';

const TOOLBAR_BUTTONS = [
  { icon: Bold, before: '**', after: '**', label: 'Bold' },
  { icon: Italic, before: '_', after: '_', label: 'Italic' },
  { icon: List, before: '\n- ', after: '', label: 'Unordered List' },
  { icon: ListOrdered, before: '\n1. ', after: '', label: 'Ordered List' },
  { icon: LinkIcon, before: '[', after: '](url)', label: 'Link' },
  { icon: Sigma, before: '$', after: '$', label: 'Inline Math' },
  { icon: Code, before: '```\n', after: '\n```', label: 'Code Block' },
] as const;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  editorHeightClass?: string;
  previewMinHeightClass?: string;
  helperText?: string;
}

export const RichTextEditor = memo(function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  label,
  editorHeightClass = 'h-48',
  previewMinHeightClass = 'min-h-[12rem]',
  helperText = 'Supports Markdown and LaTeX (e.g. $E=mc^2$)',
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Focus back and set selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        {label && <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</label>}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1",
              !isEditing ? "bg-white text-indigo-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Eye size={14} /> Preview
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1",
              isEditing ? "bg-white text-indigo-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Edit3 size={14} /> Edit
          </button>
        </div>
      </div>

      <div className="relative group">
        {isEditing ? (
          <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
              {TOOLBAR_BUTTONS.map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertText(btn.before, btn.after)}
                  title={btn.label}
                  className="p-2 hover:bg-white hover:text-indigo-600 rounded-lg text-slate-500 transition-all"
                >
                  <btn.icon size={16} />
                </button>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn("w-full p-4 outline-none resize-none text-sm font-sans leading-relaxed", editorHeightClass)}
            />
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className={cn("p-4 bg-white border border-slate-200 rounded-2xl cursor-text hover:border-indigo-300 transition-all", previewMinHeightClass)}
          >
            {value ? (
              <div className="markdown-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <span className="text-slate-400 text-sm italic">{placeholder || 'Click to start writing...'}</span>
            )}
          </div>
        )}
      </div>
      {helperText && <p className="text-[10px] text-slate-400 italic">{helperText}</p>}
    </div>
  );
});

export const MarkdownRenderer = ({ content, className }: { content: string, className?: string }) => {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkMath]} 
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
