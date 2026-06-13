'use client'

import { useEffect, useRef } from 'react'
import { deities } from '@/lib/deities'
import { useLang } from '@/lib/i18n'

/**
 * Horizontally scrollable list of all deities at the top of the screen.
 * Tap a name to switch — the temple gates close and reopen on the new god.
 * Built to scale: add more deities in lib/deities.ts and they appear here.
 */
export function DeityStrip({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const { lang } = useLang()
  const listRef = useRef<HTMLUListElement>(null)

  // Keep the active deity centered in view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[activeIndex] as HTMLElement | undefined
    if (!item) return
    const target =
      item.offsetLeft - list.clientWidth / 2 + item.clientWidth / 2
    list.scrollTo({ left: target, behavior: 'smooth' })
  }, [activeIndex])

  return (
    <nav
      aria-label="Deities"
      className="absolute top-11 right-0 left-0 z-50 h-10 border-y border-gold/20 bg-black/25 backdrop-blur-sm"
    >
      <ul
        ref={listRef}
        className="no-scrollbar flex h-full items-center justify-center gap-3 overflow-x-auto px-4"
      >
        {deities.map((deity, i) => (
          <li key={deity.id} className="shrink-0 flex items-center gap-2.5">
            {i > 0 && (
              <span className="text-gold/40 text-lg leading-none">•</span>
            )}
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={i === activeIndex ? 'true' : undefined}
              className="flex items-center gap-0.5 focus-visible:outline-none px-2 py-1"
            >
              <span
                className={`font-serif text-xs whitespace-nowrap transition-colors duration-200 ${
                  i === activeIndex
                    ? 'text-saffron drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] font-bold'
                    : 'text-cream-muted hover:text-cream/70'
                }`}
              >
                {lang === 'hi' ? deity.nameHindi : deity.nameEnglish}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
