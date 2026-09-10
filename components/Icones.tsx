import { type SVGProps } from 'react';

type IconeProps = SVGProps<SVGSVGElement> & { taille?: number };

const defaut = (taille: number = 20): SVGProps<SVGSVGElement> => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: taille,
  height: taille,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

/* ── Utilisateurs / Personnes ── */

export function IconeUtilisateur({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconeUtilisateurs({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/* ── Outils / Artisans ── */

export function IconeOutil({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/* ── Transport / Voiture ── */

export function IconeVoiture({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
    </svg>
  );
}

export function IconeMoto({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <circle cx="5" cy="17" r="3" />
      <circle cx="19" cy="17" r="3" />
      <path d="M10 5h4l3 7H7l3-7z" />
      <path d="M5 17h14" />
    </svg>
  );
}

/* ── Finances ── */

export function IconeMonnaie({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function IconeBanque({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M3 22h18" />
      <path d="M6 18V10" />
      <path d="M10 18V10" />
      <path d="M14 18V10" />
      <path d="M18 18V10" />
      <path d="M2 10l10-7 10 7" />
    </svg>
  );
}

export function IconeTransaction({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function IconeGraphique({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

/* ── Étoile / Abonnements ── */

export function IconeEtoile({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ── Missions / Documents ── */

export function IconeDocument({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function IconePressePapiers({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

/* ── Carte / Navigation ── */

export function IconeCarte({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

/* ── Sécurité / Bouclier ── */

export function IconeBouclier({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconeBouclierCheck({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11.5 14.5 15.5 10" />
    </svg>
  );
}

/* ── Alertes / Avertissements ── */

export function IconeAlerte({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function IconeInfo({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/* ── Check / Succès ── */

export function IconeCheck({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconeCheckCercle({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/* ── Croix / Fermer ── */

export function IconeCroix({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconeCroixCercle({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

/* ── Écriture / Édition ── */

export function IconeEdition({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/* ── Balance / Litiges ── */

export function IconeBalance({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M5 8l7-5 7 5" />
      <path d="M5 8l-3 9h6L5 8z" />
      <path d="M19 8l-3 9h6l-3-9z" />
      <line x1="5" y1="17" x2="19" y2="17" />
    </svg>
  );
}

/* ── Horloge / Sablier ── */

export function IconeHorloge({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/* ── Notification / Cloche ── */

export function IconeCloche({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

/* ── Boîte aux lettres / Vide ── */

export function IconeBoiteVide({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

/* ── Téléchargement ── */

export function IconeTelecharger({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ── Carte d'identité ── */

export function IconeCarteID({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 10h4" />
      <path d="M14 14h4" />
      <path d="M6 16c0-1.1.9-2 2-2s2 .9 2 2" />
    </svg>
  );
}

/* ── Inscription / Stylo ── */

export function IconeInscription({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

/* ── Position géographique ── */

export function IconePosition({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* ── Flèche / Direction ── */

export function IconeFleche({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Poubelle / Supprimer ── */

export function IconePoubelle({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

/* ── Publication / Post ── */

export function IconePublication({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/* ── Tendance hausse / baisse ── */

export function IconeTendanceHausse({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function IconeTendanceBaisse({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

/* ── Rafraîchir ── */

export function IconeRefresh({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

/* ── Écriture manuscrite ── */

export function IconePlume({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

/* ── Authentification (page de connexion) ── */

export function IconeEnveloppe({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

export function IconeCadenas({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconeOeil({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconeOeilBarre({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ── Connexion / Entrer ── */

export function IconeEntrer({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

/* ── Navigation / Fil d'Ariane ── */

export function IconeMaison({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

export function IconeRecherche({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconeChevronDroite({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function IconeChevronGauche({ taille, ...props }: IconeProps) {
  return (
    <svg {...defaut(taille)} {...props}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
