import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protection des routes du back-office, avant le rendu.
 *
 * La garde vivait dans un effet React : la coquille s'affichait d'abord, puis
 * l'effet constatait l'absence de jeton et renvoyait vers la connexion. On
 * voyait donc le tableau de bord clignoter avant d'être éjecté — et pendant
 * cet instant, la structure de l'administration était visible à quelqu'un qui
 * n'était pas connecté.
 *
 * L'intergiciel tranche avant que la moindre page ne soit rendue.
 */
const COOKIE_JETON = 'maboko_admin_token';

export function middleware(requete: NextRequest) {
  const jeton = requete.cookies.get(COOKIE_JETON)?.value;
  const surConnexion = requete.nextUrl.pathname === '/connexion';

  if (!jeton && !surConnexion) {
    const cible = new URL('/connexion', requete.url);

    // La page demandée est mémorisée : après la connexion, on y retourne
    // plutôt que de repartir systématiquement du tableau de bord.
    if (requete.nextUrl.pathname !== '/') {
      cible.searchParams.set('retour', requete.nextUrl.pathname);
    }

    return NextResponse.redirect(cible);
  }

  // Déjà connecté : l'écran de connexion n'a plus de raison d'être.
  if (jeton && surConnexion) {
    return NextResponse.redirect(new URL('/', requete.url));
  }

  return NextResponse.next();
}

export const config = {
  // Tout sauf les ressources statiques et les icônes servies par Next.
  matcher: ['/((?!_next/static|_next/image|icon|apple-icon|favicon).*)'],
};
