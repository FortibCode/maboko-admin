'use client';

import { type ReactNode, useId } from 'react';
import { motion } from 'framer-motion';

/**
 * Bandeau de filtres.
 *
 * Les champs de filtrage flottaient jusqu'ici directement sur le fond de page :
 * les regrouper dans une surface leur donne un statut de barre d'outils et
 * sépare nettement « ce qui pilote la liste » de « la liste ».
 */
export function BarreOutils({ children }: { children: ReactNode }) {
  return (
    <div className="carte mb-6 flex flex-wrap items-center gap-3 !p-3">{children}</div>
  );
}

/** Sélecteur segmenté : la pastille active glisse d'un onglet à l'autre. */
export function Segmente<T extends string>({
  options,
  valeur,
  onChange,
}: {
  options: { valeur: T; libelle: string; compte?: number }[];
  valeur: T;
  onChange: (valeur: T) => void;
}) {
  // Un identifiant par instance, sinon deux sélecteurs de la même page
  // partageraient la pastille et se la voleraient en glissant.
  const identifiant = useId();

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl bg-maboko-fond p-1">
      {options.map((option) => {
        const actif = option.valeur === valeur;
        return (
          <button
            key={option.valeur}
            type="button"
            onClick={() => onChange(option.valeur)}
            aria-pressed={actif}
            className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200
              ${actif ? 'text-white' : 'text-maboko-texte hover:text-maboko-principale'}`}
          >
            {actif && (
              <motion.span
                layoutId={`segmente${identifiant}`}
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'linear-gradient(100deg, #B35B28 0%, #8E4520 100%)',
                  boxShadow: '0 4px 14px -5px rgba(179, 91, 40, 0.6)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
              {option.libelle}
              {option.compte !== undefined && option.compte > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums
                    ${actif ? 'bg-white/25 text-white' : 'bg-maboko-bordure text-maboko-principale'}`}
                >
                  {option.compte}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
