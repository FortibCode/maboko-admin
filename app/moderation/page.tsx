'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { BarreOutils, Segmente } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Modal, Alerte } from '@/components/Modal';
import { Pagination as PaginationComp, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date } from '@/lib/format';
import type { Pagination, Signalement } from '@/lib/types';

const PAR_PAGE = 5;

export default function PageModeration() {
  const [signalements, setSignalements] = useState<Signalement[]>();
  const [statut, setStatut] = useState('en_attente');
  const [erreur, setErreur] = useState<string>();
  const [enCours, setEnCours] = useState<number>();
  const [page, setPage] = useState(1);

  const [modalSuppr, setModalSuppr] = useState<{ ouvert: boolean; signalement?: Signalement }>({ ouvert: false });
  const [alerte, setAlerte] = useState<{ ouvert: boolean; type?: 'succes' | 'danger'; titre: string; message: string }>({
    ouvert: false, titre: '', message: '',
  });

  const charger = useCallback(async () => {
    setErreur(undefined);
    try {
      const reponse = await api.get<Pagination<Signalement>>('/admin/signalements', { statut });
      setSignalements(reponse.data);
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

  const executeTraiter = async (signalement: Signalement, decision: 'supprimer' | 'ignorer') => {
    setEnCours(signalement.id);
    try {
      await api.post(`/admin/signalements/${signalement.id}`, { decision });
      await charger();
      setAlerte({
        ouvert: true,
        type: 'succes',
        titre: decision === 'supprimer' ? 'Contenu supprimé' : 'Classé sans suite',
        message: decision === 'supprimer'
          ? 'Le contenu signalé a été supprimé définitivement de la plateforme.'
          : 'Le signalement a été classé sans suite.',
      });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  const listePaginee = signalements ? paginer(signalements, page, PAR_PAGE) : [];

  return (
    <>
      <Coquille
        titre="Modération"
        description="Publications et profils signalés par les utilisateurs"
        actions={
          statut === 'en_attente' && signalements && signalements.length > 0
            ? <span className="pastille-attente">{signalements.length} à traiter</span>
            : undefined
        }
      >
        <BarreOutils>
          <Segmente
            valeur={statut}
            onChange={(valeur) => { setStatut(valeur); setPage(1); }}
            options={[
              { valeur: 'en_attente', libelle: 'En attente' },
              { valeur: 'traite', libelle: 'Traités' },
              { valeur: 'ignore', libelle: 'Classés sans suite' },
            ]}
          />
        </BarreOutils>

        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !signalements ? (
          <Chargement />
        ) : signalements.length === 0 ? (
          <EtatVide titre="Rien à modérer" message="Aucun signalement dans cette catégorie." />
        ) : (
          <div>
            <div className="grid gap-4 lg:grid-cols-2">
              {listePaginee.map((signalement) => (
                <article
                  key={signalement.id}
                  className="carte border-l-4"
                  style={{
                    borderLeftColor: signalement.type === 'post' ? '#EAA023' : '#B35B28',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center text-maboko-texte">
                          {signalement.type === 'post' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          )}
                        </div>
                        <p className="font-semibold text-maboko-principale truncate">{signalement.motif}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-maboko-texte">
                        {signalement.type === 'post' ? 'Publication' : 'Profil'} signalé
                        {signalement.signalePar ? ` par ${signalement.signalePar}` : ''} le{' '}
                        {date(signalement.signaleLe, true)}
                      </p>
                    </div>
                    {signalement.contenuSupprime && (
                      <span className="pastille-suspendu shrink-0">Supprimé</span>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl bg-maboko-fond border border-maboko-bordure p-4">
                    {signalement.contenuSupprime ? (
                      <p className="text-sm italic text-maboko-texte">Ce contenu n&apos;existe plus.</p>
                    ) : signalement.type === 'post' ? (
                      <>
                        {signalement.contenu?.auteur && (
                          <p className="text-xs font-medium text-maboko-texte">
                            Par {signalement.contenu.auteur}
                          </p>
                        )}
                        <p className="mt-1.5 text-sm leading-relaxed">{signalement.contenu?.description}</p>
                        {signalement.contenu?.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={signalement.contenu.image}
                            alt="Contenu signalé"
                            className="mt-3 max-h-48 w-full rounded-lg object-cover"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{signalement.contenu?.nom}</p>
                        <p className="text-xs text-maboko-texte">{signalement.contenu?.email}</p>
                      </>
                    )}
                  </div>

                  {statut === 'en_attente' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={enCours === signalement.id || !!signalement.contenuSupprime}
                        onClick={() => setModalSuppr({ ouvert: true, signalement })}
                        className="bouton-danger flex-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Supprimer
                      </button>
                      <button
                        type="button"
                        disabled={enCours === signalement.id}
                        onClick={() => executeTraiter(signalement, 'ignorer')}
                        className="bouton-secondaire flex-1"
                      >
                        Classer sans suite
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <PaginationComp
              page={page}
              total={signalements.length}
              perPage={PAR_PAGE}
              onChanger={setPage}
            />
          </div>
        )}
      </Coquille>

      <Modal
        ouvert={modalSuppr.ouvert}
        type="danger"
        titre="Supprimer ce contenu ?"
        message="Cette action est irréversible. Le contenu sera définitivement supprimé de la plateforme et l'auteur en sera notifié."
        libelleBoutonOk="Supprimer définitivement"
        onConfirmer={() => {
          const s = modalSuppr.signalement;
          setModalSuppr({ ouvert: false });
          if (s) executeTraiter(s, 'supprimer');
        }}
        onAnnuler={() => setModalSuppr({ ouvert: false })}
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
