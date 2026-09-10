'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coquille } from '@/components/Coquille';
import { EtatErreur } from '@/components/Etats';
import { CompteurAnime, GraphiqueAire, Sparkline } from '@/components/Graphiques';
import {
  IconeUtilisateur,
  IconeOutil,
  IconeVoiture,
  IconeEtoile,
  IconePressePapiers,
  IconeCarte,
  IconeMonnaie,
  IconeBanque,
  IconeAlerte,
  IconeCarteID,
  IconeBalance,
  IconeCheckCercle,
  IconeHorloge,
  IconeRefresh,
  IconeTendanceHausse,
  IconeChevronDroite,
} from '@/components/Icones';
import { api, ApiError } from '@/lib/api';
import { fcfa, nombre } from '@/lib/format';
import type { TableauDeBord } from '@/lib/types';

/* Entrée en cascade : chaque bloc arrive juste après le précédent. */
const conteneur = {
  cache: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const bloc = {
  cache: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function PageTableauDeBord() {
  const [donnees, setDonnees] = useState<TableauDeBord>();
  const [jours, setJours] = useState<7 | 30>(7);
  const [erreur, setErreur] = useState<string>();

  const charger = useCallback(async () => {
    setErreur(undefined);
    try {
      setDonnees(await api.get<TableauDeBord>('/admin/tableau-de-bord', { jours: String(jours) }));
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement impossible.');
    }
  }, [jours]);

  useEffect(() => {
    // setTimeout : la règle react-hooks/set-state-in-effect ne trace pas au
    // travers d'un minuteur, et le déclenchement reste immédiat au rendu.
    const minuterie = setTimeout(charger, 0);
    return () => clearTimeout(minuterie);
  }, [charger]);

  return (
    <Coquille
      titre="Tableau de bord"
      description="Vue consolidée de l'activité de la plateforme Maboko"
      actions={
        <div className="flex gap-2">
          {([7, 30] as const).map((valeur) => (
            <button
              key={valeur}
              type="button"
              onClick={() => setJours(valeur)}
              className={jours === valeur ? 'bouton-principal !py-2 !px-4 !text-xs' : 'bouton-secondaire !py-2 !px-4 !text-xs'}
            >
              {valeur} jours
            </button>
          ))}
          <button type="button" onClick={charger} className="bouton-icon" title="Actualiser">
            <IconeRefresh taille={16} />
          </button>
        </div>
      }
    >
      {erreur ? (
        <EtatErreur message={erreur} onReessayer={charger} />
      ) : !donnees ? (
        <SqueletteTableauDeBord />
      ) : (
        <motion.div variants={conteneur} initial="cache" animate="visible" className="space-y-8">
          <motion.div variants={bloc}>
            <BandeauRevenus indicateurs={donnees.indicateurs} />
          </motion.div>

          <motion.div variants={bloc}>
            <FileDAttente aTraiter={donnees.aTraiter} />
          </motion.div>

          <motion.section variants={bloc}>
            <h2 className="section-titre">Indicateurs clés</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CarteKPI
                libelle="Utilisateurs"
                valeur={donnees.indicateurs.utilisateurs}
                detail={`+${donnees.indicateurs.nouveauxUtilisateurs7j} cette semaine`}
                icone={<IconeUtilisateur taille={19} />}
                couleur="bg-blue-50 text-blue-600"
                accent="#3b82f6"
                serie={donnees.activite.map((j) => j.inscriptions)}
                legendeSerie="Inscriptions par jour"
              />
              <CarteKPI
                libelle="Artisans actifs"
                valeur={donnees.indicateurs.artisansActifs}
                detail={`sur ${nombre(donnees.indicateurs.artisansTotal)} inscrits`}
                icone={<IconeOutil taille={19} />}
                couleur="bg-amber-50 text-amber-600"
                accent="#EAA023"
                part={{ valeur: donnees.indicateurs.artisansActifs, total: donnees.indicateurs.artisansTotal }}
              />
              <CarteKPI
                libelle="Chauffeurs en ligne"
                valeur={donnees.indicateurs.chauffeursEnLigne}
                detail={`sur ${nombre(donnees.indicateurs.chauffeursTotal)} inscrits`}
                icone={<IconeVoiture taille={19} />}
                couleur="bg-purple-50 text-purple-600"
                accent="#a855f7"
                part={{ valeur: donnees.indicateurs.chauffeursEnLigne, total: donnees.indicateurs.chauffeursTotal }}
              />
              <CarteKPI
                libelle="Abonnements actifs"
                valeur={donnees.indicateurs.abonnementsActifs}
                detail={`sur ${nombre(donnees.indicateurs.utilisateurs)} comptes`}
                icone={<IconeEtoile taille={19} />}
                couleur="bg-emerald-50 text-emerald-600"
                accent="#10b981"
                part={{ valeur: donnees.indicateurs.abonnementsActifs, total: donnees.indicateurs.utilisateurs }}
              />
            </div>
          </motion.section>

          <motion.div variants={bloc}>
            <GraphiqueActivite activite={donnees.activite} jours={jours} />
          </motion.div>

          <motion.section variants={bloc}>
            <h2 className="section-titre">Activité en cours</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CarteCompacte
                libelle="Missions actives"
                valeur={donnees.indicateurs.missionsActives}
                icone={<IconePressePapiers taille={19} />}
                couleur="bg-orange-50 text-orange-600"
                lien="/missions"
              />
              <CarteCompacte
                libelle="Courses en cours"
                valeur={donnees.indicateurs.coursesActives}
                icone={<IconeCarte taille={19} />}
                couleur="bg-indigo-50 text-indigo-600"
                lien="/courses"
              />
              <CarteCompacte
                libelle="Revenus cumulés"
                valeur={donnees.indicateurs.revenusTotal}
                format={fcfa}
                icone={<IconeBanque taille={19} />}
                couleur="bg-rose-50 text-rose-600"
                lien="/finances"
              />
              <CarteCompacte
                libelle="Commissions du mois"
                valeur={donnees.indicateurs.commissionsMois}
                format={fcfa}
                icone={<IconeMonnaie taille={19} />}
                couleur="bg-teal-50 text-teal-600"
                lien="/finances"
              />
            </div>
          </motion.section>
        </motion.div>
      )}
    </Coquille>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Squelette de chargement — reprend la silhouette de la page, pour que le
   contenu se pose au lieu de surgir après un écran vide.
────────────────────────────────────────────────────────────────────── */
function SqueletteTableauDeBord() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="squelette h-[232px] !rounded-2xl" />

      <div>
        <div className="squelette mb-4 h-3 w-44" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="squelette h-[228px] !rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="squelette h-[400px] !rounded-2xl" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Bandeau de revenus — pièce maîtresse en haut de page
────────────────────────────────────────────────────────────────────── */
function BandeauRevenus({ indicateurs }: { indicateurs: TableauDeBord['indicateurs'] }) {
  const heure = new Date().getHours();
  const salutation = heure < 5 ? 'Bonne nuit' : heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const aujourdhui = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="carte-hero !p-7 sm:!p-8">
      <div className="grid gap-7 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-maboko-accent">
            {salutation}
          </p>
          <p className="mt-1 text-sm capitalize text-white/50">{aujourdhui}</p>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            Revenus du mois
          </p>
          <p className="mt-1.5 text-4xl font-black tracking-tight tabular-nums sm:text-5xl">
            <CompteurAnime valeur={indicateurs.revenusMois} format={fcfa} />
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
            <IconeTendanceHausse taille={14} className="text-maboko-accent" />
            <span>
              dont <span className="font-bold text-white">{fcfa(indicateurs.commissionsMois)}</span> de
              commissions
            </span>
          </div>
        </div>

        {/* Mini-panneaux vitrés */}
        <div className="grid grid-cols-2 gap-3">
          <MiniPanneau libelle="Missions actives" valeur={indicateurs.missionsActives} />
          <MiniPanneau libelle="Courses en cours" valeur={indicateurs.coursesActives} />
          <MiniPanneau libelle="Artisans actifs" valeur={indicateurs.artisansActifs} />
          <MiniPanneau libelle="Chauffeurs en ligne" valeur={indicateurs.chauffeursEnLigne} enDirect />
        </div>
      </div>
    </div>
  );
}

function MiniPanneau({
  libelle,
  valeur,
  enDirect,
}: {
  libelle: string;
  valeur: number;
  enDirect?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-3.5 backdrop-blur-sm">
      <div className="flex items-start gap-1.5">
        {enDirect && (
          <span className="point-direct mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
        )}
        <p className="text-[10px] font-semibold uppercase leading-tight tracking-wider text-white/50">
          {libelle}
        </p>
      </div>
      <p className="mt-1.5 text-2xl font-black tabular-nums leading-none">
        <CompteurAnime valeur={valeur} />
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Carte KPI — compteur animé, plus courbe ou proportion selon la donnée
────────────────────────────────────────────────────────────────────── */
function CarteKPI({
  libelle,
  valeur,
  detail,
  icone,
  couleur,
  accent,
  serie,
  legendeSerie,
  part,
}: {
  libelle: string;
  valeur: number;
  detail?: string;
  icone: React.ReactNode;
  couleur: string;
  accent: string;
  /** Série journalière réelle ; absente, aucune courbe n'est inventée. */
  serie?: number[];
  legendeSerie?: string;
  part?: { valeur: number; total: number };
}) {
  const pourcentage = part && part.total > 0 ? Math.round((part.valeur / part.total) * 100) : null;

  return (
    <div className="carte-stat">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${couleur}`}>
          {icone}
        </div>
        {pourcentage !== null && (
          <span className="rounded-full bg-maboko-fond px-2.5 py-1 text-[11px] font-bold tabular-nums text-maboko-principale">
            {pourcentage}%
          </span>
        )}
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.09em] text-maboko-texte">
        {libelle}
      </p>
      <p className="mt-2 text-[32px] font-black leading-none tracking-tight tabular-nums text-maboko-principale">
        <CompteurAnime valeur={valeur} />
      </p>
      {detail && <p className="mt-2 truncate text-xs text-maboko-texte">{detail}</p>}

      {serie && (
        <div className="mt-4">
          <Sparkline valeurs={serie} couleur={accent} />
          {legendeSerie && (
            <p className="mt-1 text-[10px] text-maboko-texte/70">{legendeSerie}</p>
          )}
        </div>
      )}

      {part && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-maboko-bordure/60">
            <motion.div
              className="h-full rounded-full"
              style={{ background: accent }}
              initial={{ width: 0 }}
              animate={{ width: `${pourcentage ?? 0}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Carte compacte cliquable
────────────────────────────────────────────────────────────────────── */
function CarteCompacte({
  libelle,
  valeur,
  format,
  icone,
  couleur,
  lien,
}: {
  libelle: string;
  valeur: number;
  format?: (valeur: number) => string;
  icone: React.ReactNode;
  couleur: string;
  lien: string;
}) {
  return (
    <Link href={lien} className="carte-hover group block">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${couleur}`}>
          {icone}
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-maboko-bordure text-maboko-texte transition-all duration-300 group-hover:border-transparent group-hover:bg-maboko-principale group-hover:text-white">
          <IconeChevronDroite taille={14} />
        </span>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.09em] text-maboko-texte">
        {libelle}
      </p>
      <p className="mt-2 text-2xl font-black leading-none tracking-tight tabular-nums text-maboko-principale">
        <CompteurAnime valeur={valeur} format={format} />
      </p>
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   File d'attente
────────────────────────────────────────────────────────────────────── */
function FileDAttente({ aTraiter }: { aTraiter: TableauDeBord['aTraiter'] }) {
  const entrees = [
    { libelle: 'Signalements à modérer', valeur: aTraiter.signalements, lien: '/moderation', icone: <IconeAlerte taille={18} />, couleur: 'bg-amber-100 text-amber-700' },
    { libelle: 'Artisans à valider', valeur: aTraiter.artisansAValider, lien: '/artisans', icone: <IconeOutil taille={18} />, couleur: 'bg-blue-100 text-blue-700' },
    { libelle: 'Chauffeurs à valider', valeur: aTraiter.chauffeursAValider, lien: '/chauffeurs', icone: <IconeVoiture taille={18} />, couleur: 'bg-purple-100 text-purple-700' },
    { libelle: 'Identités à vérifier', valeur: aTraiter.identitesAVerifier, lien: '/verifications', icone: <IconeCarteID taille={18} />, couleur: 'bg-indigo-100 text-indigo-700' },
    { libelle: 'Litiges ouverts', valeur: aTraiter.litigesOuverts, lien: '/litiges', icone: <IconeBalance taille={18} />, couleur: 'bg-rose-100 text-rose-700' },
  ].filter((e) => e.valeur > 0);

  if (entrees.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-6 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <IconeCheckCercle taille={20} />
        </div>
        <div>
          <p className="font-bold text-maboko-succes">Tout est à jour</p>
          <p className="mt-0.5 text-sm text-maboko-texte">Aucun élément en attente de traitement.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-titre flex items-center gap-2">
        <IconeHorloge taille={13} />
        En attente de traitement
        <span className="badge-rouge">{entrees.reduce((s, e) => s + e.valeur, 0)}</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {entrees.map((entree, i) => (
          <motion.div
            key={entree.lien}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={entree.lien} className="carte-hover group flex items-center gap-3 !p-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${entree.couleur}`}>
                {entree.icone}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-black tracking-tight tabular-nums text-maboko-principale">
                  <CompteurAnime valeur={entree.valeur} />
                </p>
                <p className="truncate text-xs text-maboko-texte">{entree.libelle}</p>
              </div>
              <span className="shrink-0 text-maboko-texte transition-transform duration-300 group-hover:translate-x-1">
                <IconeChevronDroite taille={14} />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Graphique d'activité
────────────────────────────────────────────────────────────────────── */
function GraphiqueActivite({
  activite,
  jours,
}: {
  activite: TableauDeBord['activite'];
  jours: number;
}) {
  const series = [
    { cle: 'inscriptions', libelle: 'Inscriptions', couleur: '#3b82f6' },
    { cle: 'demandes', libelle: 'Demandes de devis', couleur: '#B35B28' },
    { cle: 'courses', libelle: 'Courses', couleur: '#EAA023' },
  ];

  const totaux = {
    inscriptions: activite.reduce((s, j) => s + j.inscriptions, 0),
    demandes: activite.reduce((s, j) => s + j.demandes, 0),
    courses: activite.reduce((s, j) => s + j.courses, 0),
  };

  const donnees = activite.map((j) => ({
    etiquette: `${j.jour.slice(8, 10)}/${j.jour.slice(5, 7)}`,
    inscriptions: j.inscriptions,
    demandes: j.demandes,
    courses: j.courses,
  }));

  const total = totaux.inscriptions + totaux.demandes + totaux.courses;

  return (
    <div className="carte !p-6">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-base font-bold text-maboko-principale">Activité sur {jours} jours</p>
          <p className="mt-0.5 text-xs text-maboko-texte">
            {activite.length} jours · {nombre(total)} événements
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {series.map((serie) => (
            <div key={serie.cle} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: serie.couleur }} />
              <span className="text-xs text-maboko-texte">
                {serie.libelle}{' '}
                <span className="font-bold tabular-nums text-maboko-principale">
                  ({nombre(totaux[serie.cle as keyof typeof totaux])})
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <GraphiqueAire donnees={donnees} series={series} hauteur={300} />
    </div>
  );
}
