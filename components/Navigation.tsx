'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ══════════════════════════════════════════════════════
   ICÔNES SVG (multi-path)
══════════════════════════════════════════════════════ */
function SvgIcon({ children, size = 18 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="shrink-0">
      {children}
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  dashboard: <SvgIcon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></SvgIcon>,
  users: <SvgIcon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></SvgIcon>,
  artisan: <SvgIcon><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></SvgIcon>,
  chauffeur: <SvgIcon><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="9" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></SvgIcon>,
  shield: <SvgIcon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></SvgIcon>,
  activity: <SvgIcon><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></SvgIcon>,
  briefcase: <SvgIcon><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></SvgIcon>,
  dollar: <SvgIcon><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></SvgIcon>,
  bell: <SvgIcon><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></SvgIcon>,
  log: <SvgIcon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></SvgIcon>,
  verify: <SvgIcon><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></SvgIcon>,
  star: <SvgIcon><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SvgIcon>,
  map: <SvgIcon><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></SvgIcon>,
  logout: <SvgIcon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></SvgIcon>,
};

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface SousLien { href: string; libelle: string; iconeKey?: string; compteClef?: string; }
interface Groupe { id: string; libelle: string; iconeKey: string; sousLiens: SousLien[]; }
interface LienSimple { href: string; libelle: string; iconeKey: string; compteClef?: string; }
type EntreeNav = { type: 'lien'; data: LienSimple } | { type: 'groupe'; data: Groupe };

/* ══════════════════════════════════════════════════════
   STRUCTURE DE NAVIGATION
══════════════════════════════════════════════════════ */
export const ENTREES_NAV: EntreeNav[] = [
  { type: 'lien', data: { href: '/', libelle: 'Tableau de bord', iconeKey: 'dashboard' } },
  {
    type: 'groupe',
    data: {
      id: 'utilisateurs', libelle: 'Gestion des acteurs', iconeKey: 'users',
      sousLiens: [
        { href: '/utilisateurs', libelle: 'Tous les comptes', iconeKey: 'users' },
        { href: '/artisans', libelle: 'Artisans', iconeKey: 'artisan', compteClef: 'artisansAValider' },
        { href: '/chauffeurs', libelle: 'Chauffeurs', iconeKey: 'chauffeur', compteClef: 'chauffeursAValider' },
        { href: '/verifications', libelle: 'Vérifications ID', iconeKey: 'verify', compteClef: 'identitesAVerifier' },
      ],
    },
  },
  {
    type: 'groupe',
    data: {
      id: 'activite', libelle: 'Missions & courses', iconeKey: 'activity',
      sousLiens: [
        { href: '/missions', libelle: 'Missions', iconeKey: 'briefcase' },
        { href: '/courses', libelle: 'Allô Chauffeur', iconeKey: 'map' },
        { href: '/metiers', libelle: 'Métiers', iconeKey: 'artisan' },
      ],
    },
  },
  {
    type: 'groupe',
    data: {
      id: 'finances', libelle: 'Finances & trésorerie', iconeKey: 'dollar',
      sousLiens: [
        { href: '/finances', libelle: 'Transactions', iconeKey: 'dollar' },
        { href: '/abonnements', libelle: 'Abonnements', iconeKey: 'star' },
      ],
    },
  },
  {
    type: 'groupe',
    data: {
      id: 'moderation', libelle: 'Modération & audit', iconeKey: 'shield',
      sousLiens: [
        { href: '/moderation', libelle: 'Signalements', iconeKey: 'shield', compteClef: 'signalements' },
        { href: '/litiges', libelle: 'Litiges', iconeKey: 'shield', compteClef: 'litigesOuverts' },
        { href: '/notifications', libelle: 'Notifications', iconeKey: 'bell' },
        { href: '/audit-logs', libelle: "Logs d'audit", iconeKey: 'log' },
      ],
    },
  },
];

/* ══════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════ */
export function Navigation({
  aTraiter,
  enLigne,
  onDeconnexion,
}: {
  aTraiter?: Record<string, number>;
  enLigne?: boolean;
  onDeconnexion: () => void;
}) {
  const chemin = usePathname();

  const groupeInitial = () => {
    const ouvert: Record<string, boolean> = {};
    for (const e of ENTREES_NAV) {
      if (e.type === 'groupe') {
        const actif = e.data.sousLiens.some((s) => chemin === s.href || chemin.startsWith(s.href + '/'));
        if (actif) ouvert[e.data.id] = true;
      }
    }
    return ouvert;
  };

  const [groupesOuverts, setGroupesOuverts] = useState<Record<string, boolean>>(groupeInitial);
  const [replie, setReplie] = useState(false);

  const basculerGroupe = (id: string) => {
    // Replié, la liste des sous-liens n'a nulle part où s'afficher : on
    // redéploie la barre avant d'ouvrir le groupe.
    if (replie) setReplie(false);
    setGroupesOuverts((p) => ({ ...p, [id]: !p[id] }));
  };

  const nbATraiter = (clef?: string) => (clef && aTraiter ? aTraiter[clef] ?? 0 : 0);

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col self-start text-white transition-[width] duration-300 ease-out
        ${replie ? 'w-[78px]' : 'w-[276px]'}`}
      style={{
        background: 'linear-gradient(175deg, #2A1A12 0%, #1C1210 45%, #150D0B 100%)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* ══ EN-TÊTE : logo, marque, repli ══ */}
      <div className="px-4 pt-5 pb-4">
        <div className={`flex gap-3 ${replie ? 'flex-col items-center' : 'items-center'}`}>
          <Link
            href="/"
            title="Retour au tableau de bord"
            className={`flex min-w-0 items-center gap-3 rounded-2xl transition-opacity hover:opacity-80
              ${replie ? '' : 'flex-1'}`}
          >
            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white ring-2 ring-maboko-accent/30">
              <Image src="/maboko-logo.jpg" alt="Maboko" fill className="object-cover" priority />
            </span>
            {!replie && (
              <span className="min-w-0 flex-1 truncate text-[19px] font-extrabold tracking-tight">
                Mabok<span className="text-maboko-accent">o</span>
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setReplie((v) => !v)}
            aria-label={replie ? 'Déplier le menu' : 'Replier le menu'}
            title={replie ? 'Déplier le menu' : 'Replier le menu'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15
              text-white/60 transition-colors hover:border-white/30 hover:text-white"
          >
            <motion.span animate={{ rotate: replie ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.span>
          </button>
        </div>

        {!replie && (
          <div className="mt-2.5 flex items-center gap-2 pl-1">
            <span className="h-1.5 w-1.5 rounded-full bg-maboko-accent" />
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Espace admin
            </span>
          </div>
        )}
      </div>

      {/* ══ NAVIGATION ══ */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-3" style={{ scrollbarWidth: 'none' }}>
        {ENTREES_NAV.map((entree) => {
          /* — Lien simple — */
          if (entree.type === 'lien') {
            const { href, libelle, iconeKey, compteClef } = entree.data;
            const actif = chemin === href;
            const nb = nbATraiter(compteClef);

            return (
              <Link
                key={href}
                href={href}
                title={replie ? libelle : undefined}
                className={`relative flex items-center gap-3 rounded-2xl py-2.5 text-sm font-semibold transition-all duration-200
                  ${replie ? 'justify-center px-0' : 'px-3'}
                  ${actif ? 'text-white' : 'border border-transparent text-white/55 hover:bg-white/[0.05] hover:text-white/85'}`}
                style={actif ? {
                  background: 'linear-gradient(100deg, #B35B28 0%, #8E4520 100%)',
                  boxShadow: '0 6px 18px -6px rgba(179, 91, 40, 0.6)',
                } : undefined}
              >
                {actif && !replie && (
                  <span className="absolute -left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-maboko-accent" />
                )}
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors
                  ${actif ? 'bg-white/15 text-white' : 'text-white/45'}`}>
                  {ICONS[iconeKey]}
                </span>
                {!replie && <span className="flex-1 truncate">{libelle}</span>}
                {nb > 0 && !replie && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-maboko-accent text-[9px] font-bold text-maboko-principale">
                    {nb}
                  </span>
                )}
              </Link>
            );
          }

          /* — Groupe déroulant — */
          const { id, libelle, iconeKey, sousLiens } = entree.data;
          const ouvert = !!groupesOuverts[id];
          const aUnActif = sousLiens.some((s) => chemin === s.href || chemin.startsWith(s.href + '/'));
          const totalGroupe = sousLiens.reduce((s, sl) => s + nbATraiter(sl.compteClef), 0);

          return (
            <div key={id}>
              <button
                type="button"
                onClick={() => basculerGroupe(id)}
                title={replie ? libelle : undefined}
                className={`flex w-full items-center gap-2.5 border py-2.5 text-[10.5px] font-bold uppercase tracking-[0.05em] transition-all duration-200
                  ${replie ? 'justify-center px-0' : 'px-3'}
                  ${/* Ouvert, l'en-tête perd ses coins bas et sa bordure basse :
                       il se soude au panneau de sous-liens au lieu de flotter
                       au-dessus comme une pastille sans rapport. */ ''}
                  ${ouvert && !replie ? 'rounded-t-2xl rounded-b-none border-b-transparent' : 'rounded-2xl'}
                  ${aUnActif
                    ? 'border-maboko-accent/25 bg-white/[0.07] text-white'
                    : 'border-white/[0.07] bg-white/[0.035] text-white/60 hover:bg-white/[0.06] hover:text-white/85'}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                  ${aUnActif ? 'text-maboko-accent' : 'text-white/45'}`}>
                  {ICONS[iconeKey]}
                </span>
                {!replie && <span className="flex-1 truncate text-left">{libelle}</span>}
                {totalGroupe > 0 && !ouvert && !replie && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-maboko-accent text-[9px] font-bold text-maboko-principale">
                    {totalGroupe}
                  </span>
                )}
                {!replie && (
                  <motion.span
                    animate={{ rotate: ouvert ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-white/35"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {ouvert && !replie && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`space-y-0.5 rounded-b-2xl border border-t-0 p-1.5
                        ${aUnActif
                          ? 'border-maboko-accent/25 bg-white/[0.04]'
                          : 'border-white/[0.07] bg-white/[0.02]'}`}
                    >
                      {sousLiens.map((sl) => {
                        const actif = chemin === sl.href || chemin.startsWith(sl.href + '/');
                        const nb = nbATraiter(sl.compteClef);
                        return (
                          <Link
                            key={sl.href}
                            href={sl.href}
                            className={`relative flex items-center gap-2.5 rounded-xl py-2 pl-3 pr-2.5 text-[13px] font-medium transition-all duration-150
                              ${actif
                                ? 'bg-white/[0.09] text-white'
                                : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'}`}
                          >
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${actif ? 'bg-maboko-accent' : 'bg-white/20'}`} />
                            <span className="flex-1 truncate">{sl.libelle}</span>
                            {nb > 0 && (
                              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-maboko-accent px-1 text-[9px] font-bold text-maboko-principale">
                                {nb}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ══ PIED : état de l'API + déconnexion ══ */}
      <div className="space-y-2.5 border-t border-white/[0.07] px-3 py-4">
        <div
          title={enLigne === false ? 'API Maboko injoignable' : 'API Maboko joignable'}
          className={`flex items-center rounded-xl border border-white/[0.07] bg-white/[0.035] py-2.5
            ${replie ? 'justify-center px-0' : 'gap-2.5 px-3'}`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${enLigne === false ? 'bg-maboko-danger' : 'bg-emerald-400'}`} />
          {!replie && (
            <span className="truncate text-[11.5px] font-medium text-white/60">
              {enLigne === false ? 'API injoignable' : 'Système opérationnel'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onDeconnexion}
          title={replie ? 'Déconnexion' : undefined}
          className={`flex w-full items-center rounded-xl border border-maboko-danger/30 bg-maboko-danger/10 py-2.5
            transition-colors hover:border-maboko-danger/50 hover:bg-maboko-danger/20
            ${replie ? 'justify-center px-0' : 'gap-2.5 px-3'}`}
        >
          <span className="shrink-0 text-red-400">{ICONS.logout}</span>
          {!replie && (
            <>
              <span className="flex-1 text-left text-[13px] font-bold text-red-400">Déconnexion</span>
              <span className="text-[11px] font-medium text-red-400/60">Quitter</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
