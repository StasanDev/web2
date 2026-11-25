import { useState } from 'react'
import './QuoteCard.css'

export default function QuoteCard({ quote }) {
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
