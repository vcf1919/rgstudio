// Generates placeholder images for the fictitious concept projects.
// Usage: node scripts/placeholders.mjs   (needs Playwright + Chromium)
// Replace the files in src/assets/projects/<slug>/ with real photos whenever you have them.
import { createRequire } from 'node:module';
// Playwright is not a project dependency: use a global install (npm i -g playwright)
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(require('node:child_process').execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;
import { mkdirSync } from 'node:fs';

const projects = [
  { slug: 'atelier-lumen', name: 'Atelier Lumen', kind: 'Estética avanzada', city: 'Catarroja',
    cover: 'radial-gradient(70% 60% at 70% 25%,#FFE3CF,transparent 60%),linear-gradient(160deg,#E9B996,#B97B58 55%,#4A2F21)',
    bg: '#F6EEE6', ink: '#2B1B12', acc: '#B97B58', soft: '#E9B996',
    h: 'Tu piel, sin prisas.', cta: 'Reservar cita', items: ['Facial', 'Láser', 'Corporal'] },
  { slug: 'clinica-marea', name: 'Clínica Marea', kind: 'Clínica dental', city: 'Alfafar',
    cover: 'radial-gradient(60% 50% at 30% 30%,#E8F1FF,transparent 60%),linear-gradient(170deg,#9FB8D9,#4D6E96 60%,#1D2B3D)',
    bg: '#EEF3F9', ink: '#14202E', acc: '#4D6E96', soft: '#9FB8D9',
    h: 'Sonreír sin miedo.', cta: 'Pedir primera visita', items: ['Implantes', 'Ortodoncia', 'Estética'] },
  { slug: 'flor-y-olivo', name: 'Flor & Olivo', kind: 'Floristería', city: 'Massanassa',
    cover: 'radial-gradient(60% 50% at 60% 30%,#F4FFE9,transparent 60%),linear-gradient(165deg,#B9CFA2,#6E8D55 60%,#26331C)',
    bg: '#F2F4EC', ink: '#1E2817', acc: '#6E8D55', soft: '#B9CFA2',
    h: 'Flores de temporada, a tu puerta.', cta: 'Encargar ramo', items: ['Ramos', 'Bodas', 'Plantas'] },
];

const coverHtml = (p) => `<body style="margin:0"><div style="width:900px;height:1140px;background:${p.cover};position:relative;overflow:hidden">
  <div style="position:absolute;width:520px;height:520px;border-radius:50%;left:40%;top:46%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.55),rgba(255,255,255,0) 60%);filter:blur(8px)"></div>
  <div style="position:absolute;width:300px;height:300px;border-radius:50%;left:-60px;top:12%;background:rgba(255,255,255,.12);filter:blur(30px)"></div>
</div></body>`;

const after = (p, mobile) => `<html><body style="margin:0;font-family:Helvetica,Arial,sans-serif;background:${p.bg};color:${p.ink}">
<div style="display:flex;justify-content:space-between;align-items:center;padding:${mobile ? '20px' : '28px 56px'}">
  <b style="font-size:${mobile ? 17 : 20}px;letter-spacing:-.02em">${p.name}</b>
  <span style="border:1px solid ${p.ink};border-radius:99px;padding:8px 16px;font-size:13px">${mobile ? 'Menú' : p.items.join(' &nbsp;·&nbsp; ')}</span>
</div>
<div style="display:grid;grid-template-columns:${mobile ? '1fr' : '1.1fr 1fr'};gap:${mobile ? 24 : 48}px;padding:${mobile ? '24px 20px' : '64px 56px'};align-items:center">
  <div>
    <div style="font:11px monospace;text-transform:uppercase;letter-spacing:.06em;opacity:.6">${p.kind} — ${p.city}</div>
    <h1 style="font-size:${mobile ? 48 : 104}px;line-height:.92;letter-spacing:-.05em;font-weight:500;margin:18px 0 26px">${p.h}</h1>
    <span style="display:inline-block;background:${p.ink};color:${p.bg};border-radius:99px;padding:14px 24px;font-size:15px">${p.cta}</span>
  </div>
  <div style="height:${mobile ? 300 : 560}px;border-radius:${mobile ? 14 : 22}px;background:${p.cover}"></div>
</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 ${mobile ? 20 : 56}px">
  ${p.items.map((i) => `<div style="border-top:1px solid ${p.ink}33;padding-top:12px;font-size:14px">${i}</div>`).join('')}
</div></body></html>`;

const before = (p, mobile) => `<html><body style="margin:0;font-family:'Times New Roman',serif;background:#fff;color:#333">
<div style="background:linear-gradient(#5a6b7c,#2e3a46);color:#fff;padding:${mobile ? 12 : 18}px;font-size:${mobile ? 20 : 28}px;text-align:center;font-weight:bold;text-shadow:1px 1px 2px #000">${p.name.toUpperCase()}</div>
<div style="background:#ddd;padding:8px;text-align:center;font-size:13px">
  ${['Inicio', 'Quienes somos', 'Servicios', 'Galeria', 'Noticias', 'Contacto'].slice(0, mobile ? 3 : 6).map((l) => `<a style="color:#00e;margin:0 8px">${l}</a>`).join('|')}
</div>
<div style="display:flex;gap:16px;padding:16px;${mobile ? 'flex-direction:column' : ''}">
  <div style="flex:1">
    <h2 style="color:#900;font-size:${mobile ? 20 : 26}px">Bienvenidos a nuestra pagina web!!</h2>
    <div style="height:${mobile ? 160 : 260}px;background:${p.cover};filter:blur(3px) saturate(.5);border:4px ridge #999"></div>
    <p style="font-size:13px;line-height:1.3">${p.kind} en ${p.city} desde hace muchos años. Ofrecemos los mejores servicios de la zona con la mejor calidad y el mejor precio. No dude en contactar con nosotros para cualquier consulta. ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(mobile ? 2 : 5)}</p>
    <p style="font-size:12px;color:#00e;text-decoration:underline">Haga click aqui para mas informacion</p>
  </div>
  <div style="width:${mobile ? 'auto' : '260px'};background:#f3f3d8;border:1px dashed #aa9;padding:10px;font-size:12px">
    <b>HORARIO</b><br>L-V 9:00-14:00 / 17:00-20:00<br><br><b>VISITAS:</b> 004213<br><br><b style="color:red">*** OFERTAS ESPECIALES!! ***</b>
  </div>
</div></body></html>`;

const browser = await chromium.launch();
for (const p of projects) {
  const dir = `src/assets/projects/${p.slug}`;
  mkdirSync(dir, { recursive: true });
  const shot = async (html, w, h, file, scale = 1) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
    await page.setContent(html);
    await page.screenshot({ path: `${dir}/${file}`, type: 'jpeg', quality: 86 });
    await page.close();
  };
  await shot(coverHtml(p), 900, 1140, 'cover.jpg');
  await shot(after(p, false), 1440, 900, 'after.jpg');
  await shot(before(p, false), 1440, 900, 'before.jpg');
  await shot(after(p, false), 1440, 900, 'desktop.jpg');
  await shot(after(p, true), 390, 844, 'mobile.jpg', 2);
  await shot(before(p, true), 390, 844, 'mobile-before.jpg', 2);
  console.log('✓', p.slug);
}
await browser.close();
