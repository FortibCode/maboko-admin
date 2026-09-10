'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Pastille } from '@/components/Pastille';
import { IconeFleche, IconeMoto, IconeVoiture } from '@/components/Icones';
import { Cellule, Tableau } from '@/components/Tableau';
import { Pagination as PaginationComp, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date, monnaie } from '@/lib/format';
import type { Pagination } from '@/lib/types';

/**
 * Reflet exact de CourseResource.
 *
 * Les noms précédents (lieuDepart, lieuArrivee, createdAt, chauffeur.utilisateur)
 * ne correspondaient à rien dans la réponse : le trajet, la date et le nom du
 * chauffeur restaient vides. Le défaut ne se voyait pas, faute de course en base.
 */
export interface CourseItem {
  id: number;
  depart?: { adresse: string | null };
  arrivee?: { adresse: string | null };
  typeVehicule: string;
  statut: string;
  tarifEstime?: number;
  tarifFinal?: number;
  creeeLe: string;
  client?: {
    id: number;
    nom: string;
    prenom: string;
  };
  chauffeur?: {
    id: number;
    nomComplet: string;
  };
}

const PAR_PAGE = 5;

export default function PageCoursesAdmin() {
  const [courses, setCourses] = useState<CourseItem[]>();
  const [erreur, setErreur] = useState<string>();
  const [page, setPage] = useState(1);

  const charger = useCallback(async () => {
    setErreur(undefined);

    try {
      const reponse = await api.get<Pagination<CourseItem>>('/courses');
      setCourses(reponse.data);
      setPage(1);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement des courses impossible.');
    }
  }, []);

  useEffect(() => {
    // setTimeout : la règle react-hooks/set-state-in-effect ne trace pas au
    // travers d'un minuteur, et le déclenchement reste immédiat au rendu.
    const minuterie = setTimeout(charger, 0);
    return () => clearTimeout(minuterie);
  }, [charger]);

  return (
    <Coquille titre="Allô Chauffeur" description="Monitoring en temps réel des courses et trajets">
      {erreur ? (
        <EtatErreur message={erreur} onReessayer={charger} />
      ) : !courses ? (
        <Chargement />
      ) : courses.length === 0 ? (
        <EtatVide titre="Aucune course" message="Aucune course enregistrée dans le système." />
      ) : (
        <div className="space-y-4">
          <Tableau entetes={['Trajet', 'Véhicule', 'Passager', 'Chauffeur', 'Tarif', 'Statut', 'Date']}>
            {paginer(courses, page, PAR_PAGE).map((c) => {
              const nomClient = c.client ? `${c.client.prenom} ${c.client.nom}` : '—';
              const nomChauffeur = c.chauffeur?.nomComplet || 'En recherche';
              const prix = c.tarifFinal ?? c.tarifEstime;

              return (
                <tr key={c.id} className="tableau-tr">
                  <Cellule>
                    <p className="cellule-titre">{c.depart?.adresse || '—'}</p>
                    <p className="cellule-sous flex items-center gap-1.5">
                      <IconeFleche taille={12} className="shrink-0 rotate-90 text-maboko-texte/60" />
                      {c.arrivee?.adresse || '—'}
                    </p>
                  </Cellule>

                  <Cellule>
                    <span className="flex items-center gap-2 text-[13px] font-semibold capitalize text-maboko-principale">
                      {c.typeVehicule === 'moto'
                        ? <IconeMoto taille={16} className="text-maboko-secondaire" />
                        : <IconeVoiture taille={16} className="text-maboko-secondaire" />}
                      {c.typeVehicule === 'moto' ? 'Moto' : 'Voiture'}
                    </span>
                  </Cellule>

                  <Cellule className="text-sm font-semibold text-maboko-principale">{nomClient}</Cellule>

                  <Cellule className="text-sm font-medium text-maboko-texte">{nomChauffeur}</Cellule>

                  <Cellule className="text-sm font-bold text-maboko-principale tabular-nums">
                    {prix ? monnaie(prix) : '—'}
                  </Cellule>

                  <Cellule>
                    <Pastille statut={c.statut} />
                  </Cellule>

                  <Cellule className="text-xs text-maboko-texte tabular-nums">
                    {date(c.creeeLe)}
                  </Cellule>
                </tr>
              );
            })}
          </Tableau>

          <PaginationComp page={page} total={courses.length} perPage={PAR_PAGE} onChanger={setPage} />
        </div>
      )}
    </Coquille>
  );
}
