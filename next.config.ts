import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Le back-office parle à l'API Laravel : aucune image distante n'est
  // optimisée côté Next, elles viennent déjà du stockage objet.
  images: { unoptimized: true },
  devIndicators: false,
};

export default config;
