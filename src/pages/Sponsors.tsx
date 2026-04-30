export default function Sponsors() {
  return (
    <main className="min-h-[100dvh] bg-black text-white pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-6 space-y-12">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Osage Brothers</p>
          <h1 className="text-4xl font-bold tracking-tight">Sponsors & Partners</h1>
          <p className="text-sm text-white/50">
            The folks making it possible to MEGA — Make Earth Great Again.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Banking · Payments</h2>
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-4">
            <div className="flex items-baseline justify-between flex-wrap gap-3">
              <h3 className="text-2xl font-bold">SF Private Bank</h3>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">Payment Processor</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              SF Private Bank powers all checkout payments and refunds for Osage Brothers. They run our
              merchant account, settle every transaction, and provide the secure card-not-present
              processing that lets us ship caps to anyone, anywhere.
            </p>
            <p className="text-sm text-white/55 leading-relaxed">
              No card numbers ever touch our servers. SF Private Bank handles tokenization, fraud screening,
              chargeback management, and 24/7 transaction support.
            </p>
          </article>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Beneficiaries</h2>
          <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-3">
            <h3 className="text-xl font-bold">Osage Tribe Initiatives</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              A portion of every sale funds language preservation, land stewardship, and youth
              programs administered through Osage Brothers. The mission is the message.
            </p>
          </article>
        </section>

        <section className="space-y-3 pt-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/40">Become a Partner</h2>
          <p className="text-sm text-white/65">
            Brand partnerships and sponsorship inquiries:{' '}
            <a className="text-white underline underline-offset-2" href="mailto:partners@osagebrothers.com">
              partners@osagebrothers.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
