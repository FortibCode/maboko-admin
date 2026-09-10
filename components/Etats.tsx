'use client';

/* -----------------------------------------------------------------------
   États de chargement, vide et erreur — socle commun à toutes les pages
----------------------------------------------------------------------- */

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { IconeAlerte, IconeBoiteVide, IconeRefresh } from '@/components/Icones';

const apparition = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function Chargement({ message = 'Chargement en cours…' }: { message?: string }) {
  return (
    <div
      className="carte flex flex-col items-center justify-center gap-5 py-20"
      aria-busy="true"
      role="status"
    >
      <div className="relative h-14 w-14">
        {/* Anneau de fond */}
        <div className="absolute inset-0 rounded-full border-[3px] border-maboko-bordure/70" />
        {/* Arc tournant */}
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-maboko-secondaire border-r-maboko-accent" />
        {/* Pastille centrale pulsée */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-maboko-accent animate-pulse-dot" />
        </div>
      </div>
      <p className="text-sm font-medium text-maboko-texte">{message}</p>
    </div>
  );
}

export function EtatVide({
  titre,
  message,
  icone,
  action,
}: {
  titre: string;
  message?: string;
  icone?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div {...apparition} className="carte flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        {/* Halo diffus derrière le médaillon */}
        <div
          className="absolute -inset-6 rounded-full opacity-70 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(234,160,35,0.22) 0%, transparent 70%)' }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-maboko-bordure bg-gradient-to-br from-white to-maboko-fond text-maboko-secondaire shadow-sm">
          {icone ?? <IconeBoiteVide taille={34} />}
        </div>
      </div>

      <p className="text-lg font-bold text-maboko-principale">{titre}</p>
      {message && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-maboko-texte">{message}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

export function EtatErreur({
  message,
  onReessayer,
}: {
  message: string;
  onReessayer?: () => void;
}) {
  return (
    <motion.div {...apparition} className="carte flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div
          className="absolute -inset-6 rounded-full opacity-70 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(158,43,34,0.18) 0%, transparent 70%)' }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white text-maboko-danger shadow-sm">
          <IconeAlerte taille={34} />
        </div>
      </div>

      <p className="text-lg font-bold text-maboko-danger">Chargement impossible</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-maboko-texte">{message}</p>
      {onReessayer && (
        <button type="button" onClick={onReessayer} className="bouton-secondaire mt-6 gap-2">
          <IconeRefresh taille={15} />
          Réessayer
        </button>
      )}
    </motion.div>
  );
}
