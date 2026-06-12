'use client'

export type PujaAction = 'flowers' | 'aarti' | 'bhog' | 'dhoop' | 'mala'

const ACTIONS: {
  id: PujaAction
  label: string
  icon: React.ReactNode
}[] = [
  {
    id: 'flowers',
    label: 'फूल',
    icon: (
      <img
        src="/images/marigold.png"
        alt=""
        className="h-7 w-7 object-contain"
      />
    ),
  },
  {
    id: 'aarti',
    label: 'आरती',
    icon: (
      <img src="/images/diya.png" alt="" className="h-7 w-7 object-contain" />
    ),
  },
  {
    id: 'bhog',
    label: 'भोग',
    icon: (
      <img src="/images/thali.png" alt="" className="h-7 w-7 object-contain" />
    ),
  },
  {
    id: 'dhoop',
    label: 'धूप',
    icon: (
      // Incense stick with smoke
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path
          d="M12 21V9"
          stroke="#c9a96e"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="7.5" r="1.6" fill="#f97316" />
        <path
          d="M12 5c-1.2-1.2.8-2 0-3.2M14.5 5.5c-1-.9.6-1.6 0-2.6"
          stroke="#c9a96e"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    ),
  },
  {
    id: 'mala',
    label: 'माला',
    icon: (
      // Prayer beads
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <circle cx="12" cy="5" r="1.7" fill="#d4a853" />
        <circle cx="17.5" cy="8" r="1.7" fill="#d4a853" />
        <circle cx="19" cy="14" r="1.7" fill="#d4a853" />
        <circle cx="15.5" cy="19" r="1.7" fill="#d4a853" />
        <circle cx="8.5" cy="19" r="1.7" fill="#d4a853" />
        <circle cx="5" cy="14" r="1.7" fill="#d4a853" />
        <circle cx="6.5" cy="8" r="1.7" fill="#d4a853" />
        <circle cx="12" cy="22" r="1.4" fill="#f97316" />
      </svg>
    ),
  },
]

export function WorshipTray({
  onAction,
  disabled,
}: {
  onAction: (action: PujaAction) => void
  disabled?: boolean
}) {
  return (
    <nav
      aria-label="Puja offerings"
      className="absolute right-0 bottom-0 left-0 z-50 flex h-20 items-center justify-around border-t border-gold/30 bg-gradient-to-t from-[#0d0705] to-[#0d0705]/95 px-2"
    >
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={disabled}
          onClick={() => onAction(action.id)}
          className="group flex flex-col items-center gap-0.5 focus-visible:outline-none disabled:opacity-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-gold/50 bg-gold/10 transition-all duration-150 group-active:scale-90 group-active:border-saffron group-active:bg-saffron/30">
            {action.icon}
          </span>
          <span className="font-serif text-[11px] text-cream-muted">
            {action.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
