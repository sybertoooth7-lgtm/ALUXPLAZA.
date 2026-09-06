// frontend/src/components/theme-toggle.tsx
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // next-themes reads localStorage on mount, which hasn't happened yet
  // during SSR/the very first client render — rendering the toggle
  // before that would risk showing the wrong icon for a flash. Guard
  // with a mounted flag rather than rendering based on `theme` directly.
  const [mounted, setMounted] = useState(false);
  // This is next-themes' own documented pattern for avoiding a hydration
  // mismatch (server/first-render never knows the persisted theme yet).
  // There's no external system to synchronize with here; the effect's
  // only job is "flip this flag once we're client-side," which the
  // rule can't distinguish from a genuine anti-pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
