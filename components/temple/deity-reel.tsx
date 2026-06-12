'use client'

import { useEffect, useRef } from 'react'
import { deities } from '@/lib/deities'

interface DeityReelProps {
  activeIndex: number
  onSelect: (index: number) => void
  disabled?: boolean
}

/**
 * Horizontal snapping filmstrip selector. Auto-scrolls to center the
 * active deity card whenever the active deity changes.
 */
export function DeityReel({ activeIndex, onSelect, disabled }: DeityReelProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const item = itemRefs.current[activeIndex]
    if (item) {
      item.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [activeIndex])

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label="Select deity"
      className="no-scrollbar flex w-full max-w-md snap-x snap-mandatory gap-3 overflow-x-auto px-6 py-2"
    >
      {deities.map((d, i) => {
        const isActive = i === activeIndex
        return (
          <button
            key={d.id}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`${d.nameEnglish} darshan`}
            disabled={disabled}
            onClick={() => onSelect(i)}
            className={`flex shrink-0 snap-center flex-col items-center gap-1.5 transition-opacity disabled:opacity-60 ${
              isActive ? '' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <span
              className={`block h-16 w-16 overflow-hidden rounded-full border-2 transition-all ${
                isActive
                  ? 'border-saffron shadow-[0_0_18px_rgba(249,115,22,0.55)]'
                  : 'border-gold/40'
              }`}
            >
              <img
                src={d.image || '/placeholder.svg'}
                alt=""
                className="h-full w-full object-cover"
              />
            </span>
            <span
              className={`font-serif text-xs ${
                isActive ? 'text-saffron' : 'text-cream-muted'
              }`}
            >
              {d.nameHindi}
            </span>
          </button>
        )
      })}
    </div>
  )
}
