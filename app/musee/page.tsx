'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Modal, Alerte } from '@/components/Modal';
import { api, ApiError } from '@/lib/api';
import type {
  MuseeAdminResponse,
  MuseeArtisan,
  MuseeCandidat,
} from '@/lib/types';

export default function PageMusee() {
  const [donnees, setDonnees] = useState<MuseeAdminResponse>();
  const [erreur, setErreur] = useState<string>();
  const [rafraichissementEnCours, setRafraichissementEnCours] = useState(false);
  const [actionEnCours, setActionEnCours] = useState<number>();

  // ⚠️ `type` devient optionnel pour pouvoir fermer la modale sans le préciser.
  const [modalAction, setModalAction] = useState<{
    ouvert: boolean;
    type?: 'valider' | 'ignorer' | 'bannir' | 'retirer';
    candidat?: MuseeCandidat;
    artisan?: MuseeArtisan;
  }>({ ouvert: false });

  const [alerte, setAlerte] = useState<{
    ouvert: boolean;
    titre: string;
    message: string;
  }>({ ouvert: false, titre: '', message: '' });

  const charger = useCallback(async () => {
    setErreur(undefined);
    try {
      setDonnees(await api.get<MuseeAdminResponse>('/admin/musee'));
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement impossible.');
    }
  }, []);

  useEffect(() => {
    const minuterie = setTimeout(charger, 0);
    return () => clearTimeout(minuterie);
  }, [charger]);

  const rafraichirCandidats = async () => {
    setRafraichissementEnCours(true);
    try {
      const reponse = await api.post<{ message: string; nombre: number }>(
        '/admin/musee/rafraichir',
      );
      await charger();
      setAlerte({
        ouvert: true,
        titre: 'Candidats recalculés',
        message: reponse.message,
      });
    } catch (e) {
      setAlerte({
        ouvert: true,
        titre: 'Erreur',
        message: e instanceof ApiError ? e.message : 'Opération impossible.',
      });
    } finally {
      setRafraichissementEnCours(false);
    }
  };

  const executerAction = async () => {
    const { type, candidat, artisan } = modalAction;
    const id = candidat?.id ?? artisan?.id;
    if (!id || !type) return;

    setModalAction({ ouvert: false });
    setActionEnCours(id);

    try {
      await api.post(`/admin/musee/${id}/${type}`);
      await charger();

      const libelles: Record<string, string> = {
        valider: 'Artisan validé et ajouté au musée.',
        ignorer: 'Candidat ignoré pendant 30 jours.',
        bannir: 'Artisan banni du musée.',
        retirer: 'Artisan retiré du musée.',
      };

      setAlerte({
        ouvert: true,
        titre: 'Action effectuée',
        message: libelles[type],
      });
    } catch (e) {
      setAlerte({
        ouvert: true,
        titre: 'Erreur',
        message: e instanceof ApiError ? e.message : 'Opération impossible.',
      });
    } finally {
      setActionEnCours(undefined);
    }
  };

  const reordonner = async (artisan: MuseeArtisan, delta: number) => {
    setActionEnCours(artisan.id);
    try {
      await api.post(`/admin/musee/${artisan.id}/reordonner`, {
        ordre: artisan.ordre + delta,
      });
      await charger();
    } catch (e) {
      setAlerte({
        ouvert: true,
        titre: 'Erreur',
        message: e instanceof ApiError ? e.message : 'Impossible de réordonner.',
      });
    } finally {
      setActionEnCours(undefined);
    }
  };

  return (
    <>
      <Coquille
        titre="Musée du savoir-faire"
        description="Artisans mis en avant sur l'application mobile"
        actions={
          <button
            type="button"
            onClick={rafraichirCandidats}
            disabled={rafraichissementEnCours}
            className="bouton-principal !py-2 !px-4 !text-xs"
          >
            {rafraichissementEnCours ? 'Calcul…' : 'Rafraîchir les candidats'}
          </button>
        }
      >
        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !donnees ? (
          <Chargement />
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="section-titre">
                Candidats en attente
                {donnees.aProposer.length > 0 && (
                  <span className="badge-rouge ml-2">{donnees.aProposer.length}</span>
                )}
              </h2>

              {donnees.aProposer.length === 0 ? (
                <p className="text-sm text-maboko-texte">
                  Aucun nouveau candidat. Les artisans les mieux notés seront
                  proposés automatiquement chaque nuit.
                </p>
              ) : (
                <div className="space-y-3">
                  {donnees.aProposer.map((candidat) => (
                    <div
                      key={candidat.id}
                      className="carte-stat flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="avatar h-11 w-11 shrink-0 text-[13px]">
                          {candidat.nomComplet.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="cellule-titre truncate">
                            {candidat.nomComplet}
                          </p>
                          <p className="cellule-sous">
                            {candidat.specialite ?? '—'}
                            {candidat.ville ? ` · ${candidat.ville}` : ''}
                          </p>
                          <p className="cellule-meta">
                            ⭐ {candidat.noteMoyenne.toFixed(1)} ·{' '}
                            {candidat.nbMissionsTerminees} missions
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModalAction({ ouvert: true, type: 'valider', candidat })
                          }
                          disabled={actionEnCours === candidat.id}
                          className="bouton-principal !py-2 !px-4 !text-xs"
                        >
                          Valider
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalAction({ ouvert: true, type: 'ignorer', candidat })
                          }
                          disabled={actionEnCours === candidat.id}
                          className="bouton-secondaire !py-2 !px-4 !text-xs"
                        >
                          Ignorer 30j
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalAction({ ouvert: true, type: 'bannir', candidat })
                          }
                          disabled={actionEnCours === candidat.id}
                          className="bouton-danger !py-2 !px-4 !text-xs"
                        >
                          Bannir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="section-titre">
                Artisans dans le musée
                {donnees.valides.length > 0 && (
                  <span className="badge-succes ml-2">{donnees.valides.length}</span>
                )}
              </h2>

              {donnees.valides.length === 0 ? (
                <EtatVide
                  titre="Musée vide"
                  message="Validez des candidats pour les faire apparaître ici et sur le mobile."
                />
              ) : (
                <div className="space-y-3">
                  {donnees.valides.map((artisan) => (
                    <div
                      key={artisan.id}
                      className="carte-stat flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="avatar h-11 w-11 shrink-0 text-[13px]">
                          {artisan.nomComplet.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="cellule-titre truncate">
                            {artisan.nomComplet}
                          </p>
                          <p className="cellule-sous">
                            {artisan.specialite ?? '—'}
                            {artisan.ville ? ` · ${artisan.ville}` : ''}
                          </p>
                          <p className="cellule-meta">
                            ⭐ {artisan.noteMoyenne.toFixed(1)} ·{' '}
                            {artisan.nbMissionsTerminees} missions · Ordre {artisan.ordre}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => reordonner(artisan, 10)}
                          disabled={actionEnCours === artisan.id}
                          className="bouton-icon"
                          title="Monter"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => reordonner(artisan, -10)}
                          disabled={actionEnCours === artisan.id}
                          className="bouton-icon"
                          title="Descendre"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalAction({ ouvert: true, type: 'retirer', artisan })
                          }
                          disabled={actionEnCours === artisan.id}
                          className="bouton-secondaire !py-2 !px-4 !text-xs"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </Coquille>

      <Modal
        ouvert={modalAction.ouvert}
        type={modalAction.type === 'valider' ? 'succes' : 'danger'}
        titre={
          modalAction.type === 'valider'
            ? 'Valider cet artisan ?'
            : modalAction.type === 'ignorer'
              ? 'Ignorer pendant 30 jours ?'
              : modalAction.type === 'bannir'
                ? 'Bannir définitivement ?'
                : 'Retirer du musée ?'
        }
        message={
          modalAction.type === 'valider'
            ? `${modalAction.candidat?.nomComplet} apparaîtra dans le musée sur le mobile.`
            : modalAction.type === 'ignorer'
              ? `${modalAction.candidat?.nomComplet} ne sera plus proposé pendant 30 jours.`
              : modalAction.type === 'bannir'
                ? `${modalAction.candidat?.nomComplet} ne sera plus jamais proposé.`
                : `${modalAction.artisan?.nomComplet} sera retiré du musée et redeviendra candidat.`
        }
        libelleBoutonOk={
          modalAction.type === 'valider'
            ? 'Valider'
            : modalAction.type === 'ignorer'
              ? 'Ignorer'
              : modalAction.type === 'bannir'
                ? 'Bannir'
                : 'Retirer'
        }
        onConfirmer={executerAction}
        onAnnuler={() => setModalAction({ ouvert: false })}
      />

      <Alerte
        ouvert={alerte.ouvert}
        titre={alerte.titre}
        message={alerte.message}
        onFermer={() => setAlerte({ ouvert: false, titre: '', message: '' })}
      />
    </>
  );
}