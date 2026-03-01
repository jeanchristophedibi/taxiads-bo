import { describe, expect, it, vi } from 'vitest';
import { DOCS_FALLBACK_URL } from '../../domain/docs-links';
import { resolveDocumentationUrl } from './resolve-documentation-url';

describe('resolveDocumentationUrl', () => {
  it('returns API documentation url when fetch succeeds', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      documentationUrl: 'https://taxiads-api.ddev.site/docs/#/',
      boApiDocsUrl: null,
      boKioskGuideUrl: null,
      updates: {},
    });

    await expect(resolveDocumentationUrl(fetcher)).resolves.toEqual({
      url: 'https://taxiads-api.ddev.site/docs/#/',
      fallback: false,
    });
  });

  it('falls back to local docs url when API fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network'));

    await expect(resolveDocumentationUrl(fetcher)).resolves.toEqual({
      url: DOCS_FALLBACK_URL,
      fallback: true,
    });
  });

  it('uses provided fallback url when API fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network'));

    await expect(
      resolveDocumentationUrl(fetcher, 'https://taxiads-api.ddev.site/docs/#/'),
    ).resolves.toEqual({
      url: 'https://taxiads-api.ddev.site/docs/#/',
      fallback: true,
    });
  });
});
