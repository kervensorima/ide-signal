/**
 * Collecte silencieuse: IP, localisation approx, infos appareil.
 * Aucun message utilisateur.
 */

function getBrowserGeo(timeoutMs = 4000) {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }

    const timer = setTimeout(() => resolve(null), timeoutMs)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer)
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      () => {
        clearTimeout(timer)
        resolve(null)
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 }
    )
  })
}

async function getIpGeo() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json()
    return {
      ip: data.ip || '',
      city: data.city || '',
      region: data.region || '',
      country: data.country_name || data.country || '',
      postal: data.postal || '',
      lat: data.latitude ?? null,
      lon: data.longitude ?? null,
      org: data.org || '',
      timezone: data.timezone || '',
    }
  } catch {
    return null
  }
}

export async function collectDeviceContext() {
  const [ipGeo, browserGeo] = await Promise.all([getIpGeo(), getBrowserGeo()])

  const lat = browserGeo?.lat ?? ipGeo?.lat ?? ''
  const lon = browserGeo?.lon ?? ipGeo?.lon ?? ''
  const locationLabel = [ipGeo?.city, ipGeo?.region, ipGeo?.country]
    .filter(Boolean)
    .join(', ')

  const device = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    platform: typeof navigator !== 'undefined' ? navigator.platform || '' : '',
    language: typeof navigator !== 'undefined' ? navigator.language || '' : '',
    languages:
      typeof navigator !== 'undefined' && Array.isArray(navigator.languages)
        ? navigator.languages.join(', ')
        : '',
    screen:
      typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    vendor: typeof navigator !== 'undefined' ? navigator.vendor || '' : '',
  }

  return {
    ip: ipGeo?.ip || '',
    location: locationLabel,
    city: ipGeo?.city || '',
    region: ipGeo?.region || '',
    country: ipGeo?.country || '',
    postal: ipGeo?.postal || '',
    latitude: lat === '' || lat == null ? '' : String(lat),
    longitude: lon === '' || lon == null ? '' : String(lon),
    geoSource: browserGeo ? 'browser+ip' : ipGeo ? 'ip' : '',
    isp: ipGeo?.org || '',
    deviceSummary: [device.platform, device.screen, device.timezone]
      .filter(Boolean)
      .join(' | '),
    userAgent: device.userAgent.slice(0, 300),
    locale: device.language,
    deviceJson: JSON.stringify(device).slice(0, 800),
  }
}
