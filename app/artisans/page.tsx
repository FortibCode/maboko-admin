'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { BarreOutils } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Modal, Alerte } from '@/components/Modal';
import { Pagination, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date } from '@/lib/format';
import type { ArtisanAdmin, Pagination as PaginationType } from '@/lib/types';

const PAR_PAGE = 5;

const STATUT_CLASSES: Record<string, string> = {
  en_attente: 'pastille-attente',
  valide: 'pastille-actif',
  rejete: 'pastille-suspendu',
};

const STATUT_LIBELLES: Record<string, string> = {
  en_attente: 'En attente',
  valide: 'Validé',
  rejete: 'Refusé',
};

export default function PageArtisans() {
  const [artisans, setArtisans] = useState<ArtisanAdmin[]>();
  const [statut, setStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [erreur, setErreur] = useState<string>();
  const [enCours, setEnCours] = useState<number>();
  const [page, setPage] = useState(1);

  /* États des modales */
  const [modalValidation, setModalValidation] = useState<{
    ouvert: boolean;
    artisan?: ArtisanAdmin;
    decision?: 'valide' | 'rejete';
    motif?: string;
  }>({ ouvert: false });

  const [modalSuspension, setModalSuspension] = useState<{
    ouvert: boolean;
    artisan?: ArtisanAdmin;
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
      const reponse = await api.get<PaginationType<ArtisanAdmin>>('/admin/artisans', {
        statut: statut || undefined,
        q: recherche || undefined,
      });
      setArtisans(reponse.data);
      setPage(1);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement impossible.');
    }
  }, [statut, recherche]);

  useEffect(() => {
    const minuterie = setTimeout(charger, recherche ? 350 : 0);
    return () => clearTimeout(minuterie);
  }, [charger, recherche]);

  /* ── Valider / Refuser ── */
  const confirmerValidation = async () => {
    const { artisan, decision, motif } = modalValidation;
    if (!artisan || !decision) return;
    setModalValidation({ ouvert: false });
    setEnCours(artisan.id);
    try {
      await api.post(`/admin/artisans/${artisan.id}/validation`, { decision, motif });
      await charger();
      setAlerte({
        ouvert: true,
        type: 'succes',
        titre: decision === 'valide' ? 'Artisan validé' : 'Artisan refusé',
        message:
          decision === 'valide'
            ? `Le profil de ${artisan.nomComplet} a été validé. Il peut maintenant accéder à la plateforme.`
            : `Le profil de ${artisan.nomComplet} a été refusé.${motif ? ` Motif : ${motif}` : ''}`,
      });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  /* ── Suspendre / Réactiver ── */
  const confirmerSuspension = async () => {
    const { artisan } = modalSuspension;
    if (!artisan) return;
    const suspendre = !artisan.compteSuspendu;
    setModalSuspension({ ouvert: false });
    setEnCours(artisan.id);
    try {
      await api.post(`/admin/utilisateurs/${artisan.utilisateurId}/suspension`, { suspendre });
      await charger();
      setAlerte({
        ouvert: true,
        type: 'succes',
        titre: suspendre ? 'Compte suspendu' : 'Compte réactivé',
        message: suspendre
          ? `Le compte de ${artisan.nomComplet} a été suspendu.`
          : `Le compte de ${artisan.nomComplet} a été réactivé.`,
      });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  const listePaginee = artisans ? paginer(artisans, page, PAR_PAGE) : [];
  const enAttente = artisans?.filter((a) => a.statutValidation === 'en_attente').length ?? 0;

  return (
    <>
      <Coquille
        titre="Artisans"
        description="Validation des inscriptions et gestion des profils"
        actions={
          enAttente > 0 ? (
            <span className="pastille-attente">
              {enAttente} en attente de validation
            </span>
          ) : undefined
        }
      >
        {/* Filtres */}
        <BarreOutils>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-maboko-texte">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par nom, e-mail ou métier…"
              className="champ pl-10"
            />
          </div>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} className="champ-select w-[200px]">
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="valide">Validés</option>
            <option value="rejete">Refusés</option>
          </select>
        </BarreOutils>

        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !artisans ? (
          <Chargement />
        ) : artisans.length === 0 ? (
          <EtatVide titre="Aucun artisan" message="Aucun profil ne correspond à ces critères." />
        ) : (
          <div>
            <div className="tableau-conteneur overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="tableau-entete">
                  <tr>
                    <th className="tableau-th">Artisan</th>
                    <th className="tableau-th">Métier(s)</th>
                    <th className="tableau-th">Statut</th>
                    <th className="tableau-th">Activité</th>
                    <th className="tableau-th">Formule</th>
                    <th className="tableau-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listePaginee.map((artisan) => (
                    <tr key={artisan.id} className="tableau-tr">
                      {/* Artisan */}
                      <td className="tableau-td">
                        <div className="flex items-center gap-3.5">
                          <div className="avatar h-11 w-11 text-[13px]">
                            {artisan.nomComplet.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="cellule-titre truncate">{artisan.nomComplet}</p>
                            <p className="cellule-sous truncate">{artisan.email}</p>
                            <p className="cellule-meta">{artisan.telephone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Métier */}
                      <td className="tableau-td">
                        <p className="cellule-titre">{artisan.metiers?.join(', ') || artisan.specialite}</p>
                        {artisan.badges && artisan.badges.length > 0 && (
                          <p className="cellule-meta mt-1.5">{artisan.badges.join(' · ')}</p>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="tableau-td">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={STATUT_CLASSES[artisan.statutValidation] ?? 'pastille-neutre'}>
                            {STATUT_LIBELLES[artisan.statutValidation] ?? artisan.statutValidation}
                          </span>
                          {artisan.compteSuspendu && (
                            <span className="pastille-suspendu">Suspendu</span>
                          )}
                        </div>
                      </td>

                      {/* Activité */}
                      <td className="tableau-td">
                        <div className="space-y-1">
                          <p className="cellule-titre tabular-nums">
                            {artisan.nbMissionsTerminees} mission{artisan.nbMissionsTerminees !== 1 ? 's' : ''}
                          </p>
                          <p className="cellule-sous">
                            {artisan.nbAvis > 0
                              ? `${artisan.noteMoyenne.toFixed(1)} / 5 (${artisan.nbAvis} avis)`
                              : 'Aucun avis'}
                          </p>
                          <p className="cellule-meta">{date(artisan.derniereConnexion)}</p>
                        </div>
                      </td>

                      {/* Formule */}
                      <td className="tableau-td">
                        <span className="pastille-neutre">{artisan.plan || '—'}</span>
                      </td>

                      {/* Actions */}
                      <td className="tableau-td">
                        <div className="flex items-center justify-end gap-2">
                          {artisan.statutValidation === 'en_attente' && (
                            <>
                              {/* Valider */}
                              <button
                                type="button"
                                title="Valider l'artisan"
                                disabled={enCours === artisan.id}
                                onClick={() => setModalValidation({ ouvert: true, artisan, decision: 'valide' })}
                                className="bouton-icon-succes"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>

                              {/* Refuser */}
                              <button
                                type="button"
                                title="Refuser l'artisan"
                                disabled={enCours === artisan.id}
                                onClick={() => setModalValidation({ ouvert: true, artisan, decision: 'rejete' })}
                                className="bouton-icon-danger"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </>
                          )}

                          {/* Suspendre / Réactiver */}
                          {artisan.compteSuspendu ? (
                            <button
                              type="button"
                              title="Réactiver le compte"
                              disabled={enCours === artisan.id}
                              onClick={() => setModalSuspension({ ouvert: true, artisan })}
                              className="bouton-icon-succes"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 3l14 9-14 9V3z" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Suspendre le compte"
                              disabled={enCours === artisan.id}
                              onClick={() => setModalSuspension({ ouvert: true, artisan })}
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

            <Pagination page={page} total={artisans.length} perPage={PAR_PAGE} onChanger={setPage} />
          </div>
        )}
      </Coquille>

      {/* ── Modal validation ── */}
      <Modal
        ouvert={modalValidation.ouvert}
        type={modalValidation.decision === 'valide' ? 'succes' : 'danger'}
        titre={modalValidation.decision === 'valide' ? 'Valider cet artisan ?' : 'Refuser cet artisan ?'}
        message={
          modalValidation.decision === 'valide'
            ? `Le profil de ${modalValidation.artisan?.nomComplet} sera validé et activé sur la plateforme.`
            : `Le profil de ${modalValidation.artisan?.nomComplet} sera refusé et l'artisan en sera notifié.`
        }
        libelleBoutonOk={modalValidation.decision === 'valide' ? 'Valider' : 'Refuser'}
        onConfirmer={confirmerValidation}
        onAnnuler={() => setModalValidation({ ouvert: false })}
      />

      {/* ── Modal suspension ── */}
      <Modal
        ouvert={modalSuspension.ouvert}
        type={modalSuspension.artisan?.compteSuspendu ? 'succes' : 'danger'}
        titre={modalSuspension.artisan?.compteSuspendu ? 'Réactiver ce compte ?' : 'Suspendre ce compte ?'}
        message={
          modalSuspension.artisan?.compteSuspendu
            ? `Le compte de ${modalSuspension.artisan?.nomComplet} sera réactivé.`
            : `Le compte de ${modalSuspension.artisan?.nomComplet} sera suspendu. Ses sessions seront fermées immédiatement.`
        }
        libelleBoutonOk={modalSuspension.artisan?.compteSuspendu ? 'Réactiver' : 'Suspendre'}
        onConfirmer={confirmerSuspension}
        onAnnuler={() => setModalSuspension({ ouvert: false })}
      />

      {/* Alerte résultat */}
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
