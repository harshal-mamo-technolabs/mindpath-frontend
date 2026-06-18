import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import Journey from '../components/Journey.jsx'
import Assessments from '../components/Assessments.jsx'
import Report from '../components/Report.jsx'
import AudioPlan from '../components/AudioPlan.jsx'
import Ecosystem from '../components/Ecosystem.jsx'
import Proof from '../components/Proof.jsx'
import Cta from '../components/Cta.jsx'

export default function Home() {
  return (
    <main>
      <Hero />
      <Marquee />
      <Journey />
      <Assessments />
      <Report />
      <AudioPlan />
      <Ecosystem />
      <Proof />
      <Cta />
    </main>
  )
}
