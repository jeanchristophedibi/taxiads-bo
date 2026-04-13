'use client';

import { getDocsFallbackUrl } from '@/modules/docs/domain/docs-links';
import { useDocsLinksQuery } from '@/modules/docs/presentation/hooks/use-docs-links-query';
import { trackDocsLinkClick } from '@/modules/docs/presentation/lib/track-docs-link-click';
import { env } from '@/shared/config/env';

function HelpLink({
  title,
  href,
  linkKey,
}: {
  title: string;
  href: string | null;
  linkKey: string;
}) {
  if (!href) {
    return (
      <div className="px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400">
        {title} indisponible
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        trackDocsLinkClick({ source: 'help-page', key: linkKey, url: href });
        window.open(href, '_blank', 'noopener,noreferrer');
      }}
      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-left hover:bg-slate-50 transition-colors"
    >
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="text-xs text-blue-600 mt-0.5 truncate">{href}</p>
    </button>
  );
}

export default function AidePage() {
  const { data, isLoading, isError, refetch } = useDocsLinksQuery();
  const fallbackUrl = getDocsFallbackUrl(env.apiBaseUrl);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="page-title">Aide</h1>
        <div className="card p-5 space-y-3">
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <h1 className="page-title">Aide</h1>
        <div className="card p-5 space-y-4">
          <p className="text-sm text-red-600">Impossible de charger les liens de documentation.</p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary" onClick={() => void refetch()}>
              Réessayer
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                trackDocsLinkClick({ source: 'help-page', key: 'fallback_local_docs', url: fallbackUrl });
                window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
              }}
            >
              Ouvrir la documentation locale
            </button>
          </div>
        </div>
      </div>
    );
  }

  const updatesEntries = Object.entries(data.updates);

  return (
    <div className="space-y-4">
      <h1 className="page-title">Aide</h1>

      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Documentation</h2>
        <HelpLink title="Documentation principale" href={data.documentationUrl} linkKey="documentation_main" />
        <HelpLink title="Doc BO/API" href={data.boApiDocsUrl} linkKey="bo_api_docs" />
        <HelpLink title="Guide sortie kiosk" href={data.boKioskGuideUrl} linkKey="bo_kiosk_guide" />
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Dernières mises à jour</h2>
        {updatesEntries.length === 0 && (
          <p className="text-sm text-slate-500">Aucune mise à jour disponible.</p>
        )}
        {updatesEntries.map(([key, href]) => (
          <HelpLink
            key={key}
            title={key.replaceAll('_', ' ')}
            href={href}
            linkKey={`update_${key}`}
          />
        ))}
      </div>
    </div>
  );
}
