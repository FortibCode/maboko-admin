/** Formes renvoyées par l'API d'administration. */

export type Pagination<T> = {
  data: T[];
  meta?: { current_page: number; last_page: number; total: number };
  links?: unknown;
};

export type TableauDeBord = {
  indicateurs: {
    missionsActives: number;
    coursesActives: number;
    utilisateurs: number;
    nouveauxUtilisateurs7j: number;
    artisansActifs: number;
    artisansTotal: number;
    chauffeursEnLigne: number;
    chauffeursTotal: number;
    revenusMois: number;
    revenusTotal: number;
    commissionsMois: number;
    abonnementsActifs: number;
  };
  activite: { jour: string; inscriptions: number; demandes: number; courses: number }[];
  aTraiter: {
    signalements: number;
    artisansAValider: number;
    chauffeursAValider: number;
    identitesAVerifier: number;
    litigesOuverts: number;
  };
};

export type ArtisanAdmin = {
  id: number;
  utilisateurId: number;
  nomComplet: string;
  email: string;
  telephone: string;
  specialite: string;
  metiers?: string[];
  badges?: string[];
  statutValidation: 'en_attente' | 'valide' | 'rejete';
  compteSuspendu: boolean;
  noteMoyenne: number;
  nbAvis: number;
  nbMissionsTerminees: number;
  plan: string;
  derniereConnexion: string | null;
  inscritLe: string | null;
};

export type ChauffeurAdmin = {
  id: number;
  utilisateurId: number;
  nomComplet: string;
  email: string;
  telephone: string;
  typeVehicule: string;
  vehicule: string;
  plaque: string;
  permis: string;
  statutValidation: 'en_attente' | 'valide' | 'rejete';
  compteSuspendu: boolean;
  enLigne: boolean;
  nbCoursesTerminees: number;
  inscritLe: string | null;
};

export type Signalement = {
  id: number;
  motif: string;
  type: 'post' | 'user';
  cibleId: string;
  contenu: { description?: string; image?: string; auteur?: string; nom?: string; email?: string } | null;
  contenuSupprime: boolean;
  signalePar?: string;
  statut: string;
  signaleLe: string | null;
};

export type Verification = {
  id: number;
  utilisateur: { id: number; nomComplet: string; email: string; telephone: string; role: string };
  typePiece: string;
  statut: string;
  motifRejet: string | null;
  deposeeLe: string | null;
  pieces: Record<string, string>;
};

export type Litige = {
  id: number;
  motif: string;
  description: string;
  statut: string;
  auteur: string | null;
  assigneA: string | null;
  resolution: string | null;
  ouvertLe: string | null;
};

export type Finances = {
  periode: { debut: string; fin: string };
  revenus: {
    total: number;
    nbTransactions: number;
    parOperateur: { operateur: string; nombre: number; total: number }[];
  };
  commissions: { total: number; parType: Record<string, number> };
  repartitionAbonnements: {
    plan: string;
    slug: string;
    nombre: number;
    revenuMensuelTheorique: number;
    part: number;
  }[];
  echecs: { nombre: number; montant: number };
};
