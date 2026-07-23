import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  ['referrals', Gift],
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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: 'Maya Kapoor',
    displayName: 'Maya',
    email: 'maya@example.com',
  })
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
      await sendTestPush({ title: 'Daybreak', body: confirmBody })
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

  const initials = form.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')

  function go(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function copyInvite() {
    navigator.clipboard?.writeText('daybreak.app/invite/MAYA-CALM').catch(() => {})
    say(t('profile.toast.inviteCopied'))
  }

  function signOut() {
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
              <p>{form.email}</p>
              <span className="pf-plan">
                <Sparkles size={13} /> {t('profile.memberSince', { date: 'March 2025' })}
              </span>
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

              <div className="pf-avatar-row">
                <span className="pf-avatar lg" aria-hidden="true">
                  {initials}
                </span>
                <div>
                  <button className="pf-mini-btn" onClick={() => say(t('profile.toast.photoDemo'))}>
                    <Pencil size={14} /> {t('profile.account.changePhoto')}
                  </button>
                  <p className="pf-avatar-note">{t('profile.account.photoNote')}</p>
                </div>
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
                <label className="pf-field">
                  <span>{t('profile.account.reportName')}</span>
                  <input
                    value={form.displayName}
                    onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                    maxLength={24}
                  />
                </label>
                <label className="pf-field pf-field-wide">
                  <span>{t('profile.account.email')}</span>
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
                <button className="btn btn-primary" onClick={() => say(t('profile.toast.profileUpdated'))}>
                  {t('profile.account.save')}
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

            {/* REFERRALS */}
            <section
              id="referrals"
              ref={(el) => (sectionRefs.current.referrals = el)}
              className="pf-section"
            >
              <div className="pf-section-head">
                <h2>
                  <Gift size={18} /> {t('profile.referrals.title')}
                </h2>
                <p>{t('profile.referrals.desc')}</p>
              </div>

              <div className="pf-referral">
                <div className="pf-referral-code">
                  <span className="pf-code-label">{t('profile.referrals.inviteLabel')}</span>
                  <div className="pf-code-row">
                    <code>daybreak.app/invite/MAYA-CALM</code>
                    <button className="pf-copy-btn" onClick={copyInvite}>
                      <Copy size={15} /> {t('profile.referrals.copy')}
                    </button>
                  </div>
                </div>
                <div className="pf-referral-stats">
                  <div>
                    <strong>2</strong>
                    <small>{t('profile.referrals.invited')}</small>
                  </div>
                  <div>
                    <strong>1</strong>
                    <small>{t('profile.referrals.joined')}</small>
                  </div>
                  <div className="reward">
                    <strong>1</strong>
                    <small>{t('profile.referrals.earned')}</small>
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
