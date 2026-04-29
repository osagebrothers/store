import { useEffect, useState } from 'react';
import { useCart, getHatPrice } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/lib/commerce';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, totalItems } = useCart();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState<'none' | 'paid' | 'preorder'>('none');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;

    if (checkout === 'success') {
      clearCart();
      setOrderStatus('paid');
    } else if (checkout === 'preorder') {
      clearCart();
      setOrderStatus('preorder');
    } else if (checkout === 'cancel') {
      toast({ title: 'Checkout canceled', description: 'No worries. Your cart is still here.' });
    }

    params.delete('checkout');
    const newSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: newSearch ? `?${newSearch}` : '' },
      { replace: true },
    );
  }, [location.pathname, location.search, clearCart, navigate, toast]);

  const handleCheckout = async () => {
    if (!fullName || !email || !address || !city || !zip) {
      toast({ title: 'Missing details', description: 'Please complete shipping details first.' });
      return;
    }

    setIsCheckingOut(true);
    try {
      const successUrl = `${window.location.origin}${window.location.pathname}?checkout=success`;
      const cancelUrl = `${window.location.origin}${window.location.pathname}?checkout=cancel`;

      const session = await createCheckoutSession({
        currency: 'USD',
        customer: { fullName, email, address, city, zip },
        items: items.map((item) => ({
          id: item.hat.id,
          quantity: item.quantity,
          unitPrice: getHatPrice(item.hat),
          hat: item.hat,
        })),
        successUrl,
        cancelUrl,
      });

      window.location.href = session.checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout could not be started.';
      const missingBackend = /404|page not found/i.test(message);
      const paymentsDisabled = /Payments are not configured|square is not configured/i.test(message);

      if (missingBackend || paymentsDisabled) {
        toast({
          title: 'Pre-order placed',
          description: 'Payments are not enabled yet. We will follow up with a payment link.',
        });
        clearCart();
        setOrderStatus('preorder');
      } else {
        toast({ title: 'Checkout failed', description: message });
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderStatus !== 'none') {
    return (
      <main className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">{orderStatus === 'preorder' ? 'Pre-order Received!' : 'Order Confirmed!'}</h1>
          <p className="text-muted-foreground">{orderStatus === 'preorder' ? 'Thanks! We will email you to confirm details and collect payment.' : 'Thanks for your order. Your custom items are being prepared.'}</p>
          <Link to="/"><Button>Back to Home</Button></Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
          <p className="text-muted-foreground">Design a custom item to get started.</p>
          <Link to="/designer"><Button>Go to Designer</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-12 px-4">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart ({totalItems})</h1>

        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.hat.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div
                className="w-16 h-16 rounded-lg shrink-0 border border-white/10"
                style={{ backgroundColor: item.hat.hatColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">MEGA Hat — {item.hat.colorway === 'black' ? 'Black' : 'White'}</p>
                <p className="text-xs text-muted-foreground">Size: {item.hat.size}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.hat.id, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.hat.id, item.quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <p className="font-semibold w-20 text-right">${(item.quantity * getHatPrice(item.hat)).toFixed(2)}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.hat.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-bold">Shipping Details</h2>
            <div className="space-y-3">
              <div><Label>Full Name</Label><Input placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Address</Label><Input placeholder="123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input placeholder="New York" value={city} onChange={(e) => setCity(e.target.value)} /></div>
                <div><Label>ZIP</Label><Input placeholder="10001" value={zip} onChange={(e) => setZip(e.target.value)} /></div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                <span>Total</span><span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full h-12 text-base font-semibold mt-4"
              disabled={isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? 'Starting checkout...' : 'Checkout'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Secure checkout at pay.osagebrothers.com
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
