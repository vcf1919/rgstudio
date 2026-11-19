/**
 * Default parameters for every effect. The values reproduce prototipo.html exactly.
 * Tune them live at /lab and paste the copied JSON into `glass` below.
 */
export const glass = {
  /** main drop radius as a fraction of the shorter side */
  radiusDesktop: 0.15,
  radiusMobile: 0.2,
  mobileBreakpoint: 700,
  /** inertia of the main drop (0–1, higher = snappier) */
  follow: 0.09,
  /** extra snap while charging */
  chargeFollow: 0.25,
  /** liquid trail: how tightly each drop follows the previous one */
  trail: 0.22,
  /** click/tap heartbeat */
  pulseAmount: 0.35,
  pulseDecay: 0.93,
  /** explosion droplets (recompiles the shader) */
  drops: 26,
  /** optics */
  refraction: 0.42,
  aberration: 1,
  specular: 0.85,
  rim: 0.28,
  /** shockwave speed multiplier (1 = prototype) */
  waveSpeed: 1,
  /** idle autopilot: ms without input before it starts, and speed multiplier */
  idleMs: 3200,
  autoSpeed: 1,
  /** charge / squeeze */
  swell: 0.28,
  squeeze: 0.22,
  /** intro bounce (seconds) */
  intro: 1.1,
  /** screen shake in px at the burst */
  shake: 4,
  /** canvas pixel-ratio cap */
  dprMax: 1.5,
};

export type GlassParams = typeof glass;

/** Hero scroll sequence, as fractions of the 280svh wrapper's progress (hp). */
export const heroScroll = {
  chargeEnd: 0.3,
  explodeStart: 0.34,
  explodeEnd: 0.95,
};

export const cursor = { size: 10, big: 56 };
export const magnetic = { radius: 200, pull: 0.35, label: 0.15 };
export const preview = { follow: 0.12, scale: 0.14, maxTilt: 14 };

/** Canvas headline size (CSS px) for a W×H area. Always capped at 88 % of the width as well. */
export const headlineScale = {
  hero: (W: number, H: number) => (W < 700 ? Math.min(W * 0.2, H * 0.14) : Math.min(W * 0.155, H * 0.3)),
  cta: (W: number, H: number) => (W < 700 ? Math.min(W * 0.24, H * 0.16) : Math.min(W * 0.19, H * 0.34)),
};
