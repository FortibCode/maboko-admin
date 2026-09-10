'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════════
   OUTILS COMMUNS
══════════════════════════════════════════════════════════════════ */

/**
 * Spline cubique monotone (Fritsch–Carlson).
 *
 * Une Bézier naïve « dépasse » entre deux points et peut faire plonger la
 * courbe sous zéro là où la donnée ne descend jamais : sur des compteurs
 * (inscriptions, courses) ce serait un mensonge visuel. Cette variante
 * garantit que la courbe reste bornée par ses propres points.
 */
function cheminMonotone(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return '';
  if (n === 1) return `M${points[0].x},${points[0].y}`;
  if (n === 2) return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;

  const dx: number[] = [];
  const pentes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x;
    pentes[i] = dx[i] === 0 ? 0 : (points[i + 1].y - points[i].y) / dx[i];
  }

  const tangentes: number[] = [pentes[0]];
  for (let i = 1; i < n - 1; i++) {
    if (pentes[i - 1] * pentes[i] <= 0) {
      tangentes[i] = 0;
    } else {
      const p1 = 2 * dx[i] + dx[i - 1];
      const p2 = dx[i] + 2 * dx[i - 1];
      tangentes[i] = (p1 + p2) / (p1 / pentes[i - 1] + p2 / pentes[i]);
    }
  }
  tangentes[n - 1] = pentes[n - 2];

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const x1 = points[i].x + dx[i] / 3;
    const y1 = points[i].y + (tangentes[i] * dx[i]) / 3;
    const x2 = points[i + 1].x - dx[i] / 3;
    const y2 = points[i + 1].y - (tangentes[i + 1] * dx[i]) / 3;
    d += `C${x1},${y1} ${x2},${y2} ${points[i + 1].x},${points[i + 1].y}`;
  }
  return d;
}

/** Arrondit la borne haute à une graduation lisible (4, 50, 200…). */
function borneHaute(valeur: number): number {
  if (valeur <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(valeur));
  for (const pas of [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]) {
    if (valeur <= pas * magnitude) return pas * magnitude;
  }
  return 10 * magnitude;
}

/** Largeur réelle du conteneur, pour dessiner en pixels plutôt qu'en étirant le SVG. */
function useLargeur<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largeur, setLargeur] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observateur = new ResizeObserver(([entree]) => {
      setLargeur(entree.contentRect.width);
    });
    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return [ref, largeur] as const;
}

function mouvementReduit() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/* ══════════════════════════════════════════════════════════════════
   COMPTEUR ANIMÉ
══════════════════════════════════════════════════════════════════ */

/** Fait grimper un nombre jusqu'à sa valeur, en freinant à l'arrivée. */
export function CompteurAnime({
  valeur,
  duree = 1100,
  format = (v: number) => Math.round(v).toLocaleString('fr-FR'),
}: {
  valeur: number;
  duree?: number;
  format?: (valeur: number) => string;
}) {
  const [courant, setCourant] = useState(valeur);

  useEffect(() => {
    let image = 0;
    let debut = 0;
    const depart = 0;

    const etape = (horodatage: number) => {
      if (!debut) debut = horodatage;
      if (mouvementReduit()) {
        setCourant(valeur);
        return;
      }
      const avancement = Math.min(1, (horodatage - debut) / duree);
      const adouci = 1 - (1 - avancement) ** 3;
      setCourant(depart + (valeur - depart) * adouci);
      if (avancement < 1) image = requestAnimationFrame(etape);
    };

    image = requestAnimationFrame(etape);
    return () => cancelAnimationFrame(image);
  }, [valeur, duree]);

  return <>{format(courant)}</>;
}

/* ══════════════════════════════════════════════════════════════════
   GRAPHIQUE EN AIRES
══════════════════════════════════════════════════════════════════ */

export type SerieGraphique = { cle: string; libelle: string; couleur: string };
export type PointGraphique = { etiquette: string } & Record<string, number | string>;

export function GraphiqueAire({
  donnees,
  series,
  hauteur = 300,
}: {
  donnees: PointGraphique[];
  series: SerieGraphique[];
  hauteur?: number;
}) {
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  const [actif, setActif] = useState<number | null>(null);
  // Préfixe unique : deux graphiques sur la même page ne doivent pas se
  // disputer les mêmes définitions de dégradé.
  const prefixe = `aire${useId().replace(/:/g, '')}`;

  const marge = { haut: 16, droite: 12, bas: 30, gauche: 40 };
  const l = Math.max(largeur, 320);
  const zoneL = l - marge.gauche - marge.droite;
  const zoneH = hauteur - marge.haut - marge.bas;

  const maximum = borneHaute(
    Math.max(1, ...donnees.flatMap((d) => series.map((s) => Number(d[s.cle]) || 0))),
  );

  const posX = (i: number) =>
    marge.gauche + (donnees.length <= 1 ? zoneL / 2 : (i * zoneL) / (donnees.length - 1));
  const posY = (v: number) => marge.haut + zoneH - (v / maximum) * zoneH;

  const graduations = [0, 0.25, 0.5, 0.75, 1].map((r) => maximum * r);

  // Un libellé sur n, pour que l'axe ne se chevauche pas sur 30 jours.
  const pasEtiquette = Math.max(1, Math.ceil(donnees.length / 8));

  return (
    <div ref={ref} className="relative w-full select-none">
      {largeur > 0 && (
        <svg
          width={l}
          height={hauteur}
          className="overflow-visible"
          onMouseLeave={() => setActif(null)}
          onMouseMove={(e) => {
            const boite = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - boite.left - marge.gauche;
            const index = Math.round((x / zoneL) * (donnees.length - 1));
            setActif(Math.max(0, Math.min(donnees.length - 1, index)));
          }}
        >
          <defs>
            {series.map((serie) => (
              <linearGradient key={serie.cle} id={`${prefixe}-${serie.cle}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={serie.couleur} stopOpacity="0.32" />
                <stop offset="100%" stopColor={serie.couleur} stopOpacity="0.02" />
              </linearGradient>
            ))}
          </defs>

          {/* Grille horizontale + graduations */}
          {graduations.map((valeur) => (
            <g key={valeur}>
              <line
                x1={marge.gauche}
                y1={posY(valeur)}
                x2={l - marge.droite}
                y2={posY(valeur)}
                stroke="#E8DCC8"
                strokeWidth="1"
                strokeDasharray={valeur === 0 ? undefined : '3 5'}
              />
              <text
                x={marge.gauche - 8}
                y={posY(valeur) + 3.5}
                textAnchor="end"
                className="fill-maboko-texte/60 text-[10px] tabular-nums"
              >
                {Math.round(valeur)}
              </text>
            </g>
          ))}

          {/* Étiquettes de l'axe des abscisses */}
          {donnees.map((point, i) =>
            i % pasEtiquette === 0 || i === donnees.length - 1 ? (
              <text
                key={point.etiquette}
                x={posX(i)}
                y={hauteur - 8}
                textAnchor="middle"
                className="fill-maboko-texte/60 text-[10px] tabular-nums"
              >
                {point.etiquette}
              </text>
            ) : null,
          )}

          {/* Aires puis courbes */}
          {series.map((serie, rang) => {
            const points = donnees.map((d, i) => ({ x: posX(i), y: posY(Number(d[serie.cle]) || 0) }));
            const ligne = cheminMonotone(points);
            const aire = `${ligne}L${posX(donnees.length - 1)},${posY(0)}L${posX(0)},${posY(0)}Z`;

            return (
              <g key={serie.cle}>
                <motion.path
                  d={aire}
                  fill={`url(#${prefixe}-${serie.cle})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.35 + rang * 0.12 }}
                />
                <motion.path
                  d={ligne}
                  fill="none"
                  stroke={serie.couleur}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: 'easeInOut', delay: rang * 0.12 }}
                />
              </g>
            );
          })}

          {/* Repère de survol */}
          {actif !== null && (
            <g>
              <line
                x1={posX(actif)}
                y1={marge.haut}
                x2={posX(actif)}
                y2={marge.haut + zoneH}
                stroke="#B35B28"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              {series.map((serie) => (
                <circle
                  key={serie.cle}
                  cx={posX(actif)}
                  cy={posY(Number(donnees[actif][serie.cle]) || 0)}
                  r="4.5"
                  fill="#fff"
                  stroke={serie.couleur}
                  strokeWidth="2.5"
                />
              ))}
            </g>
          )}
        </svg>
      )}

      {/* Infobulle */}
      {actif !== null && largeur > 0 && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-xl bg-maboko-principale px-3 py-2 text-xs text-white shadow-xl"
          style={{
            left: Math.min(Math.max(posX(actif), 70), l - 70),
            top: 0,
          }}
        >
          <p className="mb-1 font-bold">{donnees[actif].etiquette}</p>
          {series.map((serie) => (
            <p key={serie.cle} className="flex items-center gap-2 whitespace-nowrap text-white/80">
              <span className="h-2 w-2 rounded-full" style={{ background: serie.couleur }} />
              {serie.libelle}
              <span className="ml-auto font-bold tabular-nums text-white">
                {Number(donnees[actif][serie.cle]) || 0}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   COURBE MINIATURE
══════════════════════════════════════════════════════════════════ */

export function Sparkline({
  valeurs,
  couleur,
  hauteur = 34,
}: {
  valeurs: number[];
  couleur: string;
  hauteur?: number;
}) {
  const [ref, largeur] = useLargeur<HTMLDivElement>();
  // Identifiant stable et unique : deux courbes sur la même page ne doivent
  // pas partager le même dégradé.
  const identifiant = `spark${useId().replace(/:/g, '')}`;

  const maximum = Math.max(1, ...valeurs);
  const l = Math.max(largeur, 40);
  const points = valeurs.map((v, i) => ({
    x: valeurs.length <= 1 ? l / 2 : (i * l) / (valeurs.length - 1),
    y: hauteur - 3 - (v / maximum) * (hauteur - 6),
  }));

  const ligne = cheminMonotone(points);

  return (
    <div ref={ref} className="w-full">
      {largeur > 0 && (
        <svg width={l} height={hauteur}>
          <defs>
            <linearGradient id={identifiant} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={couleur} stopOpacity="0.3" />
              <stop offset="100%" stopColor={couleur} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${ligne}L${l},${hauteur}L0,${hauteur}Z`} fill={`url(#${identifiant})`} />
          <motion.path
            d={ligne}
            fill="none"
            stroke={couleur}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
          />
        </svg>
      )}
    </div>
  );
}
