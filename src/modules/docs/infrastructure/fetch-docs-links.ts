import { env } from '@/shared/config/env';
import { getDocsFallbackUrl, mapDocsResponseToLinks, type DocsLinks } from '../domain/docs-links';

export async function fetchDocsLinks(): Promise<DocsLinks> {
  const res = await fetch(`${env.apiBaseUrl}/public/docs`, {
    headers: {
      Accept: 'application/json',
      ...(env.sharedSecret ? { 'X-Shared-Secret': env.sharedSecret } : {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`DOCS_LINKS_HTTP_${res.status}`);
  }

  const payload = (await res.json()) as unknown;
  return mapDocsResponseToLinks(payload, { fallbackUrl: getDocsFallbackUrl(env.apiBaseUrl) });
}
