import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import {
  BadgeCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  CreditCard,
  Crown,
  Download,
  FileText,
  Loader2,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { isStripeMode } from '../lib/billingMode.js'
import { stripeConfigured, stripePromise } from '../lib/stripe.js'
import { getPaymentMethods } from '../lib/payments.js'
import { getEbook, listEbooks, markEbookProgress, startEbook } from '../lib/ebooksApi.js'

/* The ebook shop — real catalog from the backend. Free books are readable by anyone but
   only land on "Your shelf" once added; paid books are a one-time card charge for Stripe
   users (or covered by a plan / MSISDN allowance). "Explore" holds everything not yet on
   the shelf; "Your shelf" holds what you've added or bought. */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const idOf = (b) => b._id || b.id
const titleCase = (s) => (s || '').replace(/\b\w/g, (c) => c.toUpperCase())
const priceTag = (b) => `€${Number(b.cost || 0).toFixed(2)}`

// Style Stripe's Payment Element to match the dark ebook modal.
const STRIPE_APPEARANCE = {
  theme: 'night',
  variables: {
    colorPrimary: '#6450cf',
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '12px',
  },
}

/* Named cover palettes, cycled by position so the shelf looks varied. */
const COVER_THEMES = [
  { accent: '#6450cf', bg: '#efeafc', fg: '#5637bf' },
  { accent: '#2f8f9d', bg: '#e3f1f3', fg: '#22707c' },
  { accent: '#4f9a6a', bg: '#e7f3eb', fg: '#3c7c53' },
  { accent: '#c56b57', bg: '#f8ebe6', fg: '#a5503d' },
  { accent: '#c98a2c', bg: '#f7f0dc', fg: '#9c6812' },
]
const themeFor = (i) =>
  COVER_THEMES[((i % COVER_THEMES.length) + COVER_THEMES.length) % COVER_THEMES.length]

/* Split a chapter body (blank-line separated) into paragraphs for the reader. */
const toParas = (body) =>
  (body || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

/* Shelf badge shown on a card the caller has added/bought (null otherwise). */
const shelfBadge = (b) => {
  if (!b.onShelf) return null
  if (b.isFree) return 'Free'
  return isStripeMode ? 'Owned' : 'Included'
}

/* The action label for acquiring a book not yet on the shelf. */
const acquireLabel = (b) => (b.isFree || !isStripeMode ? 'Add to shelf' : `Buy · ${priceTag(b)}`)

/* A reusable CSS book cover. */
function Cover({ book, theme, size = 'md' }) {
  return (
    <div className={`bk-cover bk-${size}`} style={{ '--accent': theme.accent, '--bg': theme.bg }}>
      <span className="bk-spine" />
      <span className="bk-press">Daybreak Press</span>
      <span className="bk-title">{book.coverText || book.title}</span>
      <span className="bk-author">{book.author}</span>
    </div>
  )
}

/* ---- new-card form: Stripe's modern Payment Element (must live inside <Elements>) ---- */
function NewCardForm({ priceLabel, onPaid, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)
    onError('')
    // Confirm the PaymentIntent; Stripe.js shows the 3D Secure step automatically when
    // the bank requires it. redirect: 'if_required' keeps us on the page otherwise.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/ebooks` },
      redirect: 'if_required',
    })
    if (error) {
      onError(error.message || 'Your card could not be charged. Please try another card.')
      setBusy(false)
      return
    }
    await onPaid()
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="apl-payform">
      <PaymentElement options={{ paymentMethodOrder: ['card'] }} />
      <button className="btn btn-primary apl-paybtn" disabled={!stripe || busy}>
        {busy ? (
          <>
            <Loader2 size={15} className="ap-spin" /> Processing…
          </>
        ) : (
          <>
            <Lock size={15} /> Pay {priceLabel}
          </>
        )}
      </button>
    </form>
  )
}

/* ---- payment step: one-click with a saved card, or a new card (Payment Element) ---- */
function EbookPay({ clientSecret, amount, onPaid }) {
  const [cards, setCards] = useState(null) // null = loading
  const [selected, setSelected] = useState(null)
  const [useNew, setUseNew] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const label = `€${Number(amount || 0).toFixed(2)}`

  useEffect(() => {
    let alive = true
    getPaymentMethods()
      .then((list) => {
        if (!alive) return
        const arr = list || []
        setCards(arr)
        setSelected(arr.find((c) => c.isDefault)?.id || arr[0]?.id || null)
        setUseNew(arr.length === 0)
      })
      .catch(() => {
        if (alive) {
          setCards([])
          setUseNew(true)
        }
      })
    return () => {
      alive = false
    }
  }, [])

  async function paySaved() {
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Payments are not configured (missing Stripe key).')
      const { error: err } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selected,
      })
      if (err) throw new Error(err.message || 'Your card could not be charged.')
      await onPaid()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!stripeConfigured) {
    return (
      <p className="apl-error">
        Payments aren’t configured — add VITE_STRIPE_PUBLISHABLE_KEY and restart.
      </p>
    )
  }
  if (cards === null) {
    return (
      <div className="apl-pay-loading">
        <Loader2 size={18} className="ap-spin" /> Preparing secure checkout…
      </div>
    )
  }

  return (
    <div className="apl-pay">
      {error && <p className="apl-error">{error}</p>}

      {!useNew && cards.length > 0 ? (
        <>
          <div className="apl-pay-cards">
            {cards.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`apl-pay-card ${selected === c.id ? 'selected' : ''}`}
                onClick={() => setSelected(c.id)}
                aria-pressed={selected === c.id}
              >
                <CreditCard size={17} />
                <span className="apl-pay-card-info">
                  <strong>
                    {titleCase(c.brand)} •••• {c.last4}
                  </strong>
                  <small>
                    Expires {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                    {c.isDefault ? ' · default' : ''}
                  </small>
                </span>
                {selected === c.id && <Check size={15} className="apl-pay-check" />}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary apl-paybtn"
            onClick={paySaved}
            disabled={busy || !selected}
          >
            {busy ? (
              <>
                <Loader2 size={15} className="ap-spin" /> Processing…
              </>
            ) : (
              <>
                <Lock size={15} /> Pay {label}
              </>
            )}
          </button>
          <button type="button" className="apl-pay-switch" onClick={() => setUseNew(true)}>
            Use a new card instead
          </button>
        </>
      ) : (
        <>
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
            <NewCardForm priceLabel={label} onPaid={onPaid} onError={setError} />
          </Elements>
          {cards.length > 0 && (
            <button type="button" className="apl-pay-switch" onClick={() => setUseNew(false)}>
              ← Use a saved card
            </button>
          )}
        </>
      )}

      <p className="apl-pay-secure">
        <ShieldCheck size={13} /> Secured by Stripe. Test mode — use card 4242 4242 4242 4242.
      </p>
    </div>
  )
}

export default function EbooksLibrary() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [books, setBooks] = useState(null) // null = loading
  const [listError, setListError] = useState('')
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  const [reader, setReader] = useState(null) // full ebook (with chapters)
  const [readerBusy, setReaderBusy] = useState(false)
  const [openChapter, setOpenChapter] = useState(null) // null = contents view, number = reading

  const [buy, setBuy] = useState(null) // { book, step: 'loading'|'pay'|'done', clientSecret, amount }
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const readerRef = useRef(null)

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 4200)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  /* fetch the catalog (JWT auto-attached → cards carry `onShelf`/`unlocked`) */
  useEffect(() => {
    let alive = true
    listEbooks()
      .then((d) => alive && setBooks(d || []))
      .catch((e) => alive && setListError(e.message))
    return () => {
      alive = false
    }
  }, [])

  const shelfCount = useMemo(() => (books || []).filter((b) => b.onShelf).length, [books])

  const categories = useMemo(() => {
    const set = new Set((books || []).map((b) => b.category).filter(Boolean))
    return ['All', ...set]
  }, [books])

  // Category/search apply to the "Explore" browse section.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (books || []).filter(
      (b) =>
        (category === 'All' || b.category === category) &&
        (!q || b.title.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q)),
    )
  }, [books, category, query])

  const gIndex = useCallback(
    (book) => (books || []).findIndex((b) => idOf(b) === idOf(book)),
    [books],
  )

  // scroll the reader back to the top whenever the chapter changes
  useEffect(() => {
    readerRef.current?.scrollTo({ top: 0 })
  }, [openChapter, reader])

  // Mark a book as on the shelf in both the grid and the open reader.
  const patchOwned = (id) => {
    setBooks((list) =>
      (list || []).map((b) => (idOf(b) === id ? { ...b, onShelf: true, unlocked: true } : b)),
    )
    setReader((r) => (r && idOf(r) === id ? { ...r, onShelf: true, unlocked: true } : r))
  }

  const openReader = async (book, chapter = null) => {
    setReaderBusy(true)
    setReader({ ...book, chapters: null }) // open the drawer in its loading (contents) state
    setOpenChapter(null)
    try {
      const full = await getEbook(idOf(book))
      setReader(full)
      setOpenChapter(chapter) // only enter the reading view once chapters are loaded
    } catch (e) {
      say(e.message || 'Couldn’t open this book — try again.')
      setReader(null)
    } finally {
      setReaderBusy(false)
    }
  }

  const closeReader = () => {
    setReader(null)
    setOpenChapter(null)
  }

  const refreshDetail = async (id) => {
    const fresh = await getEbook(id)
    setReader((r) => (r && idOf(r) === id ? fresh : r))
    return fresh
  }

  // Toggle a chapter's read state, recompute progress locally, and persist it.
  const markRead = async (order, read) => {
    const id = idOf(reader)
    setReader((r) => {
      if (!r || idOf(r) !== id) return r
      const chapters = (r.chapters || []).map((c) => (c.order === order ? { ...c, read } : c))
      const total = chapters.length || 1
      const done = chapters.filter((c) => c.read).length
      return { ...r, chapters, chaptersRead: done, progress: Math.round((done / total) * 100) }
    })
    try {
      const res = await markEbookProgress(id, order, read)
      setBooks((list) =>
        (list || []).map((b) =>
          idOf(b) === id ? { ...b, progress: res.progress, chaptersRead: res.chaptersRead } : b,
        ),
      )
    } catch (e) {
      say(e.message || 'Couldn’t save your progress.')
      // revert the optimistic toggle
      setReader((r) =>
        r && idOf(r) === id
          ? {
              ...r,
              chapters: (r.chapters || []).map((c) =>
                c.order === order ? { ...c, read: !read } : c,
              ),
            }
          : r,
      )
    }
  }

  /* ----- add / unlock / buy ----- */
  const startGet = (book) => {
    if (!isAuthenticated) {
      navigate('/login?next=/ebooks')
      return
    }
    if (book.isFree) {
      addToShelf(book)
      return
    }
    // Stripe: open real checkout. MSISDN: unlock straight from the plan allowance.
    if (isStripeMode) {
      beginPurchase(book)
    } else {
      unlockWithPlan(book)
    }
  }

  // Free book → put it on the shelf (a "free" access record). It was already readable.
  const addToShelf = async (book) => {
    setBusy(true)
    try {
      await startEbook(idOf(book))
      patchOwned(idOf(book))
      say(`“${book.title}” added to your shelf.`)
    } catch (e) {
      say(e.message || 'Couldn’t add this book to your shelf.')
    } finally {
      setBusy(false)
    }
  }

  const unlockWithPlan = async (book) => {
    setBusy(true)
    try {
      const res = await startEbook(idOf(book))
      if (res.requiresPayment) {
        setBuy({ book, step: 'pay', clientSecret: res.clientSecret, amount: res.amount })
      } else {
        patchOwned(idOf(book))
        say(`“${book.title}” is on your shelf.`)
      }
    } catch (e) {
      say(e.message || 'Couldn’t add this book to your shelf.')
    } finally {
      setBusy(false)
    }
  }

  // Open checkout: ask the backend for a PaymentIntent. If a plan allowance covers it,
  // there's no charge; otherwise we show the real Stripe payment form.
  const beginPurchase = async (book) => {
    setBuy({ book, step: 'loading' })
    try {
      const res = await startEbook(idOf(book))
      if (res.requiresPayment) {
        setBuy({ book, step: 'pay', clientSecret: res.clientSecret, amount: res.amount })
      } else {
        // covered by a plan allowance — no charge needed
        patchOwned(idOf(book))
        setBuy({ book, step: 'done' })
      }
    } catch (e) {
      say(e.message || 'Couldn’t start checkout — try again.')
      setBuy(null)
    }
  }

  const onPaid = async () => {
    const id = idOf(buy.book)
    for (let i = 0; i < 10; i += 1) {
      const res = await startEbook(id)
      if (!res.requiresPayment) break
      await sleep(1200)
    }
    patchOwned(id)
    setBuy((b) => ({ ...b, step: 'done' }))
  }

  const finishBuy = async (read) => {
    const book = buy.book
    setBuy(null)
    if (read) openReader(book, 0)
    else {
      await refreshDetail(idOf(book)).catch(() => {})
      say(`“${book.title}” added to your shelf.`)
    }
  }

  /* ----- download an owned book as a PDF via the browser's print-to-PDF, keeping the
     same cream look as the styled HTML. Matches how the app's reports do "Download PDF"
     (window.print + print-color-adjust: exact). Renders in a hidden iframe so only the
     book prints, not the app. ----- */
  const downloadBook = (book) => {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const theme = themeFor(gIndex(book))
    const chaptersHtml = (book.chapters || [])
      .map((ch, i) => {
        const paras = toParas(ch.body)
          .map((p) => `      <p>${esc(p)}</p>`)
          .join('\n')
        return `    <section class="ch">\n      <span class="kic">Chapter ${i + 1}</span>\n      <h2>${esc(ch.title)}</h2>\n${paras}\n    </section>`
      })
      .join('\n')
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(book.title)} — Daybreak Press</title>
<style>
  @page { margin: 18mm 0; }
  /* Plain white page. print-color-adjust: exact keeps it white regardless of any dark UI. */
  html { background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #232038; line-height: 1.7; margin: 0 auto; max-width: 640px; padding: 0 24px; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .cover { text-align: center; padding-bottom: 40px; margin-bottom: 40px; border-bottom: 1px solid #d8d0c2; }
  .cover h1 { font-size: 34px; margin: 0 0 10px; line-height: 1.15; }
  .cover .by { color: #6b6680; font-style: italic; }
  .cover .press { letter-spacing: .2em; text-transform: uppercase; font-size: 11px; color: ${theme.accent}; font-family: Arial, sans-serif; }
  .ch { margin: 0 0 44px; }
  .ch .kic { letter-spacing: .18em; text-transform: uppercase; font-size: 11px; color: ${theme.accent}; font-family: Arial, sans-serif; }
  .ch h2 { font-size: 24px; margin: 4px 0 18px; break-after: avoid; }
  .ch p { margin: 0 0 15px; orphans: 2; widows: 2; }
  footer { text-align: center; color: #9a93a8; font-size: 13px; font-family: Arial, sans-serif; padding-top: 24px; border-top: 1px solid #d8d0c2; }
</style>
</head>
<body>
  <div class="cover">
    <p class="press">Daybreak Press</p>
    <h1>${esc(book.title)}</h1>
    <p class="by">${esc(book.author || 'Daybreak Press')}</p>
  </div>
${chaptersHtml}
  <footer>© Daybreak Press · Prepared for your personal reading.</footer>
</body>
</html>`

    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'
    iframe.onload = () => {
      const w = iframe.contentWindow
      w.focus()
      w.print()
      w.onafterprint = () => iframe.remove()
      // safety cleanup if afterprint never fires (e.g. dialog dismissed)
      setTimeout(() => document.body.contains(iframe) && iframe.remove(), 120000)
    }
    iframe.srcdoc = html
    document.body.appendChild(iframe)
    say(`Preparing “${book.title}” — choose “Save as PDF” in the print dialog.`)
  }

  /* A single catalog card — used by both the shelf and explore grids. */
  const renderCard = (book, i) => {
    const theme = themeFor(gIndex(book))
    const badge = shelfBadge(book)
    return (
      <Reveal as="article" key={idOf(book)} className="eb-card" delay={(i % 4) * 0.06}>
        <button
          className="eb-card-cover"
          onClick={() => openReader(book)}
          aria-label={`Preview ${book.title}`}
        >
          <Cover book={book} theme={theme} size="md" />
          {!book.isFree && (
            <span className="eb-premium">
              <Crown size={11} /> Premium
            </span>
          )}
          {badge && (
            <span className="eb-card-owned">
              <BadgeCheck size={13} /> {badge}
            </span>
          )}
        </button>
        <div className="eb-card-body">
          {book.category && (
            <span className="eb-cat" style={{ color: theme.fg, background: theme.bg }}>
              {book.category}
            </span>
          )}
          <h3>{book.title}</h3>
          <p className="eb-author">{book.author}</p>
          <div className="eb-meta">
            <span className="eb-pages">
              <FileText size={12} /> {book.chaptersCount} ch
            </span>
            {book.readMinutes ? (
              <span className="eb-pages">
                <Clock size={12} /> {book.readMinutes} min
              </span>
            ) : null}
          </div>
          {book.onShelf && book.chaptersCount ? (
            <div className="eb-card-progress">
              <div className="bar">
                <i style={{ width: `${book.progress || 0}%`, background: theme.accent }} />
              </div>
              <span>{book.progress || 0}%</span>
            </div>
          ) : null}
          <div className="eb-card-foot">
            {book.onShelf ? (
              <button className="eb-btn-read" onClick={() => openReader(book, 0)}>
                <BookOpen size={15} /> Read
              </button>
            ) : (
              <>
                <button className="eb-btn-buy" onClick={() => startGet(book)}>
                  {acquireLabel(book)}
                </button>
                <button className="eb-textlink sm" onClick={() => openReader(book)}>
                  {book.isFree ? 'Read' : 'Preview'}
                </button>
              </>
            )}
          </div>
        </div>
      </Reveal>
    )
  }

  /* ----- states ----- */
  if (listError) {
    return (
      <main className="eb">
        <div className="eb-section">
          <div className="container">
            <p className="eb-empty">Couldn’t load the ebook shop — {listError}</p>
          </div>
        </div>
      </main>
    )
  }

  const shelf = (books || []).filter((b) => b.onShelf)
  const explore = filtered.filter((b) => !b.onShelf)
  const readerTheme = reader ? themeFor(Math.max(0, gIndex(reader))) : COVER_THEMES[0]

  return (
    <main className="eb">
      {/* ===== hero ===== */}
      <header className="eb-hero">
        <div className="aurora" aria-hidden="true">
          <i />
          <i />
        </div>
        <div className="container">
          <Reveal as="span" className="eyebrow">
            The ebook shop
          </Reveal>
          <Reveal as="h1" className="h1 eb-title" delay={0.07}>
            Short reads for a <em>calmer mind.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.14}>
            Gentle books on the things that weigh on us — anxiety, sleep, self-doubt, grief. Some
            are free to read; others unlock with a one-time purchase.
          </Reveal>
          <Reveal className="eb-shelf-pill" delay={0.2}>
            <BookOpen size={15} /> {shelfCount} on your shelf
          </Reveal>
        </div>
      </header>

      {/* ===== your shelf ===== */}
      {books !== null && shelf.length > 0 && (
        <section className="eb-section">
          <div className="container">
            <div className="eb-section-head">
              <h2 className="rp-h2">
                <Sparkles size={19} /> Your shelf
              </h2>
              <span className="eb-section-count">
                {shelf.length} {shelf.length === 1 ? 'book' : 'books'}
              </span>
            </div>
            <p className="eb-section-sub">Books you’ve added or bought — open any time.</p>
            <div className="eb-grid">{shelf.map((b, i) => renderCard(b, i))}</div>
          </div>
        </section>
      )}

      {/* ===== explore ===== */}
      <section className="eb-section eb-library">
        <div className="container">
          <div className="eb-section-head">
            <h2 className="rp-h2">
              <Search size={19} /> Explore
            </h2>
            <label className="eb-search">
              <Search size={16} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles or authors"
                aria-label="Search the library"
              />
            </label>
          </div>
          <p className="eb-section-sub">
            Add a free book to your shelf, or read chapter one and unlock the rest.
          </p>

          {categories.length > 1 && (
            <div className="eb-filters" role="tablist" aria-label="Categories">
              {categories.map((c) => (
                <button
                  key={c}
                  role="tab"
                  aria-selected={category === c}
                  className={`eb-chip ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {books === null ? (
            <div className="eb-empty">
              <Loader2 size={20} className="ap-spin" /> Loading the library…
            </div>
          ) : explore.length === 0 ? (
            <p className="eb-empty">
              {shelf.length > 0
                ? 'You’ve added everything here — enjoy your shelf.'
                : 'No books match that yet — try another category or search.'}
            </p>
          ) : (
            <div className="eb-grid">{explore.map((b, i) => renderCard(b, i))}</div>
          )}
        </div>
      </section>

      {/* ===== toast ===== */}
      <div className="ap-toast-zone eb-toast-zone" aria-live="polite">
        {toast && (
          <p className="ap-toast">
            <BadgeCheck size={14} /> {toast}
          </p>
        )}
      </div>

      {/* ===== reader drawer ===== */}
      {reader && (
        <div
          className={`eb-reader-overlay ${openChapter !== null ? 'reading' : ''}`}
          onClick={(e) => e.target === e.currentTarget && closeReader()}
        >
          <aside
            ref={readerRef}
            className={`eb-reader ${openChapter !== null ? 'reading' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${reader.title} reader`}
          >
            <button className="eb-reader-close" onClick={closeReader} aria-label="Close reader">
              <X size={20} />
            </button>

            {openChapter === null ? (
              <>
                {/* ---- contents view ---- */}
                <div className="eb-reader-top">
                  <Cover book={reader} theme={readerTheme} size="lg" />
                  <div className="eb-reader-info">
                    {reader.category && (
                      <span
                        className="eb-cat"
                        style={{ color: readerTheme.fg, background: readerTheme.bg }}
                      >
                        {reader.category}
                      </span>
                    )}
                    <h2>{reader.title}</h2>
                    <p className="eb-reader-author">{reader.author}</p>
                    <div className="eb-meta">
                      {reader.pages ? (
                        <span className="eb-pages">
                          <FileText size={13} /> {reader.pages} pages
                        </span>
                      ) : null}
                      {reader.readMinutes ? (
                        <span className="eb-pages">
                          <Clock size={13} /> {reader.readMinutes} min
                        </span>
                      ) : null}
                    </div>
                    {reader.onShelf && reader.chapters ? (
                      <div className="eb-reader-progress">
                        <div className="eb-reader-bar">
                          <i
                            style={{ width: `${reader.progress || 0}%`, background: readerTheme.accent }}
                          />
                        </div>
                        <span>{reader.progress || 0}% read</span>
                      </div>
                    ) : null}
                    {reader.onShelf ? (
                      <p className="eb-reader-locked" style={{ color: readerTheme.accent }}>
                        <BadgeCheck size={13} /> On your shelf
                      </p>
                    ) : reader.isFree ? (
                      <p className="eb-reader-locked" style={{ color: readerTheme.accent }}>
                        <BookOpen size={13} /> Free to read · add it to keep it on your shelf
                      </p>
                    ) : (
                      <p className="eb-reader-locked">
                        <Lock size={13} /> Read chapter one free · unlock to keep reading
                      </p>
                    )}
                  </div>
                </div>

                <div className="eb-reader-body">
                  <h3 className="eb-toc-head">Contents</h3>
                  {readerBusy && !reader.chapters ? (
                    <p className="eb-empty">
                      <Loader2 size={16} className="ap-spin" /> Loading…
                    </p>
                  ) : (
                    <ol className="eb-toc">
                      {(reader.chapters || []).map((ch, idx) => {
                        const open = !ch.locked
                        return (
                          <li key={ch.order} className={open ? 'readable' : 'locked'}>
                            <button
                              className="eb-toc-row"
                              disabled={!open}
                              onClick={() => open && setOpenChapter(idx)}
                            >
                              <span className="eb-toc-num">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="eb-toc-title">{ch.title}</span>
                              {ch.read ? (
                                <Check
                                  size={15}
                                  className="eb-toc-go"
                                  style={{ color: readerTheme.accent }}
                                />
                              ) : open ? (
                                idx === 0 && !reader.unlocked ? (
                                  <em className="eb-toc-tag">Free</em>
                                ) : (
                                  <ChevronRight size={15} className="eb-toc-go" />
                                )
                              ) : (
                                <Lock size={13} className="eb-toc-lock" />
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </div>

                <div className="eb-reader-foot">
                  {reader.onShelf ? (
                    <>
                      <button className="btn btn-primary eb-btn" onClick={() => setOpenChapter(0)}>
                        <BookOpen size={16} /> Start reading
                      </button>
                      <button className="eb-download" onClick={() => downloadBook(reader)}>
                        <Download size={15} /> Download PDF
                      </button>
                    </>
                  ) : reader.isFree ? (
                    <>
                      <button className="btn btn-primary eb-btn" onClick={() => setOpenChapter(0)}>
                        <BookOpen size={16} /> Start reading
                      </button>
                      <button
                        className="eb-textlink"
                        onClick={() => startGet(reader)}
                        disabled={busy}
                      >
                        <Plus size={14} /> Add to shelf
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary eb-btn" onClick={() => setOpenChapter(0)}>
                        <BookOpen size={16} /> Read chapter one
                      </button>
                      <button
                        className="eb-textlink"
                        onClick={() => {
                          const b = reader
                          closeReader()
                          startGet(b)
                        }}
                      >
                        {isStripeMode ? `Unlock · ${priceTag(reader)}` : 'Add to shelf'}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* ---- reading view ---- */}
                <div className="eb-read-head">
                  <button className="eb-read-back" onClick={() => setOpenChapter(null)}>
                    <ChevronLeft size={16} /> Contents
                  </button>
                  <span className="eb-read-of">
                    Chapter {openChapter + 1} of {reader.chapters?.length || 0}
                  </span>
                </div>

                <article className="eb-read-body">
                  <span className="eb-read-eyebrow">{reader.title}</span>
                  <h2 className="eb-read-title">{reader.chapters?.[openChapter]?.title}</h2>
                  {toParas(reader.chapters?.[openChapter]?.body).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </article>

                {reader.onShelf && reader.chapters?.[openChapter] && (
                  <button
                    className={`eb-mark-read ${reader.chapters[openChapter].read ? 'done' : ''}`}
                    onClick={() =>
                      markRead(
                        reader.chapters[openChapter].order,
                        !reader.chapters[openChapter].read,
                      )
                    }
                  >
                    {reader.chapters[openChapter].read ? (
                      <>
                        <Check size={15} /> Marked as read
                      </>
                    ) : (
                      <>
                        <Circle size={15} /> Mark as read
                      </>
                    )}
                  </button>
                )}

                <div className="eb-read-nav">
                  <button
                    className="eb-read-step"
                    disabled={openChapter === 0}
                    onClick={() => setOpenChapter((c) => Math.max(0, c - 1))}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {openChapter < (reader.chapters?.length || 0) - 1 ? (
                    !reader.chapters?.[openChapter + 1]?.locked ? (
                      <button
                        className="eb-read-step primary"
                        onClick={() => setOpenChapter((c) => c + 1)}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        className="eb-read-step locked"
                        onClick={() => {
                          const b = reader
                          closeReader()
                          startGet(b)
                        }}
                      >
                        <Lock size={14} /> {isStripeMode ? 'Unlock to continue' : 'Add to shelf'}
                      </button>
                    )
                  ) : (
                    <span className="eb-read-end">The end · {reader.author}</span>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* ===== buy modal ===== */}
      {buy && (
        <div
          className="ap-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Buy ${buy.book.title}`}
          onClick={(e) => e.target === e.currentTarget && buy.step !== 'pay' && setBuy(null)}
        >
          <div className="ap-modal eb-modal">
            {buy.step === 'loading' && (
              <div className="apl-pay-loading">
                <Loader2 size={22} className="ap-spin" /> Preparing secure checkout…
              </div>
            )}

            {buy.step === 'pay' && (
              <>
                <div className="eb-modal-top">
                  <Cover book={buy.book} theme={themeFor(gIndex(buy.book))} size="md" />
                  <div>
                    <h3>{buy.book.title}</h3>
                    <p className="eb-modal-author">{buy.book.author}</p>
                    <span className="eb-modal-price">{priceTag(buy.book)}</span>
                  </div>
                </div>
                <EbookPay clientSecret={buy.clientSecret} amount={buy.amount} onPaid={onPaid} />
                <button className="ap-modal-close" onClick={() => setBuy(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </>
            )}

            {buy.step === 'done' && (
              <div className="ap-modal-done">
                <span className="ap-done-check">
                  <Check size={26} />
                </span>
                <h3>{buy.book.title} is yours</h3>
                <p>It’s on your shelf now — start whenever you like.</p>
                <div className="ap-modal-actions">
                  <button className="btn btn-light" onClick={() => finishBuy(true)}>
                    <BookOpen size={16} /> Read now
                  </button>
                  <button className="ap-ghostlink" onClick={() => finishBuy(false)}>
                    To my shelf
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
