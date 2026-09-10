import { libelleStatut } from '@/lib/format';

const NEUTRE = 'border-maboko-bordure bg-maboko-fond text-maboko-texte';

const COULEURS: Record<string, string> = {
  valide: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  resolu: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  traite: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  en_attente: 'border-amber-200 bg-amber-50 text-amber-700',
  ouvert: 'border-amber-200 bg-amber-50 text-amber-700',
  en_cours: 'border-blue-200 bg-blue-50 text-blue-700',
  rejete: 'border-rose-200 bg-rose-50 text-rose-700',
  ignore: NEUTRE,
  clos: NEUTRE,
};

export function Pastille({ statut }: { statut: string }) {
  return (
    <span className={`pastille ${COULEURS[statut] ?? NEUTRE}`}>{libelleStatut(statut)}</span>
  );
}

export function PastilleSuspendu() {
  return <span className="pastille border-rose-200 bg-rose-50 text-rose-700">Suspendu</span>;
}
