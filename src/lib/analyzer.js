/**
 * Multilingual opportunity scorer (EN / FR / ES / HT) + nonsense filter.
 * No AI.
 */

const CATEGORIES = [
  {
    id: 'ecommerce',
    label: 'Ecommerce',
    base: 74,
    valueBoost: 8,
    keys: [
      'ecommerce', 'e-commerce', 'ecom', 'online store', 'webshop', 'shopify',
      'boutique en ligne', 'magasin en ligne', 'vente en ligne', 'boutique',
      'tienda online', 'comercio electronico', 'tienda',
      'vann online', 'vann sou entenet', 'boutik online', 'boutik',
      'rad online', 'vann rad', 'marketplace',
    ],
  },
  {
    id: 'mobile_app',
    label: 'Application mobile',
    base: 70,
    valueBoost: 10,
    keys: [
      'app', 'application', 'mobile app', 'android', 'ios', 'react native', 'flutter',
      'application mobile', 'appli',
      'aplicacion', 'app movil',
      'aplikasyon', 'aplikasyon mobil', 'ap mobil',
    ],
  },
  {
    id: 'website',
    label: 'Site web',
    base: 58,
    valueBoost: 4,
    keys: [
      'website', 'web site', 'landing page', 'landing', 'web page',
      'site web', 'site internet', 'page web', 'vitrine',
      'sitio web', 'pagina web',
      'sit entenet', 'sit web', 'paj web',
    ],
  },
  {
    id: 'restaurant',
    label: 'Restaurant / Food',
    base: 66,
    valueBoost: 6,
    keys: [
      'restaurant', 'food', 'delivery', 'catering', 'menu', 'cafe',
      'restauration', 'livraison', 'nourriture', 'traiteur',
      'comida', 'restaurante', 'entrega',
      'restoran', 'manje', 'livrezon',
    ],
  },
  {
    id: 'inventory',
    label: 'Gestion / Inventaire',
    base: 64,
    valueBoost: 7,
    keys: [
      'inventory', 'stock', 'warehouse', 'erp', 'management', 'pos',
      'inventaire', 'gestion', 'caisse',
      'inventario', 'almacen',
      'envante', 'jesyon',
    ],
  },
  {
    id: 'education',
    label: 'Education',
    base: 56,
    valueBoost: 5,
    keys: [
      'school', 'education', 'elearning', 'e-learning', 'course', 'training', 'lms',
      'ecole', 'formation', 'cours', 'apprentissage',
      'escuela', 'educacion', 'curso',
      'lekol', 'edikasyon', 'fomasyon', 'kou',
    ],
  },
  {
    id: 'booking',
    label: 'Reservation / Booking',
    base: 62,
    valueBoost: 6,
    keys: [
      'booking', 'appointment', 'reservation', 'schedule', 'calendar',
      'rendez-vous', 'reservation',
      'cita', 'reserva',
      'rezervasyon', 'randevou',
    ],
  },
  {
    id: 'logistics',
    label: 'Logistique / Livraison',
    base: 63,
    valueBoost: 6,
    keys: [
      'logistics', 'shipping', 'courier', 'fleet',
      'logistique', 'livraison', 'transport',
      'logistica', 'envio',
      'livrezon', 'transpo', 'kurye',
    ],
  },
  {
    id: 'fintech',
    label: 'Paiement / Fintech',
    base: 68,
    valueBoost: 9,
    keys: [
      'payment', 'fintech', 'wallet', 'banking', 'invoice', 'billing',
      'paiement', 'portefeuille', 'facture', 'moncash', 'natcash',
      'pago', 'billetera', 'facturacion',
      'peyman', 'peman', 'kob', 'transferans',
    ],
  },
]

/** Common real words across EN / FR / ES / HT to reject pure keyboard smash */
const REAL_WORDS = new Set(
  [
    // EN
    'i', 'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'my', 'we',
    'need', 'want', 'make', 'build', 'create', 'app', 'website', 'site', 'online', 'store',
    'sell', 'buy', 'people', 'business', 'project', 'idea', 'help', 'service', 'system',
    'manage', 'customer', 'clients', 'mobile', 'web', 'shop', 'food', 'school', 'pay',
    // FR
    'je', 'un', 'une', 'le', 'la', 'les', 'de', 'des', 'du', 'et', 'ou', 'pour', 'avec',
    'mon', 'ma', 'mes', 'nous', 'besoin', 'veux', 'faire', 'creer', 'site', 'application',
    'vendre', 'acheter', 'projet', 'idee', 'aide', 'service', 'systeme', 'gestion',
    'client', 'clients', 'boutique', 'ecole', 'paiement', 'livraison',
    // ES
    'yo', 'el', 'la', 'los', 'las', 'de', 'del', 'y', 'o', 'para', 'con', 'mi', 'mis',
    'necesito', 'quiero', 'hacer', 'crear', 'sitio', 'aplicacion', 'vender', 'comprar',
    'proyecto', 'idea', 'ayuda', 'servicio', 'sistema', 'gestion', 'cliente', 'tienda',
    'escuela', 'pago', 'entrega',
    // HT
    'mwen', 'yon', 'yo', 'nan', 'pou', 'ak', 'ou', 'nou', 'li', 'sa', 'ki', 'gen', 'bezwen',
    'vle', 'fe', 'kreye', 'sit', 'aplikasyon', 'vann', 'achte', 'pwoje', 'ide', 'ede',
    'sevis', 'sistèm', 'sistem', 'jesyon', 'kliyan', 'boutik', 'lekol', 'peman', 'livrezon',
    'rad', 'manje', 'restoran', 'online', 'enternet', 'mobil',
  ].map((w) => normalize(w))
)

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'azertyuiop', 'qsdfghjklm']

/** Insults / vulgar / junk tokens (normalized). Reject without echoing them. */
const BLOCKED_WORDS = new Set(
  [
    'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'nigger', 'nigga',
    'slut', 'whore', 'cunt', 'faggot', 'retard',
    'putain', 'merde', 'connard', 'connasse', 'salope', 'encule', 'pd', 'ntm', 'fdp',
    'puta', 'mierda', 'cabron', 'pendejo', 'maricón', 'maricon', 'joder', 'coño', 'cono',
    'kouyon', 'kouyon', 'malpwòpte', 'malpwopte', 'kaka', 'bouzen', 'bouzin', 'masisi',
    'xxx', 'porn', 'porno', 'nsfw', 'sexcam',
    'blabla', 'blahblah', 'asdfasdf', 'qwerty', 'lorem', 'ipsum', 'testtest',
    'hahaha', 'hehehe', 'lololol', 'azerty', 'undefined', 'nullnull',
  ].map((w) => normalize(w))
)

const FILLER_ONLY = /^(bla|ha|he|lol|lmao|ok|oui|non|yes|no|hi|hey|yo|test|abc|xyz|123)+$/

const INTENT_RE =
  /\b(bezwen|vle|kreye|fe|bati|devlope|need|want|build|make|create|develop|veux|besoin|creer|faire|desarrollar|necesito|quiero|hacer|crear)\b/

const VALUE_BANDS = [
  { min: 85, value: '$2,000 - $5,000 USD' },
  { min: 75, value: '$1,200 - $3,500 USD' },
  { min: 65, value: '$800 - $2,500 USD' },
  { min: 50, value: '$400 - $1,200 USD' },
  { min: 0, value: '$200 - $700 USD' },
]

function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function tokens(text) {
  return normalize(text)
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function looksLikeKeyboardWalk(word) {
  if (word.length < 5) return false
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i <= row.length - 4; i++) {
      const slice = row.slice(i, i + 4)
      if (word.includes(slice) || word.includes([...slice].reverse().join(''))) return true
    }
  }
  return false
}

function repeatedCharRatio(text) {
  const letters = text.replace(/[^a-z]/gi, '')
  if (letters.length < 8) return 0
  let maxRun = 1
  let run = 1
  for (let i = 1; i < letters.length; i++) {
    if (letters[i] === letters[i - 1]) {
      run += 1
      maxRun = Math.max(maxRun, run)
    } else {
      run = 1
    }
  }
  return maxRun / letters.length
}

function vowelRatio(text) {
  const letters = text.replace(/[^a-z]/gi, '')
  if (!letters.length) return 0
  const vowels = (letters.match(/[aeiouy]/g) || []).length
  return vowels / letters.length
}

function hasBlockedLanguage(words, text) {
  if (words.some((w) => BLOCKED_WORDS.has(w))) return true
  for (const bad of BLOCKED_WORDS) {
    if (bad.length >= 4 && text.includes(bad)) return true
  }
  return false
}

function hasCategorySignal(text) {
  return CATEGORIES.some((cat) => cat.keys.some((k) => text.includes(normalize(k))))
}

/**
 * Detect gibberish, insults, filler, or non-project text.
 */
export function detectNonsense(description) {
  const raw = description.trim()
  const text = normalize(raw)
  const words = tokens(raw)
  const lettersOnly = text.replace(/[^a-z]/g, '')
  const unique = new Set(words)

  if (hasBlockedLanguage(words, text)) {
    return {
      isNonsense: true,
      message:
        'Contenu non professionnel détecté. Merci de décrire ton idée de projet avec respect.',
    }
  }

  if (words.length < 4) {
    return {
      isNonsense: true,
      message:
        'Écris au moins 4 mots qui décrivent bien ton idée (quoi, pour qui, quel type).',
    }
  }

  if (unique.size <= 2 && words.length >= 4) {
    return {
      isNonsense: true,
      message: 'Évite de répéter les mêmes mots. Donne une description claire.',
    }
  }

  if (words.filter((w) => FILLER_ONLY.test(w)).length >= Math.ceil(words.length * 0.5)) {
    return {
      isNonsense: true,
      message: "Ce n'est pas une idée de projet. Écris une phrase claire sur ce que tu veux construire.",
    }
  }

  if (words.length < 3 && lettersOnly.length >= 18) {
    return {
      isNonsense: true,
      message: 'Texte peu clair. Décris ton idée avec des mots précis (quoi, pour qui).',
    }
  }

  if (repeatedCharRatio(text) > 0.28 || /(.)\1{4,}/.test(text)) {
    return {
      isNonsense: true,
      message: 'Trop de caractères répétés. Écris une vraie description de projet.',
    }
  }

  if (lettersOnly.length >= 12 && vowelRatio(lettersOnly) < 0.18) {
    return {
      isNonsense: true,
      message: 'Texte illisible. Écris une idée claire en français, anglais, espagnol ou créole.',
    }
  }

  const smashCount = words.filter(
    (w) => looksLikeKeyboardWalk(w) || /^(asdf|qwer|zxcv|lorem|test123|aaaa|bbbb)/.test(w)
  ).length
  if (smashCount >= 1) {
    return {
      isNonsense: true,
      message: 'Saisie aléatoire détectée. Merci de partager une idée de projet sérieuse.',
    }
  }

  const realHits = words.filter((w) => REAL_WORDS.has(w)).length
  const longWords = words.filter((w) => w.length >= 4)
  const realLong = longWords.filter((w) => REAL_WORDS.has(w)).length
  const categoryOk = hasCategorySignal(text)
  const intentOk = INTENT_RE.test(text)

  if (!categoryOk && longWords.length >= 2 && realLong / Math.max(longWords.length, 1) < 0.25 && realHits < 3) {
    return {
      isNonsense: true,
      message:
        'Idée incompréhensible. Exemple: "J\'ai besoin d\'un ecommerce pour vendre des vêtements en ligne".',
    }
  }

  if (!categoryOk && !intentOk && realHits < 4) {
    return {
      isNonsense: true,
      message:
        "Cela ne ressemble pas à une idée de projet. Dis ce que tu veux construire (app, site, ecommerce...) et pour qui.",
    }
  }

  if (!categoryOk && !intentOk) {
    return {
      isNonsense: true,
      message:
        'Ajoute une intention claire: besoin / veux / need / quiero + le type de projet.',
    }
  }

  if (lettersOnly.length < Math.min(12, raw.length * 0.45)) {
    return {
      isNonsense: true,
      message: 'Utilise surtout des mots, pas seulement des chiffres ou des symboles.',
    }
  }

  return { isNonsense: false, message: '' }
}

function detectLanguageHints(text) {
  const t = normalize(text)
  const hints = []
  if (/\b(the|and|for|with|need|want|app|website)\b/.test(t)) hints.push('en')
  if (/\b(je|pour|avec|besoin|application|site)\b/.test(t)) hints.push('fr')
  if (/\b(necesito|para|con|quiero|aplicacion|sitio)\b/.test(t)) hints.push('es')
  if (/\b(mwen|pou|ak|bezwen|vle|yon|nan)\b/.test(t)) hints.push('ht')
  return hints.length ? hints : ['unknown']
}

export function analyzeIdea(description) {
  const nonsense = detectNonsense(description)
  if (nonsense.isNonsense) {
    return {
      rejected: true,
      category: 'Signal invalide',
      score: 0,
      estimatedValue: 'N/A',
      analysis: nonsense.message,
      locales: [],
      matchedKeywords: [],
    }
  }

  const original = description.trim()
  const text = normalize(original)
  const locales = detectLanguageHints(original)

  let best = null
  let hits = 0
  const matchedCategories = []

  for (const cat of CATEGORIES) {
    const matchedKeys = cat.keys.filter((k) => text.includes(normalize(k)))
    if (matchedKeys.length > 0) {
      hits += matchedKeys.length
      matchedCategories.push(cat)
      if (!best || cat.base + matchedKeys.length > best.base) {
        best = { ...cat, matchedKeys }
      }
    }
  }

  let score = best ? best.base : 36
  score += Math.min(hits * 3, 18)
  if (matchedCategories.length > 1) score += 5
  if (original.length >= 80) score += 3
  if (original.length >= 140) score += 4
  if (original.length >= 200) score += 3
  if (best) score += Math.min(best.valueBoost, 10)
  if (/\b(pou|para|for|pour)\b/.test(text)) score += 2
  if (/\b(vann|sell|vender|vendre|clients?|kliyan|clientes?)\b/.test(text)) score += 3

  score = clamp(Math.round(score), 1, 100)

  const category = best ? best.label : 'Idee generale'
  const band = VALUE_BANDS.find((b) => score >= b.min)

  const analysis = best
    ? `Signal détecté: ${category}. Mots-clés reconnus (${locales.join(', ')}). Score indicatif basé sur la clarté et le potentiel commercial estimé.`
    : 'Idée ouverte. Ajoute le type de produit, le public cible et le canal (app, site, ecommerce) pour renforcer le signal.'

  return {
    rejected: false,
    category,
    score,
    estimatedValue: band.value,
    analysis,
    locales,
    matchedKeywords: best ? best.matchedKeys.slice(0, 6) : [],
  }
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
