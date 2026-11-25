import { createRoot } from 'react-dom/client'
import './styles.css'
import './main.js'
import About from './components/About/About.jsx'
import HeroIntro from './components/App/App.jsx'
import Footer from './components/Footer/Footer.jsx'
import Header from './components/Header/Header.jsx'
import RandomQuote from './components/RandomQuote/RandomQuote.jsx'

createRoot(document.getElementById('header-root')).render(<Header />)
createRoot(document.getElementById('intro-root')).render(<HeroIntro />)
createRoot(document.getElementById('random-quote-root')).render(<RandomQuote />)
createRoot(document.getElementById('about-root')).render(<About />)
createRoot(document.getElementById('footer-root')).render(<Footer />)
