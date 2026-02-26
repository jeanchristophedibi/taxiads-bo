'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/shared/ui/toast-provider';

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

const setAuthUserCookie = (name: string, email: string) => {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `auth_user=${encodeURIComponent(JSON.stringify({ name, email }))}; path=/; max-age=${maxAge}; samesite=lax`;
  window.dispatchEvent(new Event('auth-user-updated'));
};

export function ProfileSettingsPanel({ showTitle = true }: { showTitle?: boolean }) {
  const toast = useToast();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [enablePassword, setEnablePassword] = useState('');
  const [pendingSetup, setPendingSetup] = useState<EnableTwoFaData | null>(null);
  const [verifyOtp, setVerifyOtp] = useState('');
  const [disableForm, setDisableForm] = useState({ current_password: '', otp_code: '' });
  const [recoveryForm, setRecoveryForm] = useState({ current_password: '', otp_code: '' });
  const [freshRecoveryCodes, setFreshRecoveryCodes] = useState<string[]>([]);

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

    try {
      const res = await fetch(`${apiBase}/profile`, { headers, cache: 'no-store' });
      if (!res.ok) throw new Error('Impossible de charger le profil');
      const json = (await res.json()) as { data: ProfileData };
      setProfile(json.data);
      setProfileForm({ name: json.data.name, email: json.data.email });
    } catch (error) {
      toast.error('Profil', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!apiBase) {
    return <div className="text-sm text-red-500">Missing NEXT_PUBLIC_API_BASE_URL</div>;
  }

  const updateProfile = async (e: React.FormEvent) => {
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
      setAuthUserCookie(json.data.name, json.data.email);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur profil', (error as Error).message);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
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

      {loading || !profile ? (
        <div className="text-sm text-slate-400">Chargement…</div>
      ) : (
        <>
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

          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Avatar</h2>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">Aucun</div>
                )}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} className="text-xs" />
                <button type="button" onClick={uploadAvatar} disabled={!avatarFile} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs disabled:opacity-50">Uploader</button>
                <button type="button" onClick={deleteAvatar} className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-xs">Supprimer</button>
              </div>
            </div>
          </section>

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

          <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Authentification 2FA</h2>
            <p className="text-xs text-slate-500">
              Statut: <span className={profile.two_factor.enabled ? 'text-emerald-600 font-medium' : 'text-slate-600 font-medium'}>{profile.two_factor.enabled ? 'activée' : 'désactivée'}</span>
              {' '}· Recovery codes: {profile.two_factor.recovery_codes_count}
            </p>

            {!profile.two_factor.enabled && (
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Mot de passe actuel (activer 2FA)</label>
                    <input type="password" value={enablePassword} onChange={(e) => setEnablePassword(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <button type="button" onClick={startTwoFactorSetup} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">Générer secret</button>
                </div>

                {pendingSetup && (
                  <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-slate-600">Secret: <span className="font-mono text-slate-900">{pendingSetup.secret}</span></p>
                    <p className="text-xs text-slate-600 break-all">URI: {pendingSetup.otpauth_uri}</p>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Code OTP pour confirmer</label>
                        <input value={verifyOtp} onChange={(e) => setVerifyOtp(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                      <button type="button" onClick={verifyTwoFactor} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs">Valider</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {profile.two_factor.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-slate-700">Désactiver 2FA</p>
                  <input type="password" placeholder="Mot de passe actuel" value={disableForm.current_password} onChange={(e) => setDisableForm((f) => ({ ...f, current_password: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input placeholder="Code OTP" value={disableForm.otp_code} onChange={(e) => setDisableForm((f) => ({ ...f, otp_code: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <button type="button" onClick={disableTwoFactor} className="px-3 py-2 border border-red-300 text-red-600 rounded-lg text-xs">Désactiver</button>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-slate-700">Régénérer recovery codes</p>
                  <input type="password" placeholder="Mot de passe actuel" value={recoveryForm.current_password} onChange={(e) => setRecoveryForm((f) => ({ ...f, current_password: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input placeholder="Code OTP" value={recoveryForm.otp_code} onChange={(e) => setRecoveryForm((f) => ({ ...f, otp_code: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                  <button type="button" onClick={regenerateRecoveryCodes} className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs">Régénérer</button>
                </div>
              </div>
            )}

            {freshRecoveryCodes.length > 0 && (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-amber-900 font-medium mb-1">Recovery codes (à sauvegarder)</p>
                <div className="grid grid-cols-2 gap-2">
                  {freshRecoveryCodes.map((code) => (
                    <code key={code} className="text-xs text-amber-900 bg-white border border-amber-200 rounded px-2 py-1">{code}</code>
                  ))}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
