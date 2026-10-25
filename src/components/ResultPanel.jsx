import { motion } from 'framer-motion'
import CelebrationBurst from './CelebrationBurst'

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const progress = score / 100

  return (
    <div className="relative mx-auto h-36 w-36">
      <motion.div
        className="pointer-events-none absolute inset-[-18%] rounded-full"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{
          opacity: [0, 0.55, 0.2],
          scale: [0.7, 1.08, 1],
          boxShadow: [
            '0 0 0 0 color-mix(in srgb, var(--color-signal) 0%, transparent)',
            '0 0 48px 8px color-mix(in srgb, var(--color-signal) 35%, transparent)',
            '0 0 24px 2px color-mix(in srgb, var(--color-signal) 18%, transparent)',
          ],
        }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        aria-hidden="true"
      />
      <svg className="relative h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-ink-lift"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-4xl font-extrabold tracking-tight text-snow"
          initial={{ opacity: 0, y: 8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 18 }}
        >
          {score}
        </motion.span>
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-fog">/ 100</span>
      </div>
    </div>
  )
}

export default function ResultPanel({ result }) {
  if (!result) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-10 overflow-hidden border-t border-white/10 pt-10"
      aria-live="polite"
      aria-atomic="true"
    >
      <CelebrationBurst active={!result.rejected && result.score > 0} />

      <p className="relative font-display text-2xl font-bold tracking-tight text-snow sm:text-3xl">
        Signal reçu
      </p>
      <p className="relative mt-2 max-w-xl text-sm leading-relaxed text-fog sm:text-base">
        Voici une estimation indicative pour filtrer l&apos;opportunité. Ce n&apos;est pas une
        valuation professionnelle.
      </p>

      <div className="relative mt-8 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
        <ScoreRing score={result.score} />

        <dl className="grid gap-5">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-fog">
              Catégorie
            </dt>
            <dd className="mt-1 font-display text-xl font-bold text-signal">{result.category}</dd>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 }}
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-fog">
              Valeur estimée
            </dt>
            <dd className="mt-1 text-lg font-semibold text-snow">{result.estimatedValue}</dd>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.44 }}
          >
            <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-fog">
              Analyse courte
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-mist">{result.analysis}</dd>
          </motion.div>
        </dl>
      </div>
    </motion.section>
  )
}
