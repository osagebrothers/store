export default function Terms() {
  return (
    <main className="min-h-[100dvh] bg-black text-white pt-20 pb-16">
      <div className="mx-auto max-w-3xl px-6 space-y-10">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Osage Brothers</p>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-white/50">Last updated: April 30, 2026</p>
        </header>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">1. Acceptance</h2>
          <p>By placing an order on osagebrothers.com you agree to these terms. If you don't agree, don't order.</p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">2. Payment Processing</h2>
          <p>
            Payments are processed by <strong className="text-white">SF Private Bank</strong>. We do not store
            your full card number. By checking out you agree to SF Private Bank's payment terms in addition to
            these terms.
          </p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">3. Shipping & Delivery</h2>
          <p>
            We ship within 30 days of order confirmation. Free shipping on every order, US and international.
            Tracking is provided when your order leaves the embroidery house.
          </p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">4. Returns</h2>
          <p>
            7-day return window from the day you receive the cap. See our{' '}
            <a className="text-white underline underline-offset-2" href="/returns">return policy</a>.
          </p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">5. Mission</h2>
          <p>
            Every cap supports Osage tribe initiatives. Our partners are listed on the{' '}
            <a className="text-white underline underline-offset-2" href="/sponsors">sponsors page</a>.
          </p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">6. Limitations</h2>
          <p>Caps are provided "as designed." We aren't liable for indirect or consequential damages.</p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">7. Contact</h2>
          <p>Questions: <a className="text-white underline underline-offset-2" href="mailto:support@osagebrothers.com">support@osagebrothers.com</a></p>
        </section>
      </div>
    </main>
  );
}
