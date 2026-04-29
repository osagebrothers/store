import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function Account() {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <p className="text-white/50 text-sm uppercase tracking-[0.2em]">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="max-w-sm w-full space-y-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="text-sm text-white/50">
            Sign in to track orders and save shipping info.
          </p>
          <div className="flex flex-col gap-3">
            <Button className="h-11" onClick={() => signIn('/account')}>
              Sign in
            </Button>
            <Button variant="outline" className="h-11" onClick={() => signUp('/account')}>
              Create account
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Account</p>
          <h1 className="text-3xl font-bold tracking-tight">{user.name || user.email}</h1>
          <p className="text-sm text-white/50 mt-1">{user.email}</p>
        </div>

        <div className="flex gap-3">
          <Link to="/cart">
            <Button variant="outline">View cart</Button>
          </Link>
          <Button variant="ghost" onClick={() => signOut('/')}>
            Sign out
          </Button>
        </div>
      </div>
    </main>
  );
}
