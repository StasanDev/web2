import About from '../About/About.jsx'
import Footer from '../Footer/Footer.jsx'
import Header from '../Header/Header.jsx'
import QuoteSearch from '../QuoteSearch/QuoteSearch.jsx'
import RandomQuote from '../RandomQuote/RandomQuote.jsx'
import './App.css'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Перейти к содержанию</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section className="hero page-width">
          <div className="hero__copy">
            <h1 className="display-heading">Слова<br />для фарма<br /><span>ауры</span></h1>
            <p className="hero__lead">
              Архив цитат из аниме. Поиск работает без регистрации.
            </p>
            <div className="hero__facts">
              <strong>2 режима</strong>
              <span>аниме / персонаж</span>
            </div>
            <a className="hero__search" href="#search">Перейти к поиску</a>
          </div>
          <RandomQuote />
        </section>
        <QuoteSearch />
        <About />
      </main>
      <Footer />
    </>
  )
}
