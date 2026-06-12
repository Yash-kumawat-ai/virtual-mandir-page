'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { deities } from '@/lib/deities'
import { TempleGates } from './temple-gates'
import { DeityReel } from './deity-reel'

const GATE_DURATION = 850
const SWIPE_THRESHOLD = 50

export function DeityShrine() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [gatesOpen, setGatesOpen] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const wheelLock = useRef(false)

  const deity = deities[activeIndex]

  // Auto-open the gates 700ms after landing on the page
  useEffect(() => {
    const t = setTimeout(() => setGatesOpen(true), 700)
    return () => clearTimeout(t)
  }, [])

  // Reels transition: close gates -> swap deity behind them -> reopen
  const goToDeity = useCallback(
    (index: number) => {
      const target = (index + deities.length) % deities.length
      if (transitioning || target === activeIndex) return
      setTransitioning(true)
      setGatesOpen(false)
      setTimeout(() => {
        setActiveIndex(target)
        setGatesOpen(true)
        setTimeout(() => setTransitioning(false), GATE_DURATION)
      }, GATE_DURATION)
    },
    [activeIndex, transitioning],
  )

  const next = useCallback(
    () => goToDeity(activeIndex + 1),
    [goToDeity, activeIndex],
  )
  const prev = useCallback(
    () => goToDeity(activeIndex - 1),
    [goToDeity, activeIndex],
  )

  // Vertical + horizontal swipe gestures (reels style)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dy) >= Math.abs(dx)) {
      if (dy < -SWIPE_THRESHOLD) next() // swipe up -> next
      else if (dy > SWIPE_THRESHOLD) prev() // swipe down -> previous
    } else {
      if (dx < -SWIPE_THRESHOLD) next() // swipe left -> next
      else if (dx > SWIPE_THRESHOLD) prev() // swipe right -> previous
    }
  }

  // Mouse wheel scroll like reels on desktop
  const onWheel = (e: React.WheelEvent) => {
    if (wheelLock.current || Math.abs(e.deltaY) < 24) return
    wheelLock.current = true
    if (e.deltaY > 0) next()
    else prev()
    setTimeout(() => {
      wheelLock.current = false
    }, GATE_DURATION * 2 + 200)
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* Shrine portal */}
      <div className="relative flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={prev}
          disabled={transitioning}
          aria-label="Previous deity"
          className="hidden h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-card text-gold transition-colors hover:border-saffron hover:text-saffron disabled:opacity-40 sm:flex"
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        {/* 2:3 portal that fits the door image natively. Doors live OUTSIDE
            the overflow-hidden inner frame so they never get clipped. */}
        <div
          role="region"
          aria-label={`${deity.nameEnglish} shrine — swipe to change deity`}
          className="relative h-[27rem] w-72 touch-pan-x select-none sm:h-[30rem] sm:w-80"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onWheel={onWheel}
        >
          {/* Golden frame */}
          <div className="absolute -inset-2 rounded-xl border-2 border-gold/50 shadow-[0_0_50px_rgba(212,168,83,0.25)]" />

          {/* Inner sanctum (clipped) */}
          <div className="absolute inset-0 overflow-hidden rounded-lg bg-[#120a06]">
            {/* Ambient blurred glow of the deity's own colors */}
            <img
              src={deity.image || '/placeholder.svg'}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            {/* Full original deity image, never cropped */}
            <motion.img
              key={deity.id}
              src={deity.image}
              alt={`${deity.nameEnglish} darshan`}
              initial={{ scale: 1.06, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative h-full w-full object-contain p-5"
              style={{
                filter: `drop-shadow(0 0 36px ${deity.glow})`,
              }}
            />
            {/* Warm vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(18,10,6,0.7)_100%)]" />
          </div>

          {/* Swinging gates (unclipped, swing outward in 3D) */}
          <TempleGates open={gatesOpen} />
        </div>

        <button
          type="button"
          onClick={next}
          disabled={transitioning}
          aria-label="Next deity"
          className="hidden h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-card text-gold transition-colors hover:border-saffron hover:text-saffron disabled:opacity-40 sm:flex"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* Deity name + jaikara */}
      <motion.div
        key={`${deity.id}-label`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: gatesOpen ? 1 : 0, y: gatesOpen ? 0 : 12 }}
        transition={{ duration: 0.5, delay: gatesOpen ? 0.5 : 0 }}
        className="flex flex-col items-center gap-1 text-center"
      >
        <h2 className="font-serif text-3xl text-cream text-balance">
          {deity.nameHindi}
        </h2>
        <p className="text-sm tracking-widest text-cream-muted uppercase italic">
          {deity.nameEnglish}
        </p>
        <p className="om-pulse mt-1 font-serif text-lg text-saffron">
          {deity.jaikara}
        </p>
      </motion.div>

      <p className="font-serif text-xs text-cream-muted/70 sm:hidden">
        {'ऊपर-नीचे स्वाइप करें — अगले भगवान के दर्शन के लिए'}
      </p>

      {/* Snapping filmstrip reel selector */}
      <DeityReel
        activeIndex={activeIndex}
        onSelect={goToDeity}
        disabled={transitioning}
      />
    </div>
  )
}
