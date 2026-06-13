'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Zone-targeted flower system. Flowers fall ONLY within the deity band
 * (center ~78% width) and settle into 3 zones relative to the deity:
 * head (30%), chest (45%), feet (25%) — like real temple flower showers.
 * The flower image is selectable (rose, lily, marigold, hibiscus, etc).
 */

interface Flower {
  id: number
  /** Horizontal position as % of the deity band (0-100) */
  x: number
  /** Where the flower starts falling from, vh */
  startY: number
  /** Where the flower settles/fades, vh */
  endY: number
  size: number
  delay: number
  duration: number
  swayLeft: number
  swayRight: number
  swayFinal: number
  spin1: number
  spin2: number
  spin3: number
  spinFinal: number
  image: string
}

const ZONES = [
  // head zone — top of deity
  { x: [32, 68], endY: [22, 32], weight: 0.3 },
  // chest zone — middle
  { x: [22, 78], endY: [36, 52], weight: 0.45 },
  // feet zone — bottom
  { x: [14, 86], endY: [62, 76], weight: 0.25 },
] as const

let flowerId = 0

function pickZone() {
  const r = Math.random()
  let acc = 0
  for (const z of ZONES) {
    acc += z.weight
    if (r <= acc) return z
  }
  return ZONES[1]
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function makeFlower(image: string, burst = false): Flower {
  const zone = pickZone()
  const swayAmount = burst ? rand(8, 16) : rand(10, 20)
  return {
    id: flowerId++,
    x: rand(zone.x[0], zone.x[1]),
    startY: rand(-12, -4),
    endY: rand(zone.endY[0], zone.endY[1]),
    size: burst ? rand(22, 38) : rand(26, 44),
    delay: burst ? rand(0, 0.35) : rand(0, 1.1),
    duration: burst ? rand(2.2, 3.2) : rand(2.6, 3.6),
    // Gentle alternating sway left-right during fall
    swayLeft: -swayAmount,
    swayRight: swayAmount,
    swayFinal: rand(-6, 6),
    // Smooth rotation progression: 0 → ~45 → ~135 → ~225 → ~360
    spin1: rand(20, 80),
    spin2: rand(100, 160),
    spin3: rand(180, 240),
    spinFinal: rand(320, 400),
    image,
  }
}

export function FlowerParticles({
  shower,
  flowerImage,
  burst,
}: {
  /** increment to trigger a flower shower */
  shower: number
  /** which flower image falls during the shower */
  flowerImage: string
  /** increment to trigger a 30 flower celebration burst (mixed flowers) */
  burst: number
}) {
  const [flowers, setFlowers] = useState<Flower[]>([])
  const prevShower = useRef(shower)
  const prevBurst = useRef(burst)

  useEffect(() => {
    if (shower === prevShower.current) return
    prevShower.current = shower
    const batch = Array.from({ length: 16 }, () => makeFlower(flowerImage))
    setFlowers((prev) => [...prev, ...batch])
    const ids = new Set(batch.map((f) => f.id))
    const t = setTimeout(
      () => setFlowers((prev) => prev.filter((f) => !ids.has(f.id))),
      4800,
    )
    return () => clearTimeout(t)
  }, [shower, flowerImage])

  useEffect(() => {
    if (burst === prevBurst.current) return
    prevBurst.current = burst
    const mixed = [
      '/images/marigold.png',
      '/images/flowers/rose.png',
      '/images/flower.png',
      '/images/flowers/hibiscus.png',
    ]
    const batch = Array.from({ length: 30 }, (_, i) =>
      makeFlower(mixed[i % mixed.length], true),
    )
    setFlowers((prev) => [...prev, ...batch])
    const ids = new Set(batch.map((f) => f.id))
    const t = setTimeout(
      () => setFlowers((prev) => prev.filter((f) => !ids.has(f.id))),
      4800,
    )
    return () => clearTimeout(t)
  }, [burst])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[76px] bottom-20 left-1/2 z-20 w-[78%] max-w-md -translate-x-1/2 overflow-hidden"
    >
      {/* Action-triggered flowers */}
      {flowers.map((f) => (
        <img
          key={f.id}
          src={f.image}
          alt=""
          className="flower-fall absolute"
          style={
            {
              left: `${f.x}%`,
              top: 0,
              width: f.size,
              height: f.size,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
              '--fall-start': `${f.startY}vh`,
              '--fall-end': `${f.endY}vh`,
              '--fall-sway-left': `${f.swayLeft}px`,
              '--fall-sway-right': `${f.swayRight}px`,
              '--fall-sway-final': `${f.swayFinal}px`,
              '--fall-spin-1': `${f.spin1}deg`,
              '--fall-spin-2': `${f.spin2}deg`,
              '--fall-spin-3': `${f.spin3}deg`,
              '--fall-spin-final': `${f.spinFinal}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
