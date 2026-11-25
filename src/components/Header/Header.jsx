import Brand from '../Brand/Brand.jsx'
import './Header.css'

export default function Header() {
  return (
    <header className="topbar page-width" id="top">
      <Brand />
      <a className="topbar__api" href="https://animechan.io/docs" target="_blank" rel="noreferrer">
        Animechan API
      </a>
    </header>
  )
}
