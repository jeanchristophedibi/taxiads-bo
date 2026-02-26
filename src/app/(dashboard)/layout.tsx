import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/shared/ui/sidebar';
import { getServerApiOrigin } from '@/shared/config/server-api';
import { GlobalSearchBar } from '@/shared/ui/global-search';

async function isTokenValid(token: string): Promise<boolean> {
  const base = getServerApiOrigin();
  try {
    const res = await fetch(`${base}/api/me`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return res.status !== 401;
  } catch {
    // API unreachable → don't block access on network errors
    return true;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const token = jar.get('auth_token')?.value;

  if (!token) redirect('/login');
  if (!(await isTokenValid(token))) redirect('/api/auth/clear');

  return (
    <div className="dashboard-shell flex min-h-screen bg-apple-bg">
      <Sidebar />
      <main className="dashboard-content flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-w)' }}>
        <GlobalSearchBar />
        <div className="px-8 py-8 max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
