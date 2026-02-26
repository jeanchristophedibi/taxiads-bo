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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--apple-bg)' }}>
      <div className="animate-fade-in card p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-apple-lg bg-[var(--apple-blue)] flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="2" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 leading-tight">TaxiAds</p>
            <p className="text-xs leading-tight" style={{ color: 'var(--apple-label)' }}>Back Office</p>
          </div>
        </div>

        <h1 className="text-[1.375rem] font-bold text-gray-900 tracking-tight mb-1">Connexion</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--apple-label)' }}>Accédez à votre espace d'administration</p>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm px-3.5 py-3 rounded-apple">
              <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@taxiads.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-medium"
                style={{ color: 'var(--apple-blue)' }}
                tabIndex={-1}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Code OTP <span style={{ color: 'var(--apple-label)' }} className="font-normal">(si 2FA activée)</span></label>
            <input
              name="otp_code"
              inputMode="numeric"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary w-full justify-center mt-2"
          >
            {pending ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Connexion…
              </>
            ) : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
