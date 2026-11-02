/**
 * Prisma seed script.
 * Creates supported networks and tokens in the database.
 * Run with: npx prisma db seed
 *
 * SECURITY: This script only creates configuration data.
 * No user data, private keys, or sensitive information.
 */
import { PrismaClient } from '@prisma/client'
import { ALL_NETWORKS } from '../src/lib/networks'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding supported networks and tokens...')

  for (const network of ALL_NETWORKS) {
    const created = await prisma.supportedNetwork.upsert({
      where: { chainId: network.chainId },
      create: {
        name: network.name,
        chainId: network.chainId,
        isTestnet: network.isTestnet,
        isEnabled: network.enabled,
        nativeCurrency: network.nativeCurrency.name,
        nativeSymbol: network.nativeCurrency.symbol,
        nativeDecimals: network.nativeCurrency.decimals,
        blockExplorerUrl: network.blockExplorerUrl,
        requiredConfirmations: network.requiredConfirmations,
      },
      update: {
        isEnabled: network.enabled,
      },
    })

    console.log(`  Network: ${network.name} (Chain ID: ${network.chainId}) — ${network.enabled ? 'enabled' : 'disabled'}`)

    for (const token of network.tokens) {
      if (token.contractAddress === null) continue // skip native

      await prisma.supportedToken.upsert({
        where: {
          networkId_contractAddress: {
            networkId: created.id,
            contractAddress: token.contractAddress,
          },
        },
        create: {
          networkId: created.id,
          symbol: token.symbol,
          name: token.name,
          contractAddress: token.contractAddress,
          decimals: token.decimals,
          coingeckoId: token.coingeckoId ?? null,
        },
        update: {},
      })

      console.log(`    Token: ${token.symbol} at ${token.contractAddress}`)
    }
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
