import { useColorScheme, toggleColorScheme } from '@/hooks/useColorScheme';

export default function Footer() {
  const isEmbedded =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  if (isEmbedded) return null;

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const link = "hover:text-white/80 transition-colors";
  const sep = <span className="text-white/20">·</span>;
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-black/80 backdrop-blur px-4 py-1.5">
      <div className="mx-auto flex max-w-6xl items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/55 uppercase tracking-[0.2em]">
        <span>Osage Brothers</span>
        {sep}
        <a href="/sponsors" className={link}>Sponsors</a>
        {sep}
        <a href="/shipping" className={link}>Shipping</a>
        {sep}
        <a href="/returns" className={link}>Returns</a>
        {sep}
        <a href="/terms" className={link}>Terms</a>
        {sep}
        <a href="mailto:support@osagebrothers.com" className={link}>Support</a>
        {sep}
        <button
          type="button"
          onClick={toggleColorScheme}
          aria-pressed={isDark}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          data-testid="theme-toggle"
          className="inline-flex h-6 items-center gap-1.5 rounded-full border border-white/15 px-2 text-white/70 hover:border-white/35 hover:text-white/95 transition-colors"
        >
          <span aria-hidden="true">{isDark ? '☾' : '☀'}</span>
          <span>{isDark ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </footer>
  );
}
