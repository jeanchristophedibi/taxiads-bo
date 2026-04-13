'use client';

import { useSidebar } from './sidebar-context';

export function MobileTopBar() {
  const { toggle } = useSidebar();

  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 sidebar-glass flex items-center gap-3 px-4 border-b border-white/10">
      <button
        type="button"
        onClick={toggle}
        aria-label="Ouvrir le menu"
        className="h-9 w-9 rounded-apple flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 shrink-0 rounded-md bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
            <rect x="9" y="11" width="14" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <span className="text-white text-sm font-semibold truncate">TaxiAds</span>
      </div>
    </div>
  );
}
