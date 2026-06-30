/**
 * CDD sunburst mark — a faithful recreation of the logo icon: a radial burst of
 * tapered blue rays with a left-to-right gradient. Pure SVG so it stays crisp at
 * any size and follows the brand blues.
 */
export default function Sunburst({ className = "h-10 w-10" }: { className?: string }) {
  const rays = 16;
  const cx = 50;
  const cy = 50;
  const inner = 12; // inner gap radius
  const outer = 48; // ray tip radius
  const halfW = 4.2; // ray half-width at the base

  const items = Array.from({ length: rays }, (_, i) => {
    const a = (i / rays) * Math.PI * 2 - Math.PI / 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // perpendicular for width
    const px = -sa;
    const py = ca;
    const x1 = cx + ca * inner + px * halfW;
    const y1 = cy + sa * inner + py * halfW;
    const x2 = cx + ca * inner - px * halfW;
    const y2 = cy + sa * inner - py * halfW;
    const x3 = cx + ca * outer; // tip
    const y3 = cy + sa * outer;
    return `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
  });

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="CDD Pays-Bas">
      <defs>
        <linearGradient id="cdd-burst" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#5b9bd5" />
          <stop offset="55%" stopColor="#2f6fe0" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {items.map((pts, i) => (
        <polygon key={i} points={pts} fill="url(#cdd-burst)" />
      ))}
    </svg>
  );
}
