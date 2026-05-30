import Link from 'next/link';

export default function Home() {
  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-6.25rem)] bg-zinc-950 px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center overflow-hidden"
    >
      {/* Subtle ambient glow — purely decorative */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-brand/[0.06] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
      </div>

      <div className="relative max-w-4xl mx-auto flex flex-col items-center gap-8">

        {/* Eyebrow label */}
        <div className="flex items-center gap-4">
          <span className="block h-px w-10 bg-brand/60" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
            Indonesian Premium Quality
          </span>
          <span className="block h-px w-10 bg-brand/60" aria-hidden="true" />
        </div>

        {/* Hero title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
          <span className="text-brand">Vanilla Bean</span>
          <br />
          <span className="text-white">Export</span>
        </h1>

        {/* Sub-description */}
        <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-400">
          Direct from Indonesian farms to your business. Premium quality vanilla
          beans and derivatives for global markets.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto">
          <Link
            href="/products"
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-md bg-brand px-8 py-3.5 text-sm font-semibold text-zinc-950 tracking-wide hover:bg-brand-dark transition-colors"
          >
            VIEW PRODUCTS
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-md border border-brand/50 px-8 py-3.5 text-sm font-semibold text-brand tracking-wide hover:border-brand hover:bg-brand/10 transition-colors"
          >
            CONTACT US
          </Link>
        </div>

      </div>
    </section>
  );
}
