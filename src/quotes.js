import { AnimechanError } from './api/animechan.js'

export function normalizeQuote(quote) {
  return {
    content: quote?.content?.trim() || 'Текст цитаты недоступен',
    anime: quote?.anime?.name?.trim() || 'Неизвестное аниме',
    character: quote?.character?.name?.trim() || 'Неизвестный персонаж',
  }
}

export function prepareQuoteResults(quotes) {
  const occurrences = new Map()

  return quotes.map(rawQuote => {
    const quote = normalizeQuote(rawQuote)
    const identity = JSON.stringify([quote.anime, quote.character, quote.content])
    const occurrence = (occurrences.get(identity) ?? 0) + 1
    occurrences.set(identity, occurrence)
    return { ...quote, key: `${identity}:${occurrence}` }
  })
}

export function getReadableError(error) {
  if (error instanceof AnimechanError) {
    if (error.status === 404) return 'Цитаты не нашлись. Проверьте написание.'
    if (error.status === 429) return 'Лимит запросов Animechan исчерпан. Попробуйте позже.'
    if (error.status >= 500) return 'Animechan временно недоступен. Попробуйте позже.'
    return error.message
  }

  return 'Ошибка загрузки. Попробуйте ещё раз.'
}

export function formatQuoteCount(count) {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${count} цитат`
  if (lastDigit === 1) return `${count} цитата`
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} цитаты`
  return `${count} цитат`
}
