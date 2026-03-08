import React, { useState, useRef, memo } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { uploadFile } from '../../services/storageService';

function UrlWithUploadInner({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setUploadError('Upload failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-500">{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={e => { onChange(e.target.value); setUploadError(null); }}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
          placeholder={placeholder || 'https://...'}
        />
        <label className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 cursor-pointer transition-colors ${uploading ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
          {uploading ? (
            <Loader2 size={18} className="text-indigo-500 animate-spin" />
          ) : (
            <Paperclip size={18} className="text-slate-400" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      </div>
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}

export const UrlWithUpload = memo(UrlWithUploadInner);
