// knip.config.ts
import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'next.config.*',
    'postcss.config.*',
    'tailwind.config.*',
    'src/app/**/page.{ts,tsx,js,jsx,mdx}',
    'src/app/**/layout.{ts,tsx,js,jsx}',
    'src/app/**/template.{ts,tsx}',
    'src/app/**/loading.{ts,tsx}',
    'src/app/**/error.{ts,tsx}',
    'src/app/**/route.{ts,tsx}',
    'src/app/api/**/route.{ts,tsx}',
    'src/pages/**/*.{ts,tsx,js,jsx}',
    'src/middleware.{ts,tsx,js,jsx}',
    'src/index.{ts,tsx,js,jsx}',
    'src/main.{ts,tsx,js,jsx}',
    'scripts/**/*.{ts,js}',
  ],
  project: [
    'src/**/*.{ts,tsx}',
    'scripts/**/*.{ts,js}',
  ],
  ignore: [
    '**/*.d.ts',
    'node_modules/**',
    '.next/**',
    'out/**',
    'dist/**',
    'build/**',
    'coverage/**',
    'public/**',
    'src/types/supabase.ts',
    'src/**/__generated__/**',
    'src/**/__tests__/**',
    'src/**/tests/**',
    'src/**/__mocks__/**',
    'src/**/mocks/**',
  ],
};

export default config;
