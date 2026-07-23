import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Heart,
  Layers,
  Pause,
  Play,
  Plus,
  SkipForward,
  Sparkles,
  X,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'
import SceneArt from '../components/SoundScenes.jsx'
import { AMBIENT, MOODS, moodOf, SOUNDSCAPES } from '../data/music.js'
import { clockToSeconds, formatTime } from '../lib/time.js'

const DEMO_SPEED = 9

/* A flowing, scrolling waveform line — not equalizer bars. */
function WaveLine({ playing, color = '#9bdfb6' }) {
  return (
    <span className={`wave ${playing ? 'on' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 480 36" preserveAspectRatio="none">
        <path
          d="M0 18 Q 15 2 30 18 T 60 18 T 90 18 T 120 18 T 150 18 T 180 18 T 210 18 T 240 18 T 270 18 T 300 18 T 330 18 T 360 18 T 390 18 T 420 18 T 450 18 T 480 18"
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export default function MusicLibrary() {
  const { t } = useTranslation()
  // localized display for a scene / mixer layer (falls back to the English data value)
  const sceneTitle = (s) => t(`sound.scenes.${s.id}.title`, s.title)
  const sceneMood = (s) => t(`sound.scenes.${s.id}.mood`, s.mood)
  const layerLabel = (l) => t(`sound.layers.${l.id}`, l.label)
  const [mood, setMood] = useState('all')
  const [liked, setLiked] = useState(() => new Set())
  const [current, setCurrent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [layers, setLayers] = useState(() => new Set())

  const isMix = current?.id === 'mix'

  // ---- real audio playback ----
  // One looping element for scene mode; a map of looping elements for the mixer
  // (one per active layer) so they all play and blend at once.
  const sceneAudioRef = useRef(null)
  const layerAudiosRef = useRef(new Map())

  // Scene mode: play the current scene's looping track (swap on scene change,
  // play/pause with the transport). Idle while mixing or when nothing is loaded.
  useEffect(() => {
    const a = sceneAudioRef.current || (sceneAudioRef.current = new Audio())
    if (isMix || !current?.src) {
      a.pause()
      return
    }
    if (!a.src.endsWith(current.src)) {
      a.src = current.src
      a.loop = true
    }
    if (playing) a.play().catch(() => {})
    else a.pause()
  }, [current?.id, current?.src, isMix, playing])

  // Mixer mode: keep one looping element per active layer, add/remove as layers
  // toggle, and start/stop them all with the transport. Each has its own volume.
  useEffect(() => {
    const map = layerAudiosRef.current
    if (!isMix) {
      map.forEach((a) => a.pause())
      map.forEach((a, id) => {
        a.src = ''
        map.delete(id)
      })
      return
    }
    sceneAudioRef.current?.pause()
    layers.forEach((id) => {
      if (!map.has(id)) {
        const l = AMBIENT.find((x) => x.id === id)
        if (l?.src) {
          const a = new Audio(l.src)
          a.loop = true
          a.volume = l.vol ?? 0.7
          map.set(id, a)
        }
      }
    })
    map.forEach((a, id) => {
      if (!layers.has(id)) {
        a.pause()
        a.src = ''
        map.delete(id)
      }
    })
    map.forEach((a) => {
      if (playing) a.play().catch(() => {})
      else a.pause()
    })
  }, [isMix, layers, playing])

  // Stop everything when the page unmounts.
  useEffect(
    () => () => {
      sceneAudioRef.current?.pause()
      layerAudiosRef.current.forEach((a) => a.pause())
    },
    [],
  )

  const list = useMemo(
    () => (mood === 'all' ? SOUNDSCAPES : SOUNDSCAPES.filter((s) => moodOf(s) === mood)),
    [mood],
  )

  const playScene = useCallback((scene) => {
    setLayers(new Set())
    setCurrent({ ...scene, secs: clockToSeconds(scene.len) })
    setElapsed(0)
    setPlaying(true)
  }, [])

  // ambient mixer → drives a "mix" in the player
  function toggleLayer(id) {
    setLayers((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      if (n.size > 0) {
        setCurrent({ id: 'mix', title: 'Your mix' })
        setPlaying(true)
        setElapsed(0)
      } else {
        setCurrent((c) => (c?.id === 'mix' ? null : c))
      }
      return n
    })
  }

  const next = useCallback(() => {
    if (!current || isMix) return
    const i = SOUNDSCAPES.findIndex((s) => s.id === current.id)
    playScene(SOUNDSCAPES[(i + 1) % SOUNDSCAPES.length])
  }, [current, isMix, playScene])

  useEffect(() => {
    if (!playing || !current || isMix) return
    const id = setInterval(() => setElapsed((e) => e + DEMO_SPEED), 1000)
    return () => clearInterval(id)
  }, [playing, current, isMix])

  useEffect(() => {
    if (current && !isMix && elapsed >= current.secs) next()
  }, [elapsed, current, isMix, next])

  function toggleLike(id) {
    setLiked((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const featured = SOUNDSCAPES[0]
  const layerObjs = AMBIENT.filter((l) => layers.has(l.id))

  return (
    <main className={`mz ${current ? 'has-player' : ''}`}>
      {/* ===== editorial hero ===== */}
      <header className="mz-hero">
        <div className="container mz-hero-grid">
          <div className="mz-hero-copy">
            <Reveal as="p" className="mz-kicker">
              {t('sound.kicker')}
            </Reveal>
            <Reveal as="h1" className="mz-title" delay={0.06}>
              {t('sound.titleA')}
              <br />
              {t('sound.titleB')} <em>{t('sound.titleEm')}</em>
            </Reveal>
            <Reveal as="p" className="mz-lede" delay={0.13}>
              {t('sound.lede')}
            </Reveal>
            <Reveal className="mz-hero-index" delay={0.2}>
              {t('sound.index', { sounds: SOUNDSCAPES.length, layers: AMBIENT.length })}
            </Reveal>
          </div>

          <Reveal className="mz-hero-feature" delay={0.16}>
            <button
              className="mz-feature-art"
              onClick={() => playScene(featured)}
              aria-label={t('sound.playAria', { title: sceneTitle(featured) })}
            >
              <SceneArt scene={featured.scene} />
              <span className="mz-feature-play">
                <Play size={22} fill="currentColor" strokeWidth={0} />
              </span>
            </button>
            <div className="mz-feature-meta">
              <span className="mz-feature-tag">{t('sound.startHere')}</span>
              <h2>{sceneTitle(featured)}</h2>
              <p>
                {sceneMood(featured)} · {featured.len}
              </p>
            </div>
          </Reveal>
        </div>
      </header>

      {/* ===== ambient mixer (signature) ===== */}
      <section className="mz-mixer-wrap">
        <div className="container">
          <div className="mz-mixer">
            <div className="mz-mixer-head">
              <div>
                <h2 className="mz-section-title">
                  <Layers size={18} /> {t('sound.makeMix')}
                </h2>
                <p>{t('sound.makeMixSub')}</p>
              </div>
              <span className="mz-mixer-count">
                {layers.size === 0
                  ? t('sound.nothingPlaying')
                  : t('sound.layersPlaying', { count: layers.size })}
              </span>
            </div>
            <div className="mz-layers">
              {AMBIENT.map((l) => {
                const on = layers.has(l.id)
                return (
                  <button
                    key={l.id}
                    className={`mz-layer ${on ? 'on' : ''}`}
                    onClick={() => toggleLayer(l.id)}
                    style={{ '--accent': l.accent }}
                    aria-pressed={on}
                  >
                    <span className="mz-layer-art">
                      <SceneArt scene={l.scene} />
                    </span>
                    <span className="mz-layer-foot">
                      <span className="mz-layer-dot" />
                      {layerLabel(l)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== soundscape library ===== */}
      <section className="mz-section">
        <div className="container">
          <div className="mz-library-head">
            <h2 className="mz-section-title">
              <Sparkles size={18} /> {t('sound.theSounds')}
            </h2>
            <div className="mz-filters" role="tablist" aria-label={t('sound.moodsAria')}>
              {MOODS.map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mood === m}
                  className={`mz-chip ${mood === m ? 'active' : ''}`}
                  onClick={() => setMood(m)}
                >
                  {t(`sound.moods.${m}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="mz-grid">
            {list.map((s, i) => {
              const isOn = current?.id === s.id
              return (
                <Reveal
                  as="article"
                  key={s.id}
                  className={`mz-scene-card ${isOn ? 'is-playing' : ''}`}
                  delay={(i % 6) * 0.05}
                >
                  <button
                    className="mz-scene-art"
                    onClick={() => playScene(s)}
                    aria-label={t('sound.playAria', { title: sceneTitle(s) })}
                  >
                    <SceneArt scene={s.scene} />
                    <span className="mz-scene-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="mz-scene-play">
                      {isOn && playing ? (
                        <Pause size={18} fill="currentColor" strokeWidth={0} />
                      ) : (
                        <Play size={18} fill="currentColor" strokeWidth={0} />
                      )}
                    </span>
                  </button>
                  <div className="mz-scene-info">
                    <div className="mz-scene-text">
                      <h3>{sceneTitle(s)}</h3>
                      <p>
                        {sceneMood(s)} · {s.len} · {t('sound.plays', { plays: s.plays })}
                      </p>
                    </div>
                    <button
                      className={`mz-like ${liked.has(s.id) ? 'on' : ''}`}
                      onClick={() => toggleLike(s.id)}
                      aria-label={t('sound.like')}
                    >
                      <Heart size={16} fill={liked.has(s.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== funnel cta ===== */}
      <section className="mz-cta">
        <div className="container">
          <Reveal className="mz-cta-panel">
            <div className="mz-cta-art" aria-hidden="true">
              <SceneArt scene="dawn" />
            </div>
            <div className="mz-cta-text">
              <h2>
                {t('sound.ctaA')} <em>{t('sound.ctaEm')}</em>
              </h2>
              <p>{t('sound.ctaP')}</p>
              <Link to="/assessments" className="btn btn-light">
                {t('sound.findPath')} <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== player ===== */}
      {current && (
        <div className={`mz-player ${playing ? 'playing' : ''}`}>
          <div className="container mz-player-inner">
            <div className="mz-player-now">
              <span className="mz-player-thumb">
                {isMix ? <Layers size={18} /> : <SceneArt scene={current.scene} />}
              </span>
              <div className="mz-player-meta">
                <strong>{isMix ? t('sound.yourMix') : sceneTitle(current)}</strong>
                <small>
                  {isMix
                    ? layerObjs.map((l) => layerLabel(l)).join(' + ') || t('sound.silence')
                    : `${sceneMood(current)} · ${t('sound.free')}`}
                </small>
              </div>
            </div>

            <div className="mz-player-center">
              <button
                className="mz-pc mz-pc-play"
                onClick={() => {
                  if (!isMix && elapsed >= current.secs) setElapsed(0)
                  setPlaying((p) => !p)
                }}
                aria-label={playing ? t('sound.pause') : t('sound.play')}
              >
                {playing ? (
                  <Pause size={20} fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play size={20} fill="currentColor" strokeWidth={0} style={{ marginLeft: 2 }} />
                )}
              </button>
              {!isMix && (
                <button className="mz-pc" onClick={next} aria-label={t('sound.next')}>
                  <SkipForward size={18} fill="currentColor" strokeWidth={0} />
                </button>
              )}
              <WaveLine playing={playing} />
              {isMix ? (
                <span className="mz-player-infinity">{t('sound.looping')}</span>
              ) : (
                <span className="mz-player-time">
                  {formatTime(Math.min(elapsed, current.secs))} / {current.len}
                </span>
              )}
            </div>

            {isMix && (
              <div className="mz-player-layers">
                {AMBIENT.map((l) => (
                  <button
                    key={l.id}
                    className={`mz-mini-layer ${layers.has(l.id) ? 'on' : ''}`}
                    onClick={() => toggleLayer(l.id)}
                    style={{ '--accent': l.accent }}
                    aria-label={
                      layers.has(l.id)
                        ? t('sound.removeLayer', { label: layerLabel(l) })
                        : t('sound.addLayer', { label: layerLabel(l) })
                    }
                    title={layerLabel(l)}
                  >
                    {layers.has(l.id) ? layerLabel(l) : <Plus size={13} />}
                  </button>
                ))}
              </div>
            )}

            <button
              className="mz-player-close"
              onClick={() => {
                setPlaying(false)
                setCurrent(null)
                setLayers(new Set())
              }}
              aria-label={t('sound.closePlayer')}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
