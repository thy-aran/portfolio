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

## Structure

```
public/assets/          # all static media
  audio/                # background tracks
  docs/                 # resume.pdf
  images/
    about-me.png
    education/          # education logos
    projects/           # project screenshots
src/
  components/
    layout/             # navbar, loading
    sections/           # page sections
    ui/                 # shared UI / hero / player
  data/                 # project content
  hooks/
  lib/
```

Alias: `@/*` → `src/*`

**Note:** The hero uses WebGPU (Chrome/Edge recommended).
# portfolio
