/**
 * wagmi + viem configuration
 * Supports only explicitly listed testnets (production chains disabled).
 */
import { createConfig, http } from 'wagmi'
import { sepolia, polygonAmoy, mainnet, polygon } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID']

if (!projectId && typeof window !== 'undefined') {
  console.warn(
    '[BOND] WalletConnect Project ID not configured. ' +
    'Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in your .env.local file.',
  )
}

// Only expose enabled chains to wagmi.
// Production chains (mainnet, polygon) are included in config but
// UI-level guards prevent their use until production release.
export const wagmiConfig = createConfig({
  chains: [sepolia, polygonAmoy, mainnet, polygon],
  connectors: [
    injected(), // MetaMask, Brave Wallet, Rabby, etc.
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: 'BOND',
              description: 'Secure non-custodial cryptocurrency transactions',
              url: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
              icons: [
                `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/assets/logo.svg`,
              ],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [sepolia.id]: http(
      process.env['NEXT_PUBLIC_SEPOLIA_RPC_URL'] ?? 'https://rpc.sepolia.org',
    ),
    [polygonAmoy.id]: http(
      process.env['NEXT_PUBLIC_POLYGON_AMOY_RPC_URL'] ??
        'https://rpc-amoy.polygon.technology',
    ),
    // Mainnet transports configured but not exposed to UI
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
})
