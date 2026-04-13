export type AuthOrganization = {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
};

export type AuthUser = {
  id?: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role?: string;
  permissions?: string[];
  current_organization_id?: string;
  organizations?: AuthOrganization[];
};

const AUTH_USER_COOKIE = 'auth_user';

const decodeCookieValue = (raw: string): string | null => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
};

const parseAuthUser = (raw: string): AuthUser | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.email || !parsed.name) return null;
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      avatar_url: parsed.avatar_url ?? null,
      role: parsed.role,
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions.filter((p): p is string => typeof p === 'string') : [],
      current_organization_id: parsed.current_organization_id,
      organizations: Array.isArray(parsed.organizations) ? parsed.organizations : [],
    };
  } catch {
    return null;
  }
};

export const getAuthUserFromCookie = (): AuthUser | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_USER_COOKIE}=([^;]*)`));
  if (!match) return null;
  const decoded = decodeCookieValue(match[1]);
  if (!decoded) return null;
  return parseAuthUser(decoded);
};

export const setAuthUserCookie = (user: AuthUser): void => {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_USER_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; samesite=lax`;
  window.dispatchEvent(new Event('auth-user-updated'));
};

export const updateAuthUserCookie = (partial: Partial<AuthUser>): void => {
  const current = getAuthUserFromCookie();
  if (!current) return;
  setAuthUserCookie({
    ...current,
    ...partial,
    permissions: partial.permissions ?? current.permissions ?? [],
    organizations: partial.organizations ?? current.organizations ?? [],
  });
};

export const hasPermission = (
  permissions: string[] | undefined,
  required: string,
): boolean => {
  if (!required) return true;
  if (!Array.isArray(permissions) || permissions.length === 0) return false;
  return permissions.includes(required) || permissions.includes('*');
};

export const hasAnyPermission = (
  permissions: string[] | undefined,
  required: string[],
): boolean => {
  if (required.length === 0) return true;
  return required.some((permission) => hasPermission(permissions, permission));
};
