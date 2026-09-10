import type { ReactNode } from 'react';

/**
 * Tableau de données premium Maboko.
 * Utilise les classes CSS du système de design (globals.css).
 */
export function Tableau({
  entetes,
  children,
}: {
  entetes: string[];
  children: ReactNode;
}) {
  return (
    <div className="tableau-conteneur overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="tableau-entete">
          <tr>
            {entetes.map((entete, i) => (
              <th
                key={`${entete}-${i}`}
                className={`tableau-th ${i === entetes.length - 1 ? 'text-right' : ''}`}
              >
                {entete}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Cellule({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`tableau-td align-middle ${className}`}>{children}</td>;
}
