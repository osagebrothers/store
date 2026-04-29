export default function Footer() {
  const isEmbedded =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  if (isEmbedded) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-black/80 backdrop-blur px-4 py-1.5">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-4 text-[10px] text-white/55 uppercase tracking-[0.2em]">
        <span>Osage Brothers</span>
        <span className="text-white/20">·</span>
        <a href="mailto:support@osagebrothers.com" className="hover:text-white/80 transition-colors">
          Support
        </a>
      </div>
    </footer>
  );
}
