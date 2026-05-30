'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV_LINKS = [
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.8 19.79 19.79 0 0 1 1.57 5.2 2 2 0 0 1 3.54 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.7a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top contact info bar */}
      <div className="bg-zinc-900 text-zinc-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-6 h-9">
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex items-center gap-1.5 hover:text-brand transition-colors"
          >
            <IconMail />
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 hover:text-brand transition-colors"
          >
            <IconPhone />
            {CONTACT.phone}
          </a>
        </div>
      </div>

      {/* Main navigation bar */}
      <nav className="bg-white border-b border-zinc-100 shadow-sm" aria-label="Main navigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <span className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-zinc-700 transition-colors">
              VANILLA
            </span>
            <span className="text-xl font-bold tracking-tight text-brand">
              &nbsp;ROYAL
            </span>
          </Link>

          {/* Desktop navigation links */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm font-medium text-zinc-600 hover:text-brand transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/contact#quote"
              className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-zinc-950 tracking-wide hover:bg-brand-dark transition-colors"
            >
              GET QUOTE
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white">
            <ul className="flex flex-col px-4 pt-2 pb-3 gap-0.5" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block py-2.5 px-3 text-sm font-medium text-zinc-700 hover:text-brand hover:bg-zinc-50 rounded-md transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="px-4 pt-3 pb-4 border-t border-zinc-100 flex flex-col gap-3">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-brand transition-colors"
              >
                <IconMail />
                {CONTACT.email}
              </a>
              <a
                href={CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-brand transition-colors"
              >
                <IconPhone />
                {CONTACT.phone}
              </a>
              <Link
                href="/contact#quote"
                className="mt-1 inline-flex items-center justify-center w-full rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-zinc-950 tracking-wide hover:bg-brand-dark transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                GET QUOTE
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
