"use client";

import { useState } from "react";
import { initials } from "@/lib/portal";

/**
 * Member portrait, falling back to initials.
 *
 * Two failure modes, as on the public site: no image on file, and an image
 * that 404s. A broken-image icon on a named professional's card is a worse
 * introduction than their own initials in the brand colours.
 */
export default function Avatar({
  name,
  src,
  size = 48,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatars come from
      // arbitrary user-supplied URLs, which next/image would need configured
      // hosts for; a plain img with a fallback is the honest choice here.
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-400 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}
