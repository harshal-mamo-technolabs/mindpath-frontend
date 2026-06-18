import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Loader2,
  Lock,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import {
  CATEGORIES,
  chapterContent,
  GENERAL_EBOOKS,
  INITIAL_OWNED,
  PERSONAL_EBOOKS,
  READING_PROGRESS,
} from '../data/ebooks.js'

/* A reusable CSS book cover. */
function Cover({ book, size = 'md' }) {
  return (
    <div
      className={`bk-cover bk-${size} ${book.kind === 'personal' ? 'bk-personal' : ''}`}
      style={{ '--accent': book.accent, '--bg': book.bg }}
    >
      <span className="bk-spine" />
      <span className="bk-press">MindPath Press</span>
      <span className="bk-title">{book.title}</span>
      {book.kind === 'personal' ? (
        <span className="bk-for">written for {book.forName}</span>
      ) : (
        <span className="bk-author">{book.author}</span>
      )}
    </div>
  )
}

const GEN_STEPS = [
  'Reading your report',
  'Writing your chapters',
  'Designing your cover',
  'Binding it together',
]

export default function EbooksLibrary() {
  const [owned, setOwned] = useState(() => new Set(INITIAL_OWNED))
  const [progress] = useState(READING_PROGRESS)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [reader, setReader] = useState(null) // ebook being read
  const [openChapter, setOpenChapter] = useState(null) // null = contents view, number = reading
  const [buy, setBuy] = useState(null) // { book, step }
  const [gen, setGen] = useState(null) // { book, step, reached }
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const readerRef = useRef(null)

  const say = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const shelfCount = owned.size

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GENERAL_EBOOKS.filter(
      (b) =>
        (category === 'All' || b.category === category) &&
        (!q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
    )
  }, [category, query])

  // ----- personalized generation ceremony -----
  useEffect(() => {
    if (!gen || gen.step !== 'generating') return
    if (gen.reached >= GEN_STEPS.length) {
      const t = setTimeout(() => setGen((g) => ({ ...g, step: 'done' })), 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setGen((g) => ({ ...g, reached: g.reached + 1 })), 950)
    return () => clearTimeout(t)
  }, [gen])

  function openReader(book, chapter = null) {
    setReader(book)
    setOpenChapter(chapter)
  }

  function closeReader() {
    setReader(null)
    setOpenChapter(null)
  }

  const isOwned = (b) => owned.has(b.id)
  const canRead = (book, idx) => isOwned(book) || idx === 0
  const continueChapter = (book) => {
    const pct = (progress[book.id] ?? 0) / 100
    return Math.min(book.chapters.length - 1, Math.max(0, Math.floor(pct * book.chapters.length)))
  }

  // scroll the reader back to the top whenever the chapter changes
  useEffect(() => {
    readerRef.current?.scrollTo({ top: 0 })
  }, [openChapter, reader])

  function downloadBook(book) {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const author = book.kind === 'personal' ? `Written for ${book.forName}` : book.author
    const chaptersHtml = book.chapters
      .map((ch, i) => {
        const paras = chapterContent(book, i)
          .map((p) => `      <p>${esc(p)}</p>`)
          .join('\n')
        return `    <section class="ch">\n      <span class="kic">Chapter ${i + 1}</span>\n      <h2>${esc(ch)}</h2>\n${paras}\n    </section>`
      })
      .join('\n')
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(book.title)} — MindPath Press</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #232038; line-height: 1.7; max-width: 660px; margin: 0 auto; padding: 64px 28px; background: #f7f3ec; }
  .cover { text-align: center; padding-bottom: 40px; margin-bottom: 40px; border-bottom: 1px solid #d8d0c2; }
  .cover h1 { font-size: 34px; margin: 0 0 10px; line-height: 1.15; }
  .cover .by { color: #6b6680; font-style: italic; }
  .cover .press { letter-spacing: .2em; text-transform: uppercase; font-size: 11px; color: ${book.accent}; font-family: Arial, sans-serif; }
  .ch { margin: 0 0 56px; }
  .ch .kic { letter-spacing: .18em; text-transform: uppercase; font-size: 11px; color: ${book.accent}; font-family: Arial, sans-serif; }
  .ch h2 { font-size: 25px; margin: 4px 0 20px; }
  .ch p { margin: 0 0 16px; }
  footer { text-align: center; color: #9a93a8; font-size: 13px; font-family: Arial, sans-serif; padding-top: 24px; border-top: 1px solid #d8d0c2; }
</style>
</head>
<body>
  <div class="cover">
    <p class="press">MindPath Press</p>
    <h1>${esc(book.title)}</h1>
    <p class="by">${esc(author)}</p>
  </div>
${chaptersHtml}
  <footer>© MindPath Press · This copy was prepared for your personal reading.</footer>
</body>
</html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${book.title
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    say(`“${book.title}” downloaded — yours to keep.`)
  }

  function startGenerate(book) {
    setGen({ book, step: 'offer', reached: 0 })
  }

  function runGenerate() {
    setGen((g) => ({ ...g, step: 'generating', reached: 0 }))
  }

  function finishGenerate(read) {
    const book = gen.book
    setOwned((prev) => new Set([...prev, book.id]))
    setGen(null)
    if (read) openReader(book, 0)
    else say(`“${book.title}” is on your shelf  written just for you.`)
  }

  function startBuy(book) {
    if (book.free) {
      setOwned((prev) => new Set([...prev, book.id]))
      say(`“${book.title}” added to your shelf  free, forever.`)
      return
    }
    setBuy({ book, step: 'offer' })
  }

  function confirmBuy() {
    setBuy((b) => ({ ...b, step: 'processing' }))
    setTimeout(() => setBuy((b) => ({ ...b, step: 'done' })), 1400)
  }

  function finishBuy(read) {
    const book = buy.book
    setOwned((prev) => new Set([...prev, book.id]))
    setBuy(null)
    if (read) openReader(book, 0)
    else say(`“${book.title}” added to your shelf.`)
  }

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
            Words for your <em>exact chapter.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.14}>
            Short, specific books some written for everyone, and some generated from your own
            report, with your name on the cover.
          </Reveal>
          <Reveal className="eb-shelf-pill" delay={0.2}>
            <BookOpen size={15} /> {shelfCount} on your shelf
          </Reveal>
        </div>
      </header>

      {/* ===== personalized ===== */}
      <section className="eb-section">
        <div className="container">
          <div className="eb-section-head">
            <h2 className="rp-h2">
              <Sparkles size={19} /> Written for you
            </h2>
            <span className="eb-section-count">
              {PERSONAL_EBOOKS.length} companions · {shelfCount} on your shelf
            </span>
          </div>
          <p className="eb-section-sub">
            One companion per report you&rsquo;ve unlocked free, because your assessment already
            paid for it.
          </p>

          <div className="eb-personal-grid">
            {PERSONAL_EBOOKS.map((book, i) => {
              const ready = isOwned(book)
              return (
                <Reveal as="article" key={book.id} className="eb-personal-card" delay={i * 0.08}>
                  <Cover book={book} size="lg" />
                  <div className="eb-personal-body">
                    <span className="eb-from">
                      <FileText size={13} /> {book.fromReport}
                    </span>
                    <h3>{book.title}</h3>
                    <p className="eb-personal-sub">
                      {book.subtitle} · {book.pages} pages · {book.readMin} min read
                    </p>
                    {ready ? (
                      <div className="eb-personal-actions">
                        <button
                          className="btn btn-primary eb-btn"
                          onClick={() => openReader(book, continueChapter(book))}
                        >
                          <BookOpen size={16} /> Continue · {progress[book.id] ?? 0}%
                        </button>
                        <span className="eb-owned-tag">
                          <BadgeCheck size={14} /> On your shelf
                        </span>
                      </div>
                    ) : (
                      <div className="eb-personal-actions">
                        <button
                          className="btn btn-primary eb-btn"
                          onClick={() => startGenerate(book)}
                        >
                          <Sparkles size={16} /> Generate · free
                        </button>
                        <button className="eb-textlink" onClick={() => openReader(book)}>
                          Preview contents
                        </button>
                      </div>
                    )}
                  </div>
                </Reveal>
              )
            })}

            <Reveal
              as={Link}
              to="/assessments"
              className="eb-personal-card eb-locked-personal"
              delay={0.24}
            >
              <div className="eb-locked-cover" aria-hidden="true">
                <Lock size={22} />
              </div>
              <div className="eb-personal-body">
                <span className="eb-from">
                  <Lock size={13} /> Unlocks with an assessment
                </span>
                <h3>More personal books</h3>
                <p className="eb-personal-sub">
                  Take another assessment and a new companion is written from that report.
                </p>
                <span className="eb-textlink">Browse assessments →</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== general library ===== */}
      <section className="eb-section eb-library">
        <div className="container">
          <div className="eb-section-head">
            <h2 className="rp-h2">
              <BookOpen size={19} /> The general library
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
          <p className="eb-section-sub">Topic books anyone can read no assessment required.</p>

          <div className="eb-filters" role="tablist" aria-label="Categories">
            {CATEGORIES.map((c) => (
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

          {filtered.length === 0 ? (
            <p className="eb-empty">No books match that yet try another category or search.</p>
          ) : (
            <div className="eb-grid">
              {filtered.map((book, i) => {
                const ready = isOwned(book)
                return (
                  <Reveal as="article" key={book.id} className="eb-card" delay={(i % 4) * 0.06}>
                    <button
                      className="eb-card-cover"
                      onClick={() => openReader(book)}
                      aria-label={`Preview ${book.title}`}
                    >
                      <Cover book={book} size="md" />
                      {ready && (
                        <span className="eb-card-owned">
                          <BadgeCheck size={13} /> Owned
                        </span>
                      )}
                    </button>
                    <div className="eb-card-body">
                      <span className="eb-cat" style={{ color: book.fg, background: book.bg }}>
                        {book.category}
                      </span>
                      <h3>{book.title}</h3>
                      <p className="eb-author">{book.author}</p>
                      <div className="eb-meta">
                        <span className="eb-rating">
                          <Star size={13} fill="currentColor" strokeWidth={0} /> {book.rating}
                          <small>({book.ratings})</small>
                        </span>
                        <span className="eb-pages">
                          <Clock size={12} /> {Math.round((book.readMin / 60) * 10) / 10}h
                        </span>
                      </div>
                      <div className="eb-card-foot">
                        {ready ? (
                          <button
                            className="eb-btn-read"
                            onClick={() => openReader(book, continueChapter(book))}
                          >
                            <BookOpen size={15} /> Read
                          </button>
                        ) : (
                          <>
                            <button className="eb-btn-buy" onClick={() => startBuy(book)}>
                              {book.free ? 'Get free' : `Buy · ${book.price}`}
                            </button>
                            <button className="eb-textlink sm" onClick={() => openReader(book)}>
                              Preview
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
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
                  <Cover book={reader} size="lg" />
                  <div className="eb-reader-info">
                    <span className="eb-cat" style={{ color: reader.fg, background: reader.bg }}>
                      {reader.kind === 'personal' ? 'Personalized' : reader.category}
                    </span>
                    <h2>{reader.title}</h2>
                    <p className="eb-reader-author">
                      {reader.kind === 'personal' ? `Written for ${reader.forName}` : reader.author}
                    </p>
                    <div className="eb-meta">
                      <span className="eb-pages">
                        <FileText size={13} /> {reader.pages} pages
                      </span>
                      <span className="eb-pages">
                        <Clock size={13} /> {reader.readMin} min
                      </span>
                      {reader.rating && (
                        <span className="eb-rating">
                          <Star size={13} fill="currentColor" strokeWidth={0} /> {reader.rating}
                        </span>
                      )}
                    </div>
                    {isOwned(reader) ? (
                      <div className="eb-reader-progress">
                        <div className="eb-reader-bar">
                          <i
                            style={{
                              width: `${progress[reader.id] ?? 4}%`,
                              background: reader.accent,
                            }}
                          />
                        </div>
                        <span>{progress[reader.id] ?? 4}% read</span>
                      </div>
                    ) : (
                      <p className="eb-reader-locked">
                        <Lock size={13} />{' '}
                        {reader.kind === 'personal'
                          ? 'Generate to read the full book'
                          : 'Read chapter one free · buy to keep reading'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="eb-reader-body">
                  <h3 className="eb-toc-head">Contents</h3>
                  <ol className="eb-toc">
                    {reader.chapters.map((ch, idx) => {
                      const open = canRead(reader, idx)
                      return (
                        <li key={ch} className={open ? 'readable' : 'locked'}>
                          <button
                            className="eb-toc-row"
                            disabled={!open}
                            onClick={() => open && setOpenChapter(idx)}
                          >
                            <span className="eb-toc-num">{String(idx + 1).padStart(2, '0')}</span>
                            <span className="eb-toc-title">{ch}</span>
                            {open ? (
                              idx === 0 && !isOwned(reader) ? (
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
                </div>

                <div className="eb-reader-foot">
                  {isOwned(reader) ? (
                    <>
                      <button
                        className="btn btn-primary eb-btn"
                        onClick={() => setOpenChapter(continueChapter(reader))}
                      >
                        <BookOpen size={16} />{' '}
                        {(progress[reader.id] ?? 0) > 0 ? 'Continue reading' : 'Start reading'}
                      </button>
                      <button className="eb-download" onClick={() => downloadBook(reader)}>
                        <Download size={15} /> Download
                      </button>
                    </>
                  ) : reader.kind === 'personal' ? (
                    <>
                      <button className="btn btn-primary eb-btn" onClick={() => setOpenChapter(0)}>
                        <BookOpen size={16} /> Read chapter one
                      </button>
                      <button
                        className="eb-textlink"
                        onClick={() => {
                          const b = reader
                          closeReader()
                          startGenerate(b)
                        }}
                      >
                        <Sparkles size={14} /> Generate · free
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
                          startBuy(b)
                        }}
                      >
                        {reader.free ? 'Add free to shelf' : `Buy · ${reader.price}`}
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
                    Chapter {openChapter + 1} of {reader.chapters.length}
                  </span>
                </div>

                <article className="eb-read-body">
                  <span className="eb-read-eyebrow">
                    {reader.kind === 'personal' ? `Written for ${reader.forName}` : reader.title}
                  </span>
                  <h2 className="eb-read-title">{reader.chapters[openChapter]}</h2>
                  {chapterContent(reader, openChapter).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </article>

                <div className="eb-read-nav">
                  <button
                    className="eb-read-step"
                    disabled={openChapter === 0}
                    onClick={() => setOpenChapter((c) => Math.max(0, c - 1))}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {openChapter < reader.chapters.length - 1 ? (
                    canRead(reader, openChapter + 1) ? (
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
                          b.kind === 'personal' ? startGenerate(b) : startBuy(b)
                        }}
                      >
                        <Lock size={14} />{' '}
                        {reader.kind === 'personal' ? 'Generate to continue' : 'Buy to continue'}
                      </button>
                    )
                  ) : (
                    <span className="eb-read-end">
                      The end ·{' '}
                      {reader.kind === 'personal' ? `for ${reader.forName}` : reader.author}
                    </span>
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
          onClick={(e) => e.target === e.currentTarget && buy.step !== 'processing' && setBuy(null)}
        >
          <div className="ap-modal eb-modal">
            {buy.step === 'offer' && (
              <>
                <div className="eb-modal-top">
                  <Cover book={buy.book} size="md" />
                  <div>
                    <h3>{buy.book.title}</h3>
                    <p className="eb-modal-author">{buy.book.author}</p>
                    <span className="eb-modal-price">{buy.book.price}</span>
                  </div>
                </div>
                <p className="ap-modal-pitch">{buy.book.blurb}</p>
                <ul className="ap-modal-list">
                  <li>
                    <Check size={15} /> {buy.book.pages} pages · {buy.book.readMin} min read
                  </li>
                  <li>
                    <Check size={15} /> Yours forever, across every device
                  </li>
                  <li>
                    <Check size={15} /> Read in the MindPath app or export to your reader
                  </li>
                </ul>
                <div className="ap-modal-actions">
                  <button className="btn btn-primary eb-btn-wide" onClick={confirmBuy}>
                    Buy now · {buy.book.price}
                  </button>
                </div>
                <p className="eb-modal-demo">Demo checkout no card, no charge.</p>
                <button className="ap-modal-close" onClick={() => setBuy(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </>
            )}
            {buy.step === 'processing' && (
              <div className="ap-modal-processing">
                <Loader2 size={34} className="ap-spin" />
                <h3>Adding to your shelf…</h3>
                <p>Demo checkout no card, no charge.</p>
              </div>
            )}
            {buy.step === 'done' && (
              <div className="ap-modal-done">
                <span className="ap-done-check">
                  <Check size={26} />
                </span>
                <h3>{buy.book.title} is yours</h3>
                <p>It&rsquo;s on your shelf now start whenever you like.</p>
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

      {/* ===== personalized generation ===== */}
      {gen && (
        <div
          className="ap-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Generate ${gen.book.title}`}
          onClick={(e) => e.target === e.currentTarget && gen.step === 'offer' && setGen(null)}
        >
          <div className="ap-modal eb-modal">
            {gen.step === 'offer' && (
              <>
                <div className="eb-modal-top">
                  <Cover book={gen.book} size="md" />
                  <div>
                    <h3>{gen.book.title}</h3>
                    <p className="eb-modal-author">A book written for {gen.book.forName}</p>
                    <span className="eb-modal-price free">Free · included</span>
                  </div>
                </div>
                <p className="ap-modal-pitch">
                  {gen.book.fromReport}. Your scores shape the chapters; your name goes on the
                  cover. It takes a few seconds to write.
                </p>
                <ul className="ap-modal-list">
                  <li>
                    <Check size={15} /> {gen.book.chapters.length} chapters from your dimensions
                  </li>
                  <li>
                    <Check size={15} /> Personalized cover with your name
                  </li>
                  <li>
                    <Check size={15} /> Short and specific {gen.book.readMin} minutes
                  </li>
                </ul>
                <div className="ap-modal-actions">
                  <button className="btn btn-primary eb-btn-wide" onClick={runGenerate}>
                    <Sparkles size={16} /> Generate my book
                  </button>
                </div>
                <button className="ap-modal-close" onClick={() => setGen(null)} aria-label="Close">
                  <X size={18} />
                </button>
              </>
            )}
            {gen.step === 'generating' && (
              <div className="eb-gen">
                <div className="eb-gen-cover">
                  <Cover book={gen.book} size="md" />
                  <span className="eb-gen-shine" />
                </div>
                <h3>Writing your book…</h3>
                <ul className="gen-steps" aria-live="polite">
                  {GEN_STEPS.map((s, i) => (
                    <li
                      key={s}
                      className={i < gen.reached ? 'done' : i === gen.reached ? 'active' : ''}
                    >
                      <span className="gen-check">
                        {i < gen.reached ? <Check size={13} /> : null}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {gen.step === 'done' && (
              <div className="ap-modal-done">
                <span className="ap-done-check">
                  <Check size={26} />
                </span>
                <h3>{gen.book.title} is written</h3>
                <p>
                  {gen.book.chapters.length} chapters, just for {gen.book.forName} it&rsquo;s on
                  your shelf.
                </p>
                <div className="ap-modal-actions">
                  <button className="btn btn-light" onClick={() => finishGenerate(true)}>
                    <BookOpen size={16} /> Read it now
                  </button>
                  <button className="ap-ghostlink" onClick={() => finishGenerate(false)}>
                    Later
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
