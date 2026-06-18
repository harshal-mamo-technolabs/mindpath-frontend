import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Clock,
  FileHeart,
  Headphones,
  ListChecks,
  Lock,
  MessagesSquare,
  Mic,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { getAssessment } from '../data/assessments.js'

export default function AssessmentDetail() {
  const { id } = useParams()
  const a = getAssessment(id)
  if (!a) return <Navigate to="/assessments" replace />

  const Icon = a.icon

  return (
    <main className="detail">
      <header className="detail-hero" style={{ '--topic': a.accent }}>
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal>
            <Link to="/assessments" className="crumb">
              <ArrowLeft size={15} /> All assessments
            </Link>
          </Reveal>

          <div className="detail-hero-grid">
            <div>
              <Reveal className="detail-title-row" delay={0.06}>
                <span className="topic-ico detail-ico" style={{ background: a.bg, color: a.fg }}>
                  <Icon size={30} strokeWidth={1.8} />
                </span>
                <div>
                  <h1>{a.title}</h1>
                  <p className="detail-tagline">{a.tagline}</p>
                </div>
              </Reveal>

              <Reveal as="p" className="lede" delay={0.14}>
                {a.blurb}
              </Reveal>

              <Reveal className="detail-meta" delay={0.2}>
                <span>
                  <Clock size={15} /> {a.mins} minutes
                </span>
                <span>
                  <ListChecks size={15} /> {a.questions.length} questions
                </span>
                <span>
                  <FileHeart size={15} /> {a.dims.length} dimensions
                </span>
                <span>
                  <CalendarCheck size={15} /> {a.plan.days}-day plan
                </span>
              </Reveal>

              <Reveal className="detail-actions" delay={0.26}>
                <Link to={`/assessments/${a.id}/take`} className="btn btn-primary">
                  Begin assessment · {a.price} <ArrowRight size={18} />
                </Link>
                <p className="detail-note">
                  <ShieldCheck size={14} /> A self-reflection instrument  not a clinical
                  or diagnostic tool.
                </p>
              </Reveal>
            </div>

            <Reveal className="detail-dims-card" delay={0.18}>
              <p className="panel-label">What we measure</p>
              {a.dims.map((d, i) => (
                <div className="detail-dim" key={d.key}>
                  <span className="detail-dim-num" style={{ background: a.bg, color: a.fg }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4>{d.label}</h4>
                    <p>{d.desc}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </header>

      <section className="section detail-receive">
        <div className="container">
          <Reveal as="span" className="eyebrow">
            What your answers become
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            One honest quarter-hour, <em>three things back.</em>
          </Reveal>

          <div className="receive-grid">
            <Reveal as="article" className="receive-card" delay={0.1}>
              <span className="receive-ico" style={{ background: '#f0edfb', color: '#4d3da8' }}>
                <FileHeart size={24} strokeWidth={1.8} />
              </span>
              <h3>Your personal report</h3>
              <p>
                Scores across all {a.dims.length} dimensions with plain-language
                interpretation  what each number means for you and what tends to help.
                Generated deterministically from a validated framework: same answers,
                same insight, every time.
              </p>
              <ul className="receive-list">
                <li>Overall profile &amp; per-dimension scores</li>
                <li>What&rsquo;s protecting you, what&rsquo;s draining you</li>
                <li>Concrete next steps, ranked by leverage</li>
              </ul>
            </Reveal>

            <Reveal as="article" className="receive-card receive-dark" delay={0.2}>
              <span
                className="receive-ico"
                style={{ background: 'rgba(238,179,129,.16)', color: '#eeb381' }}
              >
                <Headphones size={24} strokeWidth={1.8} />
              </span>
              <h3>A {a.plan.days}-day audio plan</h3>
              <p>
                Sessions selected and ordered from your scores  one unlocks each
                morning, 5–10 minutes each. It opens with a welcome recorded for you, by
                name.
              </p>
              <div className="receive-plan">
                <p className="receive-welcome">
                  <Mic size={14} /> &ldquo;Hi {'{your name}'}  {a.plan.welcome}&rdquo;
                </p>
                {a.plan.sessions.slice(0, 3).map((s) => (
                  <span className="receive-session" key={s.day}>
                    <em>Day {s.day}</em> {s.title} <small>{s.len}</small>
                  </span>
                ))}
                <span className="receive-session locked">
                  <Lock size={12} /> Days 4–{a.plan.days} unlock daily
                </span>
              </div>
            </Reveal>

            <Reveal as="article" className="receive-card" delay={0.3}>
              <span className="receive-ico" style={{ background: '#f9e3cd', color: '#8a5420' }}>
                <Sparkles size={24} strokeWidth={1.8} />
              </span>
              <h3>Unlocked after your report</h3>
              <p>
                Your report opens doors that stay personal  each one built from your
                dimensions, not a template.
              </p>
              <ul className="receive-unlocks">
                <li>
                  <BookOpen size={16} />
                  <div>
                    <strong>&ldquo;{a.ebook}&rdquo;</strong>
                    <small>A short ebook written from your profile, cover with your name</small>
                  </div>
                </li>
                <li>
                  <MessagesSquare size={16} />
                  <div>
                    <strong>AI counselling sessions</strong>
                    <small>A voice advisor that has already read your report</small>
                  </div>
                </li>
                <li>
                  <CalendarCheck size={16} />
                  <div>
                    <strong>Retake in 60–90 days</strong>
                    <small>Before/after comparison that proves the path worked</small>
                  </div>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="detail-cta">
        <div className="container">
          <Reveal className="detail-cta-panel">
            <div>
              <h2>
                Ready when you are. <em>It takes {a.mins} quiet minutes.</em>
              </h2>
              <p>
                Answer as the person you are this week  not your best week, not your
                worst. Honest in, useful out.
              </p>
            </div>
            <Link to={`/assessments/${a.id}/take`} className="btn btn-light">
              Begin assessment <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
