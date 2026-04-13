'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { useToast } from '@/shared/ui/toast-provider';
import { updateAuthUserCookie } from '@/shared/application/auth-context';

type ProfileData = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  two_factor: {
    enabled: boolean;
    pending: boolean;
    recovery_codes_count: number;
  };
};

type EnableTwoFaData = {
  pending: boolean;
  secret: string;
  otpauth_uri: string;
};

const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const setAuthUserCookie = (name: string, email: string, avatar_url?: string | null) => {
  updateAuthUserCookie({ name, email, avatar_url: avatar_url ?? null });
};

export function ProfileSettingsPanel({ showTitle = true, sectionFilter = '' }: { showTitle?: boolean; sectionFilter?: string }) {
  const toast = useToast();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [enablePassword, setEnablePassword] = useState('');
  const [pendingSetup, setPendingSetup] = useState<EnableTwoFaData | null>(null);
  const [verifyOtp, setVerifyOtp] = useState('');
  const [disableForm, setDisableForm] = useState({ current_password: '', otp_code: '' });
  const [recoveryForm, setRecoveryForm] = useState({ current_password: '', otp_code: '' });
  const [freshRecoveryCodes, setFreshRecoveryCodes] = useState<string[]>([]);
  const normalizedFilter = sectionFilter.trim().toLowerCase();

  const isSectionVisible = (label: string): boolean => {
    if (!normalizedFilter) return true;
    return label.toLowerCase().includes(normalizedFilter);
  };

  const initials = useMemo(() => {
    const name = profileForm.name || '';
    return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
  }, [profileForm.name]);

  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(null); return; }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const headers = useMemo(() => {
    const token = getAuthToken();
    return {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const loadProfile = async () => {
    if (!apiBase) return;
    setLoading(true);
    setLoadError(false);

    try {
      const res = await fetch(`${apiBase}/profile`, { headers, cache: 'no-store' });
      if (!res.ok) throw new Error('Impossible de charger le profil');
      const json = (await res.json()) as { data: ProfileData };
      setProfile(json.data);
      setProfileForm({ name: json.data.name, email: json.data.email });
    } catch (error) {
      setLoadError(true);
      toast.error('Profil', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!apiBase) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    fetch(`${apiBase}/profile`, { headers, cache: 'no-store' })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) throw new Error('Impossible de charger le profil');
        const json = (await res.json()) as { data: ProfileData };
        if (cancelled) return;
        setProfile(json.data);
        setProfileForm({ name: json.data.name, email: json.data.email });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!apiBase) {
    return <div className="text-sm text-red-500">Missing NEXT_PUBLIC_API_BASE_URL</div>;
  }

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/profile`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error('Échec de mise à jour du profil');
      const json = (await res.json()) as { data: ProfileData };
      setProfile(json.data);
      setAuthUserCookie(json.data.name, json.data.email, json.data.avatar_url);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur profil', (error as Error).message);
    }
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/profile/password`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      if (!res.ok) throw new Error('Échec de mise à jour du mot de passe');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Mot de passe mis à jour');
    } catch (error) {
      toast.error('Erreur mot de passe', (error as Error).message);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await fetch(`${apiBase}/profile/avatar`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error('Échec upload avatar');
      const json = (await res.json()) as { data: ProfileData };
      setProfile(json.data);
      setAuthUserCookie(json.data.name, json.data.email, json.data.avatar_url);
      setAvatarFile(null);
      toast.success('Avatar mis à jour');
    } catch (error) {
      toast.error('Erreur avatar', (error as Error).message);
    }
  };

  const deleteAvatar = async () => {
    try {
      const res = await fetch(`${apiBase}/profile/avatar`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Échec suppression avatar');
      const json = (await res.json()) as { data: ProfileData };
      setProfile(json.data);
      setAuthUserCookie(json.data.name, json.data.email, json.data.avatar_url);
      toast.success('Avatar supprimé');
    } catch (error) {
      toast.error('Erreur avatar', (error as Error).message);
    }
  };

  const startTwoFactorSetup = async () => {
    try {
      const res = await fetch(`${apiBase}/profile/2fa/enable`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: enablePassword }),
      });
      if (!res.ok) throw new Error('Impossible de démarrer 2FA');
      const json = (await res.json()) as { data: EnableTwoFaData };
      setPendingSetup(json.data);
      setEnablePassword('');
      toast.info('2FA', 'Secret généré. Vérifie maintenant avec ton application OTP.');
    } catch (error) {
      toast.error('Erreur 2FA', (error as Error).message);
    }
  };

  const verifyTwoFactor = async () => {
    try {
      const res = await fetch(`${apiBase}/profile/2fa/verify`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_code: verifyOtp }),
      });
      if (!res.ok) throw new Error('Code OTP invalide');
      const json = (await res.json()) as { data: { enabled: boolean; recovery_codes: string[]; user: ProfileData } };
      setFreshRecoveryCodes(json.data.recovery_codes);
      setProfile(json.data.user);
      setPendingSetup(null);
      setVerifyOtp('');
      toast.success('2FA activée');
    } catch (error) {
      toast.error('Erreur 2FA', (error as Error).message);
    }
  };

  const disableTwoFactor = async () => {
    try {
      const res = await fetch(`${apiBase}/profile/2fa/disable`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(disableForm),
      });
      if (!res.ok) throw new Error('Impossible de désactiver 2FA');
      const json = (await res.json()) as { data: { enabled: boolean; user: ProfileData } };
      setProfile(json.data.user);
      setDisableForm({ current_password: '', otp_code: '' });
      setFreshRecoveryCodes([]);
      toast.success('2FA désactivée');
    } catch (error) {
      toast.error('Erreur 2FA', (error as Error).message);
    }
  };

  const regenerateRecoveryCodes = async () => {
    try {
      const res = await fetch(`${apiBase}/profile/2fa/recovery-codes`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(recoveryForm),
      });
      if (!res.ok) throw new Error('Impossible de régénérer les recovery codes');
      const json = (await res.json()) as { data: { recovery_codes: string[] } };
      setFreshRecoveryCodes(json.data.recovery_codes);
      setRecoveryForm({ current_password: '', otp_code: '' });
      toast.success('Recovery codes régénérés');
      await loadProfile();
    } catch (error) {
      toast.error('Erreur recovery codes', (error as Error).message);
    }
  };

  return (
    <div className="space-y-5">
      {showTitle && <h1 className="text-xl font-semibold text-slate-900">Mon profil</h1>}

      {!profile && loading ? (
        <div className="text-sm text-slate-400">Chargement…</div>
      ) : !profile || loadError ? (
        <div className="text-sm text-red-500">Impossible de charger le profil. <button type="button" onClick={() => void loadProfile()} className="underline">Réessayer</button></div>
      ) : (
        <>
        {isSectionVisible('Avatar') && (
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="relative h-44 sm:h-52">
              {/* Avatar image fills the banner when available */}
              {(avatarPreview ?? profile.avatar_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview ?? profile.avatar_url!}
                  alt="couverture"
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500" />
              )}
              {/* Always-on subtle overlay for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/35 hover:bg-black/50 transition-colors px-2.5 py-1.5 text-[11px] text-white"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Modifier la photo
              </button>
            </div>

            <div className="relative px-5 pb-5 pt-14 sm:pt-16">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -top-12 sm:-top-14 left-5 h-24 w-24 sm:h-28 sm:w-28 rounded-full ring-4 ring-white overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Changer l'avatar"
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="aperçu" className="h-full w-full object-cover" />
                ) : profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-sky-600 to-cyan-500 text-white text-2xl font-semibold">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </button>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{profileForm.name || 'Utilisateur'}</h2>
                  <p className="text-sm text-slate-500">{profileForm.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {avatarFile ? `Fichier sélectionné: ${avatarFile.name}` : "Cliquez sur la photo pour changer l'avatar."}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50 transition-colors"
                  >
                    Choisir une image
                  </button>
                  <button
                    type="button"
                    onClick={uploadAvatar}
                    disabled={!avatarFile}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs disabled:opacity-40 hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); if (avatarInputRef.current) avatarInputRef.current.value = ''; }}
                      className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                  {profile.avatar_url && !avatarFile && (
                    <button
                      type="button"
                      onClick={deleteAvatar}
                      className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
          {isSectionVisible('Informations personnelles') && (
            <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Informations personnelles</h2>
              <form onSubmit={updateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nom</label>
                  <input value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Email</label>
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div className="md:col-span-2 text-right">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Enregistrer</button>
                </div>
              </form>
            </section>
          )}

          

          {isSectionVisible('Mot de passe') && (
            <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Mot de passe</h2>
              <form onSubmit={changePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Actuel</label>
                  <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nouveau</label>
                  <input type="password" value={passwordForm.password} onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Confirmation</label>
                  <input type="password" value={passwordForm.password_confirmation} onChange={(e) => setPasswordForm((f) => ({ ...f, password_confirmation: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div className="md:col-span-3 text-right">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Changer</button>
                </div>
              </form>
            </section>
          )}

          {isSectionVisible('Authentification 2FA') && (
            <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Authentification 2FA</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${profile.two_factor.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {profile.two_factor.enabled ? 'Activée' : 'Désactivée'}
                </span>
              </div>

              {profile.two_factor.enabled && (
                <p className="text-xs text-slate-500">Recovery codes restants : <span className="font-medium text-slate-700">{profile.two_factor.recovery_codes_count}</span></p>
              )}

              {/* ── Setup flow (just called /enable) ── */}
              {!profile.two_factor.enabled && pendingSetup && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600">Scannez ce QR code avec votre application OTP (Google Authenticator, Authy…)</p>
                  <div className="flex justify-center p-4 bg-white border border-slate-200 rounded-xl w-fit mx-auto">
                    <QRCode value={pendingSetup.otpauth_uri} size={160} />
                  </div>
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer hover:text-slate-700">Saisie manuelle du secret</summary>
                    <code className="block mt-1 font-mono break-all bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 select-all">{pendingSetup.secret}</code>
                  </details>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Code OTP (6 chiffres)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        value={verifyOtp}
                        onChange={(e) => setVerifyOtp(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm tracking-widest"
                      />
                    </div>
                    <button type="button" onClick={verifyTwoFactor} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs">Valider</button>
                  </div>
                </div>
              )}

              {/* ── Pending (page refreshed mid-setup) ── */}
              {!profile.two_factor.enabled && !pendingSetup && profile.two_factor.pending && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    Un setup 2FA est en cours. Entrez le code de votre application pour finaliser, ou relancez le setup.
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Code OTP (6 chiffres)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                        value={verifyOtp}
                        onChange={(e) => setVerifyOtp(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm tracking-widest"
                      />
                    </div>
                    <button type="button" onClick={verifyTwoFactor} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs">Valider</button>
                  </div>
                </div>
              )}

              {/* ── Activate form (not enabled, no pending) ── */}
              {!profile.two_factor.enabled && !profile.two_factor.pending && !pendingSetup && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Mot de passe actuel</label>
                    <input type="password" value={enablePassword} onChange={(e) => setEnablePassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <button type="button" onClick={startTwoFactorSetup} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs whitespace-nowrap">Activer la 2FA</button>
                </div>
              )}

              {/* ── Restart setup link when pending ── */}
              {!profile.two_factor.enabled && profile.two_factor.pending && !pendingSetup && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-slate-400 hover:text-slate-600">Relancer le setup (nouveau QR code)</summary>
                  <div className="flex items-end gap-2 mt-2">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Mot de passe actuel</label>
                      <input type="password" value={enablePassword} onChange={(e) => setEnablePassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    </div>
                    <button type="button" onClick={startTwoFactorSetup} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs whitespace-nowrap">Nouveau QR</button>
                  </div>
                </details>
              )}

              {/* ── Enabled: disable + regen recovery codes ── */}
              {profile.two_factor.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-slate-700">Désactiver la 2FA</p>
                    <input type="password" placeholder="Mot de passe actuel" value={disableForm.current_password} onChange={(e) => setDisableForm((f) => ({ ...f, current_password: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <input type="text" inputMode="numeric" placeholder="Code OTP" value={disableForm.otp_code} onChange={(e) => setDisableForm((f) => ({ ...f, otp_code: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm tracking-widest" />
                    <button type="button" onClick={disableTwoFactor} className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-xs">Désactiver</button>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-slate-700">Régénérer les recovery codes</p>
                    <input type="password" placeholder="Mot de passe actuel" value={recoveryForm.current_password} onChange={(e) => setRecoveryForm((f) => ({ ...f, current_password: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                    <input type="text" inputMode="numeric" placeholder="Code OTP" value={recoveryForm.otp_code} onChange={(e) => setRecoveryForm((f) => ({ ...f, otp_code: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm tracking-widest" />
                    <button type="button" onClick={regenerateRecoveryCodes} className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs">Régénérer</button>
                  </div>
                </div>
              )}

              {/* ── Fresh recovery codes (show once after verify or regen) ── */}
              {freshRecoveryCodes.length > 0 && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-amber-900 font-medium">Recovery codes — sauvegardez-les maintenant, ils ne seront plus affichés.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {freshRecoveryCodes.map((code) => (
                      <code key={code} className="text-xs text-amber-900 bg-white border border-amber-200 rounded px-2 py-1 font-mono select-all">{code}</code>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const text = freshRecoveryCodes.join('\n');
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'taxiads-recovery-codes.txt'; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="text-xs text-amber-700 underline hover:text-amber-900"
                  >
                    Télécharger (.txt)
                  </button>
                </div>
              )}
            </section>
          )}

          {normalizedFilter && !isSectionVisible('Informations personnelles') && !isSectionVisible('Avatar') && !isSectionVisible('Mot de passe') && !isSectionVisible('Authentification 2FA') && (
            <div className="text-sm text-slate-500">Aucune section ne correspond au filtre.</div>
          )}
        </>
      )}
    </div>
  );
}
