'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type LoginResponse = {
  token?: string;
  access_token?: string;
  user?: { id?: string; name?: string; email?: string };
  message?: string;
  errors?: Record<string, string[]>;
  data?: {
    token?: string;
    access_token?: string;
    user?: { id?: string; name?: string; email?: string };
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      setError('Configuration manquante: NEXT_PUBLIC_API_BASE_URL');
      setPending(false);
      return;
    }

    const apiHost = (() => {
      try {
        return new URL(baseUrl).host;
      } catch {
        return baseUrl;
      }
    })();

    try {
      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password, otp_code: otpCode || undefined, device_name: 'taxiads-bo' }),
      });

      const payload = (await res.json()) as LoginResponse;

      if (!res.ok) {
        const apiError = payload.errors
          ? Object.values(payload.errors).flat().join(' ')
          : payload.message || 'Identifiants incorrects.';
        setError(apiError);
        return;
      }

      const token =
        payload.token ??
        payload.access_token ??
        payload.data?.token ??
        payload.data?.access_token;
      const user = payload.user ?? payload.data?.user;

      if (!token || !user?.email) {
        setError('Réponse API de connexion invalide.');
        return;
      }

      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
      document.cookie = `auth_user=${encodeURIComponent(JSON.stringify({ name: user.name ?? '', email: user.email }))}; path=/; max-age=${maxAge}; samesite=lax`;
      router.replace('/dashboard');
    } catch {
      setError(`Impossible de joindre le serveur (${apiHost}).`);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 w-full max-w-sm">
        <div className="mb-8">
          <div className="text-xl font-bold text-slate-900 mb-1">TaxiAds BO</div>
          <p className="text-sm text-slate-500">Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@taxiads.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Code OTP (si 2FA activée)</label>
            <input
              name="otp_code"
              inputMode="numeric"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {pending ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
