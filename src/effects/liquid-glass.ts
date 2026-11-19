/**
 * Liquid glass (metaballs) — ported 1:1 from prototipo.html (`Glass()`).
 * The headline is drawn twice on 2D canvases: an outlined "sketch" and a filled
 * "finished" version. Inside the metaball field the finished one shows through,
 * refracted. With `explode: true` a scroll-driven burst + shockwave finishes the
 * whole headline (driven from outside through the `charge` and `ex` setters).
 */
import FS from './liquid-glass.frag?raw';
import { glass as defaults, type GlassParams } from '../config/effects';
import { prefersReducedMotion } from '../lib/media';

export type Segment = { t: string; acc?: boolean };
export type Lines = Segment[][];

export interface GlassOptions {
  /** canvas to render into (defaults to the first <canvas> inside `el`) */
  canvas?: HTMLCanvasElement;
  lines: Lines;
  /** max font size in CSS px for a W×H area (it is also capped at 88 % of the width) */
  scale: (W: number, H: number) => number;
  /** mono label on the sketch; `{px}` is replaced with the font size */
  label: string;
  bgIn?: string;
  explode?: boolean;
  params?: Partial<GlassParams>;
  /** ignore prefers-reduced-motion (used by /lab) */
  forceMotion?: boolean;
}

export interface GlassInstance {
  /** 0–1: drop pulled to the centre, swelling and trembling */
  charge: number;
  /** 0–1: explosion + shockwave progress */
  ex: number;
  /** click heartbeat (decays on its own) */
  pulse: number;
  /** live-editable parameters (except `drops`, which needs a new instance) */
  readonly params: GlassParams;
  readonly webgl: boolean;
  destroy(): void;
}

const N = 8; // 0 main, 1-3 orbit, 4-7 trail
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FAM = '"Host Grotesk", sans-serif';
const SKETCH_BG = '#F1EFEA';
const INK = '#111110';
const ACC = '#FF4D12';

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

export function init(el: HTMLElement, opts: GlassOptions): GlassInstance {
  const canvas = opts.canvas ?? el.querySelector('canvas')!;
  const params: GlassParams = { ...defaults, ...opts.params };
  const P = opts.explode ? Math.max(0, Math.round(params.drops)) : 0;
  const NT = N + P;
  const reduce = opts.forceMotion ? false : prefersReducedMotion();
  const bgIn = opts.bgIn ?? '#EAE7E0';
  const { lines, scale, label } = opts;

  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  const t0c = document.createElement('canvas');
  const t1c = document.createElement('canvas');
  let W = 0, H = 0, DPR = 1;
  let prog: WebGLProgram | null = null;
  const U: Record<string, WebGLUniformLocation | null> = {};
  let tex0: WebGLTexture | null = null, tex1: WebGLTexture | null = null;
  let ok = false, visible = false, started = false, dead = false, raf = 0;

  const self: GlassInstance = {
    charge: 0, ex: 0, pulse: 0, params,
    get webgl() { return ok; },
    destroy,
  };

  /* ---------- textures ---------- */
  function drawTex(c: HTMLCanvasElement, solid: boolean) {
    const x = c.getContext('2d')!;
    c.width = W * DPR; c.height = H * DPR; x.setTransform(DPR, 0, 0, DPR, 0, 0);
    x.fillStyle = solid ? bgIn : SKETCH_BG; x.fillRect(0, 0, W, H);
    const ls = 'letterSpacing' in x;
    // fit: never wider than 88 % of the screen
    x.font = `500 100px ${FAM}`; if (ls) (x as any).letterSpacing = '-5.5px';
    const widest = Math.max(...lines.map((segs) => segs.reduce((s, sg) => s + x.measureText(sg.t).width, 0)));
    const fs = Math.min(scale(W, H), (W * 0.88) / widest * 100);
    x.font = `500 ${fs}px ${FAM}`; x.textBaseline = 'middle';
    if (ls) (x as any).letterSpacing = fs * -0.055 + 'px';
    const gap = fs * 0.95, cy = H * 0.5;
    lines.forEach((segs, i) => {
      const y = cy + (i - (lines.length - 1) / 2) * gap;
      const total = segs.reduce((s, sg) => s + x.measureText(sg.t).width, 0);
      let cx = W / 2 - total / 2;
      segs.forEach((sg) => {
        x.textAlign = 'left';
        if (solid) { x.fillStyle = sg.acc ? ACC : INK; x.fillText(sg.t, cx, y); }
        else { x.lineWidth = 1; x.strokeStyle = '#2A2927'; x.strokeText(sg.t, cx, y); }
        cx += x.measureText(sg.t).width;
      });
    });
    if (!solid) {
      if (ls) (x as any).letterSpacing = '0px';
      x.font = '400 10px "JetBrains Mono", monospace'; x.fillStyle = '#B4AFA6'; x.textAlign = 'left';
      x.fillText(label.replace('{px}', String(Math.round(fs))), Math.max(16, W / 2 - fs * 2.6), cy - gap * (lines.length / 2) - fs * 0.2);
      x.setLineDash([3, 5]); x.strokeStyle = '#D3CEC5';
      x.beginPath(); x.moveTo(0, cy); x.lineTo(W, cy); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke();
    }
  }

  /* ---------- GL setup ---------- */
  function sh(type: number, src: string) {
    const s = gl!.createShader(type)!; gl!.shaderSource(s, src); gl!.compileShader(s); return s;
  }
  function mkTex() {
    const t = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, t);
    [gl!.TEXTURE_WRAP_S, gl!.TEXTURE_WRAP_T].forEach((k) => gl!.texParameteri(gl!.TEXTURE_2D, k, gl!.CLAMP_TO_EDGE));
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    return t;
  }
  if (gl) {
    prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `#define NT ${NT}\n` + FS));
    gl.linkProgram(prog);
    ok = !!gl.getProgramParameter(prog, gl.LINK_STATUS);
    if (ok) {
      gl.useProgram(prog);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['t0', 't1', 'res', 'b', 'r', 'rmax', 'wave', 'refr', 'aber', 'spec', 'rim'].forEach((k) => (U[k] = gl.getUniformLocation(prog!, k)));
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      tex0 = mkTex(); tex1 = mkTex(); gl.uniform1i(U.t0, 0); gl.uniform1i(U.t1, 1);
    }
  }
  el.classList.toggle('no-webgl', !ok);

  function resize() {
    const b = el.getBoundingClientRect(); if (!b.width) return;
    W = b.width; H = b.height; DPR = Math.min(devicePixelRatio || 1, params.dprMax);
    canvas.width = W * DPR; canvas.height = H * DPR;
    drawTex(t0c, false); drawTex(t1c, true);
    if (ok && gl) {
      gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex0); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t0c);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t1c);
    } else {
      // no WebGL: the finished headline as a static image
      canvas.style.background = `url(${t1c.toDataURL()}) center/cover`;
    }
  }

  /* ---------- simulation state ---------- */
  const B = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
  let sc = 0, se = 0;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const DROPS = Array.from({ length: P }, (_, j) => ({
    a: j * 2.39996 + rnd() * 0.6, // golden-angle spread
    s: 0.35 + rnd() * 0.9,        // how far it flies
    r: 0.12 + rnd() * 0.32,       // size
    g: 0.4 + rnd() * 1.2,         // gravity
  }));
  const pos = new Float32Array(NT * 2), rs = new Float32Array(NT);
  let tx = 0, ty = 0, lastIn = -1e9;
  const start = performance.now();

  const local = (e: PointerEvent): [number, number] => {
    const b = canvas.getBoundingClientRect();
    return [(e.clientX - b.left) * DPR, (H - (e.clientY - b.top)) * DPR];
  };
  const onMove = (e: PointerEvent) => { [tx, ty] = local(e); lastIn = performance.now(); };
  const onDown = (e: PointerEvent) => { [tx, ty] = local(e); lastIn = performance.now(); self.pulse = 1; };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerdown', onDown);

  const io = new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible && started && !raf) raf = requestAnimationFrame(frame);
  });
  io.observe(el);

  const fine = matchMedia('(pointer:fine)').matches;
  const onResize = () => {
    // textures are only rebuilt when the width changes (mobile URL bars only change the height)
    const b = el.getBoundingClientRect();
    if (Math.abs(W - b.width) > 1 || (fine && Math.abs(H - b.height) > 1)) resize();
  };

  function frame(now: number) {
    raf = 0;
    if (dead || !visible) return; // paused while off screen; the observer restarts it
    raf = requestAnimationFrame(frame);
    if (!ok || !gl || !W) return;
    const p = params;
    const t = (now - start) / 1000;
    const R0 = Math.min(W, H) * DPR * (W < p.mobileBreakpoint ? p.radiusMobile : p.radiusDesktop);
    const intro = reduce ? 1 : Math.min(1, Math.max(0, (t - 0.25) / p.intro));
    const pop = intro === 1 ? 1 : 1 + 2.2 * Math.pow(intro - 1, 3) + 1.2 * Math.pow(intro - 1, 2);
    self.pulse *= p.pulseDecay;
    if (now - lastIn > p.idleMs && !reduce) {
      const ta = t * p.autoSpeed;
      tx = W * DPR * (0.5 + 0.28 * Math.sin(ta * 0.45));
      ty = H * DPR * (0.5 + 0.16 * Math.sin(ta * 0.7 + 1));
    }
    if (B[0].x === 0) { B.forEach((b) => { b.x = W * DPR * 0.5; b.y = H * DPR * 0.5; }); tx = B[0].x; ty = B[0].y; }
    // smoothed scroll-driven state
    sc += (self.charge - sc) * 0.12; se += (self.ex - se) * 0.14;
    const cvg = sc, cx = W * DPR * 0.5, cy = H * DPR * 0.5;
    // charge: pulled to the centre, trembling harder and harder
    const jit = reduce ? 0 : R0 * 0.05 * Math.pow(cvg, 3) * (se < 0.02 ? 1 : 0);
    const gx0 = tx + (cx - tx) * cvg + Math.sin(t * 61) * jit, gy0 = ty + (cy - ty) * cvg + Math.cos(t * 53) * jit;
    const kf = p.follow + cvg * p.chargeFollow;
    B[0].x += (gx0 - B[0].x) * kf; B[0].y += (gy0 - B[0].y) * kf;
    for (let i = 1; i <= 3; i++) { // orbiting drops
      const a = t * (0.6 + i * 0.17) + i * 2.1, rad = R0 * (0.55 + 0.25 * Math.sin(t * 0.9 + i)) * (1 - cvg);
      const gx = B[0].x + Math.cos(a) * rad, gy = B[0].y + Math.sin(a * 1.3) * rad * 0.8, k = 0.035 + i * 0.012;
      B[i].x += (gx - B[i].x) * k; B[i].y += (gy - B[i].y) * k;
    }
    for (let i = 4; i < N; i++) { // liquid tail: each follows the previous one
      const prev = i === 4 ? B[0] : B[i - 1];
      B[i].x += (prev.x - B[i].x) * p.trail; B[i].y += (prev.y - B[i].y) * p.trail;
    }
    // main drop: swells while charging, squeezes just before bursting, then vanishes into droplets
    const ex = se;
    const swell = 1 + p.swell * cvg - p.squeeze * smooth(0.82, 1, cvg);
    const gone = 1 - smooth(0, 0.12, ex);
    const R = R0 * (1 + self.pulse * p.pulseAmount) * swell * gone;
    B.forEach((b, i) => {
      pos[i * 2] = b.x; pos[i * 2 + 1] = b.y;
      const merge = 1 - cvg;
      const base = i === 0 ? R : i <= 3 ? R0 * (0.42 + 0.08 * i) * merge * gone : R0 * (0.62 - (i - 4) * 0.11) * merge * gone;
      rs[i] = base * pop;
    });
    // explosion droplets
    const diag = Math.hypot(W, H) * DPR;
    for (let j = 0; j < P; j++) {
      const d = DROPS[j], k = N + j;
      if (ex <= 0.001) { pos[k * 2] = B[0].x; pos[k * 2 + 1] = B[0].y; rs[k] = 0; continue; }
      const travel = 1 - Math.pow(1 - ex, 3);
      const dist = travel * diag * 0.62 * d.s;
      pos[k * 2] = B[0].x + Math.cos(d.a) * dist;
      pos[k * 2 + 1] = B[0].y + Math.sin(d.a) * dist * 0.85 - ex * ex * diag * 0.18 * d.g; // a bit of gravity
      rs[k] = R0 * d.r * swell * Math.pow(1 - ex, 1.3) * smooth(0, 0.04, ex) * pop;
    }
    // shockwave that paints the finished web over the sketch
    const waveR = ex > 0.02 ? Math.pow(smooth(0.02, 0.9 / Math.max(0.1, p.waveSpeed), ex), 0.7) * diag * 1.15 : 0;
    gl.uniform3f(U.wave, B[0].x, B[0].y, waveR);
    gl.uniform2fv(U.b, pos); gl.uniform1fv(U.r, rs); gl.uniform1f(U.rmax, R0);
    gl.uniform1f(U.refr, p.refraction); gl.uniform1f(U.aber, p.aberration);
    gl.uniform1f(U.spec, p.specular); gl.uniform1f(U.rim, p.rim);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // tiny screen shake right at the burst
    const shake = reduce ? 0 : Math.max(0, 1 - Math.abs(ex - 0.06) / 0.06) * p.shake;
    canvas.style.transform = shake ? `translate(${Math.sin(t * 90) * shake}px,${Math.cos(t * 77) * shake}px)` : '';
  }

  // the canvas headline needs the real font metrics
  document.fonts.load(`500 100px ${FAM}`).then(() => document.fonts.ready).then(() => {
    if (dead) return;
    resize(); started = true;
    addEventListener('resize', onResize);
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });

  function destroy() {
    dead = true;
    cancelAnimationFrame(raf); raf = 0;
    io.disconnect();
    removeEventListener('resize', onResize);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerdown', onDown);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }

  return self;
}
