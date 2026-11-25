import Brand from '../Brand/Brand.jsx'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer page-width">
      <Brand />
      <a href="https://animechan.io/docs" target="_blank" rel="noreferrer">
        Документация API
      </a>
    </footer>
  )
}
