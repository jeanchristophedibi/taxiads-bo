import { describe, expect, it } from 'vitest';
import { DOCS_FALLBACK_URL, getDocsFallbackUrl, mapDocsResponseToLinks } from './docs-links';

describe('mapDocsResponseToLinks', () => {
  it('maps API payload to docs links UI model', () => {
    const result = mapDocsResponseToLinks({
      data: {
        documentation_url: 'https://taxiads-api.ddev.site/docs/#/',
        bo_api_docs_url: 'https://taxiads-api.ddev.site/docs/bo/README.md',
        bo_kiosk_guide_url: 'https://taxiads-api.ddev.site/docs/bo/bo-update-kiosk-uninstall-guide.md',
        updates: {
          mobile_app_download: 'https://taxiads-api.ddev.site/docs/bo/api-update-12-mobile-app-download.md',
        },
      },
    });

    expect(result).toEqual({
      documentationUrl: 'https://taxiads-api.ddev.site/docs/#/',
      boApiDocsUrl: 'https://taxiads-api.ddev.site/docs/bo/README.md',
      boKioskGuideUrl: 'https://taxiads-api.ddev.site/docs/bo/bo-update-kiosk-uninstall-guide.md',
      updates: {
        mobile_app_download: 'https://taxiads-api.ddev.site/docs/bo/api-update-12-mobile-app-download.md',
      },
    });
  });

  it('falls back to local docs url when documentation_url is missing', () => {
    const result = mapDocsResponseToLinks({ data: {} });
    expect(result.documentationUrl).toBe(DOCS_FALLBACK_URL);
  });

  it('supports custom fallback url when documentation_url is missing', () => {
    const result = mapDocsResponseToLinks(
      { data: {} },
      { fallbackUrl: 'https://taxiads-api.ddev.site/docs/#/' },
    );

    expect(result.documentationUrl).toBe('https://taxiads-api.ddev.site/docs/#/');
  });
});

describe('getDocsFallbackUrl', () => {
  it('builds absolute docs url from api base url', () => {
    expect(getDocsFallbackUrl('https://taxiads-api.ddev.site/api')).toBe('https://taxiads-api.ddev.site/docs/#/');
  });

  it('returns local fallback path when api base url is invalid', () => {
    expect(getDocsFallbackUrl('')).toBe('/docs/#/');
  });
});
