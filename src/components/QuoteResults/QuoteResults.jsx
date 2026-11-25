import { formatQuoteCount } from '../../quotes.js'
import QuoteCard from '../QuoteCard/QuoteCard.jsx'
import './QuoteResults.css'

export default function QuoteResults({ result, onRetry, onEdit }) {
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
