import './styles.css'
import { AnimechanError, getRandomQuote } from './api/animechan.js'

const elements = {
  featuredContent: document.querySelector('#featured-content'),
  featuredError: document.querySelector('#featured-error'),
  featuredErrorMessage: document.querySelector('#featured-error-message'),
  featuredRetry: document.querySelector('#featured-retry'),
  randomButton: document.querySelector('#random-button'),
}

let randomController

function createElement(tag, className, text) {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function normaliseQuote(quote) {
  return {
    content: quote?.content?.trim() || 'Текст цитаты недоступен.',
    anime: quote?.anime?.name?.trim() || 'Неизвестное аниме',
    altAnime: quote?.anime?.altName?.trim() || '',
    character: quote?.character?.name?.trim() || 'Неизвестный персонаж',
  }
}

function getReadableError(error) {
  if (error instanceof AnimechanError) {
    if (error.status === 404) return 'По этому запросу цитаты не нашлись. Попробуйте другое написание.'
    if (error.status === 429) return 'Дневной лимит Animechan исчерпан. Попробуйте снова позже.'
    if (error.status >= 500) return 'Animechan временно недоступен. Попробуйте повторить запрос.'
    return error.message
  }

  return 'Что-то пошло не так. Попробуйте повторить запрос.'
}

function renderFeaturedLoading() {
  elements.featuredError.hidden = true
  elements.featuredContent.hidden = false
  elements.featuredContent.setAttribute('aria-busy', 'true')
  elements.featuredContent.replaceChildren()

  const skeleton = createElement('div', 'featured-skeleton')
  skeleton.setAttribute('aria-label', 'Загрузка случайной цитаты')
  skeleton.innerHTML = `
    <span class="skeleton skeleton--quote"></span>
    <span class="skeleton skeleton--quote skeleton--short"></span>
    <span class="skeleton skeleton--meta"></span>
  `
  elements.featuredContent.append(skeleton)
}

function renderFeatured(quoteData) {
  const quote = normaliseQuote(quoteData)
  elements.featuredContent.replaceChildren()
  elements.featuredContent.setAttribute('aria-busy', 'false')

  const mark = createElement('span', 'quote-mark', '“')
  mark.setAttribute('aria-hidden', 'true')

  const text = createElement('blockquote', 'featured-quote', quote.content)

  const meta = createElement('div', 'featured-meta')
  const person = createElement('div')
  person.append(
    createElement('span', null, 'Персонаж'),
    createElement('strong', null, quote.character),
  )
  const anime = createElement('div')
  anime.append(
    createElement('span', null, 'Аниме'),
    createElement('strong', null, quote.anime),
  )
  meta.append(person, anime)

  elements.featuredContent.append(mark, text, meta)
}

function renderFeaturedError(error) {
  elements.featuredContent.hidden = true
  elements.featuredContent.setAttribute('aria-busy', 'false')
  elements.featuredErrorMessage.textContent = getReadableError(error)
  elements.featuredError.hidden = false
}

async function loadRandomQuote() {
  randomController?.abort()
  randomController = new AbortController()
  elements.randomButton.disabled = true
  elements.randomButton.classList.add('is-loading')
  renderFeaturedLoading()

  try {
    const quote = await getRandomQuote({ signal: randomController.signal })
    renderFeatured(quote)
  } catch (error) {
    if (error.name !== 'AbortError') renderFeaturedError(error)
  } finally {
    elements.randomButton.disabled = false
    elements.randomButton.classList.remove('is-loading')
  }
}

elements.randomButton.addEventListener('click', loadRandomQuote)
elements.featuredRetry.addEventListener('click', loadRandomQuote)

loadRandomQuote()
