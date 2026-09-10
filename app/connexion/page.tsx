'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError, ecrireJeton } from '@/lib/api';
import {
  IconeEnveloppe,
  IconeCadenas,
  IconeOeil,
  IconeOeilBarre,
  IconeEntrer,
  IconeAlerte,
} from '@/components/Icones';

type Connexion = { token: string; user: { role: string; nom: string; prenom: string | null } };

/**
 * Page de connexion au back-office Maboko.
 *
 * Une seule carte centrée sur un fond décoratif aux couleurs de la charte
 * (§VIII du cahier de charges), plutôt qu'une photo de banque d'images : le
 * fond est composé de dégradés et de formes propres au projet, sans
 * dépendance à un visuel dont les droits ne sont pas établis.
 *
 * Refusée si le rôle n'est pas admin ou super_admin (vérifié côté API).
 */
export default function PageConnexion() {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMDP, setAfficherMDP] = useState(false);
  const [erreur, setErreur] = useState<string>();
  const [enCours, setEnCours] = useState(false);
  const [aideMotDePasseOublie, setAideMotDePasseOublie] = useState(false);

  const soumettre = async (evenement: React.FormEvent) => {
    evenement.preventDefault();
    setErreur(undefined);
    setEnCours(true);

    try {
      const reponse = await api.post<Connexion>('/login', {
        identifiant,
        password: motDePasse,
      });

      if (!['admin', 'super_admin'].includes(reponse.user.role)) {
        setErreur("Ce compte n'a pas les droits d'administration.");
        setEnCours(false);
        return;
      }

      ecrireJeton(reponse.token);
      router.push('/');
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Connexion impossible. Vérifiez vos identifiants.');
      setEnCours(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #4A2A18 0%, #7A3F1D 45%, #B35B28 78%, #EAA023 100%)' }}
    >
      {/* ── Fond décoratif : reliefs et silhouette de toit sur le dégradé de la charte ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Halo doré en bas à gauche */}
        <div
          className="absolute -left-32 -bottom-40 h-[32rem] w-[32rem] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, #EAA023 0%, transparent 70%)' }}
        />
        {/* Halo sombre en haut à droite, pour la profondeur */}
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2E1A0F 0%, transparent 70%)' }}
        />
        {/* Cercle clair, bas droite */}
        <div
          className="absolute -right-16 bottom-10 h-56 w-56 rounded-full opacity-20 blur-2xl"
          style={{ background: 'radial-gradient(circle, #FFFDF8 0%, transparent 70%)' }}
        />

        {/* Silhouette de toit — reprise du motif de la maison du logo */}
        <svg
          className="absolute left-[-4%] top-[8%] w-[38%] max-w-md text-white/10"
          viewBox="0 0 200 140"
          fill="none"
        >
          <path
            d="M10 90 L100 15 L190 90"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ── Carte de connexion ── */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[1000px]">
          <div
            className="rounded-[2rem] border border-maboko-bordure/60 bg-maboko-fond p-8 sm:p-12 lg:px-24 lg:py-14"
            style={{ boxShadow: '0 30px 60px -20px rgba(74, 42, 24, 0.3), 0 8px 24px rgba(74, 42, 24, 0.1)' }}
          >
            <div className="mb-8 flex justify-center">
              <Image
                src="/maboko-logo.jpg"
                alt="Maboko — les mains qui font le Congo"
                width={260}
                height={260}
                className="h-auto w-48 object-contain sm:w-56"
                priority
              />
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-[26px] font-bold text-maboko-principale sm:text-[32px]">Se connecter</h1>
              <p className="mt-2.5 text-[15px] leading-relaxed text-maboko-texte">
                Accédez à votre compte pour continuer sur Maboko.
              </p>
            </div>

            <form onSubmit={soumettre} className="space-y-5">
              {/* Identifiant */}
              <div>
                <label htmlFor="identifiant" className="sr-only">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-maboko-texte/70">
                    <IconeEnveloppe taille={18} />
                  </span>
                  <input
                    id="identifiant"
                    type="text"
                    value={identifiant}
                    onChange={(e) => setIdentifiant(e.target.value)}
                    className="w-full rounded-2xl border border-maboko-bordure bg-white py-4 pl-12 pr-4 text-[15px] text-maboko-principale outline-none transition-all placeholder:text-maboko-texte/60 focus:border-maboko-secondaire focus:ring-2 focus:ring-maboko-secondaire/15"
                    autoComplete="username"
                    placeholder="Adresse e-mail"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="motdepasse" className="sr-only">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-maboko-texte/70">
                    <IconeCadenas taille={18} />
                  </span>
                  <input
                    id="motdepasse"
                    type={afficherMDP ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    className="w-full rounded-2xl border border-maboko-bordure bg-white py-4 pl-12 pr-12 text-[15px] text-maboko-principale outline-none transition-all placeholder:text-maboko-texte/60 focus:border-maboko-secondaire focus:ring-2 focus:ring-maboko-secondaire/15"
                    autoComplete="current-password"
                    placeholder="Mot de passe"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setAfficherMDP((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-maboko-texte/70 transition-colors hover:text-maboko-principale"
                    aria-label={afficherMDP ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {afficherMDP ? <IconeOeilBarre taille={18} /> : <IconeOeil taille={18} />}
                  </button>
                </div>
              </div>

              {/* Mot de passe oublié */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setAideMotDePasseOublie((v) => !v)}
                  className="text-sm font-semibold text-maboko-secondaire underline decoration-maboko-secondaire/40 underline-offset-2 transition-colors hover:text-maboko-principale"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {aideMotDePasseOublie && (
                <p className="rounded-xl bg-maboko-accent/10 px-4 py-3 text-xs leading-relaxed text-maboko-principale">
                  Les comptes d&apos;administration ne se réinitialisent pas en libre-service.
                  Contactez un autre administrateur ou l&apos;équipe technique Maboko pour obtenir
                  un nouveau mot de passe.
                </p>
              )}

              {/* Erreur */}
              {erreur && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <span className="mt-0.5 shrink-0 text-maboko-danger">
                    <IconeAlerte taille={16} />
                  </span>
                  <p className="text-sm text-maboko-danger">{erreur}</p>
                </div>
              )}

              {/* Bouton */}
              <button
                type="submit"
                disabled={enCours}
                className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-maboko-secondaire py-4 text-base font-bold text-white transition-all duration-200 hover:bg-maboko-principale active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ boxShadow: '0 10px 24px -6px rgba(179, 91, 40, 0.45)' }}
              >
                {enCours ? (
                  <>
                    <svg
                      className="animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    <IconeEntrer taille={17} />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-maboko-bordure/60 pt-6 text-center">
              <p className="text-xs text-maboko-texte">
                Accès réservé aux administrateurs de la plateforme Maboko.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-white/70">
            Maboko © {new Date().getFullYear()} · les mains qui font le Congo
          </p>
        </div>
      </div>
    </div>
  );
}
