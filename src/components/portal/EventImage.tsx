"use client";

import { useState } from "react";

/**
 * An event photo that degrades to a branded placeholder instead of an empty
 * white box when the file is missing, mis-pathed or fails to load.
 */
export default function EventImage({ src, className }: { src: string | null; className: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`${className} grid place-items-center bg-gradient-to-br from-brand-50 to-brand/20 text-brand`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 opacity-70">
          <path d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />
  );
}
