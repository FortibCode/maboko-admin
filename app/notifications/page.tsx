'use client';

import { useState } from 'react';
import { Coquille } from '@/components/Coquille';
import {
  IconeCloche,
  IconeUtilisateurs,
  IconeUtilisateur,
  IconeOutil,
  IconeVoiture,
} from '@/components/Icones';
import { api, ApiError } from '@/lib/api';

/* Bornes alignées sur celles acceptées par l'API de diffusion. */
const MAX_TITRE = 150;
const MAX_CORPS = 1000;

const CIBLES = [
  { valeur: 'tous', libelle: 'Tous', detail: 'Comptes actifs', icone: <IconeUtilisateurs taille={17} /> },
  { valeur: 'clients', libelle: 'Clients', detail: 'Demandeurs de service', icone: <IconeUtilisateur taille={17} /> },
  { valeur: 'artisans', libelle: 'Artisans', detail: 'Prestataires inscrits', icone: <IconeOutil taille={17} /> },
  { valeur: 'chauffeurs', libelle: 'Chauffeurs', detail: 'Allô Chauffeur', icone: <IconeVoiture taille={17} /> },
];

export default function PageNotificationsAdmin() {
  const [cible, setCible] = useState('tous');
  const [titre, setTitre] = useState('');
  const [corps, setCorps] = useState('');
  const [important, setImportant] = useState(false);
  const [enEnvoi, setEnEnvoi] = useState(false);
  const [succes, setSucces] = useState<string>();
  const [erreur, setErreur] = useState<string>();

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSucces(undefined);
    setErreur(undefined);

    if (!titre.trim() || !corps.trim()) {
      setErreur('Le titre et le corps de la notification sont obligatoires.');
      return;
    }

    setEnEnvoi(true);

    try {
      const reponse = await api.post<{ message: string; destinataires: number }>(
        '/admin/notifications/broadcast',
        {
          cible,
          titre: titre.trim(),
          corps: corps.trim(),
          important,
        },
      );

      setSucces(reponse.message);
      setTitre('');
      setCorps('');
      setImportant(false);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'L’envoi a échoué.');
    } finally {
      setEnEnvoi(false);
    }
  };

  return (
    <Coquille
      titre="Diffusion de Notifications"
      description="Envoi de notifications Push & SMS groupées à l’ensemble ou une catégorie d’utilisateurs"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="carte !p-6">
        {succes && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            {succes}
          </div>
        )}

        {erreur && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {erreur}
          </div>
        )}

        <form onSubmit={envoyer} className="space-y-6">
          <fieldset>
            <legend className="label mb-3">Public cible</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {CIBLES.map((option) => {
                const actif = cible === option.valeur;
                return (
                  <button
                    key={option.valeur}
                    type="button"
                    onClick={() => setCible(option.valeur)}
                    aria-pressed={actif}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200
                      ${actif
                        ? 'border-maboko-secondaire bg-maboko-secondaire/[0.07] shadow-[0_4px_14px_-6px_rgba(179,91,40,0.5)]'
                        : 'border-maboko-bordure bg-white hover:border-maboko-secondaire/40 hover:bg-maboko-fond/60'}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors
                      ${actif ? 'bg-maboko-secondaire text-white' : 'bg-maboko-fond text-maboko-texte'}`}>
                      {option.icone}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-bold text-maboko-principale">
                        {option.libelle}
                      </span>
                      <span className="block text-[11.5px] leading-tight text-maboko-texte">
                        {option.detail}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="titre" className="label">Titre de la notification</label>
              <span className="text-[11px] tabular-nums text-maboko-texte/70">
                {titre.length}/{MAX_TITRE}
              </span>
            </div>
            <input
              id="titre"
              type="text"
              required
              maxLength={MAX_TITRE}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Mise à jour importante des conditions d’utilisation"
              className="champ w-full"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="corps" className="label">Message</label>
              <span className="text-[11px] tabular-nums text-maboko-texte/70">
                {corps.length}/{MAX_CORPS}
              </span>
            </div>
            <textarea
              id="corps"
              required
              maxLength={MAX_CORPS}
              rows={5}
              value={corps}
              onChange={(e) => setCorps(e.target.value)}
              placeholder="Contenu clair et concis diffusé sur les appareils…"
              className="champ w-full resize-y"
            />
          </div>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200
              ${important
                ? 'border-amber-300 bg-amber-50'
                : 'border-maboko-bordure bg-white hover:bg-maboko-fond/60'}`}
          >
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-maboko-bordure text-maboko-secondaire focus:ring-maboko-secondaire"
            />
            <span>
              <span className="block text-[13px] font-bold text-maboko-principale">
                Notification urgente
              </span>
              <span className="block text-[11.5px] leading-relaxed text-maboko-texte">
                Déclenche un SMS de secours si le Push échoue. Le SMS est facturé :
                à réserver aux messages critiques.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={enEnvoi}
            className="bouton-principal w-full gap-2 py-3.5 text-sm"
          >
            {enEnvoi ? (
              <>
                <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Diffusion en cours…
              </>
            ) : (
              <>
                <IconeCloche taille={16} />
                Envoyer la notification
              </>
            )}
          </button>
        </form>
      </div>

      <Apercu titre={titre} corps={corps} important={important} />
      </div>
    </Coquille>
  );
}

/**
 * Aperçu du rendu sur l'appareil.
 *
 * Une diffusion push part à tous les comptes d'un coup et ne se rattrape pas :
 * voir la vignette telle qu'elle s'affichera vaut mieux que la deviner.
 */
function Apercu({ titre, corps, important }: { titre: string; corps: string; important: boolean }) {
  return (
    <div className="carte !p-5 lg:sticky lg:top-24">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-maboko-texte">
        Aperçu sur l’appareil
      </p>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-maboko-principale to-[#2A1810] p-4">
        <div className="rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-maboko-secondaire text-white">
              <IconeCloche taille={11} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-maboko-texte">
              Maboko
            </span>
            <span className="ml-auto text-[10px] text-maboko-texte/60">maintenant</span>
          </div>

          <p className="mt-2 break-words text-[13px] font-bold leading-tight text-maboko-principale">
            {titre || 'Titre de la notification'}
          </p>
          <p className="mt-1 line-clamp-4 break-words text-[11.5px] leading-relaxed text-maboko-texte">
            {corps || 'Le message apparaîtra ici, tel que les utilisateurs le liront.'}
          </p>
        </div>

        {important && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span className="text-[11px] font-medium text-white/80">
              Un SMS partira si le Push échoue
            </span>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-maboko-texte">
        Le rendu exact dépend du système de l’appareil ; les longs titres sont tronqués
        par Android et iOS.
      </p>
    </div>
  );
}
