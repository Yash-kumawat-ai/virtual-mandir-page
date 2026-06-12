'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  playBellChime,
  playDiyaTone,
  playFlowerTone,
} from '@/lib/temple-audio'

type Offering = 'flowers' | 'bell' | 'diya' | null

interface Petal {
  id: number
  left: number
  size: number
  delay: number
  duration: number
  drift: number
  spin: number
  hue: 'orange' | 'pink'
}

let petalId = 0

export function useOfferings() {
  const [active, setActive] = useState<Offering>(null)
  const [petals, setPetals] = useState<Petal[]>([])

  const offerFlowers = useCallback(() => {
    playFlowerTone()
    const batch: Petal[] = Array.from({ length: 22 }, () => ({
      id: petalId++,
      left: Math.random() * 100,
      size: 22 + Math.random() * 34,
      delay: Math.random() * 1.2,
      duration: 3.2 + Math.random() * 2.4,
      drift: -60 + Math.random() * 120,
      spin: 180 + Math.random() * 360,
      hue: Math.random() > 0.5 ? 'orange' : 'pink',
    }))
    setPetals((prev) => [...prev, ...batch])
    setActive('flowers')
    setTimeout(() => setActive(null), 2600)
    setTimeout(() => {
      setPetals((prev) => prev.filter((p) => !batch.includes(p)))
    }, 7000)
  }, [])

  const ringBell = useCallback(() => {
    playBellChime()
    setActive('bell')
    setTimeout(() => setActive(null), 1800)
  }, [])

  const lightDiya = useCallback(() => {
    playDiyaTone()
    setActive('diya')
    setTimeout(() => setActive(null), 2800)
  }, [])

  return { active, petals, offerFlowers, ringBell, lightDiya }
}

export function OfferingOverlays({
  active,
  petals,
}: {
  active: Offering
  petals: Petal[]
}) {
  return (
    <>
      {/* Falling flower petal shower */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {petals.map((p) => (
          <img
            key={p.id}
            src="/images/flower.png"
            alt=""
            className="petal absolute top-0"
            style={
              {
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                '--petal-duration': `${p.duration}s`,
                '--petal-drift': `${p.drift}px`,
                '--petal-spin': `${p.spin}deg`,
                filter:
                  p.hue === 'pink'
                    ? 'hue-rotate(-40deg) saturate(1.3)'
                    : 'none',
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <AnimatePresence>
        {/* Swinging bell */}
        {active === 'bell' && (
          <motion.div
            key="bell"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="pointer-events-none fixed top-6 left-1/2 z-50 -translate-x-1/2"
          >
            <img
              src="/images/bell.png"
              alt=""
              className="bell-swinging h-36 w-36 object-contain drop-shadow-[0_0_24px_rgba(212,168,83,0.6)] sm:h-44 sm:w-44"
            />
          </motion.div>
        )}

        {/* Glowing diya */}
        {active === 'diya' && (
          <motion.div
            key="diya"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-none fixed bottom-28 left-1/2 z-50 -translate-x-1/2"
          >
            <img
              src="/images/diya.png"
              alt=""
              className="diya-glow h-32 w-32 object-contain sm:h-40 sm:w-40"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function OfferingsDock({
  onFlowers,
  onBell,
  onDiya,
}: {
  onFlowers: () => void
  onBell: () => void
  onDiya: () => void
}) {
  const items = [
    {
      label: 'फूल चढ़ाएं',
      sub: 'Offer Flowers',
      img: '/images/flower.png',
      onClick: onFlowers,
    },
    {
      label: 'घंटी बजाएं',
      sub: 'Ring Bell',
      img: '/images/bell.png',
      onClick: onBell,
    },
    {
      label: 'दीया जलाएं',
      sub: 'Light Diya',
      img: '/images/diya.png',
      onClick: onDiya,
    },
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {items.map((item) => (
        <button
          key={item.sub}
          type="button"
          onClick={item.onClick}
          className="group flex flex-col items-center gap-1.5 rounded-xl border border-gold/30 bg-card px-4 py-3 transition-all hover:border-saffron hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-6"
        >
          <img
            src={item.img || '/placeholder.svg'}
            alt=""
            className="h-10 w-10 object-contain transition-transform group-hover:scale-110 sm:h-12 sm:w-12"
          />
          <span className="font-serif text-sm text-cream">{item.label}</span>
          <span className="text-xs text-cream-muted italic">{item.sub}</span>
        </button>
      ))}
    </div>
  )
}
