'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Scope = 'all' | 'ecrans' | 'campagnes' | 'playlists' | 'creatives' | 'annonceurs' | 'localisations' | 'play-logs';

const SCOPE_ROUTES: Record<Exclude<Scope, 'all'>, string> = {
  ecrans: '/ecrans',
  campagnes: '/campagnes',
  playlists: '/playlists',
  creatives: '/creatives',
  annonceurs: '/annonceurs',
  localisations: '/localisations',
  'play-logs': '/play-logs',
};

const SCOPE_LABELS: { value: Scope; label: string }[] = [
  { value: 'all', label: 'Global' },
  { value: 'ecrans', label: 'Écrans' },
  { value: 'campagnes', label: 'Campagnes' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'creatives', label: 'Créatives' },
  { value: 'annonceurs', label: 'Annonceurs' },
  { value: 'localisations', label: 'Localisations' },
  { value: 'play-logs', label: 'Diffusions' },
];

export function GlobalSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [scope, setScope] = useState<Scope>('all');
  const [term, setTerm] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const initialTerm = useMemo(() => {
    return searchParams.get('global') ?? searchParams.get('search') ?? '';
  }, [searchParams]);

  useEffect(() => {
    setTerm(initialTerm);
  }, [initialTerm, pathname]);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )auth_user=([^;]*)/);
    if (!match) {
      setUser(null);
      return;
    }
    try {
      setUser(JSON.parse(decodeURIComponent(match[1])) as { name: string; email: string });
    } catch {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('');
  }, [user]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = term.trim();

    if (scope === 'all') {
      const query = new URLSearchParams();
      if (value) query.set('global', value);
      const qs = query.toString();
      router.push(qs ? `/dashboard?${qs}` : '/dashboard');
      return;
    }

    const targetPath = SCOPE_ROUTES[scope];
    const query = new URLSearchParams();
    if (value) query.set('search', value);
    const qs = query.toString();
    router.push(qs ? `${targetPath}?${qs}` : targetPath);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="sidebar-glass p-3 flex flex-col gap-2 sm:flex-row sm:items-center border-y border-r border-white/10 shadow-apple-lg rounded-none"
    >
      <div className="flex-1 flex items-center rounded-apple border border-[var(--apple-separator)] bg-white/95 overflow-hidden">
        <div className="h-10 w-10 shrink-0 flex items-center justify-center border-r border-[var(--apple-separator)] text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Recherche globale (écran, campagne, playlist, annonceur...)"
          className="w-full h-10 px-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <select
        value={scope}
        onChange={(e) => setScope(e.target.value as Scope)}
        className="input w-full sm:w-44 bg-white/95"
      >
        {SCOPE_LABELS.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>

      <button type="submit" className="btn-primary">
        Rechercher
      </button>

      <button
        type="button"
        className="relative h-10 w-10 shrink-0 rounded-full border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((value) => !value)}
          className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-semibold border border-white/20 shadow-lg shadow-indigo-500/25"
          aria-label="Compte"
        >
          {initials}
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-12 w-56 rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden z-50">
            <div className="px-3 py-2.5 border-b border-white/10">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || '—'}</p>
            </div>
            <Link
              href="/profile"
              className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors"
            >
              Mon profil
            </Link>
            <form action="/api/logout" method="post" className="border-t border-white/10">
              <button
                type="submit"
                className="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Déconnexion
              </button>
            </form>
          </div>
        )}
      </div>
    </form>
  );
}
