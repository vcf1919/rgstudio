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
- `src/content/process/*.md`: los 4 pasos del proceso (título, semana, texto, color de la tarjeta y visual).
- `src/content/projects/*.md`: los trabajos. El nombre del archivo es la URL (`/trabajos/<archivo>/`).

### Añadir un proyecto

1. Crea `src/assets/projects/<slug>/` con las imágenes: `cover` (vertical, ~900×1140; es la vista previa
   y la cabecera del caso), `before`, `after` (misma proporción, 16:10) y las capturas de escritorio y móvil.
2. Copia un `.md` de `src/content/projects/`, renómbralo a `<slug>.md` y cambia los campos:
   `title`, `sector`, `year`, `order` (posición en la lista), `kind` (`concepto` o `real`), `summary`,
   `cover` + `coverAlt`, `before`/`after`, 2–3 `blocks` de reto y solución, `screens` y, si existe, `url`.
3. `draft: true` lo oculta en producción.

Si algo no cuadra con el esquema (`src/content.config.ts`), `npm run build` te dice qué campo falla.

Las imágenes actuales son placeholders generados con `node scripts/placeholders.mjs`
(necesita Playwright instalado globalmente). Sustitúyelas por fotos reales cuando las tengas.

## Efectos

Módulos en `src/effects/`, todos con `init(el, options)` → `{ destroy() }`, montados en cada página desde
`src/lib/lifecycle.ts` (compatible con las View Transitions).

- `liquid-glass.ts` + `liquid-glass.frag`: el cristal líquido (metaballs) portado 1:1 del prototipo.
- `hero-scroll.ts`: progreso del scroll del hero (`hp`) → carga, explosión y onda.
- `reveal-words.ts`, `reveal-lines.ts`: frase que se ilumina y titulares con máscara.
- `stack-cards.ts`: tarjetas apiladas del proceso.
- `hover-preview.ts`: vista previa flotante de Trabajos y nombre de la View Transition.
- `magnetic.ts`: botón de WhatsApp magnético.
- `before-after.ts`: deslizador antes/después de cada caso.
- `cursor.ts`: punto naranja con puntero fino.

Los parámetros por defecto están en `src/config/effects.ts`.

### Ajustar desde /lab

Abre `/lab` (no indexado y fuera del menú). Mueve los sliders, usa "Simular scroll" o "Reproducir" para repetir la
explosión sin hacer scroll, pulsa **Copiar config** y pega el JSON en el objeto `glass` de `src/config/effects.ts`.

## Desplegar en Cloudflare Pages

- Framework preset: Astro · Build command: `npm run build` · Output: `dist`
- Node: lo toma de `.nvmrc` (22).
- `public/_headers` pone caché larga en fuentes y assets y `noindex` en `/lab`.
