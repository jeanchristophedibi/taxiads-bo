'use client';

import { useAnnouncementsQuery } from '../hooks/use-announcements-query';
import { useToggleAnnouncementMutation } from '../hooks/use-announcement-mutations';
import { AnnouncementActionsMenu } from './announcement-actions-menu';
import type { Announcement } from '../../domain/entities/announcement';
import { useToast } from '@/shared/ui/toast-provider';

interface Props {
  search?: string;
  page: number;
  onPageChange: (page: number) => void;
}

const fmtDatetime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC',
  });

function ToggleSwitch({ announcement }: { announcement: Announcement }) {
  const toast = useToast();
  const toggleMutation = useToggleAnnouncementMutation();
  const active = announcement.isActiveNow;

  const handleToggle = () => {
    toggleMutation.mutate({ id: announcement.id, activate: !active }, {
      onSuccess: () => toast.success(active ? 'Annonce désactivée' : 'Annonce activée'),
      onError: (err) => toast.error('Erreur', (err as Error).message),
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={toggleMutation.isPending}
      title={active ? 'Désactiver' : 'Activer'}
      className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${active ? 'translate-x-4' : 'translate-x-0'}`} />
      </span>
      <span className={`text-xs font-medium ${active ? 'text-emerald-700' : 'text-slate-400'}`}>
        {toggleMutation.isPending ? '…' : active ? 'Actif' : 'Inactif'}
      </span>
    </button>
  );
}

export function AnnouncementsTable({ search, page, onPageChange }: Props) {
  const { data, isLoading, isError } = useAnnouncementsQuery({ search, page });

  if (isError) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-red-500">Impossible de charger les annonces.</p>
      </div>
    );
  }

  const announcements = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="tbl-head">
            <th className="text-left px-5 py-3">Titre</th>
            <th className="text-left px-5 py-3">Contenu</th>
            <th className="text-left px-5 py-3 whitespace-nowrap">Période</th>
            <th className="text-left px-5 py-3">Statut</th>
            <th className="text-left px-5 py-3 whitespace-nowrap">Créé le</th>
            <th className="px-3 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="tbl-body">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-3"><div className="skeleton h-3.5 w-40 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-3 w-60 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-3 w-44 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-5 w-24 rounded" /></td>
                  <td className="px-5 py-3"><div className="skeleton h-3 w-24 rounded" /></td>
                  <td className="px-3 py-3" />
                </tr>
              ))
            : announcements.length === 0
            ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="w-10 h-10 rounded-apple bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 11l19-9-9 19-2-8-8-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Aucune annonce trouvée</p>
                    <p className="text-xs text-slate-400 mt-1">Créez votre première annonce.</p>
                  </td>
                </tr>
              )
            : announcements.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-900">{a.title}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-slate-500 truncate max-w-xs">{a.content}</p>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-xs text-slate-500">
                    <span>{fmtDatetime(a.startsAt)}</span>
                    <span className="mx-1.5 text-slate-300">→</span>
                    <span>{fmtDatetime(a.endsAt)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <ToggleSwitch announcement={a} />
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 py-3">
                    <AnnouncementActionsMenu announcement={a} />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--apple-separator)', background: 'rgba(249,249,251,0.7)' }}>
          <p className="text-xs" style={{ color: 'var(--apple-label)' }}>
            {meta.total} annonce{meta.total > 1 ? 's' : ''} · page {meta.currentPage}/{meta.lastPage}
          </p>
          <div className="flex gap-1">
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="btn-secondary disabled:opacity-40">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Précédent
            </button>
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= meta.lastPage} className="btn-secondary disabled:opacity-40">
              Suivant
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
