'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAuthUserFromCookie, hasAnyPermission, hasPermission, type AuthUser } from './auth-context';

export function useAuthUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const refresh = () => setUser(getAuthUserFromCookie());
    refresh();
    window.addEventListener('auth-user-updated', refresh);
    return () => window.removeEventListener('auth-user-updated', refresh);
  }, []);

  return user;
}

export function useAuthPermissions() {
  const user = useAuthUser();
  const permissions = user?.permissions ?? [];

  return useMemo(() => ({
    user,
    permissions,
    can: (required: string) => hasPermission(permissions, required),
    canAny: (required: string[]) => hasAnyPermission(permissions, required),
  }), [permissions, user]);
}
