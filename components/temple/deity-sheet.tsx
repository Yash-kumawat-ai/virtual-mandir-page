'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { deities } from '@/lib/deities'

/**
 * Bottom sheet deity selector — kept off the main screen so the
 * darshan stays immersive.
 */
export function DeitySheet({
  open,
  activeIndex,
  onSelect,
  onClose,
}: {
  open: boolean
  activeIndex: number
  onSelect: (index: number) => void
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[60] bg-black/55"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label="देवता चुनें"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute right-0 bottom-0 left-0 z-[70] rounded-t-2xl border-t border-gold/40 bg-[#1a0f0a] pb-6"
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-cream/25" />
            <h2 className="px-5 pt-3 pb-1 font-serif text-lg text-gold">
              {'देवता चुनें'}
            </h2>
            <p className="px-5 pb-3 text-xs text-cream-muted italic">
              Choose your deity for darshan
            </p>
            <div className="no-scrollbar flex gap-4 overflow-x-auto px-5 py-2">
              {deities.map((deity, i) => (
                <button
                  key={deity.id}
                  type="button"
                  onClick={() => {
                    onSelect(i)
                    onClose()
                  }}
                  className="flex shrink-0 flex-col items-center gap-1.5 focus-visible:outline-none"
                >
                  <span
                    className={`block h-16 w-16 overflow-hidden rounded-full border-2 transition-all ${
                      i === activeIndex
                        ? 'border-saffron shadow-[0_0_18px_rgba(249,115,22,0.55)]'
                        : 'border-gold/40'
                    }`}
                  >
                    <img
                      src={deity.image || '/placeholder.svg'}
                      alt={deity.nameEnglish}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span
                    className={`font-serif text-xs ${
                      i === activeIndex ? 'text-saffron' : 'text-cream-muted'
                    }`}
                  >
                    {deity.nameHindi}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
