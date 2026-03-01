import React, { useState, useRef } from 'react';
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

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, className, label }: RichTextEditorProps) => {
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

  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), label: 'Bold' },
    { icon: Italic, action: () => insertText('_', '_'), label: 'Italic' },
    { icon: List, action: () => insertText('\n- ', ''), label: 'Unordered List' },
    { icon: ListOrdered, action: () => insertText('\n1. ', ''), label: 'Ordered List' },
    { icon: LinkIcon, action: () => insertText('[', '](url)'), label: 'Link' },
    { icon: Sigma, action: () => insertText('$', '$'), label: 'Inline Math' },
    { icon: Code, action: () => insertText('```\n', '\n```'), label: 'Code Block' },
  ];

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
              !isEditing ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Eye size={14} /> Preview
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1",
              isEditing ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
              {toolbarButtons.map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={btn.action}
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
              className="w-full h-48 p-4 outline-none resize-none text-sm font-sans leading-relaxed"
            />
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="min-h-[12rem] p-4 bg-white border border-slate-200 rounded-2xl cursor-text hover:border-indigo-300 transition-all"
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
      <p className="text-[10px] text-slate-400 italic">Supports Markdown and LaTeX (e.g. $E=mc^2$)</p>
    </div>
  );
};

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
