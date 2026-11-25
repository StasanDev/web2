import { useEffect, useState } from 'react'
import { getRandomQuote } from '../../api/animechan.js'
import { getReadableError, normalizeQuote } from '../../quotes.js'
import './RandomQuote.css'

export default function RandomQuote() {
  const [requestNumber, setRequestNumber] = useState(0)
  const [result, setResult] = useState({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    async function loadQuote() {
      try {
        const quote = await getRandomQuote({ signal: controller.signal })
        if (!controller.signal.aborted) {
          setResult({ status: 'ready', quote: normalizeQuote(quote) })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ status: 'error', message: getReadableError(error) })
        }
      }
    }

    loadQuote()
    return () => controller.abort()
  }, [requestNumber])

  function loadAnother() {
    setResult({ status: 'loading' })
    setRequestNumber(number => number + 1)
  }

  const isLoading = result.status === 'loading'
  const buttonLabel = result.status === 'error' ? 'Повторить' : 'Другая цитата'

  return (
    <section className="featured-card">
      <h2>Случайная реплика</h2>
      <div className="featured-card__content">
        {isLoading && <p className="status" role="status">Загружаем цитату</p>}
        {result.status === 'error' && (
          <p className="error" role="alert">{result.message}</p>
        )}
        {result.status === 'ready' && (
          <>
            <blockquote className="featured-quote quote-text">{result.quote.content}</blockquote>
            <dl className="featured-meta">
              <div>
                <dt>Персонаж</dt>
                <dd>{result.quote.character}</dd>
              </div>
              <div>
                <dt>Аниме</dt>
                <dd>{result.quote.anime}</dd>
              </div>
            </dl>
          </>
        )}
      </div>
      <button className="button button--dark" type="button" onClick={loadAnother} disabled={isLoading}>
        {buttonLabel}
      </button>
    </section>
  )
}
