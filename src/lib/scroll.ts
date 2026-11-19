/**
 * Smooth scroll (Lenis) + one shared scroll/resize ticker.
 * Lenis is off with prefers-reduced-motion; on touch devices Lenis leaves native scrolling alone.
 * Lenis drives window.scrollTo, so a single native `scroll` listener covers both cases.
 */
import Lenis from 'lenis';
import { prefersReducedMotion } from './media';

type Cb = () => void;
const subs = new Set<Cb>();
let lenis: Lenis | null = null;
let rafId = 0;
let bound = false;

const run = () => subs.forEach((cb) => cb());

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return;
  lenis = new Lenis({ lerp: 0.09 });
  const raf = (t: number) => { lenis?.raf(t); rafId = requestAnimationFrame(raf); };
  rafId = requestAnimationFrame(raf);
}

export function stopSmoothScroll() {
  cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = null;
}

export function getLenis() { return lenis; }

/** Subscribe to scroll + resize. Returns an unsubscribe function. The callback runs once immediately. */
export function onScroll(cb: Cb) {
  if (!bound) {
    addEventListener('scroll', run, { passive: true });
    addEventListener('resize', run, { passive: true });
    bound = true;
  }
  subs.add(cb);
  cb();
  return () => { subs.delete(cb); };
}
