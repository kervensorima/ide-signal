import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

const COLORS = ['#e8a838', '#ffd76a', '#fff4d0', '#f4f6f9', '#ffb347', '#ffe8a3']

function fireParty() {
  const defaults = {
    colors: COLORS,
    disableForReducedMotion: true,
    zIndex: 80,
  }

  confetti({
    ...defaults,
    particleCount: 70,
    spread: 72,
    startVelocity: 42,
    origin: { x: 0.5, y: 0.55 },
    shapes: ['star', 'circle'],
    scalar: 1.05,
  })

  confetti({
    ...defaults,
    particleCount: 45,
    angle: 60,
    spread: 58,
    origin: { x: 0.08, y: 0.7 },
    shapes: ['star'],
  })

  confetti({
    ...defaults,
    particleCount: 45,
    angle: 120,
    spread: 58,
    origin: { x: 0.92, y: 0.7 },
    shapes: ['star'],
  })

  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 55,
      spread: 100,
      startVelocity: 28,
      gravity: 0.85,
      ticks: 220,
      origin: { x: 0.5, y: 0.35 },
      shapes: ['star', 'circle'],
      scalar: 0.9,
    })
  }, 280)

  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 30,
      spread: 360,
      startVelocity: 18,
      gravity: 0.6,
      ticks: 180,
      origin: { x: 0.5, y: 0.45 },
      shapes: ['star'],
      scalar: 0.75,
    })
  }, 650)
}

function SparkleField() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${6 + ((i * 17) % 88)}%`,
        top: `${8 + ((i * 23) % 78)}%`,
        size: 4 + (i % 5) * 2,
        delay: (i % 7) * 0.12,
        duration: 1.4 + (i % 4) * 0.35,
      })),
    []
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {sparks.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-signal"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: '0 0 10px color-mix(in srgb, var(--color-signal) 80%, transparent)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.2, 1, 0],
            scale: [0, 1.4, 0.6, 1.2, 0],
            y: [0, -12, -28],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            ease: 'easeOut',
          }}
        />
      ))}

      {sparks.slice(0, 10).map((s) => {
        const size = 10 + (s.id % 4) * 4
        return (
          <motion.span
            key={`star-${s.id}`}
            className="absolute"
            style={{
              left: s.left,
              top: s.top,
              width: size,
              height: size,
              filter: 'drop-shadow(0 0 6px rgba(232,168,56,0.7))',
            }}
            initial={{ opacity: 0, rotate: -20, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              rotate: [-20, 15, 40],
              scale: [0, 1.2, 0.8, 0],
              y: [0, -30 - (s.id % 5) * 8],
            }}
            transition={{
              duration: 1.8 + (s.id % 3) * 0.25,
              delay: 0.15 + s.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <svg viewBox="0 0 24 24" className="h-full w-full fill-signal">
              <path d="M12 2.2l2.4 7.1h7.4l-6 4.4 2.3 7.1L12 16.5 6 20.8l2.3-7.1-6-4.4h7.4L12 2.2z" />
            </svg>
          </motion.span>
        )
      })}
    </div>
  )
}

/**
 * Fires confetti + floating stars when `active` becomes true.
 */
export default function CelebrationBurst({ active }) {
  const [showSparks, setShowSparks] = useState(false)

  useEffect(() => {
    if (!active) {
      setShowSparks(false)
      return undefined
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) return undefined

    setShowSparks(true)
    fireParty()

    const hide = window.setTimeout(() => setShowSparks(false), 2200)
    return () => window.clearTimeout(hide)
  }, [active])

  return (
    <AnimatePresence>
      {showSparks ? (
        <motion.div
          key="celebration"
          className="pointer-events-none absolute inset-0 z-20"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SparkleField />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
