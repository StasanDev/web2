import './App.css'

export default function HeroIntro() {
  return (
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
  )
}
