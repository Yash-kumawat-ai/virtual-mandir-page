'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '@/lib/i18n'
import {
  playAartiTick,
  playAartiComplete,
  playBellChime,
} from '@/lib/temple-audio'

const ROTATIONS_NEEDED = 3
const FULL_TURN = Math.PI * 2

/**
 * Aarti interaction: a brass thali rises up, then the user moves their
 * finger (or mouse) in circles. The plate orbits the deity following the
 * gesture. After 3 full rotations the aarti completes with a golden burst.
 */
export function AartiOverlay({
  open,
  onProgress,
  onComplete,
  onClose,
}: {
  open: boolean
  /** called every quarter turn — pulse the deity glow */
  onProgress: () => void
  /** called once after 3 full rotations */
  onComplete: () => void
  onClose: () => void
}) {
  const { t } = useLang()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastAngle = useRef<number | null>(null)
  const accumulated = useRef(0)
  const lastQuarter = useRef(0)
  const completed = useRef(false)
  const tracking = useRef(false)

  // Displayed plate angle (radians) and rounds completed
  const [plateAngle, setPlateAngle] = useState(Math.PI / 2) // start at bottom
  const [rounds, setRounds] = useState(0)
  const [finishing, setFinishing] = useState(false)

  // Reset when opened
  useEffect(() => {
    if (open) {
      lastAngle.current = null
      accumulated.current = 0
      lastQuarter.current = 0
      completed.current = false
      setPlateAngle(Math.PI / 2)
      setRounds(0)
      setFinishing(false)
    }
  }, [open])

  const getCenter = useCallback(() => {
    const el = containerRef.current
    if (!el) return { cx: 0, cy: 0 }
    const r = el.getBoundingClientRect()
    // Deity center sits slightly above middle of the darshan area
    return { cx: r.left + r.width / 2, cy: r.top + r.height * 0.45 }
  }, [])

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (completed.current || !tracking.current) return
      const { cx, cy } = getCenter()
      const angle = Math.atan2(clientY - cy, clientX - cx)

      if (lastAngle.current !== null) {
        let delta = angle - lastAngle.current
        // normalize wrap-around
        if (delta > Math.PI) delta -= FULL_TURN
        if (delta < -Math.PI) delta += FULL_TURN
        // ignore wild jumps (finger crossing center)
        if (Math.abs(delta) < Math.PI / 2) {
          accumulated.current += Math.abs(delta)
          setPlateAngle(angle)

          const quarter = Math.floor(accumulated.current / (Math.PI / 2))
          if (quarter > lastQuarter.current) {
            lastQuarter.current = quarter
            playAartiTick()
            onProgress()
            setRounds(Math.floor(accumulated.current / FULL_TURN))
          }

          if (
            accumulated.current >= ROTATIONS_NEEDED * FULL_TURN &&
            !completed.current
          ) {
            completed.current = true
            setRounds(ROTATIONS_NEEDED)
            setFinishing(true)
            playAartiComplete()
            playBellChime()
            onComplete()
            setTimeout(onClose, 1400)
          }
        }
      }
      lastAngle.current = angle
    },
    [getCenter, onProgress, onComplete, onClose],
  )

  const orbitRadius =
    typeof window !== 'undefined'
      ? Math.min(window.innerWidth * 0.34, 170)
      : 140
  const plateX = Math.cos(plateAngle) * orbitRadius
  const plateY = Math.sin(plateAngle) * orbitRadius * 0.82 // slight ellipse

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 touch-none"
          onPointerDown={(e) => {
            tracking.current = true
            lastAngle.current = null
            e.currentTarget.setPointerCapture(e.pointerId)
            handleMove(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => handleMove(e.clientX, e.clientY)}
          onPointerUp={() => {
            tracking.current = false
            lastAngle.current = null
          }}
          onPointerCancel={() => {
            tracking.current = false
            lastAngle.current = null
          }}
        >
          {/* Dim backdrop, deity stays visible through it */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Instruction */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: finishing ? 0 : 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute top-[14%] right-0 left-0 flex flex-col items-center gap-1 px-6 text-center"
          >
            <p className="font-serif text-lg text-cream drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {t('aartiInstruction')}
            </p>
            <p className="text-xs tracking-wide text-cream-muted italic">
              {t('aartiHint')}
            </p>
            {/* Rotation progress dots */}
            <div className="mt-2 flex items-center gap-2">
              {Array.from({ length: ROTATIONS_NEEDED }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    i < rounds
                      ? 'scale-110 bg-saffron shadow-[0_0_10px_rgba(249,115,22,0.9)]'
                      : 'bg-cream/25'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Faint orbit guide ring */}
          <div
            className="pointer-events-none absolute left-1/2 aarti-guide-ring"
            style={{
              top: '45%',
              width: orbitRadius * 2,
              height: orbitRadius * 2 * 0.82,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* The orbiting aarti thali */}
          <motion.div
            initial={{ y: 240, scale: 0.5, opacity: 0 }}
            animate={
              finishing
                ? { scale: 1.35, opacity: 0 }
                : { y: 0, scale: 1, opacity: 1 }
            }
            transition={
              finishing
                ? { duration: 0.7, ease: 'easeOut' }
                : { duration: 0.45, ease: 'easeOut' }
            }
            className="pointer-events-none absolute left-1/2"
            style={{ top: '45%' }}
          >
            <div
              style={{
                transform: `translate(calc(-50% + ${plateX}px), calc(-50% + ${plateY}px))`,
              }}
            >
              <img
                src="/images/thali.png"
                alt="Aarti thali"
                className="aarti-plate-glow h-24 w-24 object-contain sm:h-28 sm:w-28"
              />
            </div>
          </motion.div>

          {/* Golden burst on completion */}
          {finishing && (
            <div className="pointer-events-none absolute left-1/2 top-[45%]">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="aarti-burst-spark absolute"
                  style={
                    {
                      '--burst-x': `${Math.cos((i / 14) * FULL_TURN) * (90 + (i % 3) * 40)}px`,
                      '--burst-y': `${Math.sin((i / 14) * FULL_TURN) * (90 + (i % 3) * 40)}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          )}

          {/* Cancel */}
          {!finishing && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 bottom-24 rounded-full border border-cream/30 bg-black/40 px-4 py-1.5 font-serif text-xs text-cream backdrop-blur-sm"
            >
              {t('close')}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
