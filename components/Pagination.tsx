'use client';

/* -----------------------------------------------------------------------
   Composant de pagination standard (5 éléments par page par défaut)
   Usage :
     <Pagination page={page} total={total} perPage={5} onChanger={setPage} />
----------------------------------------------------------------------- */

interface PropsPagination {
  page: number;
  total: number;
  perPage?: number;
  onChanger: (page: number) => void;
}

export function Pagination({ page, total, perPage = 5, onChanger }: PropsPagination) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  if (totalPages <= 1) return null;

  // Fenêtre de pages à afficher (max 5 numéros autour de la page actuelle)
  const pages: (number | '...')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const debut = (page - 1) * perPage + 1;
  const fin = Math.min(page * perPage, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 px-1">
      <p className="text-xs text-maboko-texte">
        Affichage de <span className="font-semibold text-maboko-principale">{debut}</span>–
        <span className="font-semibold text-maboko-principale">{fin}</span>{' '}
        sur <span className="font-semibold text-maboko-principale">{total}</span> résultat{total > 1 ? 's' : ''}
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        {/* Précédent */}
        <button
          type="button"
          onClick={() => onChanger(page - 1)}
          disabled={page <= 1}
          className="pagination-btn"
          aria-label="Page précédente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Numéros de page */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-maboko-texte">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChanger(p as number)}
              className={p === page ? 'pagination-btn-actif' : 'pagination-btn'}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        {/* Suivant */}
        <button
          type="button"
          onClick={() => onChanger(page + 1)}
          disabled={page >= totalPages}
          className="pagination-btn"
          aria-label="Page suivante"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

/* -----------------------------------------------------------------------
   Hook usePagination — logique de découpage pour les listes locales
----------------------------------------------------------------------- */
export function usePagination<T>(items: T[], perPage = 5) {
  return { perPage };
}

/** Découpe un tableau selon la page courante et la taille de page. */
export function paginer<T>(items: T[], page: number, perPage = 5): T[] {
  return items.slice((page - 1) * perPage, page * perPage);
}
