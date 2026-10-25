const ENDPOINT = import.meta.env.VITE_APPS_SCRIPT_URL || ''
const SECRET = import.meta.env.VITE_APPS_SCRIPT_SECRET || ''

export function isSheetsConfigured() {
  return Boolean(ENDPOINT && /^https:\/\//i.test(ENDPOINT))
}

export async function submitIdea(payload) {
  if (!isSheetsConfigured()) {
    return { ok: false, skipped: true, error: 'Google Sheets non configure' }
  }

  const body = {
    ...payload,
    secret: SECRET || undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    locale: typeof navigator !== 'undefined' ? navigator.language : '',
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      signal: controller.signal,
      redirect: 'follow',
    })

    const text = await response.text()
    let data = null
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }

    if (!response.ok || (data && data.ok === false)) {
      return {
        ok: false,
        error: (data && data.error) || `Erreur serveur (${response.status})`,
      }
    }

    return { ok: true, data }
  } catch (err) {
    if (err && err.name === 'AbortError') {
      return { ok: false, error: 'Delai depasse. Reessaie dans un instant.' }
    }
    return { ok: false, error: "Impossible d'enregistrer. Verifie ta connexion." }
  } finally {
    clearTimeout(timeout)
  }
}
