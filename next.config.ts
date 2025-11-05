import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vos configurations existantes */

  // Configuration pour ignorer les erreurs TypeScript
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build
    ignoreBuildErrors: true
  },

  // Configuration pour ignorer les erreurs ESLint
  eslint: {
    // Ignorer les erreurs ESLint pendant le build
    ignoreDuringBuilds: true
  },

  // Configuration optimisée des headers de cache pour BACK OFFICE
  async headers() {
    return [
      // Assets statiques - Cache 1 an
      {
        source: '/:all*(css|js|gif|svg|jpg|jpeg|png|woff|woff2|avif|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate'
          }
        ],
      },

      // API Back Office - PAS DE CACHE (données sensibles et temps réel)
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,OPTIONS,PATCH,DELETE'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
          },
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate'
          }
        ]
      },

      // Dashboard - Pas de cache (données administratives)
      {
        source: '/dashboard/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate'
          }
        ]
      }
    ]
  }
};

export default nextConfig;