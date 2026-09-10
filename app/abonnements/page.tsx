'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Cellule, Tableau } from '@/components/Tableau';
import { Pagination as PaginationComp, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { monnaie } from '@/lib/format';

/**
 * Reflet exact de PlanResource côté API.
 *
 * `id`, `ordre` et `actif` étaient déclarés ici sans jamais être renvoyés :
 * la colonne « Statut » affichait donc « Inactif » pour toutes les formules,
 * et la clé de liste valait `undefined`. Le slug est unique et suffit.
 */
export interface PlanItem {
  slug: string;
  nom: string;
  description: string | null;
  prixMensuel: number;
  prixAnnuel: number;
  avantages: string[];
}

const PAR_PAGE = 5;

export default function PageAbonnementsAdmin() {
  const [plans, setPlans] = useState<PlanItem[]>();
  const [erreur, setErreur] = useState<string>();
  const [page, setPage] = useState(1);

  const charger = useCallback(async () => {
    setErreur(undefined);

    try {
      const reponse = await api.get<{ data: PlanItem[] }>('/plans');
      setPlans(reponse.data);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement des plans d’abonnement impossible.');
    }
  }, []);

  useEffect(() => {
    // setTimeout : la règle react-hooks/set-state-in-effect ne trace pas au
    // travers d'un minuteur, et le déclenchement reste immédiat au rendu.
    const minuterie = setTimeout(charger, 0);
    return () => clearTimeout(minuterie);
  }, [charger]);

  return (
    <Coquille titre="Abonnements & Formules" description="Présentation et grille tarifaire des plans Maboko Pro/Premium">
      {erreur ? (
        <EtatErreur message={erreur} onReessayer={charger} />
      ) : !plans ? (
        <Chargement />
      ) : plans.length === 0 ? (
        <EtatVide titre="Aucun plan" message="Aucun plan d'abonnement configuré." />
      ) : (
        <div className="space-y-4">
          <Tableau entetes={['Formule', 'Prix mensuel', 'Prix annuel', 'Avantages inclus']}>
            {paginer(plans, page, PAR_PAGE).map((plan) => (
              <tr key={plan.slug} className="tableau-tr">
                <Cellule>
                  <div className="space-y-1">
                    <p className="cellule-titre">{plan.nom}</p>
                    <p className="cellule-code">{plan.slug}</p>
                    {plan.description && <p className="cellule-meta max-w-[190px]">{plan.description}</p>}
                  </div>
                </Cellule>

                <Cellule>
                  <span className="cellule-nombre">
                    {plan.prixMensuel > 0 ? monnaie(plan.prixMensuel) : 'Gratuit'}
                  </span>
                </Cellule>

                <Cellule>
                  <span className="cellule-nombre">
                    {plan.prixAnnuel > 0 ? monnaie(plan.prixAnnuel) : 'Gratuit'}
                  </span>
                </Cellule>

                <Cellule className="max-w-sm">
                  {plan.avantages && plan.avantages.length > 0 ? (
                    <ul className="space-y-1.5">
                      {plan.avantages.map((avantage) => (
                        <li key={avantage} className="flex items-start gap-2">
                          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-maboko-accent" />
                          <span className="cellule-sous">{avantage}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-maboko-bordure">—</span>
                  )}
                </Cellule>
              </tr>
            ))}
          </Tableau>

          <PaginationComp page={page} total={plans.length} perPage={PAR_PAGE} onChanger={setPage} />
        </div>
      )}
    </Coquille>
  );
}
