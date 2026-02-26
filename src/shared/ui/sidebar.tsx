'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type NavLink = { href: string; label: string };
type NavItem = { label: string; children: NavLink[] };

const NAV: NavItem[] = [

  {
    label: 'Dashboard',
    children: [{ href: '/dashboard', label: 'Dashboard' }],
  },
  
  {
    label: 'Diffusion',
    children: [
      { href: '/ecrans', label: 'Écrans' },
      { href: '/creatives', label: 'Créatives' },
      { href: '/campagnes', label: 'Campagnes' },
      { href: '/playlists', label: 'Playlists' },
      { href: '/play-logs', label: 'Historique des diffusions' },
    ],
  },
  {
    label: 'Ressources',
    children: [
      { href: '/annonceurs', label: 'Annonceurs' },
      { href: '/localisations', label: 'Localisations' },
    ],
  },

];

function getAuthUser(): { name: string; email: string } | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )auth_user=([^;]*)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

const isActivePath = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const initiallyOpenGroups = useMemo(() => {
    const open: Record<string, boolean> = {};
    NAV.forEach((group) => {
      open[group.label] = group.children.some((child) => isActivePath(pathname, child.href));
    });
    return open;
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initiallyOpenGroups);

  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  useEffect(() => {
    const onAuthUserUpdated = () => setUser(getAuthUser());
    window.addEventListener('auth-user-updated', onAuthUserUpdated);
    return () => window.removeEventListener('auth-user-updated', onAuthUserUpdated);
  }, []);

  useEffect(() => {
    setOpenGroups((prev) => ({ ...initiallyOpenGroups, ...prev }));
  }, [initiallyOpenGroups]);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-slate-900 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-slate-800">
        <span className="text-white font-semibold text-sm">TaxiAds BO</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-auto">
        {NAV.map((group, groupIndex) => {
          const groupActive = group.children.some((child) => isActivePath(pathname, child.href));
          const groupOpen = !!openGroups[group.label];

          if (group.children.length === 1) {
            const only = group.children[0];
            const active = isActivePath(pathname, only.href);
            return (
              <Link
                key={`group-single-${group.label}-${groupIndex}`}
                href={only.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {group.label}
              </Link>
            );
          }

          return (
            <div key={`group-${group.label}-${groupIndex}`} className="rounded-md overflow-hidden">
              <button
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                  groupActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{group.label}</span>
                <span className={`text-xs transition-transform ${groupOpen ? 'rotate-90' : ''}`}>▶</span>
              </button>

              {groupOpen && (
                <div className="bg-slate-950/40 border-l border-slate-700 ml-3">
                  {group.children.map((child, childIndex) => {
                    const childActive = isActivePath(pathname, child.href);
                    return (
                      <Link
                        key={`child-${group.label}-${child.href}-${childIndex}`}
                        href={child.href}
                        className={`block px-3 py-2 text-xs transition-colors ${
                          childActive ? 'text-blue-300 bg-slate-800/40' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800">
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((v) => !v)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-left hover:bg-slate-800 transition-colors"
          >
            {/* <p className="text-xs text-slate-400 mb-1">Profil connecté</p> */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Utilisateur'}</p>
                {/* <p className="text-xs text-slate-400 truncate">{user?.email || '—'}</p> */}
              </div>
              <span className={`text-xs text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl overflow-hidden">
              <Link
                href="/profile"
                className="block px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Mon profil
              </Link>
              <form action="/api/logout" method="post" className="border-t border-slate-700">
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-left text-xs font-medium text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
