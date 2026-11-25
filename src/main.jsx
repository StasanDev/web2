import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './components/App/App.jsx'

const container = document.getElementById('root')
createRoot(container).render(<App />)
