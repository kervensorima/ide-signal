import { useState } from 'react'
import { motion } from 'framer-motion'
import SignalBackground from './components/SignalBackground'
import IdeaForm from './components/IdeaForm'

export default function App() {
  const [intensity, setIntensity] = useState(0)

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <SignalBackground intensity={intensity} />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16"
        >
          <p className="font-display text-[clamp(2.75rem,12vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.04em] text-snow">
            IDE
            <span className="block text-signal">SIGNAL</span>
          </p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 max-w-md text-base leading-relaxed text-mist sm:text-lg"
          >
            Partage ton idée de projet. On mesure la force du signal et on te donne
            un score d&apos;opportunité.
          </motion.p>
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[1.75rem] border border-white/10 bg-ink-soft/55 p-5 backdrop-blur-md sm:p-8"
        >
          <h1 className="font-display text-xl font-bold tracking-tight text-snow sm:text-2xl">
            Envoie ton idée
          </h1>
          <p className="mt-2 text-sm text-fog sm:text-base">
            Pas besoin d&apos;un plan parfait. Une description claire suffit pour commencer.
          </p>

          <div className="mt-8">
            <IdeaForm onIntensityChange={setIntensity} />
          </div>
        </motion.main>

        <footer className="mt-auto pt-12 text-center text-xs text-fog/80">
          IDE SIGNAL · Score indicatif · Sans IA
        </footer>
      </div>
    </div>
  )
}
