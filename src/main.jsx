import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import './styles/pages/assessment.css'
import './styles/pages/stress-report.css'
import './styles/pages/audio.css'
import './styles/pages/auth.css'
import './styles/pages/reports.css'
import './styles/pages/ebooks.css'
import './styles/pages/dashboard.css'
import './styles/pages/profile.css'
import './styles/pages/billing.css'
import './styles/pages/counselling.css'
import './styles/pages/music.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
