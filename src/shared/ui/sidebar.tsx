'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSidebar } from './sidebar-context';
import { env } from '@/shared/config/env';
import { fetchDocsLinks } from '@/modules/docs/infrastructure/fetch-docs-links';
import { trackDocsLinkClick } from '@/modules/docs/presentation/lib/track-docs-link-click';
import { resolveDocumentationUrl } from '@/modules/docs/presentation/lib/resolve-documentation-url';
import { getDocsFallbackUrl } from '@/modules/docs/domain/docs-links';

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  screens: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  ),
  creatives: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  artworks: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  campaigns: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  ),
  playlists: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h12M3 18h12M16 16l5-4-5-4v8z" />
    </svg>
  ),
  history: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  ),
  map: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  ),
  advertisers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 7v14M21 7v14M6 21V11m4 10V11m4 10V11m4 10V11M3 7l9-4 9 4" />
    </svg>
  ),
  locations: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  chevronRight: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  chevronDown: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  announcements: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  ),
  programs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  profile: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  documentation: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
};

/* ─── Nav definition ─────────────────────────────────────────────────────── */
type NavLink = { href: string; label: string; icon: React.ReactNode };
type NavGroup = { label: string; icon?: React.ReactNode; children: NavLink[] };

const NAV: NavGroup[] = [
  {
    label: 'Dashboard',
    children: [{ href: '/dashboard', label: 'Dashboard', icon: icons.dashboard }],
  },
  {
    label: 'Diffusion',
    children: [
      { href: '/ecrans',     label: 'Écrans',       icon: icons.screens },
      { href: '/creatives',  label: 'Créatives',    icon: icons.creatives },
      { href: '/artworks',   label: 'Artworks',     icon: icons.artworks },
      { href: '/campagnes',  label: 'Campagnes',    icon: icons.campaigns },
      { href: '/playlists',  label: 'Playlists',    icon: icons.playlists },
      { href: '/play-logs',  label: 'Historique',   icon: icons.history },
      { href: '/carte',      label: 'Carte',        icon: icons.map },
    ],
  },
  {
    label: 'Communication',
    children: [
      { href: '/annonces', label: 'Annonces', icon: icons.announcements },
      { href: '/programmes', label: 'Programmes', icon: icons.programs },
    ],
  },
  {
    label: 'Ressources',
    children: [
      { href: '/annonceurs',    label: 'Annonceurs',    icon: icons.advertisers },
      { href: '/localisations', label: 'Localisations', icon: icons.locations },
    ],
  },
  {
    label: 'Aide',
    children: [
      { href: '/aide', label: 'Aide', icon: icons.documentation },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/* ─── Component ──────────────────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openingDocs, setOpeningDocs] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const openDocumentation = async () => {
    if (openingDocs) return;
    setOpeningDocs(true);

    const popup = typeof window !== 'undefined'
      ? window.open('about:blank', '_blank', 'noopener,noreferrer')
      : null;

    const navigate = (url: string) => {
      if (popup) {
        popup.location.href = url;
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    try {
      const resolved = await resolveDocumentationUrl(fetchDocsLinks, getDocsFallbackUrl(env.apiBaseUrl));
      trackDocsLinkClick({
        source: 'sidebar',
        key: resolved.fallback ? 'fallback_local_docs' : 'documentation_main',
        url: resolved.url,
      });
      navigate(resolved.url);
    } finally {
      setOpeningDocs(false);
    }
  };

  useEffect(() => { setIsProfileOpen(false); close(); }, [pathname, close]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!profileMenuRef.current?.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <>
      {/* Mobile overlay — closes sidebar on tap outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 flex flex-col z-40 sidebar-glass transition-transform duration-300 ease-[var(--ease-apple)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ width: 'var(--sidebar-w)' }}
      >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
            <rect x="9" y="11" width="14" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">TaxiAds</p>
          <p className="text-slate-500 text-[10px] leading-tight font-medium tracking-wide uppercase">Back Office</p>
        </div>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((group) => {

          /* Single-item group → direct link */
          if (group.children.length === 1) {
            const only = group.children[0];
            const active = isActivePath(pathname, only.href);
            return (
              <Link
                key={group.label}
                href={only.href}
                className={`animate-nav-item flex items-center gap-3 px-3 py-2.5 rounded-apple text-sm font-medium transition-all duration-200 ease-apple ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <span className={active ? 'text-white' : 'text-white/40'}>{only.icon}</span>
                {only.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
              </Link>
            );
          }

          /* Multi-item group → collapsible */
          return (
            <div key={group.label}>
              {/* Section label */}
              <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-widest select-none">
                {group.label}
              </p>

              {group.children.map((child, idx) => {
                const active = isActivePath(pathname, child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`animate-nav-item flex items-center gap-3 px-3 py-2 rounded-apple text-sm transition-all duration-200 ease-apple ${
                      active
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5 font-normal'
                    }`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <span className={`shrink-0 ${active ? 'text-white' : 'text-white/35'}`}>
                      {child.icon}
                    </span>
                    <span className="truncate">{child.label}</span>
                    {active && (
                      <span className="ml-auto w-1 h-4 rounded-full bg-white/60 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => void openDocumentation()}
          disabled={openingDocs}
          className="mt-4 w-full animate-nav-item flex items-center gap-3 px-3 py-2.5 rounded-apple text-sm font-medium transition-all duration-200 ease-apple text-white/50 hover:text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          <span className="text-white/40">{icons.documentation}</span>
          Documentation
        </button>
      </nav>

      {/* ── Profile ──────────────────────────────────────────────────── */}
      <div className="px-3 pb-4 shrink-0 border-t border-white/5 pt-3">
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors duration-150 group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-slate-300">{icons.user}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-slate-200 truncate leading-tight">
                Compte
              </p>
              <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                Options
              </p>
            </div>
            <span className={`text-slate-500 group-hover:text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}>
              {icons.chevronDown}
            </span>
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden"
              style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {icons.profile}
                <span>Mon profil</span>
              </Link>
              <div className="border-t border-white/5" />
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                >
                  {icons.logout}
                  <span>Déconnexion</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      </aside>
    </>
  );
}
