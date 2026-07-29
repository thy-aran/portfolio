# ARAN ADNAN — Portfolio

Vite · React · TypeScript · Tailwind · GSAP · React Three Fiber

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build

## Deploy (GitHub Pages)

Repo: `thy-aran/portfolio` → **https://thy-aran.github.io/portfolio/**

1. Push these changes to `main`
2. GitHub → **Settings → Pages**
3. Set **Source** to **GitHub Actions** (not “Deploy from a branch”)
4. Workflow `.github/workflows/deploy.yml` builds with `base: /portfolio/` and publishes `dist`

A blank page usually means JS/CSS were requested from `/assets/...` instead of `/portfolio/assets/...`. The `base` setting and `asset()` helper fix that.

## Structure

```
public/assets/   # audio, docs, images
src/             # app code
```

Alias: `@/*` → `src/*`

**Note:** The hero uses WebGPU (Chrome/Edge recommended).
