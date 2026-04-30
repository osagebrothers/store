export default function Returns() {
  return (
    <main className="min-h-[100dvh] bg-black text-white pt-20 pb-16">
      <div className="mx-auto max-w-3xl px-6 space-y-10">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Osage Brothers</p>
          <h1 className="text-4xl font-bold tracking-tight">Return Policy</h1>
          <p className="text-sm text-white/50">7-day window. No re-stocking fee.</p>
        </header>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">7-Day Return Window</h2>
          <p>
            You have <strong className="text-white">7 days from delivery</strong> to request a return.
            Caps must be unworn, in original packaging, with embroidery undamaged.
          </p>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">How to Return</h2>
          <ol className="space-y-2 list-decimal pl-5">
            <li>Email <a className="text-white underline underline-offset-2" href="mailto:support@osagebrothers.com">support@osagebrothers.com</a> with your order number.</li>
            <li>We email you a prepaid return label within 24 hours.</li>
            <li>Drop the package at any carrier location.</li>
            <li>Refund issued to your original payment method within 5 business days of receipt.</li>
          </ol>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">What's Covered</h2>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Wrong size or fit issue</li>
            <li>Manufacturing defect (loose stitching, color mismatch)</li>
            <li>Shipping damage</li>
            <li>Change of heart (within the 7-day window)</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">What's Not Covered</h2>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Worn caps with sweat marks or fabric wear</li>
            <li>Custom modifications you made yourself</li>
            <li>Returns requested after 7 days from delivery</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-white/70 leading-relaxed">
          <h2 className="text-base font-bold text-white tracking-wide uppercase">Refunds</h2>
          <p>
            Refunds processed via <strong className="text-white">SF Private Bank</strong> back to your
            original payment method. Allow 3-7 business days for the credit to post.
          </p>
        </section>
      </div>
    </main>
  );
}
