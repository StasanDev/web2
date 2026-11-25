import './About.css'

export default function About() {
  return (
    <section className="about-strip page-width">
      <article>
        <h2>Источник цитат</h2>
        <p>Все цитаты загружаются напрямую из публичного Animechan API через <code>fetch</code>.</p>
      </article>
      <article>
        <h2>Статусы запроса</h2>
        <p>Сайт показывает загрузку, пустой ответ или ошибку. При ошибке запрос можно повторить.</p>
      </article>
      <article>
        <h2>Кэш поиска</h2>
        <p>Успешные ответы сохраняются на время сессии. При повторном поиске сайт берёт цитаты из кэша.</p>
      </article>
    </section>
  )
}
