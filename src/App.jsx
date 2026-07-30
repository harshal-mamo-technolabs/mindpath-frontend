import { useEffect, useRef } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import GuidedTour from './components/tour/GuidedTour.jsx'
import { consumeTourPending, startTour } from './lib/tour.js'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import AssessmentCatalog from './pages/AssessmentCatalog.jsx'
import AssessmentDetail from './pages/AssessmentDetail.jsx'
import AssessmentTake from './pages/AssessmentTake.jsx'
import AssessmentReport from './pages/AssessmentReport.jsx'
import ReportView from './pages/ReportView.jsx'
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
import Handoff from './pages/Handoff.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

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

/**
 * Starts the onboarding walkthrough for someone arriving from the funnel.
 *
 * The handoff page queues it and then navigates, so this waits for the
 * destination route before consuming the flag — that way the tour begins on the
 * report, with the score id it needs, rather than on /handoff itself.
 */
function TourBoot() {
  const { pathname } = useLocation()
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current || pathname === '/handoff') return
    if (!consumeTourPending()) return

    startedRef.current = true
    const match = pathname.match(/^\/reports\/([^/]+)/)
    startTour({ scoreId: match?.[1] ?? null })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <TourBoot />
      <GuidedTour />
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
          <Route path="/sound" element={<MusicLibrary />} />
        </Route>
        {/* Focused, chrome-free flows */}
        <Route path="/assessments/:id/take" element={<AssessmentTake />} />
        <Route path="/assessments/:id/report" element={<AssessmentReport />} />
        <Route path="/reports/:scoreId" element={<ReportView />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        {/* Signs in a buyer arriving from the landing-page funnel. */}
        <Route path="/handoff" element={<Handoff />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </>
  )
}
