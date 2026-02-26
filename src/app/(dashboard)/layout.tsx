import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/shared/ui/sidebar';
import { getServerApiOrigin } from '@/shared/config/server-api';

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56 p-8">
        {children}
      </main>
    </div>
  );
}
