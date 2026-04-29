import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User as UserIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

function DoveLogo({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label="Peace dove">🕊️</span>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn } = useAuth();

  const isEmbedded =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show navbar after scrolling past hero
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.35);
    };
    // Always show on non-index pages
    if (pathname !== '/') {
      setVisible(true);
      return;
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Escape closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const scrollToMovement = useCallback(() => {
    if (typeof window === 'undefined') return;

    const tryScroll = (triesLeft: number) => {
      const el = document.getElementById('movement');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (triesLeft <= 0) return;
      window.requestAnimationFrame(() => tryScroll(triesLeft - 1));
    };

    if (pathname !== '/') {
      navigate('/');
      window.setTimeout(() => tryScroll(80), 50);
      return;
    }

    tryScroll(80);
  }, [navigate, pathname]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const title = document.title || 'Osage Brothers';

    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
      }) : null;

      if (nav?.share) {
        await nav.share({ title, url });
        return;
      }

      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(url);
        toast({ title: 'Link copied', description: 'Paste it anywhere.' });
        return;
      }

      window.prompt('Copy this link:', url);
    } catch {
      // User cancellation or share failure: do nothing.
    }
  }, [toast]);

  if (isEmbedded) return null;

  return (
    <>
      <nav
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateX(-50%) translateY(${visible ? '0' : '-20px'})`,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="flex h-12 items-center gap-6 px-6 rounded-full bg-black/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link
            to="/"
            className="text-white/90 hover:text-white transition-colors flex-shrink-0"
            aria-label="Home"
          >
            <DoveLogo className="text-2xl leading-none" />
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={scrollToMovement}
              className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
            >
              About
            </button>
            <Link
              to="/collection"
              className={`text-[10px] font-bold tracking-[0.25em] uppercase transition-colors ${
                pathname === '/collection' ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/designer"
              className={`text-[10px] font-bold tracking-[0.25em] uppercase transition-colors ${
                pathname === '/designer' ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Design
            </Link>
            <button
              onClick={handleShare}
              className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
            >
              Share
            </button>
            {user ? (
              <Link
                to="/account"
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Account"
              >
                <UserIcon className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => signIn(pathname)}
                className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1 rounded-full text-white/70 hover:text-white transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-4 right-4 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMobileOpen(false);
                scrollToMovement();
              }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors text-white/75 hover:text-white hover:bg-white/5 font-black"
            >
              About
            </button>
            <Link
              to="/collection"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors font-black ${
                pathname === '/collection' ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/designer"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors font-black ${
                pathname === '/designer' ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Design
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleShare();
              }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors text-white/75 hover:text-white hover:bg-white/5 font-black"
            >
              Share
            </button>
            {user ? (
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors font-black ${
                  pathname === '/account' ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white hover:bg-white/5'
                }`}
              >
                Account
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signIn(pathname);
                }}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors text-white/75 hover:text-white hover:bg-white/5 font-black"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
