'use client'

import { DeityShrine } from '@/components/temple/deity-shrine'
import {
  OfferingsDock,
  OfferingOverlays,
  useOfferings,
} from '@/components/temple/offerings'

export default function TemplePage() {
  const { active, petals, offerFlowers, ringBell, lightDiya } = useOfferings()

  return (
    <main className="relative flex min-h-svh flex-col items-center gap-8 overflow-x-hidden px-4 py-10">
      {/* Header */}
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="om-pulse font-serif text-4xl text-gold">{'ॐ'}</span>
        <h1 className="font-serif text-2xl text-cream text-balance sm:text-3xl">
          {'श्री मंदिर में आपका स्वागत है'}
        </h1>
        <p className="text-sm text-cream-muted italic">
          Welcome to the Divine Temple
        </p>
      </header>

      {/* Temple gate + deity reels */}
      <DeityShrine />

      {/* Offerings */}
      <section
        aria-label="Puja offerings"
        className="flex flex-col items-center gap-3 pb-6"
      >
        <h2 className="font-serif text-lg text-gold">{'पूजा अर्पण'}</h2>
        <OfferingsDock
          onFlowers={offerFlowers}
          onBell={ringBell}
          onDiya={lightDiya}
        />
      </section>

      {/* Ambient overlays: petal shower, swinging bell, glowing diya */}
      <OfferingOverlays active={active} petals={petals} />
    </main>
  )
}
