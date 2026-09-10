'use client';

import { useCallback, useEffect, useState } from 'react';
import { Coquille } from '@/components/Coquille';
import { IconeOutil } from '@/components/Icones';
import { BarreOutils } from '@/components/Filtres';
import { Chargement, EtatErreur, EtatVide } from '@/components/Etats';
import { Cellule, Tableau } from '@/components/Tableau';
import { Modal, Alerte } from '@/components/Modal';
import { Pagination as PaginationComp, paginer } from '@/components/Pagination';
import { api, ApiError } from '@/lib/api';
import type { Pagination } from '@/lib/types';

const PAR_PAGE = 5;

export interface MetierItem {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  icone?: string;
  /** Photo du métier, absolue. Absente tant que rien n'a été déposé. */
  imageUrl?: string | null;
  ordre: number;
  actif: boolean;
  nbArtisans?: number;
}

export default function PageMetiers() {
  const [metiers, setMetiers] = useState<MetierItem[]>();
  const [recherche, setRecherche] = useState('');
  const [erreur, setErreur] = useState<string>();
  const [enCours, setEnCours] = useState<number>();
  const [page, setPage] = useState(1);
  const [modalSuppr, setModalSuppr] = useState<{ ouvert: boolean; metier?: MetierItem }>({ ouvert: false });
  const [alerte, setAlerte] = useState<{ ouvert: boolean; type?: 'succes' | 'danger'; titre: string; message: string }>({ ouvert: false, titre: '', message: '' });
  const [erreurFormulaire, setErreurFormulaire] = useState<string>();

  // Modal / Form state
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [metierEnEdition, setMetierEnEdition] = useState<MetierItem | null>(null);
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [icone, setIcone] = useState('');
  const [ordre, setOrdre] = useState('0');

  // Photo du métier. `undefined` = inchangée, `''` = à retirer, sinon la
  // nouvelle image en base64. L'aperçu montre la photo déjà en place.
  const [image, setImage] = useState<string>();
  const [apercu, setApercu] = useState<string | null>(null);
  const [erreurImage, setErreurImage] = useState<string>();

  const charger = useCallback(async () => {
    setErreur(undefined);

    try {
      const reponse = await api.get<Pagination<MetierItem>>('/admin/metiers', {
        q: recherche || undefined,
      });
      setMetiers(reponse.data);
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement des métiers impossible.');
    }
  }, [recherche]);

  useEffect(() => {
    const minuterie = setTimeout(charger, recherche ? 350 : 0);
    return () => clearTimeout(minuterie);
  }, [charger, recherche]);

  const ouvrirCreation = () => {
    setMetierEnEdition(null);
    setNom('');
    setDescription('');
    setIcone('');
    setOrdre('0');
    setImage(undefined);
    setApercu(null);
    setErreurImage(undefined);
    setErreurFormulaire(undefined);
    setAfficherFormulaire(true);
  };

  const ouvrirEdition = (m: MetierItem) => {
    setMetierEnEdition(m);
    setNom(m.nom);
    setDescription(m.description || '');
    setIcone(m.icone || '');
    setOrdre(String(m.ordre));
    setImage(undefined);
    setApercu(m.imageUrl || null);
    setErreurImage(undefined);
    setErreurFormulaire(undefined);
    setAfficherFormulaire(true);
  };

  /// Cinq mégaoctets : la limite acceptée par le serveur.
  const TAILLE_MAX = 5 * 1024 * 1024;

  const choisirImage = (fichier?: File) => {
    setErreurImage(undefined);
    if (!fichier) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(fichier.type)) {
      setErreurImage('Formats acceptés : JPEG, PNG ou WebP.');
      return;
    }

    if (fichier.size > TAILLE_MAX) {
      setErreurImage('Image trop lourde : 5 Mo au maximum.');
      return;
    }

    const lecteur = new FileReader();
    lecteur.onload = () => {
      const resultat = String(lecteur.result);
      setImage(resultat);
      setApercu(resultat);
    };
    lecteur.onerror = () => setErreurImage('Lecture du fichier impossible.');
    lecteur.readAsDataURL(fichier);
  };

  const retirerImage = () => {
    setImage('');
    setApercu(null);
    setErreurImage(undefined);
  };

  const enregistrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    try {
      const payload = {
        nom: nom.trim(),
        description: description.trim() || undefined,
        icone: icone.trim() || undefined,
        // Omise si l'utilisateur n'y a pas touché : le serveur garde alors
        // la photo en place.
        ...(image === undefined ? {} : { image }),
        ordre: parseInt(ordre, 10) || 0,
      };

      if (metierEnEdition) {
        await api.post(`/admin/metiers/${metierEnEdition.id}`, { ...payload, _method: 'PUT' });
      } else {
        await api.post('/admin/metiers', payload);
      }

      setAfficherFormulaire(false);
      await charger();
      setAlerte({ ouvert: true, type: 'succes', titre: metierEnEdition ? 'Métier modifié' : 'Métier créé', message: metierEnEdition ? `Le métier "${nom}" a été mis à jour.` : `Le métier "${nom}" a été créé avec succès.` });
    } catch (err) {
      setErreurFormulaire(err instanceof ApiError ? err.message : 'Enregistrement impossible.');
    }
  };

  const confirmerSuppression = async () => {
    const m = modalSuppr.metier;
    if (!m) return;
    setModalSuppr({ ouvert: false });
    setEnCours(m.id);
    try {
      await api.post(`/admin/metiers/${m.id}`, { _method: 'DELETE' });
      await charger();
      setAlerte({ ouvert: true, type: 'succes', titre: 'Métier supprimé', message: `Le métier "${m.nom}" a été supprimé.` });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur', message: e instanceof ApiError ? e.message : 'Suppression impossible.' });
    } finally {
      setEnCours(undefined);
    }
  };

  return (
    <>
      <Coquille titre="Métiers" description="Administration du référentiel des métiers Maboko">
      <BarreOutils>
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un métier…"
          className="champ max-w-sm"
        />

        <button type="button" onClick={ouvrirCreation} className="bouton-principal">
          + Ajouter un métier
        </button>
      </BarreOutils>

      {afficherFormulaire && (
        <div className="mb-6 rounded-2xl border border-maboko-bordure bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold">
            {metierEnEdition ? `Modifier le métier "${metierEnEdition.nom}"` : 'Créer un nouveau métier'}
          </h2>
          <form onSubmit={enregistrer} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Nom du métier *</label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Électricien"
                  className="champ w-full"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Icône / Identifiant</label>
                <input
                  type="text"
                  value={icone}
                  onChange={(e) => setIcone(e.target.value)}
                  placeholder="Ex: lightning-bolt"
                  className="champ w-full"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold">Photo du métier</label>
                <div className="flex items-center gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-maboko-bordure bg-maboko-fond">
                    {apercu ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={apercu} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-2 text-center text-[10px] leading-tight text-maboko-texte/60">
                        Aucune photo
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => choisirImage(e.target.files?.[0])}
                      className="block w-full text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-maboko-principale file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />
                    <p className="text-[11px] text-maboko-texte/70">
                      JPEG, PNG ou WebP, 5 Mo maximum. À défaut de photo, l’application
                      affiche l’icône ci-dessus.
                    </p>
                    {apercu && (
                      <button type="button" onClick={retirerImage} className="text-[11px] font-semibold text-maboko-danger underline">
                        Retirer la photo
                      </button>
                    )}
                    {erreurImage && (
                      <p className="text-[11px] font-semibold text-maboko-danger">{erreurImage}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Ordre d’affichage</label>
                <input
                  type="number"
                  value={ordre}
                  onChange={(e) => setOrdre(e.target.value)}
                  className="champ w-full"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Courte description de ce métier…"
                rows={2}
                className="champ w-full"
              />
            </div>

            {erreurFormulaire && (
              <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-maboko-danger">
                {erreurFormulaire}
              </p>
            )}

            <div className="flex gap-2">
              <button type="submit" className="bouton-principal">
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setAfficherFormulaire(false)}
                className="bouton-secondaire"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={charger} />
      ) : !metiers ? (
        <Chargement />
      ) : metiers.length === 0 ? (
        <EtatVide titre="Aucun métier" message="Aucun métier ne correspond à la recherche." icone={<IconeOutil taille={34} />} />
      ) : (
        <div>
          <Tableau entetes={['Nom', 'Slug', 'Description', 'Artisans liés', 'Ordre', 'Statut', 'Actions']}>
            {paginer(metiers, page, PAR_PAGE).map((m) => (
              <tr key={m.id} className="tableau-tr">
                <Cellule>
                  <p className="font-semibold">{m.icone ? `${m.icone} ` : ''}{m.nom}</p>
                </Cellule>

                <Cellule className="text-xs text-maboko-texte font-mono">{m.slug}</Cellule>

                <Cellule className="max-w-xs text-xs text-maboko-texte truncate">
                  {m.description || <span className="text-maboko-bordure">—</span>}
                </Cellule>

                <Cellule className="text-sm font-semibold">
                  {m.nbArtisans ?? 0} artisan{(m.nbArtisans ?? 0) > 1 ? 's' : ''}
                </Cellule>

                <Cellule className="text-xs tabular-nums">{m.ordre}</Cellule>

                <Cellule>
                  <span className={m.actif ? 'pastille-actif' : 'pastille-neutre'}>
                    {m.actif ? 'Actif' : 'Inactif'}
                  </span>
                </Cellule>

                <Cellule>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      title="Modifier"
                      onClick={() => ouvrirEdition(m)}
                      className="bouton-icon"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Supprimer"
                      disabled={enCours === m.id}
                      onClick={() => setModalSuppr({ ouvert: true, metier: m })}
                      className="bouton-icon-danger"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" /><path d="M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </Cellule>
              </tr>
            ))}
          </Tableau>

          <PaginationComp page={page} total={metiers.length} perPage={PAR_PAGE} onChanger={setPage} />
        </div>
      )}
    </Coquille>

    {/* Modales */}
    <Modal
      ouvert={modalSuppr.ouvert}
      type="danger"
      titre={`Supprimer le métier "${modalSuppr.metier?.nom}" ?`}
      message="Ce métier sera supprimé ou désactivé. Les artisans associés ne seront pas supprimés."
      libelleBoutonOk="Supprimer"
      onConfirmer={confirmerSuppression}
      onAnnuler={() => setModalSuppr({ ouvert: false })}
    />

    <Alerte
      ouvert={alerte.ouvert}
      type={alerte.type}
      titre={alerte.titre}
      message={alerte.message}
      onFermer={() => setAlerte((prev) => ({ ...prev, ouvert: false }))}
    />
  </>);
}
