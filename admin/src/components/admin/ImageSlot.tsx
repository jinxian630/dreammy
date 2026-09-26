'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { assetPath } from '@/lib/images';
import { IconImage } from '@/components/ui/icons';

export interface ImageSlotProps {
  imageKey?: string | null;
  alt?: string;
  /** CSS aspect-ratio, e.g. "16 / 10". Reserves space so layout never shifts. */
  ratio?: string;
  rounded?: string;
  className?: string;
  /** Optional label shown inside the empty slot. */
  caption?: string;
}

/**
 * Renders artwork when the mapped file exists; otherwise a clean, empty
 * placeholder of the correct aspect ratio. Never shows a broken-image icon and
 * never collapses the layout — artwork is dropped in later (see ASSET-MANIFEST).
 */
export function ImageSlot({
  imageKey,
  alt = '',
  ratio = '16 / 10',
  rounded = 'rounded-2xl',
  className,
  caption,
}: ImageSlotProps) {
  const src = assetPath(imageKey);
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div
      className={cn('image-slot', rounded, className)}
      style={{ aspectRatio: ratio }}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : alt || 'Image placeholder'}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="flex flex-col items-center gap-1 text-rose-soft/70">
          <IconImage width={26} height={26} />
          {caption && <span className="text-[11px] font-medium">{caption}</span>}
        </span>
      )}
    </div>
  );
}
