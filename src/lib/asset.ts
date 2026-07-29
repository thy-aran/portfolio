/** Prefix a public asset path with Vite's base (needed for GitHub Pages). */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.replace(/^\//, "");
  return `${base}${clean}`;
}
