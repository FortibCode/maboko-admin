/** Formate un montant en francs CFA : 195000 → « 195 000 FCFA ». */
export function fcfa(montant: number | null | undefined): string {
  if (montant === null || montant === undefined) return '—';

  return `${Math.round(montant).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
}

export const monnaie = fcfa;

export function nombre(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined) return '—';

  return valeur.toLocaleString('fr-FR').replace(/ | /g, ' ');
}

/** Date lisible : « 09/09/2026 » ou « 09/09/2026 à 14:30 ». */
export function date(iso: string | null | undefined, avecHeure = false): string {
  if (!iso) return '—';

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';

  const jour = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  return avecHeure
    ? `${jour} à ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    : jour;
}

/** Libellé lisible d'un statut de validation. */
export function libelleStatut(statut: string): string {
  return (
    {
      en_attente: 'En attente',
      valide: 'Validé',
      rejete: 'Refusé',
      ouvert: 'Ouvert',
      en_cours: 'En cours',
      resolu: 'Résolu',
      clos: 'Clos',
      traite: 'Traité',
      ignore: 'Classé sans suite',
    }[statut] ?? statut
  );
}
