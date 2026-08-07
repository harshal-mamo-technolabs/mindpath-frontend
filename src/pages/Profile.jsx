import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  LogOut,
  Mail,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getToken, saveSession } from '../lib/auth.js'
import { getProfile, updateProfile } from '../lib/profileApi.js'
import { APP_NAME } from '../lib/brand.js'
import { isMsisdnMode } from '../lib/billingMode.js'
import { ensurePushSubscription, pushSupported } from '../lib/push.js'
import {
  getNotificationPrefs,
  sendTestPush,
  subscribePush,
  updateNotificationPrefs,
} from '../lib/notificationsApi.js'

const SECTIONS = [
  ['account', User],
  ['notifications', Bell],
  ['privacy', Shield],
]

function TimePicker({ value, onChange }) {
  const { t } = useTranslation()
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
        aria-label={t('profile.aria.pickTime')}
        aria-expanded={open}
      >
        <Clock size={13} />
        {value}
        <ChevronDown size={11} className={`pf-time-chev ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <div className="pf-time-popover" role="dialog" aria-label={t('profile.aria.timePicker')}>
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
            {slots.map((slot) => (
              <button
                key={slot}
                className={`pf-time-slot ${value === slot ? 'active' : ''}`}
                onClick={() => {
                  onChange(slot)
                  setOpen(false)
                }}
              >
                {slot.replace(` ${tab}`, '')}
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
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  // Seeded from the session so the page paints instantly, then refreshed from
  // the API (which also carries createdAt for the "member since" line).
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '' })
  const [memberSince, setMemberSince] = useState(null)
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState({
    dailyReminder: false,
    reminderTime: '7:00 AM',
    productNews: false,
  })
  const vapid = useRef({ key: null, configured: false })
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

  // load the user's saved notification settings + the server's VAPID key
  useEffect(() => {
    let alive = true
    getNotificationPrefs()
      .then((d) => {
        if (!alive || !d) return
        vapid.current = { key: d.vapidPublicKey, configured: d.pushConfigured }
        setPrefs({
          dailyReminder: !!d.dailyReminder,
          reminderTime: d.reminderTime || '7:00 AM',
          productNews: !!d.productNews,
        })
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // Pull the authoritative profile once signed in.
  useEffect(() => {
    let alive = true
    getProfile()
      .then((p) => {
        if (!alive || !p) return
        setForm({ name: p.name ?? '', email: p.email ?? '' })
        setMemberSince(p.createdAt ?? null)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // Nothing to show without a session — send them to sign in first.
  if (!isAuthenticated) return <Navigate to="/login?next=/profile" replace />

  async function saveAccount() {
    const name = form.name.trim()
    if (name.length < 2) {
      say(t('profile.toast.nameTooShort', 'Please enter your name.'))
      return
    }
    setSaving(true)
    try {
      const updated = await updateProfile(name)
      // Keep the session in step so the nav avatar and reports update too.
      saveSession({ token: getToken(), user: { ...user, name: updated.name } })
      setForm((f) => ({ ...f, name: updated.name }))
      say(t('profile.toast.profileUpdated'))
    } catch (err) {
      say(err.message)
    } finally {
      setSaving(false)
    }
  }

  const tzOffset = () => new Date().getTimezoneOffset()

  // Turn a push channel on: create/store a browser subscription + the pref on the backend,
  // then have the BACKEND fire an immediate confirmation push.
  const enableChannel = async (key, confirmBody) => {
    if (!pushSupported()) {
      say(t('profile.toast.browserNoNotif'))
      return
    }
    if (!vapid.current.configured || !vapid.current.key) {
      say(t('profile.toast.serverNotSetup'))
      return
    }
    try {
      const subscription = await ensurePushSubscription(vapid.current.key)
      await subscribePush({ ...subscription, tzOffsetMinutes: tzOffset() })
      const patch = { [key]: true, tzOffsetMinutes: tzOffset() }
      if (key === 'dailyReminder') patch.reminderTime = prefs.reminderTime
      await updateNotificationPrefs(patch)
      setPrefs((p) => ({ ...p, [key]: true }))
      await sendTestPush({ title: APP_NAME, body: confirmBody })
      say(confirmBody)
    } catch (e) {
      if (e.message === 'permission-denied') {
        say(t('profile.toast.allowNotif'))
      } else {
        say(e.message || t('profile.toast.turnOnFailed'))
      }
    }
  }

  const disableChannel = async (key, offMsg) => {
    setPrefs((p) => ({ ...p, [key]: false }))
    say(offMsg)
    try {
      await updateNotificationPrefs({ [key]: false })
    } catch {
      /* keep the UI state; it'll re-sync on next load */
    }
  }

  const toggleReminder = (on) =>
    on
      ? enableChannel('dailyReminder', t('profile.toast.reminderOn', { time: prefs.reminderTime }))
      : disableChannel('dailyReminder', t('profile.toast.reminderOff'))

  const toggleProductNews = (on) =>
    on
      ? enableChannel('productNews', t('profile.toast.productNewsOn'))
      : disableChannel('productNews', t('profile.toast.productNewsOff'))

  const changeTime = (time) => {
    setPrefs((p) => ({ ...p, reminderTime: time }))
    say(
      prefs.dailyReminder
        ? t('profile.toast.reminderSetFor', { time })
        : t('profile.toast.reminderTimeSaved'),
    )
    updateNotificationPrefs({ reminderTime: time, tzOffsetMinutes: tzOffset() }).catch(() => {})
  }

  const initials =
    (form.name || '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '·'

  function go(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function signOut() {
    logout()
    navigate('/login')
  }

  return (
    <main className="profile">
      <div className="container">
        <Reveal as="header" className="pf-head">
          <span className="eyebrow">{t('profile.eyebrow')}</span>
          <h1 className="pf-title">{t('profile.title')}</h1>
        </Reveal>

        <div className="pf-grid">
          {/* ---- left rail ---- */}
          <aside className="pf-rail">
            <div className="pf-id">
              <span className="pf-avatar" aria-hidden="true">
                {initials}
              </span>
              <h2>{form.name}</h2>
              {/* Carrier-billed users sign in by MSISDN — they have no email to show. */}
              {!isMsisdnMode && <p>{form.email}</p>}
              {memberSince && (
                <span className="pf-plan">
                  {t('profile.memberSince', {
                    date: new Date(memberSince).toLocaleDateString(i18n.language, {
                      month: 'long',
                      year: 'numeric',
                    }),
                  })}
                </span>
              )}
            </div>

            <nav className="pf-nav" aria-label={t('profile.aria.settingsSections')}>
              {SECTIONS.map(([id, Icon]) => (
                <button
                  key={id}
                  className={`pf-nav-item ${active === id ? 'active' : ''}`}
                  onClick={() => go(id)}
                >
                  <Icon size={17} />
                  {t(`profile.${id}.title`)}
                  <ChevronRight size={15} className="pf-nav-chev" />
                </button>
              ))}
            </nav>

            <button className="pf-signout" onClick={signOut}>
              <LogOut size={16} /> {t('profile.signOut')}
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
                  <User size={18} /> {t('profile.account.title')}
                </h2>
                <p>{t('profile.account.desc')}</p>
              </div>

              <div className="pf-fields">
                <label className="pf-field">
                  <span>{t('profile.account.fullName')}</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    autoComplete="name"
                  />
                </label>
                {!isMsisdnMode && (
                  <label className="pf-field pf-field-wide">
                    <span>{t('profile.account.email')}</span>
                    <span className="pf-input-icon">
                      <Mail size={16} />
                      <input
                        type="email"
                        value={form.email}
                        readOnly
                        autoComplete="email"
                        aria-describedby="email-note"
                      />
                    </span>
                    <small id="email-note" className="pf-field-note">
                      {t(
                        'profile.account.emailNote',
                        'This is how you sign in and where your reports are sent.',
                      )}
                    </small>
                  </label>
                )}
              </div>

              <div className="pf-section-foot">
                <button className="btn btn-primary" onClick={saveAccount} disabled={saving}>
                  {saving ? t('profile.account.saving', 'Saving…') : t('profile.account.save')}
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
                  <Bell size={18} /> {t('profile.notifications.title')}
                </h2>
                <p>{t('profile.notifications.desc')}</p>
              </div>

              <div className="pf-rows">
                <div className="pf-row">
                  <div>
                    <strong>{t('profile.notifications.dailyTitle')}</strong>
                    <small>{t('profile.notifications.dailyDesc')}</small>
                  </div>
                  <div className="pf-row-control">
                    {prefs.dailyReminder && (
                      <TimePicker value={prefs.reminderTime} onChange={changeTime} />
                    )}
                    <Toggle
                      on={prefs.dailyReminder}
                      onChange={toggleReminder}
                      label={t('profile.notifications.dailyTitle')}
                    />
                  </div>
                </div>

                <div className="pf-row">
                  <div>
                    <strong>{t('profile.notifications.productTitle')}</strong>
                    <small>{t('profile.notifications.productDesc')}</small>
                  </div>
                  <Toggle
                    on={prefs.productNews}
                    onChange={toggleProductNews}
                    label={t('profile.notifications.productTitle')}
                  />
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
                  <Shield size={18} /> {t('profile.privacy.title')}
                </h2>
                <p>{t('profile.privacy.desc')}</p>
              </div>

              <div className="pf-rows">
                <button
                  className="pf-row pf-row-btn"
                  onClick={() => say(t('profile.toast.exportStarted'))}
                >
                  <div>
                    <strong>{t('profile.privacy.exportTitle')}</strong>
                    <small>{t('profile.privacy.exportDesc')}</small>
                  </div>
                  <Download size={18} />
                </button>
              </div>

              <p className="pf-disclaimer">
                <Shield size={14} /> {t('profile.privacy.disclaimer')}
              </p>

              <div className="pf-danger">
                <div>
                  <strong>{t('profile.privacy.deleteTitle')}</strong>
                  <small>{t('profile.privacy.deleteDesc')}</small>
                </div>
                <button className="pf-danger-btn" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={15} /> {t('profile.privacy.delete')}
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
          aria-label={t('profile.aria.deleteAccount')}
          onClick={(e) => e.target === e.currentTarget && setConfirmDelete(false)}
        >
          <div className="ap-modal pf-delete-modal">
            <span className="pf-delete-ico">
              <Trash2 size={24} />
            </span>
            <h3>{t('profile.modal.title')}</h3>
            <p>{t('profile.modal.body')}</p>
            <div className="ap-modal-actions">
              <button
                className="pf-danger-btn lg"
                onClick={() => {
                  setConfirmDelete(false)
                  say(t('profile.toast.accountSafe'))
                }}
              >
                {t('profile.modal.confirm')}
              </button>
              <button className="ap-ghostlink" onClick={() => setConfirmDelete(false)}>
                {t('profile.modal.keep')}
              </button>
            </div>
            <button
              className="ap-modal-close"
              onClick={() => setConfirmDelete(false)}
              aria-label={t('profile.aria.close')}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
