import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maboko — Administration',
  description: 'Back-office de pilotage de la plateforme Maboko',
};

export default function RacineLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
