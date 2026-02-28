'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type GlobalScope = {
  key: string;
  label: string;
  route: string;
  optionResource: string;
};

type OptionItem = { key: string; value: string };
type ScopeResult = GlobalScope & { items: OptionItem[] };

const SCOPES: GlobalScope[] = [
  { key: 'ecrans', label: 'Écrans', route: '/ecrans', optionResource: 'screens' },
  { key: 'campagnes', label: 'Campagnes', route: '/campagnes', optionResource: 'campaigns' },
  { key: 'playlists', label: 'Playlists', route: '/playlists', optionResource: 'playlists' },
  { key: 'creatives', label: 'Créatives', route: '/creatives', optionResource: 'creatives' },
  { key: 'annonceurs', label: 'Annonceurs', route: '/annonceurs', optionResource: 'advertisers' },
  { key: 'localisations', label: 'Localisations', route: '/localisations', optionResource: 'locations' },
];

const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const getAuthUser = (): { name: string; email: string; avatar_url?: string | null } | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )auth_user=([^;]*)/);
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as { name: string; email: string; avatar_url?: string | null };
  } catch {
    return null;
  }
};

export function GlobalSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [term, setTerm] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDropdownPos, setProfileDropdownPos] = useState({ top: 0, right: 0 });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar_url?: string | null } | null>(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScopeResult[]>([]);

  const initialTerm = useMemo(() => {
    return searchParams.get('global') ?? searchParams.get('search') ?? '';
  }, [searchParams]);

  useEffect(() => {
    setTerm(initialTerm);
  }, [initialTerm, pathname]);

  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  useEffect(() => {
    const refresh = () => setUser(getAuthUser());
    window.addEventListener('auth-user-updated', refresh);
    return () => window.removeEventListener('auth-user-updated', refresh);
  }, []);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (
        !profileRef.current?.contains(event.target as Node) &&
        !profileDropdownRef.current?.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (!popupRef.current?.contains(event.target as Node)) {
        setOpenPopup(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  /* Compute dropdown anchor position whenever it opens */
  useEffect(() => {
    if (profileOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setProfileDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
      setOpenPopup(false); // close search popup if open
    }
  }, [profileOpen]);

  useEffect(() => {
    document.body.classList.toggle('notifications-open', notificationsOpen);
    return () => document.body.classList.remove('notifications-open');
  }, [notificationsOpen]);

  useEffect(() => {
    const query = term.trim().toLowerCase();
    if (query.length < 2) {
      setResults([]);
      setOpenPopup(false);
      return;
    }

    const token = getAuthToken();
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);

      try {
        const fetched = await Promise.all(
          SCOPES.map(async (scope) => {
            const res = await fetch(`${base}/bo/options/${scope.optionResource}`, {
              headers: {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            });

            if (!res.ok) return { ...scope, items: [] as OptionItem[] };

            const json = (await res.json()) as { data?: OptionItem[] };
            const items = (json.data ?? [])
              .filter((item) => item.value.toLowerCase().includes(query))
              .slice(0, 4);

            return { ...scope, items };
          }),
        );

        setResults(fetched.filter((scope) => scope.items.length > 0));
        setOpenPopup(true);
      } catch {
        setResults([]);
        setOpenPopup(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [term]);

  const initials = useMemo(() => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('');
  }, [user]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = term.trim();
    if (!query) return;

    const firstScope = results[0];
    if (firstScope) {
      router.push(`${firstScope.route}?search=${encodeURIComponent(query)}`);
      setOpenPopup(false);
      return;
    }

    router.push(`/dashboard?global=${encodeURIComponent(query)}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="sidebar-glass px-3 py-2.5 flex items-center gap-2 border-b border-white/10"
    >
      <div className="relative flex-1 min-w-0" ref={popupRef}>
        <div className="flex items-center rounded-apple border border-[var(--apple-separator)] bg-white/95 overflow-hidden">
          <div className="h-9 w-9 shrink-0 flex items-center justify-center border-r border-[var(--apple-separator)] text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onFocus={() => term.trim().length >= 2 && setOpenPopup(true)}
            placeholder="Rechercher…"
            className="w-full h-9 px-3 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {openPopup && (
          <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
            {loading ? (
              <p className="px-3 py-2 text-sm text-slate-400">Recherche en cours…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-400">Aucun résultat.</p>
            ) : (
              <div className="max-h-80 overflow-auto py-1">
                {results.map((scope) => (
                  <div key={scope.key} className="border-b border-white/5 last:border-b-0">
                    <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-slate-500">{scope.label}</div>
                    {scope.items.map((item) => (
                      <Link
                        key={`${scope.key}-${item.key}`}
                        href={`${scope.route}?search=${encodeURIComponent(item.value)}`}
                        onClick={() => setOpenPopup(false)}
                        className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                      >
                        {item.value}
                      </Link>
                    ))}
                    <Link
                      href={`${scope.route}?search=${encodeURIComponent(term.trim())}`}
                      onClick={() => setOpenPopup(false)}
                      className="block px-3 py-2 text-xs text-blue-300 hover:bg-blue-500/10"
                    >
                      Voir tous les résultats dans {scope.label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text button hidden on mobile — form still submits on Enter */}
      <button type="submit" className="hidden sm:inline-flex btn-primary shrink-0">
        Rechercher
      </button>

      <button
        type="button"
        onClick={() => setNotificationsOpen(true)}
        className="relative h-9 w-9 shrink-0 rounded-full border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 21a2 2 0 0 0 4 0" />
        </svg>
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <div className="relative shrink-0" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((value) => !value)}
          className="h-9 w-9 rounded-full overflow-hidden border border-white/20 shadow-lg shadow-indigo-500/25 focus:outline-none"
          aria-label="Compte"
        >
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-semibold">
              {initials}
            </span>
          )}
        </button>
      </div>

      {/* Profile dropdown portalled to body — avoids stacking-context / overflow clipping */}
      {profileOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={profileDropdownRef}
          className="fixed w-56 rounded-xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden z-[200]"
          style={{ top: profileDropdownPos.top, right: profileDropdownPos.right }}
        >
          <div className="px-3 py-2.5 border-b border-white/10">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Utilisateur'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || '—'}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setProfileOpen(false)}
            className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 transition-colors"
          >
            Mon profil
          </Link>
          <form
            action="/api/logout"
            method="post"
            className="border-t border-white/10"
            onSubmit={(e) => e.stopPropagation()}
          >
            <button
              type="submit"
              className="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>,
        document.body
      )}

      {notificationsOpen && typeof document !== 'undefined' && createPortal(
        <>
          <button
            type="button"
            aria-label="Fermer les notifications"
            className="notification-overlay fixed inset-0 z-[1000] bg-black/30"
            onClick={() => setNotificationsOpen(false)}
          />
          <section
            className="notification-drawer fixed right-0 top-0 z-[1001] h-screen w-[360px] max-w-[92vw] sidebar-glass border-l border-white/10 shadow-2xl"
            aria-label="Centre de notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-57px)]">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Système</p>
                <p className="text-sm text-slate-100 mt-1">Aucune alerte critique en cours.</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Diffusions</p>
                <p className="text-sm text-slate-100 mt-1">Les données de diffusion sont à jour.</p>
              </div>
            </div>
          </section>
        </>
      , document.body)}
    </form>
  );
}
