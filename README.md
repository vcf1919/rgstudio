# rgdev.studio

Web personal y portfolio. Astro (100 % estático) + WebGL a pelo + Lenis + TypeScript vanilla.

## Arrancar

```bash
nvm use        # Node 22 (.nvmrc)
npm install
npm run dev    # http://localhost:4321
npm run build  # astro check + build → dist/
```

## Contenido

- `src/content/site.json`: nombre, WhatsApp, email, Instagram y los textos del hero, el estudio y el contacto.
  Los titulares de canvas van en `lines` (cada línea es una lista de segmentos; `"acc": true` los pinta en naranja).
- Proyectos y pasos del proceso: Content Collections en `src/content/` (paso 3).

## Efectos

Módulos en `src/effects/`, todos con `init(el, options)` → `{ destroy() }`, montados en cada página desde
`src/lib/lifecycle.ts` (compatible con las View Transitions).

- `liquid-glass.ts` + `liquid-glass.frag`: el cristal líquido (metaballs) portado 1:1 del prototipo.
- `hero-scroll.ts`: progreso del scroll del hero (`hp`) → carga, explosión y onda.
- `cursor.ts`: punto naranja con puntero fino.

Los parámetros por defecto están en `src/config/effects.ts`.

### Ajustar desde /lab

Abre `/lab` (no indexado y fuera del menú). Mueve los sliders, usa "Simular scroll" o "Reproducir" para repetir la
explosión sin hacer scroll, pulsa **Copiar config** y pega el JSON en el objeto `glass` de `src/config/effects.ts`.

## Desplegar en Cloudflare Pages

- Framework preset: Astro · Build command: `npm run build` · Output: `dist`
- Node: lo toma de `.nvmrc` (22).
- `public/_headers` pone caché larga en fuentes y assets y `noindex` en `/lab`.
