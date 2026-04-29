import { Link, useNavigate } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cartStore';
import { HAT_BLACK, HAT_PRICE, HAT_WHITE, HatConfig } from '@/types/hat';

interface HatCardProps {
  config: HatConfig;
  title: string;
}

function HatCard({ config, title }: HatCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const add = () => {
    addItem(config);
    navigate('/cart');
  };
  return (
    <article className="rounded-2xl border border-white/10 bg-stone-950/50 overflow-hidden flex flex-col">
      <div className="h-72 md:h-80 bg-black">
        <HatScene
          hatColor={config.hatColor}
          bandColor={config.bandColor}
          text={config.text}
          backText={config.backText}
          brimText={config.brimText}
          textColor={config.textColor}
          textStyle={config.textStyle}
          font={config.font}
          decals={config.decals}
          autoRotate
          className="w-full h-full"
        />
      </div>
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-lg font-bold">${HAT_PRICE.toFixed(0)}</p>
        </div>
        <p className="text-sm text-white/55 leading-relaxed">
          MEGA front in gold embroidery. "Out, Out" inside label.
        </p>
        <Button onClick={add} className="h-11 mt-auto">
          Add to Cart
        </Button>
      </div>
    </article>
  );
}

export default function Collection() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">The Collection</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Two ways to wear it.</h1>
          <p className="text-base text-white/55 max-w-md mx-auto">
            One hat. Two colorways. Black or white. Gold embroidery either way.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <HatCard config={HAT_BLACK} title="MEGA — Black" />
          <HatCard config={HAT_WHITE} title="MEGA — White" />
        </div>

        <div className="mt-12 text-center">
          <Link to="/designer" className="text-xs uppercase tracking-[0.25em] text-white/40 hover:text-white">
            View in 3D
          </Link>
        </div>
      </div>
    </main>
  );
}
