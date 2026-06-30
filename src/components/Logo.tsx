import Link from "next/link";
import Sunburst from "./Sunburst";

/**
 * CDD Pays-Bas logo — faithful to the real brand mark (blue sunburst + wordmark
 * "CLUB DES DIRIGEANTS" / "PAYS-BAS").
 *
 * If you upload the official logo image and set SiteSettings.logo from the Admin
 * Dashboard, that image is used instead of the SVG recreation below.
 */
export default function Logo({
  logo,
  siteName = "CDD Pays-Bas",
  className = "",
  compact = false,
}: {
  logo?: string | null;
  siteName?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 ${className}`} aria-label={siteName}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={siteName} className="h-11 w-auto" />
      ) : (
        <>
          <Sunburst className={compact ? "h-9 w-9" : "h-11 w-11"} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-extrabold tracking-tight text-gray-900">
              CLUB DES DIRIGEANTS
            </span>
            <span className="text-[15px] font-extrabold tracking-[0.18em] text-accent">
              PAYS-BAS
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
