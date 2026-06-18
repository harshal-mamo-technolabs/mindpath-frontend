import { ClipboardList, FileHeart, Headphones, RefreshCcw, Repeat } from 'lucide-react'
import Reveal from './Reveal.jsx'

const STEPS = [
  {
    icon: ClipboardList,
    bg: '#f0edfb',
    fg: '#4d3da8',
    title: 'Take your assessment',
    text: 'Pick a topic that feels heavy right now. Answer honestly  it takes about 12 quiet minutes.',
  },
  {
    icon: FileHeart,
    bg: '#f9e3cd',
    fg: '#8a5420',
    title: 'Meet your report',
    text: 'Your scores across each dimension, explained in plain language  what they mean for you, and what to do next.',
  },
  {
    icon: Headphones,
    bg: '#dde9dd',
    fg: '#2e5f49',
    title: 'Walk it daily',
    text: 'A 7–30 day audio plan sequenced from your report. One session unlocks each day. Five to ten minutes.',
  },
  {
    icon: RefreshCcw,
    bg: '#e2dcf8',
    fg: '#4d3da8',
    title: 'Retake & see the change',
    text: 'After 60–90 days, retake the assessment and watch your before-and-after side by side.',
  },
]

export default function Journey() {
  return (
    <section className="section journey" id="journey">
      <div className="container">
        <div className="journey-head">
          <Reveal as="span" className="eyebrow">
            How it works
          </Reveal>
          <Reveal as="h2" className="h2" delay={0.08}>
            One loop. <em>Lasting change.</em>
          </Reveal>
          <Reveal as="p" className="lede" delay={0.16}>
            Everything at MindPath begins with understanding yourself and everything after is built
            from that understanding.
          </Reveal>
        </div>

        <Reveal className="journey-map" reveal={false}>
          <svg
            className="journey-path-svg"
            viewBox="0 0 1140 190"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M30 150 C 140 40, 230 40, 320 90 C 410 140, 480 160, 570 110 C 660 60, 730 40, 820 90 C 910 140, 990 150, 1110 60"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>

          <div className="journey-steps">
            {STEPS.map(({ icon: Icon, bg, fg, title, text }, i) => (
              <Reveal key={title} className="step-card" delay={i * 0.12}>
                <span className="step-num">Step {String(i + 1).padStart(2, '0')}</span>
                <span className="step-ico" style={{ background: bg, color: fg }}>
                  <Icon size={24} strokeWidth={1.8} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal className="journey-loop-note" delay={0.2}>
          <span className="loop-pill">
            <Repeat size={16} />
            Then the path loops deeper topic, new plan, visible progress.
          </span>
        </Reveal>
      </div>
    </section>
  )
}
