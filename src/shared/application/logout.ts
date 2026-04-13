import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { env } from '@/shared/config/env';

const clearAuthCookies = () => {
  document.cookie = 'auth_token=; Max-Age=0; path=/';
  document.cookie = 'auth_user=; Max-Age=0; path=/';
  window.dispatchEvent(new Event('auth-user-updated'));
};

const getAuthToken = (): string | null => {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export async function performLogout(router: AppRouterInstance): Promise<void> {
  const token = getAuthToken();

  try {
    if (token) {
      await fetch(`${env.apiBaseUrl}/logout`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch {
    // Local session cleanup is still enough to end the BO session.
  } finally {
    clearAuthCookies();
    router.replace('/login');
  }
}
