import { motion } from 'framer-motion'

export default function SignalBackground({ intensity = 0 }) {
  const glow = 0.12 + intensity * 0.35

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% -10%, color-mix(in srgb, var(--color-signal) 18%, transparent), transparent 55%), radial-gradient(ellipse 60% 40% at 80% 80%, color-mix(in srgb, var(--color-signal) 8%, transparent), transparent 50%), linear-gradient(180deg, var(--color-ink) 0%, #0a0d12 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
        }}
      />

      <div className="absolute left-1/2 top-[38%] h-[min(90vw,640px)] w-[min(90vw,640px)] -translate-x-1/2 -translate-y-1/2">
        {[1, 2, 3, 4].map((ring) => (
          <motion.div
            key={ring}
            className="absolute inset-0 rounded-full border border-signal/25"
            style={{
              scale: 0.25 + ring * 0.2,
              opacity: 0.15 + ring * 0.08,
            }}
            animate={{
              opacity: [0.12 + ring * 0.05, 0.28 + ring * 0.06, 0.12 + ring * 0.05],
              scale: [0.25 + ring * 0.2, 0.27 + ring * 0.2, 0.25 + ring * 0.2],
            }}
            transition={{
              duration: 4 + ring * 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: ring * 0.35,
            }}
          />
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 h-[2px] w-1/2 origin-left"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--color-signal) 80%, transparent), transparent)',
            boxShadow: `0 0 24px color-mix(in srgb, var(--color-signal) ${glow * 100}%, transparent)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
          animate={{
            boxShadow: [
              `0 0 0 0 color-mix(in srgb, var(--color-signal) 45%, transparent)`,
              `0 0 0 18px color-mix(in srgb, var(--color-signal) 0%, transparent)`,
            ],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      </div>

      <div className="noise-overlay absolute inset-0" />
    </div>
  )
}
