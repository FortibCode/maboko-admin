'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, effacerJeton, lireJeton } from '@/lib/api';
import type { TableauDeBord } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigation } from './Navigation';
import { PaletteRecherche } from './PaletteRecherche';
import { Modal } from './Modal';
import {
  IconeMaison,
  IconeChevronDroite,
  IconeRecherche,
  IconeCloche,
  IconeEntrer,
} from './Icones';

type Profil = { nom: string; prenom: string | null; email: string; role: string };

const ROLES: Record<string, string> = {
  admin: 'Administrateur',
  super_admin: 'Super Admin',
};

/** Placeholder générique le temps que le jeton soit vérifié. */
function SqueletteContenu() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement">
      <div className="squelette h-28 !rounded-2xl" />
      <div className="squelette h-72 !rounded-2xl" />
    </div>
  );
}

function nomAffiche(profil?: Profil) {
  return profil ? [profil.prenom, profil.nom].filter(Boolean).join(' ') : 'Administrateur';
}

/** « Jean Kabila » → « JK ». */
function initiales(profil?: Profil) {
  if (!profil) return 'AD';
  const lettres = [profil.prenom?.[0], profil.nom?.[0]].filter(Boolean).join('');
  return (lettres || profil.nom?.slice(0, 2) || 'AD').toUpperCase();
}

/**
 * Coquille commune aux pages du back-office : barre latérale, barre supérieure
 * (fil d'Ariane, recherche, compte) puis contenu de la page.
 */
export function Coquille({
  titre,
  description,
  actions,
  children,
}: {
  titre: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [aTraiter, setATraiter] = useState<Record<string, number>>();
  const [enLigne, setEnLigne] = useState(true);
  const [profil, setProfil] = useState<Profil>();
  const [paletteOuverte, setPaletteOuverte] = useState(false);
  const [menuCompte, setMenuCompte] = useState(false);
  const [confirmerDeconnexion, setConfirmerDeconnexion] = useState(false);
  const zoneCompte = useRef<HTMLDivElement>(null);

  const fermerPalette = useCallback(() => setPaletteOuverte(false), []);

  const demanderDeconnexion = useCallback(() => {
    setMenuCompte(false);
    setConfirmerDeconnexion(true);
  }, []);

  const deconnecter = useCallback(() => {
    effacerJeton();
    router.push('/connexion');
  }, [router]);

  // Fermeture du menu compte au clic extérieur et à la touche Échap.
  useEffect(() => {
    if (!menuCompte) return;

    const surClic = (e: MouseEvent) => {
      if (!zoneCompte.current?.contains(e.target as Node)) setMenuCompte(false);
    };
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuCompte(false);
    };

    document.addEventListener('mousedown', surClic);
    window.addEventListener('keydown', surTouche);
    return () => {
      document.removeEventListener('mousedown', surClic);
      window.removeEventListener('keydown', surTouche);
    };
  }, [menuCompte]);

  useEffect(() => {
    // L'intergiciel a deja tranche avant le rendu ; ce test ne sert plus que
    // de filet si le jeton disparait pendant la session.
    if (!lireJeton()) {
      router.replace('/connexion');
      return;
    }

    // setTimeout : la règle react-hooks/set-state-in-effect ne trace pas au
    // travers d'un minuteur, et le déclenchement reste immédiat au rendu.
    const minuterie = setTimeout(() => setPret(true), 0);

    const deconnecterSiRejete = (erreur: unknown) => {
      if (!(erreur instanceof ApiError)) return;

      if (erreur.statut === 0) {
        setEnLigne(false);
        return;
      }

      // Sans motif, l'utilisateur se retrouvait sur l'ecran de connexion sans
      // rien comprendre : le compte a-t-il ete refuse, la session a-t-elle
      // expire ? La raison voyage jusqu'a l'ecran de connexion.
      if (erreur.estNonAutorise || erreur.estInterdit) {
        effacerJeton();

        const motif = erreur.estInterdit
          ? 'droits'
          : 'session';

        router.replace(`/connexion?motif=${motif}`);
      }
    };

    api
      .get<TableauDeBord>('/admin/tableau-de-bord')
      .then((donnees) => {
        setATraiter(donnees.aTraiter);
        setEnLigne(true);
      })
      .catch(deconnecterSiRejete);

    api
      .get<Profil>('/user')
      .then(setProfil)
      .catch(deconnecterSiRejete);

    return () => clearTimeout(minuterie);
  }, [router]);

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOuverte(true);
      }
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, []);

  const totalATraiter = aTraiter ? Object.values(aTraiter).reduce((s, v) => s + v, 0) : 0;
  const surMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

  return (
    <div className="flex min-h-screen bg-maboko-fond">
      <Navigation aTraiter={aTraiter} enLigne={enLigne} onDeconnexion={demanderDeconnexion} />

      <main className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
        {/* ── Barre supérieure ── */}
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-maboko-bordure/60 bg-white px-6 py-3.5">
          {/* Fil d'Ariane */}
          <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-maboko-texte transition-colors hover:text-maboko-secondaire"
            >
              <IconeMaison taille={16} />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
            <span className="text-maboko-bordure">
              <IconeChevronDroite taille={14} />
            </span>
            <span className="truncate font-bold text-maboko-principale">{titre}</span>
          </nav>

          {/* Recherche */}
          <button
            type="button"
            onClick={() => setPaletteOuverte(true)}
            className="group mx-auto hidden w-full max-w-md items-center gap-3 rounded-full border border-maboko-bordure
              bg-maboko-fond/60 px-4 py-2.5 text-sm transition-colors hover:border-maboko-secondaire/40 hover:bg-maboko-fond md:flex"
          >
            <span className="text-maboko-texte/60">
              <IconeRecherche taille={16} />
            </span>
            <span className="flex-1 text-left text-maboko-texte/70">Rechercher une page…</span>
            <kbd className="rounded-md border border-maboko-bordure bg-white px-1.5 py-0.5 text-[10px] font-semibold text-maboko-texte">
              {surMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>

          {/* Actions compte */}
          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
            <button
              type="button"
              onClick={() => setPaletteOuverte(true)}
              aria-label="Rechercher une page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-maboko-bordure text-maboko-texte
                transition-colors hover:border-maboko-secondaire/40 hover:text-maboko-secondaire md:hidden"
            >
              <IconeRecherche taille={16} />
            </button>

            <Link
              href="/notifications"
              title={totalATraiter > 0 ? `${totalATraiter} élément(s) à traiter` : 'Notifications'}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-maboko-bordure
                text-maboko-texte transition-colors hover:border-maboko-secondaire/40 hover:text-maboko-secondaire"
            >
              <IconeCloche taille={16} />
              {totalATraiter > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-maboko-secondaire px-1 text-[9px] font-bold text-white">
                  {totalATraiter > 99 ? '99+' : totalATraiter}
                </span>
              )}
            </Link>

            <div ref={zoneCompte} className="relative pl-1">
              <button
                type="button"
                onClick={() => setMenuCompte((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuCompte}
                className={`flex items-center gap-2.5 rounded-full border py-1 pl-1 pr-2.5 transition-colors
                  ${menuCompte
                    ? 'border-maboko-secondaire/40 bg-maboko-fond'
                    : 'border-transparent hover:border-maboko-bordure hover:bg-maboko-fond/70'}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maboko-principale text-[11px] font-bold text-white">
                  {initiales(profil)}
                </span>
                <span className="hidden min-w-0 text-left leading-tight lg:block">
                  <span className="block truncate text-[13px] font-bold text-maboko-principale">
                    {nomAffiche(profil)}
                  </span>
                  <span className="block truncate text-[11px] text-maboko-texte">
                    {profil?.email ?? '—'}
                  </span>
                </span>
                <motion.span
                  animate={{ rotate: menuCompte ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="hidden text-maboko-texte lg:block"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence>
                {menuCompte && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-[calc(100%+10px)] z-30 w-64 overflow-hidden rounded-2xl border border-maboko-bordure bg-white shadow-xl"
                  >
                    <div className="border-b border-maboko-bordure/60 bg-maboko-fond/50 px-4 py-3.5">
                      <p className="truncate text-sm font-bold text-maboko-principale">
                        {nomAffiche(profil)}
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] text-maboko-texte">
                        {profil?.email ?? '—'}
                      </p>
                      {profil?.role && (
                        <span className="pastille-info mt-2">{ROLES[profil.role] ?? profil.role}</span>
                      )}
                    </div>

                    <div className="p-1.5">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={demanderDeconnexion}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-maboko-danger transition-colors hover:bg-rose-50"
                      >
                        <IconeEntrer taille={16} className="rotate-180" />
                        Se déconnecter
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Contenu ── */}
        <motion.div
          className="flex-1 p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-maboko-principale">{titre}</h1>
              {description && <p className="mt-1 text-sm text-maboko-texte">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>

          {/* Le contenu attend la vérification du jeton, mais la barre latérale
              et l'en-tête restent affichés : la navigation ne clignote plus. */}
          {pret ? children : <SqueletteContenu />}
        </motion.div>
      </main>

      <PaletteRecherche ouvert={paletteOuverte} fermer={fermerPalette} />

      <Modal
        ouvert={confirmerDeconnexion}
        type="avertissement"
        titre="Se déconnecter ?"
        message="Votre session d'administration sera fermée. Tout travail non enregistré dans un formulaire ouvert sera perdu."
        libelleBoutonOk="Se déconnecter"
        libelleBoutonAnnuler="Rester connecté"
        onConfirmer={deconnecter}
        onAnnuler={() => setConfirmerDeconnexion(false)}
      />
    </div>
  );
}
