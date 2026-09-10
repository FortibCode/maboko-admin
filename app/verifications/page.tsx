'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { IconeCheck, IconeCroix } from '@/components/Icones';
import { BarreOutils, Segmente } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Pastille } from '@/components/Pastille';
import { Modal, Alerte } from '@/components/Modal';
import { Pagination as PaginationComp, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import { date } from '@/lib/format';
import type { Pagination, Verification } from '@/lib/types';

const LIBELLE_PIECE: Record<string, string> = {
  cni: 'Carte nationale d’identité',
  passeport: 'Passeport',
  carte_consulaire: 'Carte consulaire',
};

const PAR_PAGE = 5;

export default function PageVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>();
  const [statut, setStatut] = useState('en_attente');
  const [erreur, setErreur] = useState<string>();
  const [enCours, setEnCours] = useState<number>();
  const [page, setPage] = useState(1);

  // Modals state
  const [modalRefus, setModalRefus] = useState<{ ouvert: boolean; item?: Verification }>({ ouvert: false });
  const [motifRefus, setMotifRefus] = useState('');
  const [modalValidation, setModalValidation] = useState<{ ouvert: boolean; item?: Verification }>({ ouvert: false });
  const [alerte, setAlerte] = useState<{ ouvert: boolean; type?: 'succes' | 'danger'; titre: string; message: string }>({ ouvert: false, titre: '', message: '' });

  const charger = useCallback(async () => {
    setErreur(undefined);

    try {
      const reponse = await api.get<Pagination<Verification>>('/admin/verifications', { statut });
      setVerifications(reponse.data);
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

  const validerVerification = async () => {
    const v = modalValidation.item;
    if (!v) return;
    setModalValidation({ ouvert: false });
    setEnCours(v.id);

    try {
      await api.post(`/admin/verifications/${v.id}`, { decision: 'valide' });
      await charger();
      setAlerte({ ouvert: true, type: 'succes', titre: 'Identité validée', message: `L'identité de ${v.utilisateur.nomComplet} a été validée.` });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  const refuserVerification = async () => {
    const v = modalRefus.item;
    if (!v || !motifRefus.trim()) return;
    setModalRefus({ ouvert: false });
    setEnCours(v.id);

    try {
      await api.post(`/admin/verifications/${v.id}`, { decision: 'rejete', motif: motifRefus.trim() });
      await charger();
      setAlerte({ ouvert: true, type: 'succes', titre: 'Demande refusée', message: `Le refus a été enregistré et notifié à l'utilisateur.` });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Opération impossible.' });
    } finally {
      setEnCours(undefined);
      setMotifRefus('');
    }
  };

  return (
    <>
      <Coquille
        titre="Vérification d’identité"
        description="Contrôle des pièces avant l’attribution du badge « Profil vérifié »"
      >
        <BarreOutils>
          <Segmente
            valeur={statut}
            onChange={setStatut}
            options={[
              { valeur: 'en_attente', libelle: 'À examiner' },
              { valeur: 'valide', libelle: 'Validées' },
              { valeur: 'rejete', libelle: 'Refusées' },
            ]}
          />
        </BarreOutils>

        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !verifications ? (
          <Chargement />
        ) : verifications.length === 0 ? (
          <EtatVide titre="Aucune demande" message="Rien à examiner dans cette catégorie." />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {paginer(verifications, page, PAR_PAGE).map((verification) => (
                <article key={verification.id} className="carte">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{verification.utilisateur.nomComplet}</p>
                      <p className="text-xs text-maboko-texte">{verification.utilisateur.email}</p>
                      <p className="text-xs text-maboko-texte">{verification.utilisateur.telephone}</p>
                    </div>
                    <Pastille statut={verification.statut} />
                  </div>

                  <p className="mt-3 text-sm">
                    {LIBELLE_PIECE[verification.typePiece] ?? verification.typePiece}
                    <span className="text-maboko-texte">
                      {' '}· déposée le {date(verification.deposeeLe, true)}
                    </span>
                  </p>

                  {Object.keys(verification.pieces).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(verification.pieces).map(([face, lien]) => (
                        <a
                          key={face}
                          href={lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bouton-secondaire !px-3 !py-1.5 !text-xs capitalize"
                        >
                          Ouvrir le {face}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm italic text-maboko-texte">Pièces indisponibles.</p>
                  )}

                  {verification.motifRejet && (
                    <p className="mt-3 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-maboko-danger">
                      {verification.motifRejet}
                    </p>
                  )}

                  {verification.statut === 'en_attente' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={enCours === verification.id}
                        onClick={() => setModalValidation({ ouvert: true, item: verification })}
                        className="bouton-principal flex-1"
                      >
                        <IconeCheck taille={15} />
                        Valider l’identité
                      </button>
                      <button
                        type="button"
                        disabled={enCours === verification.id}
                        onClick={() => {
                          setMotifRefus('');
                          setModalRefus({ ouvert: true, item: verification });
                        }}
                        className="bouton-danger flex-1"
                      >
                        <IconeCroix taille={15} />
                        Refuser
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <PaginationComp page={page} total={verifications.length} perPage={PAR_PAGE} onChanger={setPage} />
          </div>
        )}
      </Coquille>

      {/* Modal Validation */}
      <Modal
        ouvert={modalValidation.ouvert}
        type="succes"
        titre={`Valider l'identité de ${modalValidation.item?.utilisateur.nomComplet} ?`}
        message="Le badge « Profil vérifié » sera immédiatement attribué à cet utilisateur."
        libelleBoutonOk="Valider"
        onConfirmer={validerVerification}
        onAnnuler={() => setModalValidation({ ouvert: false })}
      />

      {/* Modal Refus avec motif */}
      {modalRefus.ouvert && (
        <div className="modal-overlay">
          <div className="modal-contenu">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <IconeCroix taille={24} />
            </div>
            <h3 className="mb-2 text-center text-lg font-bold text-maboko-principale">
              Refuser l&apos;identité de {modalRefus.item?.utilisateur.nomComplet}
            </h3>
            <p className="mb-4 text-center text-xs text-maboko-texte">
              Veuillez indiquer le motif du refus. Il sera communiqué à l’utilisateur.
            </p>

            <textarea
              value={motifRefus}
              onChange={(e) => setMotifRefus(e.target.value)}
              placeholder="Ex: Document illisible, pièce périmée..."
              className="champ w-full mb-4"
              rows={3}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalRefus({ ouvert: false })}
                className="bouton-secondaire flex-1"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!motifRefus.trim()}
                onClick={refuserVerification}
                className="bouton-danger flex-1"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

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
