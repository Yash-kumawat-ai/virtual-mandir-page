'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { deities } from '@/lib/deities'
import {
  playBellChime,
  playFlowerTone,
  playAartiTone,
  playBhogTone,
  playDhoopTone,
  playMalaTone,
} from '@/lib/temple-audio'
import { TempleGates } from './temple-gates'
import { HangingBells } from './hanging-bells'
import { FlowerParticles } from './flower-particles'
import { AartiOverlay } from './aarti-overlay'
import { WorshipTray, type PujaAction } from './worship-tray'
import { DeitySheet } from './deity-sheet'

const XP_KEY = 'mandir-bhakti-xp'

export function DarshanScreen() {
  const [gatesOpen, setGatesOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [deityVisible, setDeityVisible] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Effects state
  const [shower, setShower] = useState(0)
  const [burst, setBurst] = useState(0)
  const [glowPulse, setGlowPulse] = useState(false)
  const [intenseGlow, setIntenseGlow] = useState(false)
  const [aartiOpen, setAartiOpen] = useState(false)
  const [bhogActive, setBhogActive] = useState(false)
  const [dhoopActive, setDhoopActive] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [xp, setXp] = useState(0)

  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deity = deities[activeIndex]

  // Load XP
  useEffect(() => {
    const saved = Number(localStorage.getItem(XP_KEY) || '0')
    setXp(saved)
  }, [])

  const addXp = useCallback((amount: number) => {
    setXp((prev) => {
      const next = prev + amount
      localStorage.setItem(XP_KEY, String(next))
      return next
    })
  }, [])

  // Gate-open hero animation on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setGatesOpen(true)
      playBellChime()
    }, 600)
    return () => clearTimeout(t)
  }, [])

  const pulseGlow = useCallback(() => {
    setGlowPulse(true)
    if (glowTimer.current) clearTimeout(glowTimer.current)
    glowTimer.current = setTimeout(() => setGlowPulse(false), 600)
  }, [])

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2800)
  }, [])

  // Deity switch — fade transition
  const selectDeity = useCallback(
    (index: number) => {
      if (index === activeIndex) return
      setDeityVisible(false)
      setTimeout(() => {
        setActiveIndex(index)
        setDeityVisible(true)
        playFlowerTone()
      }, 350)
    },
    [activeIndex],
  )

  const handleAction = useCallback(
    (action: PujaAction) => {
      switch (action) {
        case 'flowers':
          playFlowerTone()
          setShower((s) => s + 1)
          pulseGlow()
          addXp(5)
          break
        case 'aarti':
          playAartiTone()
          setAartiOpen(true)
          break
        case 'bhog':
          playBhogTone()
          setBhogActive(true)
          pulseGlow()
          addXp(5)
          setTimeout(() => setBhogActive(false), 2400)
          break
        case 'dhoop':
          playDhoopTone()
          setDhoopActive(true)
          addXp(5)
          setTimeout(() => setDhoopActive(false), 5000)
          break
        case 'mala':
          playMalaTone()
          pulseGlow()
          setShower((s) => s + 1)
          addXp(5)
          break
      }
    },
    [pulseGlow, addXp],
  )

  const onAartiComplete = useCallback(() => {
    setIntenseGlow(true)
    setBurst((b) => b + 1)
    addXp(20)
    showToast('🙏 आरती सम्पन्न — आपको आशीर्वाद मिला')
    setTimeout(() => setIntenseGlow(false), 1100)
  }, [addXp, showToast])

  const deityFilter = intenseGlow
    ? 'drop-shadow(0 0 120px rgba(249,115,22,0.7))'
    : glowPulse
      ? 'drop-shadow(0 0 80px rgba(249,115,22,0.6))'
      : `drop-shadow(0 0 40px ${deity.glow})`

  return (
    <div className="relative mx-auto h-svh w-full max-w-md overflow-hidden bg-[#0d0705]">
      {/* LAYER 1: Temple background — subtle radial warmth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#3d1a08_0%,#1d0e06_55%,#0d0705_100%)]" />

      {/* LAYER 2: Divine rotating light rays behind deity */}
      <div
        aria-hidden="true"
        className="halo-rays absolute top-[42%] left-1/2 h-[140vw] w-[140vw] max-h-[560px] max-w-[560px]"
      />

      {/* LAYER 3: DEITY — fills the entire darshan area, face at top */}
      <div className="absolute top-[76px] right-0 bottom-20 left-0 z-10">
        <AnimatePresence mode="wait">
          {deityVisible && (
            <motion.img
              key={deity.id}
              src={deity.image}
              alt={`${deity.nameEnglish} darshan`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: gatesOpen ? 1 : 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full object-cover object-top"
              style={{
                filter: deityFilter,
                transition: 'filter 0.3s ease-out',
              }}
            />
          )}
        </AnimatePresence>
        {/* Warm vignette so edges melt into the temple darkness */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,transparent_52%,rgba(13,7,5,0.82)_100%)]" />
        {/* Divine glow overlay — pulses on puja actions */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(ellipse at 50% 35%, rgba(249,160,40,0.32) 0%, transparent 58%)',
            opacity: intenseGlow ? 1 : glowPulse ? 0.75 : 0,
          }}
        />
      </div>

      {/* LAYER 4: Thin decorative golden arch — top only */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 left-0 z-20"
      >
        <svg viewBox="0 0 390 100" className="w-full" fill="none">
          <path
            d="M0 0h390v34c-26 0-36 22-62 22-24 0-30-14-52-14-20 0-26 10-46 10h-70c-20 0-26-10-46-10-22 0-28 14-52 14-26 0-36-22-62-22V0z"
            fill="#2a1408"
          />
          <path
            d="M0 34c26 0 36 22 62 22 24 0 30-14 52-14 20 0 26 10 46 10h70c20 0 26-10 46-10 22 0 28 14 52 14 26 0 36-22 62-22"
            stroke="#d4a853"
            strokeWidth="2"
            opacity="0.8"
          />
          {/* Kalash at center */}
          <path
            d="M195 22l-7 12h14l-7-12z"
            fill="#d4a853"
          />
          <circle cx="195" cy="18" r="3.5" fill="#f97316" />
        </svg>
      </div>

      {/* LAYER 5: Hanging bells */}
      <HangingBells onRing={() => addXp(5)} />

      {/* LAYER 6: Flowers — deity zones only */}
      <FlowerParticles shower={shower} burst={burst} />

      {/* Dhoop smoke wisps near deity feet */}
      {dhoopActive && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="smoke-wisp absolute bottom-0"
              style={{
                left: `${(i - 1) * 26}px`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Bhog thali rises to deity feet */}
      <AnimatePresence>
        {bhogActive && (
          <motion.img
            src="/images/thali.png"
            alt=""
            initial={{ opacity: 0, y: 120, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="pointer-events-none absolute bottom-24 left-1/2 z-30 h-24 w-24 -translate-x-1/2 object-contain drop-shadow-[0_0_24px_rgba(249,115,22,0.5)]"
          />
        )}
      </AnimatePresence>

      {/* Header — minimal, 44px */}
      <header className="absolute top-0 right-0 left-0 z-50 flex h-11 items-center justify-between px-3">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1 rounded-full border border-gold/30 bg-black/35 px-3 py-1 font-serif text-xs text-cream backdrop-blur-sm"
        >
          {'देवता बदलें'}
          <ChevronDown className="h-3 w-3" />
        </button>
        <motion.h1
          key={deity.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-1/2 -translate-x-1/2 font-serif text-base text-gold drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
        >
          {deity.nameHindi}
        </motion.h1>
        <span className="rounded-full border border-gold/30 bg-black/35 px-2.5 py-1 text-xs text-gold backdrop-blur-sm">
          {`🙏 ${xp}`}
        </span>
      </header>

      {/* Jaikara below header */}
      <motion.p
        key={`${deity.id}-jaikara`}
        initial={{ opacity: 0 }}
        animate={{ opacity: gatesOpen ? 1 : 0 }}
        transition={{ delay: 0.6 }}
        className="om-pulse absolute top-12 right-0 left-0 z-30 text-center font-serif text-sm text-saffron"
      >
        {deity.jaikara}
      </motion.p>

      {/* Aarti rotation interaction */}
      <AartiOverlay
        open={aartiOpen}
        onProgress={pulseGlow}
        onComplete={onAartiComplete}
        onClose={() => setAartiOpen(false)}
      />

      {/* Completion toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="absolute bottom-24 left-1/2 z-50 w-max max-w-[88%] -translate-x-1/2 rounded-full border border-gold/40 bg-black/75 px-5 py-2.5 text-center font-serif text-sm text-cream backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 7: Bottom worship tray — 5 actions, 80px */}
      <WorshipTray onAction={handleAction} disabled={!gatesOpen || aartiOpen} />

      {/* Temple gates hero animation (above all darshan layers, below header) */}
      <div className="absolute inset-0 z-[55] pointer-events-none">
        <TempleGates open={gatesOpen} />
      </div>

      {/* Deity selector bottom sheet */}
      <DeitySheet
        open={sheetOpen}
        activeIndex={activeIndex}
        onSelect={selectDeity}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  )
}
