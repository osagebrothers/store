import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cartStore';
import { Colorway, HAT_BLACK, HAT_PRICE, HAT_WHITE } from '@/types/hat';

export default function Designer() {
  const [colorway, setColorway] = useState<Colorway>('black');
  const navigate = useNavigate();
  const { addItem } = useCart();

  const config = useMemo(() => (colorway === 'black' ? HAT_BLACK : HAT_WHITE), [colorway]);

  const handleAdd = () => {
    addItem(config);
    navigate('/cart');
  };

  return (
    <main className="min-h-[100dvh] bg-black text-white pt-12">
      <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-3rem)]">
        <div className="flex-1 relative h-[60vh] lg:h-auto">
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

        <aside className="lg:w-[360px] border-l border-white/5 p-8 space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Osage Brothers</p>
            <h1 className="text-2xl font-bold tracking-tight">MEGA Hat</h1>
            <p className="text-sm text-white/50 mt-1">Make Earth Great Again</p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Colorway</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setColorway('black')}
                className={`h-14 rounded-xl border transition-colors text-xs uppercase tracking-[0.2em] font-bold ${
                  colorway === 'black'
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                Black
              </button>
              <button
                onClick={() => setColorway('white')}
                className={`h-14 rounded-xl border transition-colors text-xs uppercase tracking-[0.2em] font-bold ${
                  colorway === 'white'
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                White
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Details</p>
            <ul className="text-sm text-white/65 space-y-1.5 leading-relaxed">
              <li>Premium ball cap</li>
              <li>Gold embroidery — front</li>
              <li>"Out, Out" inside label</li>
              <li>One size, structured fit</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-white/40">Price</span>
              <span className="text-3xl font-bold">${HAT_PRICE.toFixed(0)}</span>
            </div>
            <Button onClick={handleAdd} className="w-full h-12 text-sm font-bold tracking-[0.15em] uppercase">
              Add to Cart
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
