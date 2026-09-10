'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* -----------------------------------------------------------------------
   Modale de confirmation professionnelle
   Remplace les window.confirm / window.alert natifs par une interface
   adaptée à la charte graphique Maboko.
----------------------------------------------------------------------- */

export type TypeModal = 'danger' | 'info' | 'succes' | 'avertissement';

interface PropsModal {
  ouvert: boolean;
  type?: TypeModal;
  titre: string;
  message: string;
  libelleBoutonOk?: string;
  libelleBoutonAnnuler?: string;
  onConfirmer: () => void;
  onAnnuler: () => void;
}

/* SVG icons for each modal type */
function IconeModal({ type }: { type: TypeModal }) {
  if (type === 'danger') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (type === 'succes') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (type === 'avertissement') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  /* info */
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

const STYLES: Record<TypeModal, { bg: string; texte: string }> = {
  danger:       { bg: 'bg-red-50 text-maboko-danger',    texte: 'text-maboko-danger' },
  info:         { bg: 'bg-blue-50 text-blue-700',         texte: 'text-blue-700' },
  succes:       { bg: 'bg-green-50 text-maboko-succes',   texte: 'text-maboko-succes' },
  avertissement:{ bg: 'bg-amber-50 text-amber-700',       texte: 'text-amber-700' },
};

export function Modal({
  ouvert,
  type = 'info',
  titre,
  message,
  libelleBoutonOk = 'Confirmer',
  libelleBoutonAnnuler = 'Annuler',
  onConfirmer,
  onAnnuler,
}: PropsModal) {
  const btnConfirmer = useRef<HTMLButtonElement>(null);
  const style = STYLES[type];

  useEffect(() => {
    if (ouvert) {
      // Fermer avec Echap
      const gestion = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onAnnuler();
      };
      window.addEventListener('keydown', gestion);
      // Focus automatique sur confirmer
      setTimeout(() => btnConfirmer.current?.focus(), 50);
      return () => window.removeEventListener('keydown', gestion);
    }
  }, [ouvert, onAnnuler]);

  return (
    <AnimatePresence>
      {ouvert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) onAnnuler();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titre"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="modal-contenu"
          >
        {/* Icône SVG */}
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${style.bg}`}>
          <IconeModal type={type} />
        </div>

        {/* Contenu */}
        <h2 id="modal-titre" className={`text-lg font-bold ${style.texte}`}>
          {titre}
        </h2>
        <p className="mt-2 text-sm text-maboko-texte leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button type="button" onClick={onAnnuler} className="bouton-secondaire flex-1 sm:flex-none">
            {libelleBoutonAnnuler}
          </button>
          <button
            ref={btnConfirmer}
            type="button"
            onClick={onConfirmer}
            className={
              type === 'danger'
                ? 'bouton-danger flex-1 sm:flex-none !py-2.5 !px-5'
                : type === 'succes'
                ? 'bouton-succes flex-1 sm:flex-none !py-2.5 !px-5'
                : 'bouton-principal flex-1 sm:flex-none'
            }
          >
            {libelleBoutonOk}
          </button>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}

/* -----------------------------------------------------------------------
   Modale d'alerte simple (sans annuler)
----------------------------------------------------------------------- */
interface PropsAlerte {
  ouvert: boolean;
  type?: TypeModal;
  titre: string;
  message: string;
  libelleBouton?: string;
  onFermer: () => void;
}

export function Alerte({
  ouvert,
  type = 'info',
  titre,
  message,
  libelleBouton = 'Fermer',
  onFermer,
}: PropsAlerte) {
  const style = STYLES[type];

  useEffect(() => {
    if (ouvert) {
      const gestion = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter') onFermer();
      };
      window.addEventListener('keydown', gestion);
      return () => window.removeEventListener('keydown', gestion);
    }
  }, [ouvert, onFermer]);

  return (
    <AnimatePresence>
      {ouvert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) onFermer();
          }}
          role="alertdialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="modal-contenu text-center"
          >
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${style.bg}`}>
          <IconeModal type={type} />
        </div>
        <h2 className={`text-lg font-bold ${style.texte}`}>{titre}</h2>
        <p className="mt-2 text-sm text-maboko-texte leading-relaxed">{message}</p>
        <button type="button" onClick={onFermer} className="bouton-principal mt-6 w-full">
          {libelleBouton}
        </button>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
