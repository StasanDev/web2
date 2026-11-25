const cache = new Map()

function cacheKey({ mode, query }) {
  return `anime-echo:${mode}:${query.toLocaleLowerCase('ru-RU')}`
}

export function readSearchCache(search) {
  const key = cacheKey(search)
  if (cache.has(key)) return cache.get(key)

  try {
    const stored = sessionStorage.getItem(key)
    if (stored === null) return null

    const quotes = JSON.parse(stored)
    if (!Array.isArray(quotes)) return null

    cache.set(key, quotes)
    return quotes
  } catch {
    return null
  }
}

export function writeSearchCache(search, quotes) {
  const key = cacheKey(search)
  cache.set(key, quotes)

  try {
    sessionStorage.setItem(key, JSON.stringify(quotes))
  } catch {
    return
  }
}
