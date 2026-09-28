"use client";

/*
 * Ported verbatim from the public site (cddayoub) so the two render the
 * identical field rather than two similar ones — same link distance, same
 * node density, same colours. Changes belong in both copies or in neither.
 *
 * The only edit is this "use client" directive: the component is all canvas
 * and effects, which a server component cannot run.
 */
import { useEffect, useRef } from 'react';

/**
 * Fibre-optic particle constellation for hero and accent sections.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY CANVAS AND NOT THREE.JS
 *
 * Three.js is ~600 kB minified. This bundle is already 515 kB and past Vite's
 * chunk warning, and the effect is a 2D node graph — there is no geometry,
 * lighting or camera work that would justify a WebGL renderer. Hand-written
 * canvas costs ~2 kB and runs on hardware where WebGL is disabled or absent.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Accessibility and performance are load-bearing here, not afterthoughts:
 *
 *   - `aria-hidden` and `pointer-events-none`. It is decoration; it must never
 *     appear in the accessibility tree or intercept a click on the CTA above it.
 *   - `prefers-reduced-motion: reduce` paints ONE static frame and starts no
 *     animation loop. A drifting field of nodes behind text is exactly the kind
 *     of continuous background motion WCAG 2.2 asks to be able to switch off.
 *   - The loop stops when the tab is hidden (visibilitychange) and when the
 *     canvas scrolls out of view (IntersectionObserver), so it does not burn
 *     battery animating something nobody is looking at.
 *   - Device pixel ratio is capped at 2. On a 3× phone an uncapped canvas is
 *     2.25× the pixels for no visible gain.
 *   - Node count scales with area and is hard-capped, so a large desktop
 *     viewport cannot push the O(n²) link pass into frame drops.
 */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** Distance within which two nodes are joined by a fibre. */
const LINK_DISTANCE = 130;
/** Distance within which the pointer joins a node. */
const POINTER_DISTANCE = 170;
/** One node per this many square pixels of canvas. */
const AREA_PER_NODE = 14_000;
const MAX_NODES = 90;
const MIN_NODES = 18;

export function ParticleNetwork({
  className = '',
  variant = 'light',
}: {
  className?: string;
  /** 'light' draws on a dark section; 'dark' draws on a light section. */
  variant?: 'light' | 'dark';
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rgb = variant === 'light' ? '125, 211, 252' : '37, 99, 235';

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    const pointer = { x: -9999, y: -9999, active: false };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      // A collapsed container (display:none, or measured before layout) would
      // otherwise divide by zero when seeding the node count.
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.round((width * height) / AREA_PER_NODE);
      const count = Math.max(MIN_NODES, Math.min(MAX_NODES, target));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Slow drift. Fast movement behind text is unreadable and nauseating.
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.6,
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Fibres first, so nodes sit on top of the lines rather than under them.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DISTANCE) continue;
          const alpha = (1 - dist / LINK_DISTANCE) * 0.28;
          ctx!.strokeStyle = `rgba(${rgb}, ${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(nodes[i].x, nodes[i].y);
          ctx!.lineTo(nodes[j].x, nodes[j].y);
          ctx!.stroke();
        }

        if (pointer.active) {
          const dx = nodes[i].x - pointer.x;
          const dy = nodes[i].y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_DISTANCE) {
            const alpha = (1 - dist / POINTER_DISTANCE) * 0.55;
            ctx!.strokeStyle = `rgba(${rgb}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(pointer.x, pointer.y);
            ctx!.stroke();
          }
        }
      }

      for (const node of nodes) {
        // Glow: one soft wide disc under a bright core. Cheaper than
        // shadowBlur, which forces a separate raster pass per shape.
        const glow = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 5);
        glow.addColorStop(0, `rgba(${rgb}, 0.5)`);
        glow.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.r * 5, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(${rgb}, 0.9)`;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function step() {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off the edges rather than wrapping: a node reappearing on the
        // opposite side reads as a glitch at this density.
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));

        if (pointer.active) {
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_DISTANCE && dist > 0.5) {
            // Gentle drift towards the cursor — enough to feel responsive
            // without the field collapsing onto the pointer.
            const pull = (1 - dist / POINTER_DISTANCE) * 0.35;
            node.x -= (dx / dist) * pull;
            node.y -= (dy / dist) * pull;
          }
        }
      }
      draw();
      frame = requestAnimationFrame(step);
    }

    function start() {
      if (reduceMotion || frame) return;
      frame = requestAnimationFrame(step);
    }
    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }

    function onPointerMove(event: PointerEvent) {
      // Coarse pointers (touch) would leave a stale attractor behind after the
      // finger lifts, so only fine pointers drive the interaction.
      if (event.pointerType !== 'mouse') return;
      const rect = canvas!.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    }
    function onPointerLeave() {
      pointer.active = false;
    }
    function onVisibility() {
      if (document.hidden) stop();
      else if (visible) start();
    }

    resize();
    draw(); // First frame paints immediately, including under reduced motion.
    start();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden) start();
        else stop();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}

export default ParticleNetwork;
