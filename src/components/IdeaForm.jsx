import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { analyzeIdea, delay, detectNonsense } from '../lib/analyzer'
import { isSheetsConfigured, submitIdea } from '../lib/submitIdea'
import ResultPanel from './ResultPanel'

const MIN_CHARS = 20
const MAX_CHARS = 255

export default function IdeaForm({ onIntensityChange }) {
  const contactId = useId()
  const descriptionId = useId()
  const contactErrorId = useId()
  const descriptionErrorId = useId()

  const [contact, setContact] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [saveNote, setSaveNote] = useState('')

  const charCount = description.length
  const remaining = MAX_CHARS - charCount
  const isNearLimit = remaining <= 30

  function validate() {
    const next = {}

    if (contact.trim()) {
      const value = contact.trim()
      const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      const looksPhone = /^[+]?[\d\s().-]{7,20}$/.test(value)
      const looksUsername = /^@?[a-zA-Z0-9._-]{3,32}$/.test(value)
      if (!looksEmail && !looksPhone && !looksUsername) {
        next.contact =
          "Indique un email, un numéro de téléphone, ou un nom d'utilisateur valide."
      }
    }

    if (charCount < MIN_CHARS) {
      next.description = `La description doit contenir au moins ${MIN_CHARS} caractères.`
    } else if (charCount > MAX_CHARS) {
      next.description = `La description ne peut pas dépasser ${MAX_CHARS} caractères.`
    } else {
      const nonsense = detectNonsense(description)
      if (nonsense.isNonsense) {
        next.description = nonsense.message
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'loading') return
    if (!validate()) return

    setStatus('loading')
    setResult(null)
    setSaveNote('')
    onIntensityChange?.(0.4)

    await delay(900)
    const analysis = analyzeIdea(description.trim())

    if (analysis.rejected) {
      setErrors({ description: analysis.analysis })
      setStatus('idle')
      onIntensityChange?.(0)
      return
    }

    setResult(analysis)
    setStatus('success')
    onIntensityChange?.(analysis.score / 100)

    if (isSheetsConfigured()) {
      const saved = await submitIdea({
        contact: contact.trim(),
        description: description.trim(),
        category: analysis.category,
        score: analysis.score,
        estimatedValue: analysis.estimatedValue,
        analysis: analysis.analysis,
        rejected: false,
      })
      setSaveNote(
        saved.ok
          ? 'Ide anrejistre nan Google Sheet.'
          : `Analiz OK, men anrejistreman echwe: ${saved.error}`
      )
    } else {
      setSaveNote('Analiz lokal OK. Google Sheets poko konfigire (gade SETUP-GOOGLE-SHEETS.md).')
    }
  }

  function handleReset() {
    setContact('')
    setDescription('')
    setErrors({})
    setResult(null)
    setSaveNote('')
    setStatus('idle')
    onIntensityChange?.(0)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label htmlFor={contactId} className="block text-sm font-semibold text-mist">
            Contact <span className="font-normal text-fog">(optionnel)</span>
          </label>
          <p id={`${contactId}-hint`} className="mt-1 text-sm text-fog">
            Email, téléphone ou nom d&apos;utilisateur
          </p>
          <input
            id={contactId}
            name="contact"
            type="text"
            autoComplete="email"
            inputMode="email"
            value={contact}
            onChange={(e) => {
              setContact(e.target.value)
              if (errors.contact) setErrors((prev) => ({ ...prev, contact: undefined }))
            }}
            aria-describedby={`${contactId}-hint${errors.contact ? ` ${contactErrorId}` : ''}`}
            aria-invalid={Boolean(errors.contact)}
            placeholder="ex. toi@email.com ou +509...."
            className="mt-3 w-full rounded-none border-0 border-b border-white/20 bg-transparent px-0 py-3 text-base text-snow outline-none transition placeholder:text-fog/60 focus:border-signal"
          />
          {errors.contact ? (
            <p id={contactErrorId} role="alert" className="mt-2 text-sm text-danger">
              {errors.contact}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-end justify-between gap-4">
            <label htmlFor={descriptionId} className="block text-sm font-semibold text-mist">
              Description du projet
            </label>
            <span
              className={`tabular-nums text-xs font-medium ${
                charCount < MIN_CHARS ? 'text-fog' : isNearLimit ? 'text-signal' : 'text-mist'
              }`}
              aria-live="polite"
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
          <p id={`${descriptionId}-hint`} className="mt-1 text-sm text-fog">
            Entre {MIN_CHARS} et {MAX_CHARS} caractères. Ide klè sèlman: pa tenten, pa mo sal.
          </p>
          <textarea
            id={descriptionId}
            name="description"
            rows={5}
            maxLength={MAX_CHARS}
            value={description}
            onChange={(e) => {
              const next = e.target.value.slice(0, MAX_CHARS)
              setDescription(next)
              onIntensityChange?.(Math.min(0.35, next.length / MAX_CHARS))
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }))
              }
            }}
            aria-describedby={`${descriptionId}-hint${
              errors.description ? ` ${descriptionErrorId}` : ''
            }`}
            aria-invalid={Boolean(errors.description)}
            placeholder="Ex. Mwen bezwen yon ecommerce pou vann rad online..."
            className="mt-3 w-full resize-y rounded-2xl border border-white/12 bg-ink-soft/80 px-4 py-3 text-base leading-relaxed text-snow outline-none transition placeholder:text-fog/55 focus:border-signal/70 focus:ring-2 focus:ring-signal/25"
          />
          {errors.description ? (
            <p id={descriptionErrorId} role="alert" className="mt-2 text-sm text-danger">
              {errors.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-signal px-7 py-3 font-display text-base font-bold tracking-wide text-ink transition hover:bg-signal-dim disabled:cursor-not-allowed disabled:opacity-70"
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === 'loading' ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
                  Analyse en cours...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Analyser le signal
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {status === 'success' ? (
            <button
              type="button"
              onClick={handleReset}
              className="min-h-12 px-4 text-sm font-semibold text-fog underline-offset-4 transition hover:text-mist hover:underline"
            >
              Nouvelle idée
            </button>
          ) : null}
        </div>

        {status === 'success' ? (
          <p className="text-sm font-medium text-ok" role="status">
            Analyse terminée. {saveNote}
          </p>
        ) : null}
      </form>

      <AnimatePresence>
        {result && !result.rejected ? <ResultPanel key="result" result={result} /> : null}
      </AnimatePresence>
    </div>
  )
}
