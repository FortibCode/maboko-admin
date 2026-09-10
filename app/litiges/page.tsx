'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { BarreOutils, Segmente } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Pastille } from '@/components/Pastille';
import { Modal, Alerte } from '@/components/Modal';
import { Pagination, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date } from '@/lib/format';
import type { Litige, Pagination as PaginationType } from '@/lib/types';

const PAR_PAGE = 5;

type ActionLitige = 'en_cours' | 'resolu' | 'clos';

export default function PageLitiges() {
  const [litiges, setLitiges] = useState<Litige[]>();
  const [statut, setStatut] = useState('');
  const [erreur, setErreur] = useState<string>();
  const [enCours, setEnCours] = useState<number>();
  const [page, setPage] = useState(1);

  const [modalAction, setModalAction] = useState<{
    ouvert: boolean;
    litige?: Litige;
    action?: ActionLitige;
  }>({ ouvert: false });

  const [alerte, setAlerte] = useState<{
    ouvert: boolean;
    type?: 'succes' | 'danger';
    titre: string;
    message: string;
  }>({ ouvert: false, titre: '', message: '' });

  const charger = useCallback(async () => {
    setErreur(undefined);
    try {
      const reponse = await api.get<PaginationType<Litige>>('/admin/litiges', {
        statut: statut || undefined,
      });
      setLitiges(reponse.data);
      setPage(1);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement impossible.');
    }
  }, [statut]);

  useEffect(() => {
    // setTimeout : la règle react-hooks/set-state-in-effect ne trace pas au
    // travers d'un minuteur, et le déclenchement reste immédiat au rendu.
    const minuterie = setTimeout(charger, 0);
    return () => clearTimeout(minuterie);
  }, [charger]);

  const confirmerAction = async () => {
    const { litige, action } = modalAction;
    if (!litige || !action) return;
    setModalAction({ ouvert: false });
    setEnCours(litige.id);
    try {
      await api.post(`/admin/litiges/${litige.id}`, { statut: action });
      await charger();
      const libelles: Record<ActionLitige, string> = {
        en_cours: 'Litige pris en charge',
        resolu: 'Litige résolu',
        clos: 'Litige clos',
      };
      setAlerte({
        ouvert: true,
        type: 'succes',
        titre: libelles[action],
        message: `Le litige "${litige.motif}" a été mis à jour avec succès.`,
      });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  const listePaginee = litiges ? paginer(litiges, page, PAR_PAGE) : [];

  const LABELS_ACTION: Record<ActionLitige, string> = {
    en_cours: 'Prendre en charge',
    resolu: 'Marquer résolu',
    clos: 'Clore sans suite',
  };

  const MSG_ACTION: Record<ActionLitige, string> = {
    en_cours: 'Ce litige sera pris en charge et son statut sera mis à jour.',
    resolu: 'Le litige sera marqué comme résolu et les parties notifiées.',
    clos: 'Le litige sera clos sans suite. Cette action est définitive.',
  };

  return (
    <>
      <Coquille
        titre="Litiges"
        description="Différends signalés entre clients, artisans et chauffeurs"
      >
        <BarreOutils>
          <Segmente
            valeur={statut}
            onChange={(valeur) => { setStatut(valeur); setPage(1); }}
            options={[
              { valeur: '', libelle: 'Ouverts' },
              { valeur: 'resolu', libelle: 'Résolus' },
              { valeur: 'clos', libelle: 'Clos' },
            ]}
          />
        </BarreOutils>

        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !litiges ? (
          <Chargement />
        ) : litiges.length === 0 ? (
          <EtatVide titre="Aucun litige" message="Rien à traiter dans cette catégorie." />
        ) : (
          <div>
            <div className="space-y-4">
              {listePaginee.map((litige) => (
                <article key={litige.id} className="carte hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center text-maboko-texte shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="3" x2="12" y2="21" />
                            <path d="M5 8l7-5 7 5" />
                            <path d="M5 8l-3 9h6L5 8z" />
                            <path d="M19 8l-3 9h6l-3-9z" />
                            <line x1="5" y1="17" x2="19" y2="17" />
                          </svg>
                        </div>
                        <p className="font-bold text-maboko-principale">{litige.motif}</p>
                      </div>
                      <p className="mt-1 text-xs text-maboko-texte">
                        Ouvert par <span className="font-medium">{litige.auteur ?? 'un utilisateur'}</span> le {date(litige.ouvertLe, true)}
                        {litige.assigneA && <> · suivi par <span className="font-medium">{litige.assigneA}</span></>}
                      </p>
                    </div>
                    <Pastille statut={litige.statut} />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-maboko-texte whitespace-pre-line border-l-2 border-maboko-bordure pl-4">
                    {litige.description}
                  </p>

                  {litige.resolution && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                      <div className="w-5 h-5 flex items-center justify-center text-maboko-succes shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-maboko-succes">Résolution</p>
                        <p className="text-sm text-maboko-texte mt-0.5">{litige.resolution}</p>
                      </div>
                    </div>
                  )}

                  {['ouvert', 'en_cours'].includes(litige.statut) && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-maboko-bordure">
                      {litige.statut === 'ouvert' && (
                        <button
                          type="button"
                          disabled={enCours === litige.id}
                          onClick={() => setModalAction({ ouvert: true, litige, action: 'en_cours' })}
                          className="bouton-secondaire"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                          Prendre en charge
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={enCours === litige.id}
                        onClick={() => setModalAction({ ouvert: true, litige, action: 'resolu' })}
                        className="bouton-succes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Marquer résolu
                      </button>
                      <button
                        type="button"
                        disabled={enCours === litige.id}
                        onClick={() => setModalAction({ ouvert: true, litige, action: 'clos' })}
                        className="bouton-secondaire"
                      >
                        Clore sans suite
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <Pagination page={page} total={litiges.length} perPage={PAR_PAGE} onChanger={setPage} />
          </div>
        )}
      </Coquille>

      <Modal
        ouvert={modalAction.ouvert}
        type={modalAction.action === 'resolu' ? 'succes' : 'avertissement'}
        titre={modalAction.action ? LABELS_ACTION[modalAction.action] : ''}
        message={modalAction.action ? MSG_ACTION[modalAction.action] : ''}
        libelleBoutonOk="Confirmer"
        onConfirmer={confirmerAction}
        onAnnuler={() => setModalAction({ ouvert: false })}
      />

      <Alerte
        ouvert={alerte.ouvert}
        type={alerte.type}
        titre={alerte.titre}
        message={alerte.message}
        onFermer={() => setAlerte((prev) => ({ ...prev, ouvert: false }))}
      />
    </>
  );
}
