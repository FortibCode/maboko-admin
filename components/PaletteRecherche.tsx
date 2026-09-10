'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ENTREES_NAV } from './Navigation';
import { IconeRecherche, IconeChevronDroite } from './Icones';

type Destination = { href: string; libelle: string; section: string };

/** Aplatit l'arborescence de navigation en une liste de destinations. */
const DESTINATIONS: Destination[] = ENTREES_NAV.flatMap((entree) =>
  entree.type === 'lien'
    ? [{ href: entree.data.href, libelle: entree.data.libelle, section: 'Général' }]
    : entree.data.sousLiens.map((sl) => ({
        href: sl.href,
        libelle: sl.libelle,
        section: entree.data.libelle,
      })),
);

/** Minuscules sans accents, pour que « moderation » trouve « Modération ». */
const normaliser = (texte: string) =>
  texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Palette de navigation rapide (⌘K / Ctrl+K).
 *
 * Elle parcourt les pages du back-office, pas les données métier : l'API
 * n'expose pas de recherche globale, et un champ qui promettrait de trouver
 * une commande ou un compte sans le pouvoir serait trompeur.
 */
export function PaletteRecherche({ ouvert, fermer }: { ouvert: boolean; fermer: () => void }) {
  const router = useRouter();
  const [requete, setRequete] = useState('');
  const [surligne, setSurligne] = useState(0);

  const resultats = useMemo(() => {
    const q = normaliser(requete.trim());
    if (!q) return DESTINATIONS;
    return DESTINATIONS.filter(
      (d) => normaliser(d.libelle).includes(q) || normaliser(d.section).includes(q),
    );
  }, [requete]);

  useEffect(() => {
    if (!ouvert) return;

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        fermer();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSurligne((i) => (resultats.length ? (i + 1) % resultats.length : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSurligne((i) => (resultats.length ? (i - 1 + resultats.length) % resultats.length : 0));
        return;
      }
      if (e.key === 'Enter' && resultats[surligne]) {
        e.preventDefault();
        router.push(resultats[surligne].href);
        fermer();
      }
    };

    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [ouvert, resultats, surligne, router, fermer]);

  const choisir = (href: string) => {
    router.push(href);
    fermer();
  };

  return (
    <AnimatePresence>
      {ouvert && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-maboko-principale/40 p-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={fermer}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-maboko-bordure bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-maboko-bordure px-4 py-3.5">
              <span className="text-maboko-texte/60">
                <IconeRecherche taille={18} />
              </span>
              <input
                autoFocus
                value={requete}
                onChange={(e) => {
                  setRequete(e.target.value);
                  setSurligne(0);
                }}
                placeholder="Rechercher une page du back-office…"
                aria-label="Rechercher une page du back-office"
                className="flex-1 bg-transparent text-sm text-maboko-principale outline-none placeholder:text-maboko-texte/60"
              />
              <kbd className="rounded-md border border-maboko-bordure px-1.5 py-0.5 text-[10px] font-semibold text-maboko-texte">
                Échap
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {resultats.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-maboko-texte">
                  Aucune page ne correspond à « {requete} ».
                </p>
              ) : (
                resultats.map((d, i) => (
                  <button
                    key={d.href}
                    type="button"
                    onMouseEnter={() => setSurligne(i)}
                    onClick={() => choisir(d.href)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors
                      ${i === surligne ? 'bg-maboko-fond' : ''}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-maboko-principale">
                        {d.libelle}
                      </span>
                      <span className="block truncate text-[11px] text-maboko-texte">{d.section}</span>
                    </span>
                    <span className={i === surligne ? 'text-maboko-secondaire' : 'text-maboko-texte/40'}>
                      <IconeChevronDroite taille={15} />
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
