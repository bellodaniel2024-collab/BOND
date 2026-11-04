import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base-cv">
      <LandingNav />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-6" style={{ color: 'var(--text-primary)' }}>
          Privacy Policy
        </h1>
        <div className="prose prose-sm max-w-none space-y-6" style={{ color: 'var(--text-secondary)' }}>
          <p>
            <strong style={{ color: 'var(--text-primary)' }}>Last updated: November 2026 — Development Preview.</strong>{' '}
            This is a development preview. This policy will be revised and formalized before production launch.
          </p>

          <section>
            <h2 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              1. Data We Collect
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>Email address and password hash (for account creation).</li>
              <li>Public wallet address (displayed in your profile; never private keys).</li>
              <li>Transaction references: public blockchain hashes, amounts, addresses, and status.</li>
              <li>Security logs: login events, IP addresses, user agent strings — for fraud prevention.</li>
              <li>Session tokens (encrypted, stored in cookies).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              2. Data We Never Collect
            </h2>
            <ul className="list-disc pl-4 space-y-1">
              <li>Private keys or seed phrases — BOND will never ask for or store these.</li>
              <li>Plaintext passwords — passwords are hashed with bcrypt before storage.</li>
              <li>Cryptocurrency funds — BOND is non-custodial and holds no user funds.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              3. How We Use Your Data
            </h2>
            <p>
              Account data is used to authenticate you and display your transaction history.
              Security logs are used to detect suspicious activity. We do not sell user data.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              4. Third-Party Services
            </h2>
            <p>
              BOND uses blockchain RPC providers (Infura, Alchemy) to read blockchain data.
              These providers may record RPC request metadata. WalletConnect (Reown) facilitates
              wallet connections and operates under its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              5. Contact
            </h2>
            <p>This privacy policy will be updated before production launch with full contact information.</p>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
