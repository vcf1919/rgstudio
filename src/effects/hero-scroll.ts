/**
 * Hero scroll sequence (prototipo.html → onScroll, hero part).
 * The 280svh wrapper's progress `hp` (0–1) drives the glass:
 *   0–0.30   charge: pulled to the centre, swelling and trembling
 *   0.34–0.95 burst + shockwave that finishes the headline
 * Reversible: the glass lerps towards these targets in both directions.
 */
import type { GlassInstance } from './liquid-glass';
import { heroScroll as cfg } from '../config/effects';
import { onScroll } from '../lib/scroll';
import { prefersReducedMotion } from '../lib/media';

export interface HeroScrollOptions {
  glass: GlassInstance;
  /** progress bar fill (scaleX) */
  bar?: HTMLElement | null;
  /** elements that fade out as soon as the scroll starts */
  fade?: HTMLElement[];
}

export const progressToGlass = (hp: number) => ({
  charge: Math.min(1, hp / cfg.chargeEnd),
  ex: Math.min(1, Math.max(0, (hp - cfg.explodeStart) / (cfg.explodeEnd - cfg.explodeStart))),
});

export function init(wrap: HTMLElement, { glass, bar, fade = [] }: HeroScrollOptions) {
  const reduce = prefersReducedMotion();
  const off = onScroll(() => {
    const vh = innerHeight;
    const b = wrap.getBoundingClientRect();
    const span = b.height - vh;
    const hp = span > 0 ? Math.min(1, Math.max(0, -b.top / span)) : 0;
    const g = reduce ? { charge: 0, ex: 0 } : progressToGlass(hp);
    glass.charge = g.charge; glass.ex = g.ex;
    if (bar) bar.style.transform = `scaleX(${hp})`;
    fade.forEach((c) => { c.style.opacity = hp > 0.05 ? String(Math.max(0, 1 - hp * 3)) : ''; });
  });
  return { destroy: off };
}
