import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Gift,
  LogOut,
  Mail,
  Pencil,
  Shield,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'

const SECTIONS = [
  ['account', 'Account', User],
  ['notifications', 'Notifications', Bell],
  ['referrals', 'Referrals', Gift],
  ['privacy', 'Privacy & data', Shield],
]

function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(() => (value.includes('PM') ? 'PM' : 'AM'))
  const ref = useRef(null)

  useEffect(() => {
    setTab(value.includes('PM') ? 'PM' : 'AM')
  }, [value])

  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const slots = []
  const start = tab === 'AM' ? 0 : 12
  for (let h = start; h < start + 12; h++) {
    for (const m of [0, 30]) {
      const hour = h % 12 === 0 ? 12 : h % 12
      slots.push(`${hour}:${m === 0 ? '00' : '30'} ${tab}`)
    }
  }

  return (
    <span className="pf-time-wrap" ref={ref}>
      <button
        className="pf-time"
        onClick={() => setOpen((o) => !o)}
        aria-label="Pick reminder time"
        aria-expanded={open}
      >
        <Clock size={13} />
        {value}
        <ChevronDown size={11} className={`pf-time-chev ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="pf-time-popover" role="dialog" aria-label="Time picker">
          <div className="pf-time-tabs">
            {['AM', 'PM'].map((p) => (
              <button
                key={p}
                className={`pf-time-tab ${tab === p ? 'active' : ''}`}
                onClick={() => setTab(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="pf-time-grid">
            {slots.map((t) => (
              <button
                key={t}
                className={`pf-time-slot ${value === t ? 'active' : ''}`}
                onClick={() => {
                  onChange(t)
                  setOpen(false)
                }}
              >
                {t.replace(` ${tab}`, '')}
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  )
}

function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`pf-toggle ${on ? 'on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className="pf-toggle-knob" />
    </button>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: 'Maya Kapoor',
    displayName: 'Maya',
    email: 'maya@example.com',
  })
  const [prefs, setPrefs] = useState({
    dailyReminder: true,
    reminderTime: '7:00 AM',
    moodNudge: true,
    weeklyEmail: false,
    dayUnlock: true,
    productNews: false,
  })
  const [active, setActive] = useState('account')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const toastTimer = useRef(null)
  const sectionRefs = useRef({})

  const say = (msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3400)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // scroll-spy
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    SECTIONS.forEach(([id]) => {
      const el = sectionRefs.current[id]
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const setPref = (key) => (val) => {
    setPrefs((p) => ({ ...p, [key]: val }))
    say('Preference saved.')
  }

  const initials = form.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  function go(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function copyInvite() {
    navigator.clipboard?.writeText('mindpath.app/invite/MAYA-CALM').catch(() => {})
    say('Invite link copied to clipboard.')
  }

  function signOut() {
    navigate('/login')
  }

  return (
    <main className="profile">
      <div className="container">
        <Reveal as="header" className="pf-head">
          <span className="eyebrow">Your account</span>
          <h1 className="pf-title">Profile &amp; settings</h1>
        </Reveal>

        <div className="pf-grid">
          {/* ---- left rail ---- */}
          <aside className="pf-rail">
            <div className="pf-id">
              <span className="pf-avatar" aria-hidden="true">
                {initials}
              </span>
              <h2>{form.name}</h2>
              <p>{form.email}</p>
              <span className="pf-plan">
                <Sparkles size={13} /> Member since March 2025
              </span>
            </div>

            <nav className="pf-nav" aria-label="Settings sections">
              {SECTIONS.map(([id, label, Icon]) => (
                <button
                  key={id}
                  className={`pf-nav-item ${active === id ? 'active' : ''}`}
                  onClick={() => go(id)}
                >
                  <Icon size={17} />
                  {label}
                  <ChevronRight size={15} className="pf-nav-chev" />
                </button>
              ))}
            </nav>

            <button className="pf-signout" onClick={signOut}>
              <LogOut size={16} /> Sign out
            </button>
          </aside>

          {/* ---- content ---- */}
          <div className="pf-content">
            {/* ACCOUNT */}
            <section
              id="account"
              ref={(el) => (sectionRefs.current.account = el)}
              className="pf-section"
            >
              <div className="pf-section-head">
                <h2>
                  <User size={18} /> Account
                </h2>
                <p>The basics and the name your reports and audio greet you by.</p>
              </div>

              <div className="pf-avatar-row">
                <span className="pf-avatar lg" aria-hidden="true">
                  {initials}
                </span>
                <div>
                  <button className="pf-mini-btn" onClick={() => say('Avatar upload is a demo.')}>
                    <Pencil size={14} /> Change avatar
                  </button>
                  <p className="pf-avatar-note">PNG or JPG, square works best.</p>
                </div>
              </div>

              <div className="pf-fields">
                <label className="pf-field">
                  <span>Full name</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    autoComplete="name"
                  />
                </label>
                <label className="pf-field">
                  <span>What reports call you</span>
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                    maxLength={24}
                  />
                </label>
                <label className="pf-field pf-field-wide">
                  <span>Email</span>
                  <span className="pf-input-icon">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      autoComplete="email"
                    />
                  </span>
                </label>
              </div>

              <div className="pf-section-foot">
                <button className="btn btn-primary" onClick={() => say('Profile updated.')}>
                  Save changes
                </button>
              </div>
            </section>

            {/* NOTIFICATIONS */}
            <section
              id="notifications"
              ref={(el) => (sectionRefs.current.notifications = el)}
              className="pf-section"
            >
              <div className="pf-section-head">
                <h2>
                  <Bell size={18} /> Notifications &amp; reminders
                </h2>
                <p>Gentle nudges keep the daily habit alive set them to fit your life.</p>
              </div>

              <div className="pf-rows">
                <div className="pf-row">
                  <div>
                    <strong>Daily session reminder</strong>
                    <small>“Day 5 is ready” a nudge when your next session unlocks.</small>
                  </div>
                  <div className="pf-row-control">
                    {prefs.dailyReminder && (
                      <TimePicker value={prefs.reminderTime} onChange={setPref('reminderTime')} />
                    )}
                    <Toggle
                      on={prefs.dailyReminder}
                      onChange={setPref('dailyReminder')}
                      label="Daily session reminder"
                    />
                  </div>
                </div>

                <div className="pf-row">
                  <div>
                    <strong>Mood check-in nudge</strong>
                    <small>
                      A quiet prompt to log how you&rsquo;re arriving, before each session.
                    </small>
                  </div>
                  <Toggle
                    on={prefs.moodNudge}
                    onChange={setPref('moodNudge')}
                    label="Mood check-in nudge"
                  />
                </div>

                <div className="pf-row">
                  <div>
                    <strong>Weekly progress email</strong>
                    <small>Your mood trend and streak, summed up every Sunday.</small>
                  </div>
                  <Toggle
                    on={prefs.weeklyEmail}
                    onChange={setPref('weeklyEmail')}
                    label="Weekly progress email"
                  />
                </div>

                <div className="pf-row">
                  <div>
                    <strong>Day-unlock push</strong>
                    <small>A push notification the moment tomorrow&rsquo;s session opens.</small>
                  </div>
                  <Toggle
                    on={prefs.dayUnlock}
                    onChange={setPref('dayUnlock')}
                    label="Day-unlock push"
                  />
                </div>

                <div className="pf-row">
                  <div>
                    <strong>Product news</strong>
                    <small>New assessment topics and features. Rare, never noisy.</small>
                  </div>
                  <Toggle
                    on={prefs.productNews}
                    onChange={setPref('productNews')}
                    label="Product news"
                  />
                </div>
              </div>
            </section>

            {/* REFERRALS */}
            <section
              id="referrals"
              ref={(el) => (sectionRefs.current.referrals = el)}
              className="pf-section"
            >
              <div className="pf-section-head">
                <h2>
                  <Gift size={18} /> Referrals
                </h2>
                <p>Walking with a friend helps and you both get a free counselling session.</p>
              </div>

              <div className="pf-referral">
                <div className="pf-referral-code">
                  <span className="pf-code-label">Your invite link</span>
                  <div className="pf-code-row">
                    <code>mindpath.app/invite/MAYA-CALM</code>
                    <button className="pf-copy-btn" onClick={copyInvite}>
                      <Copy size={15} /> Copy
                    </button>
                  </div>
                </div>
                <div className="pf-referral-stats">
                  <div>
                    <strong>2</strong>
                    <small>invited</small>
                  </div>
                  <div>
                    <strong>1</strong>
                    <small>joined</small>
                  </div>
                  <div className="reward">
                    <strong>1</strong>
                    <small>free session earned</small>
                  </div>
                </div>
              </div>
            </section>

            {/* PRIVACY */}
            <section
              id="privacy"
              ref={(el) => (sectionRefs.current.privacy = el)}
              className="pf-section"
            >
              <div className="pf-section-head">
                <h2>
                  <Shield size={18} /> Privacy &amp; data
                </h2>
                <p>Your reports are yours. Take them with you, or close the account entirely.</p>
              </div>

              <div className="pf-rows">
                <button
                  className="pf-row pf-row-btn"
                  onClick={() => say('Export started  a demo.')}
                >
                  <div>
                    <strong>Export my data</strong>
                    <small>Download every report, score, and mood log as a file.</small>
                  </div>
                  <Download size={18} />
                </button>
              </div>

              <p className="pf-disclaimer">
                <Shield size={14} /> MindPath assessments are self-reflection tools, not clinical or
                diagnostic services. Your data is never sold. If you&rsquo;re in crisis, please
                reach out to local emergency services or a crisis line.
              </p>

              <div className="pf-danger">
                <div>
                  <strong>Delete account</strong>
                  <small>
                    Permanently removes your reports, plans, and shelf. This cannot be undone.
                  </small>
                </div>
                <button className="pf-danger-btn" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* toast */}
      <div className="ap-toast-zone" aria-live="polite">
        {toast && (
          <p className="ap-toast">
            <Check size={14} /> {toast}
          </p>
        )}
      </div>

      {/* delete confirm */}
      {confirmDelete && (
        <div
          className="ap-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Delete account"
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
        >
          <div className="ap-modal pf-delete-modal">
            <span className="pf-delete-ico">
              <Trash2 size={24} />
            </span>
            <h3>Delete your account?</h3>
            <p>
              This would permanently erase your reports, audio progress, and shelf. In this demo,
              nothing is actually deleted.
            </p>
            <div className="ap-modal-actions">
              <button
                className="pf-danger-btn lg"
                onClick={() => {
                  setConfirmDelete(false)
                  say('Demo  your account is safe.')
                }}
              >
                Yes, delete everything
              </button>
              <button className="ap-ghostlink" onClick={() => setConfirmDelete(false)}>
                Keep my account
              </button>
            </div>
            <button
              className="ap-modal-close"
              onClick={() => setConfirmDelete(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
