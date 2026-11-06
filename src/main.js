import './styles.css'
import { AnimechanError, getRandomQuote, searchQuotes } from './api/animechan.js'

const elements = {
  featuredContent: document.querySelector('#featured-content'),
  featuredError: document.querySelector('#featured-error'),
  featuredErrorMessage: document.querySelector('#featured-error-message'),
  featuredRetry: document.querySelector('#featured-retry'),
  randomButton: document.querySelector('#random-button'),
  searchForm: document.querySelector('#search-form'),
  searchLabel: document.querySelector('label[for="search-input"]'),
  searchInput: document.querySelector('#search-input'),
  fieldError: document.querySelector('#field-error'),
  resultsHeading: document.querySelector('#results-heading'),
  resultsTitle: document.querySelector('#results-title'),
  resultCount: document.querySelector('#result-count'),
  resultsState: document.querySelector('#results-state'),
  resultsGrid: document.querySelector('#results-grid'),
  toast: document.querySelector('#toast'),
}

const modeCopy = {
  anime: {
    label: 'Название аниме',
    placeholder: 'Например, Naruto',
    preposition: 'в аниме',
  },
  character: {
    label: 'Имя персонажа',
    placeholder: 'Например, Saitama',
    preposition: 'у персонажа',
  },
}

let randomController
let searchController
let lastSearch = null
let toastTimer

const cache = new Map()

function getSelectedMode() {
  return new FormData(elements.searchForm).get('mode')
}

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

function renderResultsLoading() {
  elements.resultsGrid.replaceChildren()
  elements.resultsHeading.hidden = true
  elements.resultsState.hidden = false
  elements.resultsState.setAttribute('aria-busy', 'true')
  elements.resultsState.innerHTML = `
    <div class="loading-state">
      <span class="loader" aria-hidden="true"></span>
      <div>
        <strong>Ищем нужные слова…</strong>
        <p>Запрашиваем цитаты у Animechan.</p>
      </div>
    </div>
  `
}

function renderResultsError(error) {
  elements.resultsGrid.replaceChildren()
  elements.resultsHeading.hidden = true
  elements.resultsState.hidden = false
  elements.resultsState.setAttribute('aria-busy', 'false')
  elements.resultsState.innerHTML = `
    <div class="message-state message-state--error" role="alert">
      <span class="message-state__icon" aria-hidden="true">!</span>
      <div>
        <strong>Запрос не удался</strong>
        <p></p>
        <button class="retry-button" type="button">Повторить запрос</button>
      </div>
    </div>
  `
  elements.resultsState.querySelector('p').textContent = getReadableError(error)
  elements.resultsState.querySelector('button').addEventListener('click', () => {
    if (lastSearch) runSearch(lastSearch)
  })
}

function renderEmptyResults(query) {
  elements.resultsGrid.replaceChildren()
  elements.resultsHeading.hidden = true
  elements.resultsState.hidden = false
  elements.resultsState.setAttribute('aria-busy', 'false')
  elements.resultsState.innerHTML = `
    <div class="message-state">
      <span class="message-state__icon" aria-hidden="true">?</span>
      <div>
        <strong>Ничего не найдено</strong>
        <p></p>
        <button class="retry-button retry-button--light" type="button">Изменить запрос</button>
      </div>
    </div>
  `
  elements.resultsState.querySelector('p').textContent = `Для «${query}» цитат пока нет. Проверьте написание или выберите пример выше.`
  elements.resultsState.querySelector('button').addEventListener('click', () => {
    elements.searchInput.focus()
    elements.searchInput.select()
  })
}

function createQuoteCard(quoteData, index) {
  const quote = normaliseQuote(quoteData)
  const article = createElement('article', 'quote-card')
  article.style.setProperty('--delay', `${Math.min(index * 70, 280)}ms`)

  const top = createElement('div', 'quote-card__top')
  top.append(
    createElement('span', 'quote-card__number', String(index + 1).padStart(2, '0')),
    createElement('span', 'quote-card__mark', '“'),
  )

  const text = createElement('blockquote', 'quote-card__text', quote.content)

  const footer = createElement('div', 'quote-card__footer')
  const credit = createElement('div', 'quote-card__credit')
  credit.append(
    createElement('strong', null, quote.character),
    createElement('span', null, quote.anime),
  )

  const copyButton = createElement('button', 'copy-button')
  copyButton.type = 'button'
  copyButton.setAttribute('aria-label', `Скопировать цитату персонажа ${quote.character}`)
  copyButton.innerHTML = `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="6.5" y="6.5" width="9" height="9" rx="1.5"></rect>
      <path d="M4.5 12.5h-1V4.8c0-.7.6-1.3 1.3-1.3h7.7v1"></path>
    </svg>
  `
  copyButton.addEventListener('click', () => copyQuote(quote, copyButton))

  footer.append(credit, copyButton)
  article.append(top, text, footer)
  return article
}

function renderResults(quotes, search, fromCache = false) {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    renderEmptyResults(search.query)
    return
  }

  const copy = modeCopy[search.mode]
  elements.resultsState.hidden = true
  elements.resultsState.setAttribute('aria-busy', 'false')
  elements.resultsHeading.hidden = false
  elements.resultsTitle.textContent = `${copy.preposition} «${search.query}»`
  elements.resultCount.textContent = `${quotes.length} ${getQuoteWord(quotes.length)}${fromCache ? ' · из кэша' : ''}`
  elements.resultsGrid.replaceChildren(...quotes.map(createQuoteCard))
}

function getQuoteWord(count) {
  if (count === 1) return 'цитата'
  if (count >= 2 && count <= 4) return 'цитаты'
  return 'цитат'
}

function cacheKey({ mode, query }) {
  return `${mode}:${query.toLocaleLowerCase('ru-RU')}`
}

function readCache(search) {
  const key = cacheKey(search)
  if (cache.has(key)) return cache.get(key)

  try {
    const stored = sessionStorage.getItem(`anime-echo:${key}`)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    cache.set(key, parsed)
    return parsed
  } catch {
    return null
  }
}

function writeCache(search, quotes) {
  const key = cacheKey(search)
  cache.set(key, quotes)
  try {
    sessionStorage.setItem(`anime-echo:${key}`, JSON.stringify(quotes))
  } catch {
    // The in-memory cache still protects the API limit when storage is unavailable.
  }
}

async function runSearch(search, { ignoreCache = false } = {}) {
  lastSearch = search
  elements.fieldError.textContent = ''

  if (!ignoreCache) {
    const cached = readCache(search)
    if (cached) {
      renderResults(cached, search, true)
      return
    }
  }

  searchController?.abort()
  searchController = new AbortController()
  renderResultsLoading()

  const submitButton = elements.searchForm.querySelector('[type="submit"]')
  submitButton.disabled = true

  try {
    const quotes = await searchQuotes({ ...search, signal: searchController.signal })
    writeCache(search, quotes)
    renderResults(quotes, search)
  } catch (error) {
    if (error.name !== 'AbortError') renderResultsError(error)
  } finally {
    submitButton.disabled = false
  }
}

async function copyQuote(quote, button) {
  const value = `«${quote.content}» — ${quote.character}, ${quote.anime}`

  try {
    await navigator.clipboard.writeText(value)
    button.classList.add('is-copied')
    showToast('Цитата скопирована')
    window.setTimeout(() => button.classList.remove('is-copied'), 1200)
  } catch {
    showToast('Не удалось скопировать цитату')
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer)
  elements.toast.textContent = message
  elements.toast.classList.add('is-visible')
  toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 2200)
}

elements.searchForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const query = elements.searchInput.value.trim()
  const mode = getSelectedMode()

  if (query.length < 2) {
    elements.fieldError.textContent = 'Введите минимум два символа.'
    elements.searchInput.focus()
    return
  }

  runSearch({ mode, query, page: 1 })
})

elements.searchForm.addEventListener('change', (event) => {
  if (event.target.name !== 'mode') return
  const mode = event.target.value
  const copy = modeCopy[mode]
  elements.searchInput.placeholder = copy.placeholder
  elements.searchLabel.textContent = copy.label
  elements.fieldError.textContent = ''
})

elements.searchInput.addEventListener('input', () => {
  elements.fieldError.textContent = ''
})

document.querySelectorAll('[data-suggestion]').forEach((button) => {
  button.addEventListener('click', () => {
    const { suggestion, mode } = button.dataset
    const radio = elements.searchForm.querySelector(`[name="mode"][value="${mode}"]`)
    radio.checked = true
    radio.dispatchEvent(new Event('change', { bubbles: true }))
    elements.searchInput.value = suggestion
    elements.searchForm.requestSubmit()
  })
})

elements.randomButton.addEventListener('click', loadRandomQuote)
elements.featuredRetry.addEventListener('click', loadRandomQuote)

loadRandomQuote()
