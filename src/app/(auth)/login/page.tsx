'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthUserCookie } from '@/shared/application/auth-context';

type LoginResponse = {
  token?: string;
  access_token?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    avatar_url?: string | null;
    role?: string;
    permissions?: string[];
    current_organization_id?: string;
    organizations?: { id: string; name: string; slug: string; status: string; role: string }[];
  };
  message?: string;
  errors?: Record<string, string[]>;
  data?: {
    token?: string;
    access_token?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
      avatar_url?: string | null;
      role?: string;
      permissions?: string[];
      current_organization_id?: string;
      organizations?: { id: string; name: string; slug: string; status: string; role: string }[];
    };
  };
};

const heroSlides = [
  {
    eyebrow: 'Supervision live',
    title: 'Pilotez vos campagnes taxi en temps reel',
    description:
      "Suivez l'etat des ecrans, la diffusion des playlists et les operations terrain depuis un seul poste de commande.",
    metric: '128 ecrans actifs',
    detail: '23 zones synchronisees',
  },
  {
    eyebrow: 'Operations reseau',
    title: 'Gardez la main sur tout le parc d affichage',
    description:
      "Centralisez les devices, les incidents, les validations et les affectations pour agir plus vite sur le terrain.",
    metric: '99.2% uptime',
    detail: 'Alertes et actions rapides',
  },
  {
    eyebrow: 'Planning media',
    title: 'Coordonnez contenus, diffusion et exploitation',
    description:
      "Creations, campagnes, playlists et planning restent alignes dans une interface plus claire pour l equipe BO.",
    metric: '340 playlists',
    detail: 'Flux publication maitrise',
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (requires2FA) otpRef.current?.focus();
  }, [requires2FA]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4800);

    return () => window.clearInterval(id);
  }, []);

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
        // Detect 2FA required
        const otpErrors = payload.errors?.otp_code ?? [];
        const otpRequired = otpErrors.some((msg) => msg.toLowerCase().includes('required'));

        if (otpRequired && !requires2FA) {
          setRequires2FA(true);
          setError('Votre compte a la 2FA activée. Entrez le code de votre application OTP.');
          return;
        }

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
      const user = (payload.user ?? payload.data?.user) as LoginResponse['user'] | undefined;

      if (!token || !user?.email) {
        setError('Réponse API de connexion invalide.');
        return;
      }

      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
      setAuthUserCookie({
        id: user.id,
        name: user.name ?? '',
        email: user.email,
        avatar_url: user.avatar_url ?? null,
        role: user.role,
        permissions: user.permissions ?? [],
        current_organization_id: user.current_organization_id,
        organizations: user.organizations ?? [],
      });
      router.replace('/dashboard');
    } catch {
      setError(`Impossible de joindre le serveur (${apiHost}).`);
    } finally {
      setPending(false);
    }
  };

  const currentSlide = heroSlides[activeSlide];

  return (
    <div
      className="min-h-screen p-3 sm:p-4 lg:p-5"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(15, 23, 42, 0.08), transparent 22rem), linear-gradient(180deg, #ece8df 0%, #f5f1e8 100%)',
      }}
    >
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2rem] border border-black/5 bg-[#f3ede2] shadow-[0_32px_90px_rgba(31,24,16,0.14)] lg:grid-cols-[minmax(0,1fr)_430px]">
        <section className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_20rem),linear-gradient(180deg,rgba(10,14,23,0.18),rgba(10,14,23,0.6)),linear-gradient(135deg,#0e1726_0%,#13263b_38%,#102f36_100%)]" />
          <div className="absolute inset-0 opacity-90">
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="absolute right-8 top-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          </div>

          <div className="absolute inset-x-8 top-8 flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/68">TaxiAds API</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Back Office</p>
            </div>
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/72 backdrop-blur">
              Exploitation media
            </div>
          </div>

          <div className="absolute right-10 top-24 grid gap-4">
            <div className="w-[21rem] rounded-[1.6rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between text-white/80">
                <span className="text-sm font-medium">Réseau d'affichage</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-100">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Écrans</p>
                  <p className="mt-3 text-2xl font-semibold text-white">128</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Campagnes</p>
                  <p className="mt-3 text-2xl font-semibold text-white">47</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Alerts</p>
                  <p className="mt-3 text-2xl font-semibold text-white">03</p>
                </div>
              </div>
            </div>

            <div className="ml-auto w-[16.5rem] rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-white shadow-2xl backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Slide actif</p>
              <p className="mt-3 text-lg font-semibold leading-tight">{currentSlide.metric}</p>
              <p className="mt-2 text-sm text-white/68">{currentSlide.detail}</p>
            </div>
          </div>

          <div className="absolute inset-x-8 bottom-10">
            <div className="max-w-xl text-white transition-all duration-500 ease-out-expo">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/56">
                {currentSlide.eyebrow}
              </p>
              <h1 className="mt-4 text-6xl font-semibold leading-[0.94] tracking-[-0.08em]">
                {currentSlide.title}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/74">{currentSlide.description}</p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Afficher le slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === index ? 'w-10 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(221,212,191,0.35)_0,rgba(221,212,191,0.35)_1px,transparent_1px,transparent_78px),linear-gradient(180deg,#f4eee1_0%,#efe7d8_100%)] bg-[length:78px_100%,auto]" />
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-white/50 blur-2xl" />
          <div className="absolute bottom-10 right-8 h-36 w-36 rounded-full bg-black/5 blur-3xl" />

          <div className="animate-fade-in relative z-10 w-full max-w-[23rem] rounded-[1.7rem] border border-white/70 bg-[rgba(255,251,245,0.88)] p-7 shadow-[0_28px_70px_rgba(31,24,16,0.14)] backdrop-blur-xl sm:p-8">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#151515] text-white shadow-[0_16px_30px_rgba(0,0,0,0.18)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 1 1 8 0v3" />
              </svg>
            </div>

            <div className="mb-8 text-center">
              <h2 className="text-[2.15rem] font-semibold tracking-[-0.06em] text-[#20201d]">Connexion</h2>
              <p className="mt-2 text-base leading-7 text-[#7b786f]">Connectez-vous a l'espace TaxiAds</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className={`flex items-start gap-2.5 rounded-[1rem] border px-3.5 py-3 text-sm ${requires2FA && !otpCode ? 'border-amber-200 bg-amber-50/90 text-amber-800' : 'border-red-200 bg-red-50/90 text-red-700'}`}>
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#2e2e29]">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@taxiads.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[0.95rem] border border-[#ddcfaf] bg-[linear-gradient(90deg,#efe4cd_0%,#fff7bf_100%)] px-4 py-3 text-[1rem] text-[#22221f] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-[#c9b36e] focus:outline-none focus:ring-4 focus:ring-[#dcc461]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#2e2e29]">Mot de passe</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[0.95rem] border border-[#ddcfaf] bg-[linear-gradient(90deg,#efe4cd_0%,#fff7bf_100%)] px-4 py-3 pr-20 text-[1rem] text-[#22221f] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-[#c9b36e] focus:outline-none focus:ring-4 focus:ring-[#dcc461]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-[#171717]"
                    tabIndex={-1}
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>

              {requires2FA && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#2e2e29]">
                    Code OTP
                    <span className="ml-1 font-normal text-[#7b786f]">(application d'authentification)</span>
                  </label>
                  <input
                    ref={otpRef}
                    name="otp_code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9a-zA-Z\-]*"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full rounded-[0.95rem] border border-[#ddcfaf] bg-[linear-gradient(90deg,#efe4cd_0%,#fff7bf_100%)] px-4 py-3 tracking-[0.35em] text-[#22221f] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition focus:border-[#c9b36e] focus:outline-none focus:ring-4 focus:ring-[#dcc461]/20"
                  />
                  <p className="mt-2 text-xs text-[#8a867d]">Vous pouvez aussi utiliser un recovery code.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-2 inline-flex w-full items-center justify-center rounded-[0.95rem] bg-[#181818] px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#050505] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <svg className="mr-2 animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Connexion...
                  </>
                ) : requires2FA ? 'Verifier' : 'Connexion'}
              </button>

              <div className="flex items-center justify-between pt-1 text-sm text-[#7b786f]">
                <span>Securise par token et 2FA</span>
                {requires2FA ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setOtpCode('');
                      setError(null);
                    }}
                    className="font-medium text-[#171717] transition hover:text-black"
                  >
                    Retour
                  </button>
                ) : (
                  <span>Equipe BO</span>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
