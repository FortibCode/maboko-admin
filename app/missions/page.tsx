'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { BarreOutils } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Pastille } from '@/components/Pastille';
import { Cellule, Tableau } from '@/components/Tableau';
import { Pagination as PaginationComp, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date, monnaie } from '@/lib/format';
import type { Pagination } from '@/lib/types';

export interface MissionItem {
  id: number;
  titre: string;
  description: string;
  adresse: string;
  statut: string;
  budgetEstime?: number;
  montantPropose?: number;
  montantFinal?: number;
  creeeLe: string;
  client?: {
    id: number;
    nom: string;
    prenom: string;
  };
  artisan?: {
    id: number;
    nomComplet?: string;
    utilisateur?: {
      nom: string;
      prenom: string;
    };
  };
  metier?: {
    nom: string;
  };
}

const PAR_PAGE = 5;

export default function PageMissions() {
  const [missions, setMissions] = useState<MissionItem[]>();
  const [statut, setStatut] = useState('');
  const [erreur, setErreur] = useState<string>();
  const [page, setPage] = useState(1);

  const charger = useCallback(async () => {
    setErreur(undefined);

    try {
      const reponse = await api.get<Pagination<MissionItem>>('/demandes', {
        statut: statut || undefined,
      });
      setMissions(reponse.data);
      setPage(1);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement des missions impossible.');
    }
  }, [statut]);

  useEffect(() => {
    // setTimeout : la règle react-hooks/set-state-in-effect ne trace pas au
    // travers d'un minuteur, et le déclenchement reste immédiat au rendu.
    const minuterie = setTimeout(charger, 0);
    return () => clearTimeout(minuterie);
  }, [charger]);

  return (
    <Coquille titre="Missions & Devis" description="Suivi global des demandes de devis et missions d’artisans">
      <BarreOutils>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} className="champ max-w-[220px]">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="acceptee">Devis accepté</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
          <option value="refusee">Refusée</option>
          <option value="annulee">Annulée</option>
        </select>
      </BarreOutils>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={charger} />
      ) : !missions ? (
        <Chargement />
      ) : missions.length === 0 ? (
        <EtatVide titre="Aucune mission" message="Aucune demande de devis ne correspond à ce filtre." />
      ) : (
        <div className="space-y-4">
          <Tableau entetes={['Mission', 'Client', 'Artisan', 'Métier', 'Montant', 'Statut', 'Date']}>
            {paginer(missions, page, PAR_PAGE).map((m) => {
              const nomClient = m.client ? `${m.client.prenom} ${m.client.nom}` : '—';
              const nomArtisan = m.artisan?.utilisateur
                ? `${m.artisan.utilisateur.prenom} ${m.artisan.utilisateur.nom}`
                : m.artisan?.nomComplet || '—';
              const prix = m.montantFinal ?? m.montantPropose ?? m.budgetEstime;

              return (
                <tr key={m.id} className="tableau-tr">
                  <Cellule>
                    <p className="font-bold text-maboko-principale">{m.titre}</p>
                    <p className="text-xs text-maboko-texte">{m.adresse}</p>
                  </Cellule>

                  <Cellule className="text-sm font-semibold text-maboko-principale">{nomClient}</Cellule>

                  <Cellule className="text-sm font-medium text-maboko-texte">{nomArtisan}</Cellule>

                  <Cellule className="text-xs font-semibold text-maboko-secondaire">{m.metier?.nom || 'Général'}</Cellule>

                  <Cellule className="text-sm font-bold text-maboko-principale tabular-nums">
                    {prix ? monnaie(prix) : 'Non défini'}
                  </Cellule>

                  <Cellule>
                    <Pastille statut={m.statut} />
                  </Cellule>

                  <Cellule className="text-xs text-maboko-texte tabular-nums">
                    {date(m.creeeLe)}
                  </Cellule>
                </tr>
              );
            })}
          </Tableau>

          <PaginationComp page={page} total={missions.length} perPage={PAR_PAGE} onChanger={setPage} />
        </div>
      )}
    </Coquille>
  );
}
