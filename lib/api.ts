/**
 * Client de l'API Maboko.
 *
 * Centralise l'adresse de base, le jeton d'authentification et la traduction
 * des erreurs. Le jeton vit dans un cookie plutôt que dans localStorage :
 * l'intergiciel Next peut ainsi protéger les routes avant même le rendu.
 */

/** Adresse visée quand rien n'est configuré. */
const API_PAR_DEFAUT = 'https://maboko-api.onrender.com';

/**
 * Adresse de l'API.
 *
 * `https://maboko-api.onrender.com` est l'adresse du serveur ; les routes,
 * elles, vivent sous `/api/v1` — le préfixe déclaré dans bootstrap/app.php et
 * routes/api.php du backend. Donner l'une pour l'autre produit un 404 sur
 * chaque appel ; le préfixe est donc ajouté ici quand il manque.
 *
 * Une variable déclarée mais vide était pire encore : `??` ne se déclenche que
 * sur `undefined`, jamais sur une chaîne vide. L'adresse devenait `/api/v1`,
 * relative, et le navigateur refusait de la construire — « Failed to construct
 * URL ». Toute valeur inutilisable retombe donc sur l'adresse par défaut.
 */
function adresseApi(): string {
  const brute = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
  const racine = brute === '' ? API_PAR_DEFAUT : brute;

  // Un hôte seul, sans protocole, ne se construit pas non plus.
  const avecProtocole = /^https?:\/\//i.test(racine) ? racine : `https://${racine}`;
  const sansBarre = avecProtocole.replace(/\/+$/, '');
  const complete = /\/api\/v\d+$/.test(sansBarre) ? sansBarre : `${sansBarre}/api/v1`;

  try {
    new URL(complete);

    return complete;
  } catch {
    // Plutôt qu'échouer sur chaque appel avec un message obscur, on revient
    // à une adresse qui fonctionne et on le signale une fois.
    console.error(
      `[api] NEXT_PUBLIC_API_URL inutilisable (${JSON.stringify(brute)}), ` +
        `retour sur ${API_PAR_DEFAUT}/api/v1`,
    );

    return `${API_PAR_DEFAUT}/api/v1`;
  }
}

const BASE = adresseApi();

const COOKIE_JETON = 'maboko_admin_token';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statut: number,
    readonly erreurs: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get estNonAutorise() {
    return this.statut === 401;
  }

  get estInterdit() {
    return this.statut === 403;
  }
}

export function lireJeton(): string | null {
  if (typeof document === 'undefined') return null;

  const trouve = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${COOKIE_JETON}=`));

  return trouve ? decodeURIComponent(trouve.split('=')[1]) : null;
}

export function ecrireJeton(jeton: string) {
  // Durée alignée sur celle d'un jeton Sanctum non expirant : la session se
  // ferme à la déconnexion, ou au bout d'une semaine d'inactivité du poste.
  const expiration = new Date(Date.now() + 7 * 24 * 3600 * 1000).toUTCString();
  document.cookie = `${COOKIE_JETON}=${encodeURIComponent(jeton)}; path=/; expires=${expiration}; SameSite=Lax`;
}

export function effacerJeton() {
  document.cookie = `${COOKIE_JETON}=; path=/; max-age=0; SameSite=Lax`;
}

async function requete<T>(
  chemin: string,
  options: { methode?: string; corps?: unknown; parametres?: Record<string, string | undefined> } = {},
): Promise<T> {
  const url = new URL(`${BASE}${chemin}`);

  for (const [cle, valeur] of Object.entries(options.parametres ?? {})) {
    if (valeur !== undefined && valeur !== '') url.searchParams.set(cle, valeur);
  }

  const jeton = lireJeton();

  let reponse: Response;

  try {
    reponse = await fetch(url.toString(), {
      method: options.methode ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.corps ? { 'Content-Type': 'application/json' } : {}),
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      },
      body: options.corps ? JSON.stringify(options.corps) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError("Impossible de joindre l'API Maboko. Vérifiez qu'elle est démarrée.", 0);
  }

  if (reponse.status === 204) return undefined as T;

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    if (reponse.status === 401) effacerJeton();

    throw new ApiError(
      donnees?.message ?? "L'opération a échoué.",
      reponse.status,
      donnees?.errors ?? {},
    );
  }

  return donnees as T;
}

export const api = {
  get: <T>(chemin: string, parametres?: Record<string, string | undefined>) =>
    requete<T>(chemin, { parametres }),
  post: <T>(chemin: string, corps?: unknown) => requete<T>(chemin, { methode: 'POST', corps }),

  /** Ouvre un téléchargement authentifié (export CSV). */
  telecharger: async (chemin: string, parametres?: Record<string, string | undefined>) => {
    const url = new URL(`${BASE}${chemin}`);
    for (const [cle, valeur] of Object.entries(parametres ?? {})) {
      if (valeur) url.searchParams.set(cle, valeur);
    }

    const reponse = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${lireJeton() ?? ''}` },
    });

    if (!reponse.ok) throw new ApiError("L'export a échoué.", reponse.status);

    const blob = await reponse.blob();
    const lien = document.createElement('a');
    lien.href = URL.createObjectURL(blob);
    lien.download =
      reponse.headers.get('content-disposition')?.match(/filename="?([^";]+)"?/)?.[1] ??
      'export.csv';
    lien.click();
    URL.revokeObjectURL(lien.href);
  },
};
