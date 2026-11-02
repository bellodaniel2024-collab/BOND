'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Lock,
  Eye,
  Zap,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Globe,
  KeyRound,
  Layers,
} from 'lucide-react'
import { LandingNav } from './LandingNav'
import { HeroSection } from './HeroSection'
import { HowItWorks } from './HowItWorks'
import { SupportedAssets } from './SupportedAssets'
import { SecuritySection } from './SecuritySection'
import { FAQ } from './FAQ'
import { LandingFooter } from './LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-base-cv overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <HowItWorks />
      <SupportedAssets />
      <SecuritySection />
      <FAQ />
      <LandingFooter />
    </div>
  )
}
