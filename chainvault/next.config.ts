import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Security headers applied to every response
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Force HTTPS (enable in production)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Referrer policy — don't leak path info
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy — disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Content Security Policy
          // NOTE: Tighten nonces/hashes in production.
          // 'unsafe-inline' for styles required by Tailwind/inline styles.
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https: wss:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // Transpile wagmi / viem ESM packages
  serverExternalPackages: ['bcryptjs', 'otplib'],

  // Handle transitive dependencies from wagmi/coinbase SDK that have
  // optional packages not installed in our project. These are from
  // the Coinbase Smart Wallet / x402 payment protocol which we don't use.
  webpack: (config, { webpack }) => {
    config.plugins = config.plugins || []
    // Completely ignore all @x402/* imports — we don't use Coinbase x402 payments
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@x402\/.*$/,
      }),
    )
    return config
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // Production-grade compression
  compress: true,

  // Strictly typed routes
  // Set to true temporarily if packages aren't fully installed yet.
  // Switch to false once all deps are resolved.
  typescript: {
    ignoreBuildErrors: process.env['SKIP_TYPE_CHECK'] === 'true',
  },

  eslint: {
    ignoreDuringBuilds: process.env['SKIP_LINT'] === 'true',
  },
}

export default nextConfig
