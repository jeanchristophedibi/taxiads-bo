import { DOCS_FALLBACK_URL, type DocsLinks } from '../../domain/docs-links';

export async function resolveDocumentationUrl(
  fetcher: () => Promise<DocsLinks>,
  fallbackUrl = DOCS_FALLBACK_URL,
): Promise<{ url: string; fallback: boolean }> {
  try {
    const links = await fetcher();
    return { url: links.documentationUrl || fallbackUrl, fallback: false };
  } catch {
    return { url: fallbackUrl, fallback: true };
  }
}
