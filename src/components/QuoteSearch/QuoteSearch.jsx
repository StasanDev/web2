import { useEffect, useRef, useState } from 'react'
import { searchQuotes } from '../../api/animechan.js'
import { readSearchCache, writeSearchCache } from '../../api/searchCache.js'
import { formatQuoteCount, getReadableError, prepareQuoteResults } from '../../quotes.js'
import './QuoteSearch.css'

const modes = {
  anime: { option: 'По аниме', label: 'Название аниме', placeholder: 'Например, Naruto' },
  character: { option: 'По персонажу', label: 'Имя персонажа', placeholder: 'Например, Saitama' },
}

const suggestions = [
  { mode: 'anime', query: 'Naruto' },
  { mode: 'anime', query: 'One Piece' },
  { mode: 'character', query: 'Saitama' },
]

export default function QuoteSearch() {
  const [mode, setMode] = useState('anime')
  const [query, setQuery] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [result, setResult] = useState({ status: 'idle' })
  const inputRef = useRef(null)
  const activeRequest = useRef(null)

  useEffect(() => () => activeRequest.current?.abort(), [])

  async function runSearch(search) {
    activeRequest.current?.abort()
    activeRequest.current = null
    setFieldError('')

    const cached = readSearchCache(search)
    if (cached !== null) {
      setResult({ status: 'ready', search, quotes: prepareQuoteResults(cached) })
      return
    }

    const controller = new AbortController()
    activeRequest.current = controller
    setResult({ status: 'loading' })

    try {
      const response = await searchQuotes({ ...search, page: 1, signal: controller.signal })
      if (controller.signal.aborted) return

      const quotes = Array.isArray(response) ? response : []
      writeSearchCache(search, quotes)
      setResult({ status: 'ready', search, quotes: prepareQuoteResults(quotes) })
    } catch (error) {
      if (!controller.signal.aborted) {
        setResult({ status: 'error', search, message: getReadableError(error) })
      }
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setFieldError('Введите минимум два символа')
      inputRef.current?.focus()
      return
    }

    runSearch({ mode, query: trimmedQuery })
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setFieldError('')
  }

  function useSuggestion(suggestion) {
    changeMode(suggestion.mode)
    setQuery(suggestion.query)
    runSearch(suggestion)
  }

  function focusSearch() {
    inputRef.current?.focus()
    inputRef.current?.select()
  }

  return (
    <section className="search-section" id="search" tabIndex={-1}>
      <div className="section-heading">
        <h2 className="display-heading">Чьи слова ищем?</h2>
        <p>
          Введите название аниме или имя персонажа. Animechan подберёт ближайшее совпадение и вернёт до пяти цитат.
        </p>
      </div>
      <form className="search-panel" onSubmit={handleSubmit} noValidate>
        <fieldset className="mode-switch">
          <legend className="visually-hidden">Режим поиска</legend>
          {Object.entries(modes).map(([value, copy]) => (
            <label key={value}>
              <input
                type="radio"
                name="mode"
                value={value}
                checked={mode === value}
                onChange={() => changeMode(value)}
              />
              <span>{copy.option}</span>
            </label>
          ))}
        </fieldset>
        <div className="search-field">
          <label className="visually-hidden" htmlFor="search-input">{modes[mode].label}</label>
          <input
            id="search-input"
            ref={inputRef}
            name="query"
            type="search"
            placeholder={modes[mode].placeholder}
            autoComplete="off"
            minLength={2}
            required
            value={query}
            onChange={event => {
              setQuery(event.target.value)
              setFieldError('')
            }}
          />
          <button className="button button--coral" type="submit" disabled={result.status === 'loading'}>
            Найти цитаты
          </button>
        </div>
        <p className="field-error error" role="status">{fieldError}</p>
      </form>
      <div className="suggestions">
        <span>Попробуйте:</span>
        {suggestions.map(suggestion => (
          <button key={suggestion.query} type="button" onClick={() => useSuggestion(suggestion)}>
            {suggestion.query}
          </button>
        ))}
      </div>
      <QuoteResults result={result} onRetry={runSearch} onEdit={focusSearch} />
    </section>
  )
}

function QuoteResults({ result, onRetry, onEdit }) {
  if (result.status === 'idle') {
    return (
      <div className="results-state results-state--prompt">
        <strong>Начните поиск</strong>
        <p>Выберите режим, введите название аниме или имя персонажа и нажмите «Найти цитаты».</p>
      </div>
    )
  }

  if (result.status === 'loading') {
    return <p className="results-state status" role="status">Ищем цитаты</p>
  }

  if (result.status === 'error') {
    return (
      <div className="results-state">
        <p className="error" role="alert">{result.message}</p>
        <button className="button button--outline" type="button" onClick={() => onRetry(result.search)}>
          Повторить поиск
        </button>
      </div>
    )
  }

  const { search, quotes } = result

  if (quotes.length === 0) {
    return (
      <div className="results-state">
        <p role="status">По запросу «{search.query}» ничего не найдено</p>
        <button className="button button--outline" type="button" onClick={onEdit}>
          Изменить запрос
        </button>
      </div>
    )
  }

  return (
    <section className="results">
      <h3>Результаты по запросу «{search.query}»</h3>
      <p className="results-count" role="status">{formatQuoteCount(quotes.length)}</p>
      <div className="results-grid" key={JSON.stringify([search.mode, search.query])}>
        {quotes.map(quote => <QuoteCard key={quote.key} quote={quote} />)}
      </div>
    </section>
  )
}

function QuoteCard({ quote }) {
  const [copyMessage, setCopyMessage] = useState('')

  async function handleCopy() {
    const text = `«${quote.content}» - ${quote.character}, ${quote.anime}`

    try {
      await navigator.clipboard.writeText(text)
      setCopyMessage('Цитата скопирована')
    } catch {
      setCopyMessage('Не удалось скопировать цитату')
    }
  }

  return (
    <article className="quote-card">
      <blockquote className="quote-text">{quote.content}</blockquote>
      <div className="quote-card__footer">
        <div className="quote-card__credit">
          <strong>{quote.character}</strong>
          <span>{quote.anime}</span>
        </div>
        <button
          className="button button--outline"
          type="button"
          onClick={handleCopy}
        >
          Копировать
        </button>
      </div>
      <p className="copy-status" role="status">{copyMessage}</p>
    </article>
  )
}
