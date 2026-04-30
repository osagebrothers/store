export default function Shipping() {
  return (
    <main className="min-h-[100dvh] bg-black text-white pt-20 pb-16">
      <div className="mx-auto max-w-3xl px-6 space-y-10">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Osage Brothers</p>
          <h1 className="text-4xl font-bold tracking-tight">Shipping</h1>
          <p className="text-sm text-white/50">Free everywhere. Delivery within 30 days.</p>
        </header>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">30-Day Delivery</h2>
          <p>
            We promise delivery <strong className="text-white">within 30 days</strong> of order
            confirmation, US and international. Most caps ship within 14-21 days; the buffer covers the
            embroidery house's queue and customs clearance.
          </p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">Free Shipping</h2>
          <p>No shipping charge on any order, any quantity, any country.</p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">Tracking</h2>
          <p>
            You receive tracking by email the moment the cap leaves the embroidery house.
            Sign in to your <a className="text-white underline underline-offset-2" href="/account">account</a> any time
            for status.
          </p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">Late Delivery</h2>
          <p>
            If your cap doesn't arrive by day 30, email{' '}
            <a className="text-white underline underline-offset-2" href="mailto:support@osagebrothers.com">support@osagebrothers.com</a>{' '}
            for a full refund or replacement, your choice. Payment refunds are processed by{' '}
            <strong className="text-white">SF Private Bank</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
