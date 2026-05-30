'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

function IconOverview() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
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

const PRIMARY_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: <IconOverview /> },
  { label: 'Market Data', href: '/dashboard/market', icon: <IconChart /> },
  { label: 'Global Buyers', href: '/dashboard/buyers', icon: <IconUsers /> },
  { label: 'AI Alerts', href: '/dashboard/alerts', icon: <IconBell />, badge: 3 },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'Settings', href: '/dashboard/settings', icon: <IconSettings /> },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-brand/15 text-brand'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
      }`}
    >
      <span className={isActive ? 'text-brand' : 'text-zinc-500'}>{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge != null && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-zinc-950 text-xs font-bold leading-none">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-0.5 px-4 py-5 border-b border-white/10">
        <span className="text-base font-bold tracking-tight text-zinc-100">VANILLA</span>
        <span className="text-base font-bold tracking-tight text-brand">&nbsp;ROYAL</span>
      </div>

      {/* Nav label + links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Intelligence
          </p>
          <ul className="flex flex-col gap-0.5" role="list">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <NavLink item={item} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            System
          </p>
          <ul className="flex flex-col gap-0.5" role="list">
            {SECONDARY_NAV.map((item) => (
              <li key={item.href}>
                <NavLink item={item} onClick={onLinkClick} />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Back to site link */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Website
        </Link>
      </div>
    </div>
  );
}

export default function DashboardSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-zinc-950 border-r border-white/[0.06]">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 bg-zinc-950 border-b border-white/[0.06]">
        <div className="flex items-center gap-0.5">
          <span className="text-sm font-bold tracking-tight text-zinc-100">VANILLA</span>
          <span className="text-sm font-bold tracking-tight text-brand">&nbsp;ROYAL</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <aside className="w-60 bg-zinc-950 border-r border-white/[0.06]">
            <div className="pt-14 h-full">
              <SidebarContent onLinkClick={() => setMobileOpen(false)} />
            </div>
          </aside>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
}
