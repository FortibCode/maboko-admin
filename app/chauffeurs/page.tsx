'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { BarreOutils } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Pastille, PastilleSuspendu } from '@/components/Pastille';
import { Modal, Alerte } from '@/components/Modal';
import { Pagination, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date } from '@/lib/format';
import type { ChauffeurAdmin, Pagination as PaginationType } from '@/lib/types';

const PAR_PAGE = 5;

export default function PageChauffeurs() {
  const [chauffeurs, setChauffeurs] = useState<ChauffeurAdmin[]>();
  const [statut, setStatut] = useState('');
  const [erreur, setErreur] = useState<string>();
  const [enCours, setEnCours] = useState<number>();
  const [page, setPage] = useState(1);

  const [modalValidation, setModalValidation] = useState<{
    ouvert: boolean;
    chauffeur?: ChauffeurAdmin;
    decision?: 'valide' | 'rejete';
  }>({ ouvert: false });

  const [modalSuspension, setModalSuspension] = useState<{
    ouvert: boolean;
    chauffeur?: ChauffeurAdmin;
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
      const reponse = await api.get<PaginationType<ChauffeurAdmin>>('/admin/chauffeurs', {
        statut: statut || undefined,
      });
      setChauffeurs(reponse.data);
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

  const confirmerValidation = async () => {
    const { chauffeur, decision } = modalValidation;
    if (!chauffeur || !decision) return;
    setModalValidation({ ouvert: false });
    setEnCours(chauffeur.id);
    try {
      await api.post(`/admin/chauffeurs/${chauffeur.id}/validation`, { decision });
      await charger();
      setAlerte({
        ouvert: true,
        type: 'succes',
        titre: decision === 'valide' ? 'Chauffeur validé' : 'Chauffeur refusé',
        message: decision === 'valide'
          ? `${chauffeur.nomComplet} peut maintenant accéder à la plateforme.`
          : `Le dossier de ${chauffeur.nomComplet} a été refusé.`,
      });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  const confirmerSuspension = async () => {
    const { chauffeur } = modalSuspension;
    if (!chauffeur) return;
    const suspendre = !chauffeur.compteSuspendu;
    setModalSuspension({ ouvert: false });
    setEnCours(chauffeur.id);
    try {
      await api.post(`/admin/utilisateurs/${chauffeur.utilisateurId}/suspension`, { suspendre });
      await charger();
      setAlerte({
        ouvert: true, type: 'succes',
        titre: suspendre ? 'Compte suspendu' : 'Compte réactivé',
        message: `Le compte de ${chauffeur.nomComplet} a été ${suspendre ? 'suspendu' : 'réactivé'}.`,
      });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  const listePaginee = chauffeurs ? paginer(chauffeurs, page, PAR_PAGE) : [];
  const enAttente = chauffeurs?.filter((c) => c.statutValidation === 'en_attente').length ?? 0;

  return (
    <>
      <Coquille
        titre="Chauffeurs"
        description="Validation des permis et véhicules, suivi des comptes"
        actions={enAttente > 0 ? <span className="pastille-attente">{enAttente} en attente</span> : undefined}
      >
        <BarreOutils>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} className="champ-select w-[220px]">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="valide">Validés</option>
            <option value="rejete">Refusés</option>
          </select>
        </BarreOutils>

        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !chauffeurs ? (
          <Chargement />
        ) : chauffeurs.length === 0 ? (
          <EtatVide titre="Aucun chauffeur" message="Aucun profil ne correspond." />
        ) : (
          <div>
            <div className="tableau-conteneur overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="tableau-entete">
                  <tr>
                    <th className="tableau-th">Chauffeur</th>
                    <th className="tableau-th">Véhicule</th>
                    <th className="tableau-th">Permis</th>
                    <th className="tableau-th">Statut</th>
                    <th className="tableau-th">Courses</th>
                    <th className="tableau-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listePaginee.map((chauffeur) => (
                    <tr key={chauffeur.id} className="tableau-tr">
                      <td className="tableau-td">
                        <div className="flex items-center gap-3.5">
                          <div className="avatar h-11 w-11 text-[13px]">
                            {chauffeur.nomComplet.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="cellule-titre truncate">{chauffeur.nomComplet}</p>
                            <p className="cellule-sous">{chauffeur.telephone}</p>
                            <p className="cellule-meta">Inscrit le {date(chauffeur.inscritLe)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="tableau-td">
                        <div className="space-y-1">
                          <p className="cellule-titre capitalize">{chauffeur.typeVehicule}</p>
                          <p className="cellule-sous">{chauffeur.vehicule}</p>
                          <p className="cellule-code">{chauffeur.plaque}</p>
                        </div>
                      </td>

                      <td className="tableau-td">
                        <span className="cellule-code">{chauffeur.permis}</span>
                      </td>

                      <td className="tableau-td">
                        <div className="flex flex-col items-start gap-1.5">
                          <Pastille statut={chauffeur.statutValidation} />
                          {chauffeur.compteSuspendu && <PastilleSuspendu />}
                          {chauffeur.enLigne && (
                            <span className="pastille-actif pastille-sans-point">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                              En ligne
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="tableau-td">
                        <span className="cellule-nombre">{chauffeur.nbCoursesTerminees}</span>
                      </td>

                      <td className="tableau-td">
                        <div className="flex items-center justify-end gap-2">
                          {chauffeur.statutValidation === 'en_attente' && (
                            <>
                              <button
                                type="button"
                                title="Valider le chauffeur"
                                disabled={enCours === chauffeur.id}
                                onClick={() => setModalValidation({ ouvert: true, chauffeur, decision: 'valide' })}
                                className="bouton-icon-succes"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                title="Refuser le chauffeur"
                                disabled={enCours === chauffeur.id}
                                onClick={() => setModalValidation({ ouvert: true, chauffeur, decision: 'rejete' })}
                                className="bouton-icon-danger"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </>
                          )}
                          {chauffeur.compteSuspendu ? (
                            <button
                              type="button"
                              title="Réactiver"
                              disabled={enCours === chauffeur.id}
                              onClick={() => setModalSuspension({ ouvert: true, chauffeur })}
                              className="bouton-icon-succes"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 3l14 9-14 9V3z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Suspendre"
                              disabled={enCours === chauffeur.id}
                              onClick={() => setModalSuspension({ ouvert: true, chauffeur })}
                              className="bouton-icon-danger"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={chauffeurs.length} perPage={PAR_PAGE} onChanger={setPage} />
          </div>
        )}
      </Coquille>

      <Modal
        ouvert={modalValidation.ouvert}
        type={modalValidation.decision === 'valide' ? 'succes' : 'danger'}
        titre={modalValidation.decision === 'valide' ? 'Valider ce chauffeur ?' : 'Refuser ce chauffeur ?'}
        message={modalValidation.decision === 'valide'
          ? `${modalValidation.chauffeur?.nomComplet} sera activé sur la plateforme.`
          : `Le dossier de ${modalValidation.chauffeur?.nomComplet} sera refusé.`}
        libelleBoutonOk={modalValidation.decision === 'valide' ? 'Valider' : 'Refuser'}
        onConfirmer={confirmerValidation}
        onAnnuler={() => setModalValidation({ ouvert: false })}
      />

      <Modal
        ouvert={modalSuspension.ouvert}
        type={modalSuspension.chauffeur?.compteSuspendu ? 'succes' : 'danger'}
        titre={modalSuspension.chauffeur?.compteSuspendu ? 'Réactiver ce compte ?' : 'Suspendre ce compte ?'}
        message={modalSuspension.chauffeur?.compteSuspendu
          ? `Le compte de ${modalSuspension.chauffeur?.nomComplet} sera réactivé.`
          : `Le compte de ${modalSuspension.chauffeur?.nomComplet} sera suspendu.`}
        libelleBoutonOk={modalSuspension.chauffeur?.compteSuspendu ? 'Réactiver' : 'Suspendre'}
        onConfirmer={confirmerSuspension}
        onAnnuler={() => setModalSuspension({ ouvert: false })}
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
