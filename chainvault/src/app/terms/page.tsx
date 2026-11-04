import type { Metadata } from 'next'
import { LandingNav } from '@/components/landing/LandingNav'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = { title: 'Terms of Service' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base-cv">
      <LandingNav />
      <main className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <h1 className="font-display font-bold text-3xl sm:text-4xl mb-6" style={{ color: 'var(--text-primary)' }}>
          Terms of Service
        </h1>
        <div className="space-y-6" style={{ color: 'var(--text-secondary)' }}>
          <div className="p-4 rounded-xl border" style={{
            background: 'rgba(245,158,11,0.07)',
            borderColor: 'rgba(245,158,11,0.2)',
            color: '#d97706',
          }}>
            <strong>Development Preview.</strong> BOND is currently in development and operates on testnets only.
            These terms apply to the development preview. Full terms will be published before production launch.
            Do not use this platform with real cryptocurrency or on mainnet.
          </div>

          {[
            {
              title: '1. Non-Custodial Nature',
              body: 'BOND is a non-custodial platform. You retain full control of your cryptocurrency at all times. BOND does not hold, manage, or have access to your funds. All transactions require your explicit authorization through your external wallet.',
            },
            {
              title: '2. Development Preview',
              body: 'This platform is currently in a development preview phase, operating exclusively on test networks. No real cryptocurrency is involved. Production mainnet features will not be enabled until security review and compliance processes are complete.',
            },
            {
              title: '3. User Responsibility',
              body: 'You are responsible for the security of your wallet, private keys, and seed phrases. BOND will never ask for your private key or seed phrase. If any message claims to be from BOND and asks for these credentials, it is a scam.',
            },
            {
              title: '4. No Financial Advice',
              body: 'BOND provides a transaction facilitation platform, not financial advice. Nothing on this platform should be construed as financial, investment, tax, or legal advice.',
            },
            {
              title: '5. No Warranties',
              body: 'The platform is provided "as is" for development testing purposes. No warranties are made regarding uptime, security, or fitness for any purpose at this stage.',
            },
            {
              title: '6. Irreversible Transactions',
              body: 'Blockchain transactions are irreversible once confirmed. BOND cannot reverse, cancel, or modify confirmed transactions. Always verify recipient addresses before authorizing a transaction.',
            },
          ].map((section) => (
            <section key={section.title}>
              <h2 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
