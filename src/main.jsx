import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './assessment.css'
import './audio.css'
import './auth.css'
import './reports.css'
import './ebooks.css'
import './dashboard.css'
import './profile.css'
import './billing.css'
import './counselling.css'
import './music.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
