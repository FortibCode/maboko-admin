import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * eslint-config-next 16 expose directement des configurations à plat :
 * le pont FlatCompat n'est plus nécessaire.
 */
const configuration = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
];

export default configuration;
