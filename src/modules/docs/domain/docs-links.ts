export const DOCS_FALLBACK_PATH = '/docs/#/';
export const DOCS_FALLBACK_URL = DOCS_FALLBACK_PATH;

export interface DocsLinks {
  documentationUrl: string;
  boApiDocsUrl: string | null;
  boKioskGuideUrl: string | null;
  updates: Record<string, string>;
}

export function getDocsFallbackUrl(apiBaseUrl?: string): string {
  if (!apiBaseUrl) return DOCS_FALLBACK_PATH;

  try {
    const url = new URL(apiBaseUrl);
    const basePath = url.pathname.replace(/\/api\/?$/, '');
    const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    return `${url.origin}${normalizedBasePath}${DOCS_FALLBACK_PATH}`;
  } catch {
    return DOCS_FALLBACK_PATH;
  }
}

const asString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const asUpdates = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object') return {};
  const entries = Object.entries(value as Record<string, unknown>)
    .map(([key, url]) => [key, asString(url)] as const)
    .filter(([, url]) => !!url)
    .map(([key, url]) => [key, url as string] as const);

  return Object.fromEntries(entries);
};

export function mapDocsResponseToLinks(
  payload: unknown,
  options?: { fallbackUrl?: string },
): DocsLinks {
  const root = (payload && typeof payload === 'object' ? payload : {}) as { data?: unknown };
  const data = (root.data && typeof root.data === 'object' ? root.data : {}) as Record<string, unknown>;

  const documentationUrl = asString(data.documentation_url) ?? options?.fallbackUrl ?? DOCS_FALLBACK_URL;

  return {
    documentationUrl,
    boApiDocsUrl: asString(data.bo_api_docs_url),
    boKioskGuideUrl: asString(data.bo_kiosk_guide_url),
    updates: asUpdates(data.updates),
  };
}
