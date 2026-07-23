import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, X } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getScore } from '../lib/assessmentsApi.js'
import AssessmentReport from '../components/report/AssessmentReport.jsx'
import { getRichReport } from '../components/report/registry.js'

/* A previously-saved report, opened from the Reports library. We refetch the
   score by id and recompute the live report from its subCategoryScores — same
   engine as the post-submit render, so it's always the full report. */
export default function ReportView() {
  const { t, i18n } = useTranslation()
  const { scoreId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let alive = true
    setState({ status: 'loading' })
    getScore(scoreId)
      .then((s) => alive && setState({ status: 'ready', score: s }))
      .catch((err) => alive && setState({ status: 'error', error: err.message, code: err.status }))
    return () => {
      alive = false
    }
  }, [scoreId])

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(`/reports/${scoreId}`)}`} replace />
  }

  if (state.status === 'loading') {
    return (
      <div className="take">
        <div className="take-center">
          <Loader2 size={28} className="ap-spin" />
          <p>{t('reports.viewLoading')}</p>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="take">
        <div className="take-center" role="alert">
          <h1>{state.code === 404 ? t('reports.notFoundTitle') : t('reports.viewErrorTitle')}</h1>
          <p>{state.error}</p>
          <Link to="/reports" className="btn btn-primary">
            {t('reports.backToReports')}
          </Link>
        </div>
      </div>
    )
  }

  const score = state.score
  const slug = score.assessment?.slug
  const rich = getRichReport(slug)

  // No rich report for this assessment — send them to the library.
  if (!rich) return <Navigate to="/reports" replace />

  const firstName = (user?.name || '').split(' ')[0] || t('reports.you')
  const taken = score.createdAt
    ? new Date(score.createdAt).toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="take" style={{ '--topic': rich.accent }}>
      <header className="take-bar">
        <Logo />
        <p className="take-topic">{taken ? t('reports.reportDate', { date: taken }) : t('reports.yourReport')}</p>
        <Link to="/reports" className="take-exit" aria-label={t('reports.backAria')}>
          <X size={20} />
        </Link>
      </header>

      <main className="take-report-stage">
        <AssessmentReport
          report={rich.build(score)}
          ui={rich.ui()}
          name={firstName}
          attempt={score.attemptNumber}
          onRetake={() => navigate(`/assessments/${slug}/take`)}
          assessmentId={score.assessment?.id}
        />
      </main>
    </div>
  )
}
