/**
 * Inline theme script — injected into <head> before any rendering.
 * Reads saved preference or system preference and applies dark/light class
 * to <html> BEFORE the page renders, preventing flash of wrong theme.
 *
 * This is a Server Component (no 'use client') and renders a raw <script>.
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var saved = localStorage.getItem('bond-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = saved === 'dark' || saved === 'light'
          ? saved
          : (prefersDark ? 'dark' : 'light');
        document.documentElement.classList.add(theme);
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        document.documentElement.classList.add('dark');
      }
    })();
  `

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      // Suppress hydration warning — this intentionally runs before React hydration
    />
  )
}
