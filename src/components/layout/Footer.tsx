import Link from 'next/link';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

const CONTACT = {
  email: 'info@vanillaroyal.id',
  phone: '+62 858 5366 9568',
  whatsappHref: 'https://wa.me/6285853669568',
} as const;

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.8 19.79 19.79 0 0 1 1.57 5.2 2 2 0 0 1 3.54 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-400">
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
        {/* Brand column */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="flex items-center w-fit">
            <span className="text-lg font-bold tracking-tight text-zinc-100">VANILLA</span>
            <span className="text-lg font-bold tracking-tight text-brand">&nbsp;ROYAL</span>
          </Link>
          <p className="text-sm leading-relaxed text-zinc-400 max-w-xs">
            Premium B2B Trust Hub for international vanilla trade. Connecting the world&rsquo;s finest vanilla producers with global buyers.
          </p>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
            HS Code 0905
          </span>
        </div>

        {/* Quick links column */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-300 mb-5">
            Navigation
          </h2>
          <ul className="flex flex-col gap-3" role="list">
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-zinc-400 hover:text-brand transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-300 mb-5">
            Get in Touch
          </h2>
          <div className="flex flex-col gap-3.5">
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-start gap-2.5 text-sm text-zinc-400 hover:text-brand transition-colors"
            >
              <IconMail />
              {CONTACT.email}
            </a>
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 text-sm text-zinc-400 hover:text-brand transition-colors"
            >
              <IconPhone />
              {CONTACT.phone}
            </a>
          </div>
          <div className="mt-7">
            <Link
              href="/contact#quote"
              className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-zinc-950 tracking-wide hover:bg-brand-dark transition-colors"
            >
              GET QUOTE
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <p>© {currentYear} Vanilla Royal. All rights reserved.</p>
          <p className="tracking-wide">Premium B2B Vanilla Trade Platform</p>
        </div>
      </div>
    </footer>
  );
}
