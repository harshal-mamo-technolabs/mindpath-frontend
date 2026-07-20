import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import Reveal from './Reveal.jsx'

const VOICE_BARS = [40, 75, 55, 90, 65, 100, 70, 85, 50, 78, 60, 92, 45, 70]

const TRACKS = [
  ['Morning yoga flow', '24:00'],
  ['Deep rest  rain on leaves', '45:00'],
  ['Box-breathing tones', '12:00'],
]

export default function Ecosystem() {
  return (
    <section className="section" id="explore">
      <div className="container">
        <Reveal as="span" className="eyebrow">
          Around your path
        </Reveal>
        <Reveal as="h2" className="h2" delay={0.08}>
          Made for <em>exactly one person.</em>
        </Reveal>
        <Reveal as="p" className="lede" delay={0.16}>
          Once your report exists, everything else can be shaped to it and the music is simply free,
          for everyone, forever.
        </Reveal>

        <div className="eco-grid">
          <Reveal as="article" className="eco-card eco-ebook" delay={0.1}>
            <span className="eco-tag">Personalized ebooks</span>
            <h3>A short book with your name on the cover</h3>
            <p>
              Generated from your report specific to your scores, your patterns, your next 30 days.
              General titles are open to everyone.
            </p>
            <Link className="eco-link" to="/ebooks" style={{ color: '#8a5420' }}>
              Visit the shop <ArrowRight size={16} />
            </Link>
            <div className="eco-book-mock" aria-hidden="true">
              <small>Daybreak Press</small>
              <h5>Quiet the Static: Maya&rsquo;s 30 Days of Recovery</h5>
              <span className="for">written for Maya K.</span>
            </div>
          </Reveal>

          <Reveal as="article" className="eco-card eco-voice" delay={0.2}>
            <span className="eco-tag">AI counselling</span>
            <h3>Talk it through, out loud</h3>
            <p>
              A speech-to-speech advisor that has read your report so you never start from
              &ldquo;tell me about yourself.&rdquo;
            </p>
            <Link className="eco-link" to="/counselling">
              How sessions work <ArrowRight size={16} />
            </Link>
            <div className="voice-viz" aria-hidden="true">
              {VOICE_BARS.map((h, i) => (
                <i key={i} style={{ '--h': h, '--i': i }} />
              ))}
            </div>
            <div className="minutes" aria-hidden="true">
              <span>15 min</span>
              <span className="hot">30 min</span>
              <span>60 min</span>
            </div>
          </Reveal>

          <Reveal as="article" className="eco-card eco-music" delay={0.3}>
            <span className="eco-tag">Free · no account</span>
            <h3>Yoga &amp; meditation music</h3>
            <p>Press play right now. No paywall, no sign-up just somewhere calm to start.</p>
            <Link className="eco-link" to="/music">
              Open the library <ArrowRight size={16} />
            </Link>
            <div className="music-rows">
              {TRACKS.map(([name, len]) => (
                <span className="music-row" key={name}>
                  <span className="mr-play">
                    <Play size={13} fill="currentColor" strokeWidth={0} />
                  </span>
                  {name}
                  <em>{len}</em>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
