const BASE_URL = 'https://api.animechan.io/v1'

export class AnimechanError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'AnimechanError'
    this.status = status
  }
}

async function request(path, { params = {}, signal } = {}) {
  const url = new URL(`${BASE_URL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  let response

  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new AnimechanError('Не удалось связаться с Animechan. Проверьте подключение к интернету.')
  }

  const body = await response.json().catch(() => null)

  if (!response.ok || body?.status === 'error') {
    const apiMessage = body?.error?.message ?? body?.message
    throw new AnimechanError(apiMessage || `Animechan вернул ошибку HTTP ${response.status}.`, response.status)
  }

  return body?.data ?? body
}

export function getRandomQuote({ signal } = {}) {
  return request('/quotes/random', { signal })
}
