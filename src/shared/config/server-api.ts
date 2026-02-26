import 'server-only';

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, '');

export function getServerApiBaseUrl(): string {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing environment variable: API_BASE_URL or NEXT_PUBLIC_API_BASE_URL');
  }

  return trimTrailingSlash(baseUrl);
}

export function getServerApiOrigin(): string {
  return getServerApiBaseUrl().replace(/\/api$/, '');
}
