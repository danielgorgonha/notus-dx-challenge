/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_NOTUS_API_URL: process.env.NEXT_PUBLIC_NOTUS_API_URL || 'https://api.notus.team/api/v1',
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
    NEXT_PUBLIC_APP_NAME: 'Notus DX Challenge',
    NEXT_PUBLIC_APP_VERSION: '1.0.0'
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob: https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.gstatic.com https://auth.privy.io https://registry.walletconnect.com https://explorer-api.walletconnect.com",
              "style-src 'self' 'unsafe-inline' https: data: https://fonts.googleapis.com",
              "font-src 'self' https: data: https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https: wss: ws: https://api.notus.team https://auth.privy.io https://www.google-analytics.com https://explorer-api.walletconnect.com https://registry.walletconnect.com https://relay.walletconnect.com wss://relay.walletconnect.com",
              "frame-src 'self' https: https://auth.privy.io",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    domains: ['localhost', 'api.notus.team', 'assets.coingecko.com'],
    unoptimized: true
  }
};

module.exports = nextConfig;
