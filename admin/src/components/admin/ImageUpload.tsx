'use client';

import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { IconImage, IconUpload, IconX } from '@/components/ui/icons';

export interface ImageUploadProps {
  label?: string;
  hint?: string;
  ratio?: string;
  /** Existing local preview URL (object URL) if any. */
  value?: string | null;
  onChange: (objectUrl: string | null, file: File | null) => void;
  maxSizeMb?: number;
}

/**
 * Local-preview-only image field. Creates a browser object URL so the admin
 * can see the picture immediately. NOTHING is uploaded to a server in demo
 * mode — the file only exists in the browser until a backend is wired.
 */
export function ImageUpload({
  label,
  hint = 'JPG, PNG or WebP, max 5MB',
  ratio = '16 / 10',
  value = null,
  onChange,
  maxSizeMb = 5,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const id = useId();

  function accept(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!/image\/(png|jpe?g|webp)/.test(file.type)) {
      setError('Please choose a PNG, JPG or WebP image.');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMb}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(url, file);
  }

  function clear() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      {label && <span className="field-label">{label}</span>}
      <div
        className={cn(
          'image-slot rounded-2xl border-2 border-dashed transition-colors',
          dragging ? 'border-primary bg-primary-soft/40' : 'border-blush-deep/50',
        )}
        style={{ aspectRatio: ratio }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          accept(e.dataTransfer.files?.[0]);
        }}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={clear}
              aria-label="Remove image"
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink shadow hover:bg-white"
            >
              <IconX width={16} height={16} />
            </button>
            <span className="absolute bottom-2 left-2 rounded-full bg-plum/70 px-2 py-0.5 text-[11px] font-medium text-white">
              Local preview only
            </span>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-rose-soft"
          >
            <IconUpload width={26} height={26} />
            <span className="text-sm font-semibold text-plum">Drag and drop an image here</span>
            <span className="text-xs text-ink-muted">or click to upload · {hint}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => accept(e.target.files?.[0])}
      />
      {!preview && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <IconImage width={16} height={16} /> Choose image
        </button>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
