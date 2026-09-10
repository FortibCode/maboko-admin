'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { BarreOutils } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Cellule, Tableau } from '@/components/Tableau';
import { Pagination as PaginationComp, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date } from '@/lib/format';
import type { Pagination } from '@/lib/types';

export interface AuditLogItem {
  id: number;
  action: string;
  auteur: string;
  auteurEmail?: string;
  cibleType?: string;
  cibleId?: number;
  avant?: Record<string, unknown>;
  apres?: Record<string, unknown>;
  adresseIp?: string;
  createdAt: string;
}

const PAR_PAGE = 5;

export default function PageAuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>();
  const [recherche, setRecherche] = useState('');
  const [erreur, setErreur] = useState<string>();
  const [page, setPage] = useState(1);

  const charger = useCallback(async () => {
    setErreur(undefined);

    try {
      const reponse = await api.get<Pagination<AuditLogItem>>('/admin/audit-logs', {
        q: recherche || undefined,
      });
      setLogs(reponse.data);
      setPage(1);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement des logs d’audit impossible.');
    }
  }, [recherche]);

  useEffect(() => {
    const minuterie = setTimeout(charger, recherche ? 350 : 0);
    return () => clearTimeout(minuterie);
  }, [charger, recherche]);

  return (
    <Coquille titre="Logs d’Audit & Sécurité" description="Historique traçable de toutes les actions administratives sensibles">
      <BarreOutils>
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Filtrer par action (ex: compte.suspendu, metier.cree)…"
          className="champ max-w-md"
        />
      </BarreOutils>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={charger} />
      ) : !logs ? (
        <Chargement />
      ) : logs.length === 0 ? (
        <EtatVide titre="Aucun log d'audit" message="Aucune action enregistrée pour le moment." />
      ) : (
        <div className="space-y-4">
          <Tableau entetes={['Action', 'Administrateur', 'Adresse IP', 'Modifications', 'Date']}>
            {paginer(logs, page, PAR_PAGE).map((log) => (
              <tr key={log.id} className="tableau-tr">
                <Cellule>
                  <span className="font-mono text-xs font-bold text-maboko-secondaire bg-orange-50 px-2 py-0.5 rounded">{log.action}</span>
                  {log.cibleType && (
                    <p className="text-[11px] text-maboko-texte mt-0.5">
                      Cible: {log.cibleType} #{log.cibleId}
                    </p>
                  )}
                </Cellule>

                <Cellule>
                  <p className="font-semibold text-xs text-maboko-principale">{log.auteur}</p>
                  {log.auteurEmail && <p className="text-[11px] text-maboko-texte">{log.auteurEmail}</p>}
                </Cellule>

                <Cellule className="font-mono text-xs text-maboko-texte">{log.adresseIp || '—'}</Cellule>

                <Cellule className="max-w-xs text-xs text-maboko-texte truncate font-mono">
                  {log.apres ? JSON.stringify(log.apres) : '—'}
                </Cellule>

                <Cellule className="text-xs text-maboko-texte tabular-nums">
                  {date(log.createdAt, true)}
                </Cellule>
              </tr>
            ))}
          </Tableau>

          <PaginationComp page={page} total={logs.length} perPage={PAR_PAGE} onChanger={setPage} />
        </div>
      )}
    </Coquille>
  );
}
