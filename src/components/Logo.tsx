import Link from "next/link";

/**
 * The CDD Pays-Bas wordmark — the same artwork the public site uses.
 *
 * ── WHY THE REAL FILE AND NOT THE SVG RECREATION ────────────────────────────
 * This used to draw a hand-built sunburst beside type set in the page font. It
 * was a good likeness and it was still a different logo: the ray geometry, the
 * letter-spacing and the blue of "PAYS-BAS" were all approximations. Set side
 * by side with cddpaysbas.nl the two read as two organisations, which is the
 * one thing a supporter crossing from the site into the portal must not think.
 *
 * So this is the file itself, copied from the public site's assets.
 *
 * ── THE DARK-SURFACE PROBLEM ────────────────────────────────────────────────
 * The artwork is a blue starburst with a BLACK wordmark on transparency. On a
 * light ground that is correct; on a dark one the wordmark disappears and the
 * mark floats next to nothing.
 *
 * `surface="dark"` applies `brightness(0) invert(1)`, which collapses every
 * opaque pixel to white — it flattens the artwork to black first, so the blue
 * and the black land on the same value, then flips it. The logo then reads as
 * a clean white silhouette rather than a half-visible one. The cost is the
 * brand blue, which no single CSS filter can preserve while also lifting the
 * black out of a flat PNG. If a light-variant asset is ever supplied, drop it
 * in and branch on `surface` here; every call site picks it up unchanged.
 *
 * A prop rather than utility classes repeated at each call site: a new dark
 * section then gets a legible logo by construction rather than by memory.
 */
export default function Logo({
  logo,
  siteName = "CDD Pays-Bas",
  className = "",
  surface = "light",
  href = "/",
  priority = false,
}: {
  /** Overrides the bundled artwork — set from SiteSettings in the admin. */
  logo?: string | null;
  siteName?: string;
  /** Sizing classes: a height plus w-auto. */
  className?: string;
  /** The ground this sits on. "dark" inverts the artwork to white. */
  surface?: "light" | "dark";
  /** Where the mark links to; pass null to render it as a plain image. */
  href?: string | null;
  priority?: boolean;
}) {
  const image = (
    /*
     * eslint-disable-next-line @next/next/no-img-element — a plain img on
     * purpose. next/image would need the uploaded-logo case allow-listed by
     * host, and this is a 106 kB asset rendered at a fixed height; the
     * optimiser has nothing to add.
     */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo || "/brand/cdd-logo.png"}
      alt={siteName}
      width={757}
      height={277}
      // No opacity. Dimming a logo that is already competing with a dark
      // ground is the difference between "white" and "washed out".
      className={`w-auto object-contain ${surface === "dark" ? "brightness-0 invert" : ""} ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={siteName}>
      {image}
    </Link>
  );
}
