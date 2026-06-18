import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import AssessmentCatalog from './pages/AssessmentCatalog.jsx'
import AssessmentDetail from './pages/AssessmentDetail.jsx'
import AssessmentTake from './pages/AssessmentTake.jsx'
import AssessmentReport from './pages/AssessmentReport.jsx'
import AudioLibrary from './pages/AudioLibrary.jsx'
import ReportsLibrary from './pages/ReportsLibrary.jsx'
import EbooksLibrary from './pages/EbooksLibrary.jsx'
import MusicLibrary from './pages/MusicLibrary.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import PricingPage from './pages/PricingPage.jsx'
import BillingPage from './pages/BillingPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import CounsellingPage from './pages/CounsellingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'

/* Scroll to top on route change; honor in-page #hash targets. */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

function SiteLayout() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/subscription" element={<BillingPage />} />
          <Route path="/counselling" element={<CounsellingPage />} />
          <Route path="/assessments" element={<AssessmentCatalog />} />
          <Route path="/assessments/:id" element={<AssessmentDetail />} />
          <Route path="/audio" element={<AudioLibrary />} />
          <Route path="/reports" element={<ReportsLibrary />} />
          <Route path="/ebooks" element={<EbooksLibrary />} />
          <Route path="/music" element={<MusicLibrary />} />
        </Route>
        {/* Focused, chrome-free flows */}
        <Route path="/assessments/:id/take" element={<AssessmentTake />} />
        <Route path="/assessments/:id/report" element={<AssessmentReport />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </>
  )
}
