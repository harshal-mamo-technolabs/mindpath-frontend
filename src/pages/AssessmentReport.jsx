import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Anchor,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  Crosshair,
  FileHeart,
  Headphones,
  Lightbulb,
  Lock,
  MessagesSquare,
  Mic,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { bandOf, DEMO_SCORES, getAssessment, localizeAssessment } from '../data/assessments.js'

/* CSS band colour by direction — not translatable */
const BAND_CLS = {
  load: { low: 'band-good', mid: 'band-mid', high: 'band-hot' },
  strength: { low: 'band-hot', mid: 'band-mid', high: 'band-good' },
}
/* English fallbacks (the real copy lives in report.demo.* locale keys) */
const BAND_CHIP_EN = {
  load: { low: 'Low load', mid: 'Moderate load', high: 'High load' },
  strength: { low: 'Developing', mid: 'Growing', high: 'Strong' },
}
const PROFILE_EN = {
  load: { low: 'Feeling steady', mid: 'Under pressure but coping', high: 'Carrying a heavy load' },
  strength: { low: 'Just starting out', mid: 'Growing steadily', high: 'A strong base' },
}

function GeneratingScreen({ a, done }) {
  const { t } = useTranslation()
  const steps = [
    t('report.demo.gen.scoring', 'Scoring your answers'),
    t('report.demo.gen.looking', 'Looking at {{n}} areas', { n: a.dims.length }),
    t('report.demo.gen.writing', 'Writing what it means'),
    t('report.demo.gen.building', 'Building your {{days}}-day audio plan', { days: a.plan.days }),
  ]
  const [reached, setReached] = useState(0)

  useEffect(() => {
    if (reached >= steps.length) {
      const timer = setTimeout(done, 700)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setReached((r) => r + 1), 1050)
    return () => clearTimeout(timer)
  }, [reached, steps.length, done])

  return (
    <div className="genscreen">
      <div className="orb gen-orb" aria-hidden="true">
        <span className="orb-ring" />
        <span className="orb-ring r2" />
        <div className="orb-core gen-core" />
      </div>
      <h1>{t('report.demo.gen.reading', 'Reading your answers…')}</h1>
      <ul className="gen-steps" aria-live="polite">
        {steps.map((s, i) => (
          <li key={s} className={i < reached ? 'done' : i === reached ? 'active' : ''}>
            <span className="gen-check">{i < reached ? <Check size={13} /> : null}</span>
            {s}
          </li>
        ))}
      </ul>
      <p className="gen-note">{t('report.demo.gen.note', 'Same answers, same report, every time')}</p>
    </div>
  )
}

export default function AssessmentReport() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const { state } = useLocation()
  const a = localizeAssessment(getAssessment(id))

  // Viewing an existing report from the library skips the generation ceremony.
  const isViewing = !!state?.view
  const [phase, setPhase] = useState(isViewing ? 'ready' : 'generating')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (phase === 'ready') {
      const raf = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(raf)
    }
  }, [phase])

  if (!a) return <Navigate to="/assessments" replace />

  const scores = state?.scores || DEMO_SCORES[id]
  const name = state?.name || 'Maya'
  const overallBand = bandOf(scores.overall)
  const bandCls = (band) => BAND_CLS[a.direction][band]
  const bandChip = (band) =>
    t(`report.demo.band.${a.direction}.${band}`, { defaultValue: BAND_CHIP_EN[a.direction][band] })
  const profileTitle = (band) =>
    t(`report.demo.profile.${a.direction}.${band}`, { defaultValue: PROFILE_EN[a.direction][band] })

  // anchor = healthiest dimension, focus = the one needing most care
  const ranked = [...a.dims].sort((x, y) => scores.dims[x.key] - scores.dims[y.key])
  const anchor = a.direction === 'load' ? ranked[0] : ranked[ranked.length - 1]
  const focus = a.direction === 'load' ? ranked[ranked.length - 1] : ranked[0]

  const RING_C = 326.7
  const today =
    state?.dateLabel ||
    new Date().toLocaleDateString(i18n.language, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  if (phase === 'generating') {
    return <GeneratingScreen a={a} done={() => setPhase('ready')} />
  }

  return (
    <div className={`reportpage ${mounted ? 'in' : ''}`} style={{ '--topic': a.accent }}>
      <header className="take-bar">
        <Logo />
        <p className="take-topic">
          {isViewing
            ? t('report.demo.reportDate', 'Report · {{date}}', { date: today })
            : t('report.demo.yourReport', 'Your report')}
        </p>
        <Link
          to={isViewing ? '/reports' : '/assessments'}
          className="take-exit"
          aria-label={
            isViewing
              ? t('report.demo.backReports', 'Back to your reports')
              : t('report.demo.backAssessments', 'Back to assessments')
          }
        >
          <RefreshCcw size={18} />
        </Link>
      </header>

      <main className="report-wrap">
        {/* ---- header card ---- */}
        <section className="rp-head">
          <div className="rc-head rp-head-row">
            <span className="rc-avatar" aria-hidden="true">
              {name[0].toUpperCase()}
            </span>
            <div>
              <h1>{t('report.demo.nameReport', '{{name}}’s Report', { name })}</h1>
              <p>
                {a.title} · {today}
              </p>
            </div>
            <span className="rc-badge">{t('report.demo.complete', 'Complete')}</span>
          </div>

          <div className="rp-overview">
            <div className="rc-ring rp-ring">
              <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
                <circle className="track" cx="66" cy="66" r="52" fill="none" strokeWidth="11" />
                <circle
                  className="val"
                  cx="66"
                  cy="66"
                  r="52"
                  fill="none"
                  strokeWidth="11"
                  style={{
                    stroke: a.accent,
                    strokeDasharray: RING_C,
                    strokeDashoffset: mounted ? RING_C * (1 - scores.overall / 100) : RING_C,
                  }}
                />
              </svg>
              <div className="rc-ring-label">
                <strong>{scores.overall}</strong>
                <small>{a.ringLabel}</small>
              </div>
            </div>
            <div>
              <span className={`band-chip ${bandCls(overallBand)}`}>{profileTitle(overallBand)}</span>
              <p className="rp-overall-text">{a.overall[overallBand]}</p>
            </div>
          </div>
        </section>

        {/* ---- anchor & focus ---- */}
        <section className="rp-duo">
          <article className="rp-duo-card anchor">
            <span className="rp-duo-ico">
              <Anchor size={18} />
            </span>
            <div>
              <h3>{t('report.demo.strongPoint', 'Your strong point {{label}}', { label: anchor.label })}</h3>
              <p>
                {t(
                  'report.demo.anchorText',
                  'At {{score}}, this is the area holding you steadiest right now. Your plan builds on it.',
                  { score: scores.dims[anchor.key] },
                )}
              </p>
            </div>
          </article>
          <article className="rp-duo-card focus">
            <span className="rp-duo-ico">
              <Crosshair size={18} />
            </span>
            <div>
              <h3>{t('report.demo.focusPoint', 'Your focus {{label}}', { label: focus.label })}</h3>
              <p>
                {t(
                  'report.demo.focusText',
                  'At {{score}}, this is where to start. The first week of your plan is built around it.',
                  { score: scores.dims[focus.key] },
                )}
              </p>
            </div>
          </article>
        </section>

        {/* ---- dimensions ---- */}
        <section className="rp-dims">
          <h2 className="rp-h2">
            <FileHeart size={19} /> {t('report.demo.closerAreas', 'A closer look at the four areas')}
          </h2>
          {a.dims.map((d) => {
            const score = scores.dims[d.key]
            const band = bandOf(score)
            return (
              <article className="rp-dim" key={d.key}>
                <header>
                  <div>
                    <h3>{d.label}</h3>
                    <p className="rp-dim-desc">{d.desc}</p>
                  </div>
                  <div className="rp-dim-score">
                    <strong>{score}</strong>
                    <span className={`band-chip ${bandCls(band)}`}>{bandChip(band)}</span>
                  </div>
                </header>
                <div className="rc-bar rp-bar">
                  <i
                    style={{
                      width: mounted ? `${score}%` : 0,
                      background: a.accent,
                    }}
                  />
                </div>
                <p className="rp-dim-hint">{d.hints[band]}</p>
                <p className="rp-dim-rec">
                  <Lightbulb size={15} />
                  <span>
                    <strong>{t('report.demo.tryThis', 'Try this:')}</strong> {d.rec}
                  </span>
                </p>
              </article>
            )
          })}
        </section>

        {/* ---- plan preview ---- */}
        <section className="rp-plan">
          <h2 className="rp-h2 on-night">
            <Headphones size={19} />{' '}
            {t('report.demo.planTitle', 'Your {{days}}-day plan, built from this report', {
              days: a.plan.days,
            })}
          </h2>
          <p className="rp-plan-welcome">
            <Mic size={15} /> &ldquo;{t('report.demo.welcomeGreeting', 'Hi {{name}}', { name })}{' '}
            {a.plan.welcome}&rdquo;
          </p>
          <div className="rp-sessions">
            {a.plan.sessions.map((s) => (
              <div className="rp-session" key={s.day}>
                <span className="rp-session-day">{t('report.demo.day', 'Day {{n}}', { n: s.day })}</span>
                <p>{s.title}</p>
                <small>{s.len}</small>
              </div>
            ))}
            <div className="rp-session locked">
              <span className="rp-session-day">
                <Lock size={12} />
              </span>
              <p>
                {t('report.demo.daysRange', 'Days {{from}}–{{to}}', {
                  from: a.plan.sessions.length + 1,
                  to: a.plan.days,
                })}
              </p>
              <small>{t('report.demo.oneEachMorning', 'one each morning')}</small>
            </div>
          </div>
          <Link to="/audio" className="btn btn-light rp-plan-btn">
            {t('report.demo.unlockPlan', 'Unlock my audio plan')} <ArrowRight size={17} />
          </Link>
        </section>

        {/* ---- next doors ---- */}
        <section className="rp-next">
          <h2 className="rp-h2">
            <ArrowRight size={19} /> {t('report.demo.whatOpens', 'What this report opens')}
          </h2>
          <div className="rp-next-grid">
            <Link to="/#explore" className="rp-next-card">
              <BookOpen size={20} />
              <div>
                <strong>
                  &ldquo;{t('report.demo.ebookCard', '{{ebook}}: {{name}}’s {{days}} Days', {
                    ebook: a.ebook,
                    name,
                    days: a.plan.days,
                  })}&rdquo;
                </strong>
                <small>{t('report.demo.ebookCardSmall', 'Your own ebook, made from these scores')}</small>
              </div>
            </Link>
            <Link to="/#explore" className="rp-next-card">
              <MessagesSquare size={20} />
              <div>
                <strong>{t('report.demo.talkThrough', 'Talk it through')}</strong>
                <small>
                  {t('report.demo.talkThroughSmall', 'An AI helper that has already read this report')}
                </small>
              </div>
            </Link>
            <Link to={`/assessments/${a.id}/take`} className="rp-next-card">
              <CalendarCheck size={20} />
              <div>
                <strong>{t('report.demo.takeAgain', 'Take it again in 60–90 days')}</strong>
                <small>{t('report.demo.takeAgainSmall', 'See these numbers change — that’s the proof')}</small>
              </div>
            </Link>
          </div>
        </section>

        <footer className="rp-foot">
          <p>
            <ShieldCheck size={14} />{' '}
            {t(
              'report.demo.disclaimer',
              'This report is a tool to help you reflect. It is made from your answers using a fixed way of scoring. It is not a medical test, a diagnosis, or a treatment plan. If you’re struggling, talking to a trained professional is a good and brave next step.',
            )}
          </p>
          <div className="rp-foot-actions">
            <Link to="/assessments" className="btn btn-ghost">
              {t('report.demo.tryAnother', 'Try another topic')}
            </Link>
            <Link to="/" className="btn btn-primary">
              {t('report.demo.backHome', 'Back to Daybreak')}
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
