import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { HAT_BLACK, HAT_WHITE } from '@/types/hat';
import { getHatPrice, useCart } from '@/store/cartStore';
import { useColorScheme } from '@/hooks/useColorScheme';

const TRANSLATIONS = [
  { text: 'Make Earth Great Again', lang: 'English' },
  { text: 'Haz la Tierra Grandiosa de Nuevo', lang: 'Español' },
  { text: 'Rendons la Terre Grande à Nouveau', lang: 'Français' },
  { text: 'Macht die Erde Wieder Großartig', lang: 'Deutsch' },
  { text: 'Rendi la Terra Grande di Nuovo', lang: 'Italiano' },
  { text: 'Faça a Terra Grande de Novo', lang: 'Português' },
  { text: '地球を再び偉大に', lang: '日本語' },
  { text: '让地球再次伟大', lang: '中文' },
  { text: '지구를 다시 위대하게', lang: '한국어' },
  { text: 'Сделаем Землю Снова Великой', lang: 'Русский' },
  { text: 'Зробимо Землю Знову Великою', lang: 'Українська' },
  { text: 'पृथ्वी को फिर से महान बनाओ', lang: 'हिन्दी' },
  { text: 'اجعل الأرض عظيمة مرة أخرى', lang: 'العربية' },
  { text: 'Dünyayı Yeniden Harika Yap', lang: 'Türkçe' },
  { text: 'Κάνε τη Γη Ξανά Σπουδαία', lang: 'Ελληνικά' },
  { text: 'Maak de Aarde Weer Geweldig', lang: 'Nederlands' },
  { text: 'Gör Jorden Stor Igen', lang: 'Svenska' },
  { text: 'Uczyńmy Ziemię Znów Wielką', lang: 'Polski' },
  { text: 'ทำให้โลกยิ่งใหญ่อีกครั้ง', lang: 'ไทย' },
  { text: 'Làm Cho Trái Đất Vĩ Đại Trở Lại', lang: 'Tiếng Việt' },
  { text: 'Fanya Dunia Kuwa Kuu Tena', lang: 'Kiswahili' },
  { text: 'Jadikan Bumi Hebat Lagi', lang: 'Bahasa' },
  { text: 'Gawing Dakila Muli ang Mundo', lang: 'Filipino' },
  { text: 'زمین را دوباره بزرگ کنیم', lang: 'فارسی' },
  { text: 'ምድርን እንደገና ታላቅ እናድርግ', lang: 'አማርኛ' },
  { text: 'Fac Terram Iterum Magnam', lang: 'Latīna' },
  { text: 'Déan an Domhan Iontach Arís', lang: 'Gaeilge' },
  { text: 'Whakanuia te Ao Anō', lang: 'Te Reo Māori' },
  { text: 'E Hoʻomaikaʻi Hou i ka Honua', lang: 'ʻŌlelo Hawaiʻi' },
  { text: 'Зробімо Зямлю Зноў Вялікай', lang: 'Беларуская' },
  { text: 'Učinimo Zemlju Ponovo Velikom', lang: 'Srpski' },
  { text: 'הפכו את כדור הארץ לגדול שוב', lang: 'עברית' },
  { text: 'Yenza uMhlaba Ube Mkhulu Futhi', lang: 'isiZulu' },
  { text: 'Jẹ́ kí Ayé Tóbi Léèkànsí', lang: 'Yorùbá' },
];

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  const scheme = useColorScheme();
  const config = scheme === 'dark' ? HAT_BLACK : HAT_WHITE;

  const navigate = useNavigate();
  const { addItem } = useCart();
  const price = getHatPrice(config);

  const handleBuy = () => {
    addItem(config);
    navigate('/cart');
  };

  useEffect(() => {
    const FADE_IN = 600;
    const HOLD = 2200;
    const FADE_OUT = 600;

    let timeout: ReturnType<typeof setTimeout>;

    const cycle = () => {
      setPhase('in');

      timeout = setTimeout(() => {
        setPhase('hold');

        timeout = setTimeout(() => {
          setPhase('out');

          timeout = setTimeout(() => {
            setCurrentIndex((i) => (i + 1) % TRANSLATIONS.length);
            cycle();
          }, FADE_OUT);
        }, HOLD);
      }, FADE_IN);
    };

    cycle();
    return () => clearTimeout(timeout);
  }, []);

  const t = TRANSLATIONS[currentIndex];

  const transitionStyle: React.CSSProperties = {
    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    opacity: phase === 'hold' || phase === 'in' ? 1 : 0,
    transform:
      phase === 'in'
        ? 'translateY(0)'
        : phase === 'hold'
          ? 'translateY(0)'
          : 'translateY(-12px)',
    ...(phase === 'in' && currentIndex > 0
      ? { animation: 'megaSlideIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards' }
      : {}),
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Keyframes for slide animation */}
      <style>{`
        @keyframes megaSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="relative h-[100dvh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-stone-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14)_0%,transparent_55%)]" />

        {/* Hat preview */}
        <div className="absolute inset-0 animate-scale-in" style={{ opacity: 0 }}>
          <HatScene
            hatColor={config.hatColor}
            bandColor={config.bandColor}
            text={config.text}
            backText={config.backText}
            brimText={config.brimText}
            textColor={config.textColor}
            textStyle={config.textStyle}
            font={config.font}
            flagCode={config.flagCode}
            decals={config.decals}
            autoRotate
            className="w-full h-full"
          />
        </div>

        {/* Headline */}
        <div className="absolute top-20 left-6 md:left-12 z-10 max-w-xl animate-fade-up delay-300" style={{ opacity: 0 }}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-black tracking-[-0.06em] leading-[0.84] text-white drop-shadow-[0_10px_45px_rgba(0,0,0,0.7)]">
            MAKE EARTH<br />GREAT AGAIN
          </h1>
          <p className="mt-3 text-lg md:text-xl text-white/65 font-medium leading-snug max-w-md">
            Make Earth Great — Together
          </p>
          <p className="mt-3 text-sm md:text-base text-white/45 leading-relaxed max-w-md">
            One planet. One people. One future.<br />
            Celebrate every culture. Back real causes. Wear the mission.
          </p>
        </div>

        {/* CTA */}
        <div className="absolute bottom-12 left-6 md:left-12 z-10 animate-fade-up delay-500" style={{ opacity: 0 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleBuy}
              className="h-11 px-8 rounded-full bg-white text-black text-xs tracking-[0.2em] uppercase font-black hover:bg-white/90 transition-colors shadow-[0_12px_44px_rgba(0,0,0,0.35)] flex items-center"
            >
              Buy ${price.toFixed(0)}
            </button>
            <Link
              to="/collection"
              className="h-11 px-8 rounded-full border border-white/25 text-white text-xs tracking-[0.2em] uppercase font-black hover:border-white/50 hover:bg-white/5 transition-colors flex items-center"
            >
              Black or White
            </Link>
            <a
              href="#movement"
              className="h-11 px-6 rounded-full border border-white/15 text-white/70 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/35 hover:bg-white/5 transition-colors flex items-center"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="absolute bottom-12 right-6 md:right-12 z-10 animate-fade-up delay-700" style={{ opacity: 0 }}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/35">Drag to rotate</p>
        </div>
      </section>

      {/* ─── THE MOVEMENT ─── */}
      <section id="movement" className="py-24 md:py-32 border-t border-black/5">
        <div className="container max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-4">The Movement</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[0.92] mb-8">
            One world. One us.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-black/50 leading-relaxed">
            <p>
              This is the Earth we all share — and the Earth we all belong in.{' '}
              <strong className="text-black/80">MEGA Earth!</strong> is for everyone who loves this planet and the people on it.
            </p>
            <p>
              We celebrate every culture, every community, every story — because when we lift each other up, everybody rises.
            </p>
            <p>
              Most people are good. Most people want to help.
              MEGA exists to turn that everyday goodness into real impact — connecting people to trusted non-profits,
              local heroes, and global causes doing the work.
            </p>
            <p>
              Every hat supports vetted charitable causes around the world.
              Small action. Big ripple. Local love with global reach.
              The future is now — and it's ours to build.
            </p>
          </div>
        </div>
      </section>

      {/* ─── EVERY LANGUAGE ─── */}
      <section className="py-28 md:py-40 bg-stone-50 border-t border-black/5 overflow-hidden">
        <div className="container max-w-5xl mx-auto px-6 md:px-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-16 text-center">
            Every Language &middot; Every Culture &middot; One Message
          </p>
          <div className="flex flex-col items-center justify-center min-h-[180px] md:min-h-[240px]">
            <div style={transitionStyle} className="text-center">
              <p className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-black/85">
                {t.text}
              </p>
              <p className="mt-5 text-[11px] tracking-[0.35em] uppercase text-black/25 font-medium">
                {t.lang}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SHOP ─── */}
      <section className="py-24 md:py-32 border-t border-black/5">
        <div className="container max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-4">Wear the Mission</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[0.92] mb-6">
                The MEGA Hat
              </h2>
              <p className="text-base text-black/45 leading-relaxed mb-6">
                Gold embroidery on a premium ball cap. Black or white. $50.
                "Out, Out" inside label.
              </p>
              <p className="text-base text-black/45 leading-relaxed mb-6">
                A portion of every purchase goes directly to non-profits and impact causes worldwide.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to="/collection"
                  className="h-11 px-8 rounded-full bg-black text-white text-xs tracking-[0.2em] uppercase font-black hover:bg-black/80 transition-colors flex items-center"
                >
                  Pick Your Hat
                </Link>
                <Link
                  to="/designer"
                  className="h-11 px-6 rounded-full border border-black/20 text-black/60 text-xs tracking-[0.2em] uppercase hover:text-black hover:border-black/40 transition-colors flex items-center"
                >
                  View in 3D
                </Link>
              </div>
            </div>
            <div className="h-80 md:h-96">
              <HatScene
                hatColor={config.hatColor}
                bandColor={config.bandColor}
                text={config.text}
                backText={config.backText}
                brimText={config.brimText}
                textColor={config.textColor}
                textStyle={config.textStyle}
                font={config.font}
                flagCode={config.flagCode}
                decals={config.decals}
                autoRotate
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── JOIN ─── */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container max-w-3xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-6">Together</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[0.92] mb-6">
            Join the MEGA Mission
          </h2>
          <p className="text-base text-white/40 leading-relaxed mb-4 max-w-lg mx-auto">
            One person can spark change. A million can move the world.
            Wear the hat. Support a cause. Celebrate every culture.
          </p>
          <p className="text-lg text-white/55 font-medium mb-10 max-w-lg mx-auto">
            This is our home. This is our moment.<br />
            MEGA Earth!
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="mailto:support@osagebrothers.com"
              className="h-11 px-8 rounded-full bg-white text-black text-xs tracking-[0.2em] uppercase font-black hover:bg-white/90 transition-colors inline-flex items-center"
            >
              Get Involved
            </a>
            <Link
              to="/collection"
              className="h-11 px-6 rounded-full border border-white/20 text-white/70 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/40 transition-colors inline-flex items-center"
            >
              Shop the Hat
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
