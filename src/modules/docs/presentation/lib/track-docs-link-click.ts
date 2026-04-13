type DocsClickPayload = {
  source: 'sidebar' | 'help-page';
  key: string;
  url: string;
};

export function trackDocsLinkClick(payload: DocsClickPayload) {
  console.info('[BO][Docs] link_click', payload);

  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('bo:docs-link-click', {
    detail: {
      ...payload,
      at: new Date().toISOString(),
    },
  }));
}
