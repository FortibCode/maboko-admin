'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { BarreOutils } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Modal, Alerte } from '@/components/Modal';
import { Pagination, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date } from '@/lib/format';
import type { Pagination as PaginationType } from '@/lib/types';

const PAR_PAGE = 5;

export interface UserAdminItem {
  id: number;
  nom: string;
  prenom?: string;
  nomComplet: string;
  email: string;
  telephone: string;
  role: 'client' | 'artisan' | 'chauffeur' | 'admin' | 'super_admin';
  statut: 'actif' | 'suspendu';
  compteSuspendu: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  ville?: string;
  quartier?: string;
  derniereConnexion?: string;
  createdAt: string;
}

const LIBELLES_ROLE: Record<string, string> = {
  client: 'Client',
  artisan: 'Artisan',
  chauffeur: 'Chauffeur',
  admin: 'Administrateur',
  super_admin: 'Super Admin',
};

const COULEURS_ROLE: Record<string, string> = {
  client: 'pastille-info',
  artisan: 'pastille border-amber-200 bg-amber-50 text-amber-700',
  chauffeur: 'pastille border-purple-200 bg-purple-50 text-purple-700',
  admin: 'pastille border-rose-200 bg-rose-50 text-rose-700',
  super_admin: 'pastille border-maboko-secondaire/30 bg-maboko-secondaire/10 text-maboko-secondaire',
};

export default function PageUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState<UserAdminItem[]>();
  const [role, setRole] = useState('');
  const [statut, setStatut] = useState('');
  const [recherche, setRecherche] = useState('');
  const [erreur, setErreur] = useState<string>();
  const [page, setPage] = useState(1);

  /* Modal de confirmation suspension */
  const [modalSuspension, setModalSuspension] = useState<{ ouvert: boolean; utilisateur?: UserAdminItem }>({ ouvert: false });
  const [enCours, setEnCours] = useState<number>();

  /* Alerte résultat */
  const [alerte, setAlerte] = useState<{ ouvert: boolean; type?: 'succes' | 'danger'; titre: string; message: string }>({
    ouvert: false,
    titre: '',
    message: '',
  });

  const charger = useCallback(async () => {
    setErreur(undefined);
    try {
      const reponse = await api.get<PaginationType<UserAdminItem>>('/admin/utilisateurs', {
        role: role || undefined,
        statut: statut || undefined,
        q: recherche || undefined,
      });
      setUtilisateurs(reponse.data);
      setPage(1);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement de l\'annuaire impossible.');
    }
  }, [role, statut, recherche]);

  useEffect(() => {
    const minuterie = setTimeout(charger, recherche ? 350 : 0);
    return () => clearTimeout(minuterie);
  }, [charger, recherche]);

  /* ── Actions ── */
  const ouvrirModalSuspension = (u: UserAdminItem) => {
    setModalSuspension({ ouvert: true, utilisateur: u });
  };

  const confirmerSuspension = async () => {
    const u = modalSuspension.utilisateur;
    if (!u) return;

    const suspendre = !u.compteSuspendu;
    setModalSuspension({ ouvert: false });
    setEnCours(u.id);

    try {
      await api.post(`/admin/utilisateurs/${u.id}/suspension`, { suspendre });
      await charger();
      setAlerte({
        ouvert: true,
        type: 'succes',
        titre: suspendre ? 'Compte suspendu' : 'Compte réactivé',
        message: suspendre
          ? `Le compte de ${u.nomComplet} a été suspendu. Ses sessions ont été révoquées.`
          : `Le compte de ${u.nomComplet} a été réactivé avec succès.`,
      });
    } catch (e) {
      setAlerte({
        ouvert: true,
        type: 'danger',
        titre: 'Opération impossible',
        message: e instanceof ApiError ? e.message : 'Une erreur est survenue. Veuillez réessayer.',
      });
    } finally {
      setEnCours(undefined);
    }
  };

  /* ── Données paginées ── */
  const listePaginee = utilisateurs ? paginer(utilisateurs, page, PAR_PAGE) : [];

  return (
    <>
      <Coquille
        titre="Annuaire des utilisateurs"
        description="Tous les comptes enregistrés sur la plateforme Maboko"
        actions={
          utilisateurs && (
            <span className="pastille pastille-neutre">
              {utilisateurs.length} utilisateur{utilisateurs.length !== 1 ? 's' : ''}
            </span>
          )
        }
      >
        {/* ── Filtres ── */}
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
              placeholder="Rechercher par nom, e-mail, téléphone…"
              className="champ pl-10"
            />
          </div>

          <select value={role} onChange={(e) => setRole(e.target.value)} className="champ-select w-[180px]">
            <option value="">Tous les rôles</option>
            <option value="client">Client</option>
            <option value="artisan">Artisan</option>
            <option value="chauffeur">Chauffeur</option>
            <option value="admin">Administrateur</option>
          </select>

          <select value={statut} onChange={(e) => setStatut(e.target.value)} className="champ-select w-[160px]">
            <option value="">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="suspendu">Suspendus</option>
          </select>

          <button type="button" onClick={charger} className="bouton-icon" title="Actualiser">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </BarreOutils>

        {/* ── Contenu ── */}
        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !utilisateurs ? (
          <Chargement />
        ) : utilisateurs.length === 0 ? (
          <EtatVide titre="Aucun utilisateur" message="Aucun compte ne correspond aux filtres indiqués." />
        ) : (
          <div>
            <div className="tableau-conteneur overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="tableau-entete">
                  <tr>
                    <th className="tableau-th">Utilisateur</th>
                    <th className="tableau-th">Rôle</th>
                    <th className="tableau-th">Localisation</th>
                    <th className="tableau-th">Statut</th>
                    <th className="tableau-th">Dernière connexion</th>
                    <th className="tableau-th">Inscription</th>
                    <th className="tableau-th text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listePaginee.map((u) => (
                    <tr key={u.id} className="tableau-tr">
                      {/* Utilisateur */}
                      <td className="tableau-td">
                        <div className="flex items-center gap-3.5">
                          <div className="avatar h-11 w-11 text-[13px]" title={u.nomComplet}>
                            {u.nomComplet.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <p className="cellule-titre truncate">{u.nomComplet}</p>
                            <p className="cellule-sous truncate">{u.email}</p>
                            <p className="cellule-code">{u.telephone}</p>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="tableau-td">
                        <span className={COULEURS_ROLE[u.role] ?? 'pastille-neutre'}>
                          {LIBELLES_ROLE[u.role] ?? u.role}
                        </span>
                      </td>

                      {/* Localisation */}
                      <td className="tableau-td">
                        {u.ville ? (
                          <span className="cellule-sous">
                            {u.ville}
                            {u.quartier ? `, ${u.quartier}` : ''}
                          </span>
                        ) : (
                          <span className="text-maboko-bordure">—</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="tableau-td">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className={u.compteSuspendu ? 'pastille-suspendu' : 'pastille-actif'}>
                            {u.compteSuspendu ? 'Suspendu' : 'Actif'}
                          </span>
                          {u.isVerified && (
                            <span className="pastille-info">
                              Vérifié
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Dernière connexion */}
                      <td className="tableau-td cellule-sous tabular-nums">
                        {u.derniereConnexion ? date(u.derniereConnexion, true) : <span className="text-maboko-bordure">Jamais</span>}
                      </td>

                      {/* Inscription */}
                      <td className="tableau-td cellule-sous tabular-nums">
                        {date(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="tableau-td">
                        <div className="flex items-center justify-end gap-2">
                          {u.role !== 'admin' && u.role !== 'super_admin' && (
                            <>
                              {u.compteSuspendu ? (
                                <button
                                  type="button"
                                  title="Réactiver le compte"
                                  disabled={enCours === u.id}
                                  onClick={() => ouvrirModalSuspension(u)}
                                  className="bouton-icon-succes"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  title="Suspendre le compte"
                                  disabled={enCours === u.id}
                                  onClick={() => ouvrirModalSuspension(u)}
                                  className="bouton-icon-danger"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              total={utilisateurs.length}
              perPage={PAR_PAGE}
              onChanger={setPage}
            />
          </div>
        )}
      </Coquille>

      {/* ── Modales ── */}
      <Modal
        ouvert={modalSuspension.ouvert}
        type={modalSuspension.utilisateur?.compteSuspendu ? 'succes' : 'danger'}
        titre={
          modalSuspension.utilisateur?.compteSuspendu
            ? 'Réactiver ce compte ?'
            : 'Suspendre ce compte ?'
        }
        message={
          modalSuspension.utilisateur?.compteSuspendu
            ? `Le compte de ${modalSuspension.utilisateur?.nomComplet} sera réactivé et l'utilisateur pourra se reconnecter.`
            : `Le compte de ${modalSuspension.utilisateur?.nomComplet} sera suspendu. Toutes ses sessions actives seront révoquées immédiatement.`
        }
        libelleBoutonOk={modalSuspension.utilisateur?.compteSuspendu ? 'Réactiver' : 'Suspendre'}
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
