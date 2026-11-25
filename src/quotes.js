import { AnimechanError } from './api/animechan.js'

export function normalizeQuote(quote) {
  return {
    content: quote?.content?.trim() || 'Текст цитаты недоступен',
    anime: quote?.anime?.name?.trim() || 'Неизвестное аниме',
    character: quote?.character?.name?.trim() || 'Неизвестный персонаж',
  }
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
