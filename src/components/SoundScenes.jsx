import { useState } from 'react'

/**
 * Soundscape art. When a real scene image exists in /public/sound/image/<scene>.png
 * we show it; otherwise (or if it fails to load) we fall back to the bespoke
 * hand-drawn line-art below — wide "places" in the brand's organic stroke style.
 * Each scene paints onto a soft tinted panel; line color comes from `line`.
 */
function Scene({ children, tint, line, className = '' }) {
  return (
    <div className={`scene ${className}`} style={{ background: tint }}>
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke={line}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </div>
  )
}

export function DawnScene(p) {
  return (
    <Scene tint="#eef3e6" line="#3c7a5e" {...p}>
      <circle cx="200" cy="150" r="38" fill="#f7e3c4" stroke="none" />
      <circle cx="200" cy="150" r="38" />
      {[-1, -0.5, 0, 0.5, 1].map((k, i) => (
        <line key={i} x1={200 + k * 60} y1="95" x2={200 + k * 48} y2="78" />
      ))}
      <path d="M0 168 C 70 150 120 150 180 168 S 320 188 400 166" />
      <path d="M0 196 C 90 176 160 178 240 196 S 360 210 400 192" />
      <path d="M70 70 q 8 -7 16 0" />
      <path d="M92 64 q 8 -7 16 0" />
    </Scene>
  )
}

export function RainScene(p) {
  return (
    <Scene tint="#e6e4f5" line="#4d3da8" {...p}>
      <path
        d="M120 86 a26 26 0 0 1 52 -6 a22 22 0 0 1 36 18 a20 20 0 0 1 -8 38 H132 a24 24 0 0 1 -12 -50 z"
        fill="#fff"
        fillOpacity="0.55"
      />
      <path d="M120 86 a26 26 0 0 1 52 -6 a22 22 0 0 1 36 18 a20 20 0 0 1 -8 38 H132 a24 24 0 0 1 -12 -50 z" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={120 + i * 26} y1="150" x2={112 + i * 26} y2="180" />
      ))}
      <path d="M150 210 q 12 -10 24 0" strokeOpacity="0.6" />
      <path d="M210 214 q 14 -11 28 0" strokeOpacity="0.6" />
    </Scene>
  )
}

export function OceanScene(p) {
  return (
    <Scene tint="#dcefee" line="#1f5b57" {...p}>
      <circle cx="300" cy="74" r="26" fill="#f7e3c4" stroke="none" />
      <circle cx="300" cy="74" r="26" />
      <path d="M0 136 q 30 -16 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0" />
      <path d="M0 168 q 30 -16 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0" />
      <path d="M0 200 q 30 -16 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0" />
    </Scene>
  )
}

export function ForestScene(p) {
  return (
    <Scene tint="#e3efdd" line="#2e5f49" {...p}>
      <circle cx="318" cy="80" r="22" fill="#f7e3c4" stroke="none" />
      <line x1="0" y1="196" x2="400" y2="196" />
      {[
        [70, 196, 36],
        [120, 196, 54],
        [180, 196, 44],
        [250, 196, 64],
        [320, 196, 40],
      ].map(([x, base, h], i) => (
        <path
          key={i}
          d={`M${x} ${base} L${x} ${base - h} M${x - 16} ${base - h * 0.4} L${x} ${base - h} L${x + 16} ${base - h * 0.4} M${x - 12} ${base - h * 0.72} L${x} ${base - h} L${x + 12} ${base - h * 0.72}`}
        />
      ))}
    </Scene>
  )
}

export function MountainScene(p) {
  return (
    <Scene tint="#e7e9f3" line="#3a3568" {...p}>
      <path d="M0 200 L90 96 L150 160 L210 80 L290 200 Z" />
      <path d="M210 80 L196 100 L224 100 Z" fill="#fff" fillOpacity="0.7" stroke="none" />
      <path d="M90 96 L80 112 L104 112 Z" fill="#fff" fillOpacity="0.7" stroke="none" />
      <path d="M150 200 q 40 -22 80 -8 t 90 -4" strokeOpacity="0.6" />
    </Scene>
  )
}

export function NightScene(p) {
  return (
    <Scene tint="#dedcef" line="#2c2654" {...p}>
      <path
        d="M300 56 a30 30 0 1 0 26 46 a24 24 0 0 1 -26 -46 z"
        fill="#f7e3c4"
        fillOpacity="0.5"
      />
      <path d="M300 56 a30 30 0 1 0 26 46 a24 24 0 0 1 -26 -46 z" />
      {[
        [80, 70],
        [140, 50],
        [110, 110],
        [200, 80],
        [60, 130],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 5} L${x} ${y + 5} M${x - 5} ${y} L${x + 5} ${y}`}
          strokeOpacity="0.7"
        />
      ))}
      <path d="M0 200 C 90 168 150 170 220 196 S 340 214 400 190" fill="#fff" fillOpacity="0.25" />
    </Scene>
  )
}

export function EmberScene(p) {
  return (
    <Scene tint="#f6e6d6" line="#b05f2c" {...p}>
      <path
        d="M200 70 c 22 26 30 44 30 60 a30 30 0 0 1 -60 0 c 0 -14 8 -26 16 -36 c 2 9 7 13 13 15 c -8 -14 -6 -27 1 -39 z"
        fill="#f7d3a8"
        fillOpacity="0.5"
      />
      <path d="M200 70 c 22 26 30 44 30 60 a30 30 0 0 1 -60 0 c 0 -14 8 -26 16 -36 c 2 9 7 13 13 15 c -8 -14 -6 -27 1 -39 z" />
      <line x1="150" y1="196" x2="250" y2="196" />
      <line x1="160" y1="204" x2="240" y2="188" strokeOpacity="0.6" />
    </Scene>
  )
}

export function BreathScene(p) {
  return (
    <Scene tint="#f7e6d6" line="#b06a2c" {...p}>
      <circle cx="200" cy="120" r="20" />
      <circle cx="200" cy="120" r="44" strokeOpacity="0.55" />
      <circle cx="200" cy="120" r="70" strokeOpacity="0.3" />
      <path d="M40 120 q 30 -22 60 0 t 60 0" strokeOpacity="0.5" />
      <path d="M240 120 q 30 -22 60 0 t 60 0" strokeOpacity="0.5" />
    </Scene>
  )
}

export function FocusScene(p) {
  return (
    <Scene tint="#ece8f8" line="#4d3da8" {...p}>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="60"
          y1={80 + i * 30}
          x2="340"
          y2={80 + i * 30}
          strokeOpacity={0.3 + i * 0.18}
          strokeDasharray={i % 2 ? '2 10' : '0'}
        />
      ))}
      <circle cx="200" cy="125" r="8" fill="#4d3da8" stroke="none" />
    </Scene>
  )
}

export const SCENE_ART = {
  dawn: DawnScene,
  rain: RainScene,
  ocean: OceanScene,
  forest: ForestScene,
  mountain: MountainScene,
  night: NightScene,
  ember: EmberScene,
  breath: BreathScene,
  focus: FocusScene,
}

export default function SceneArt({ scene, className }) {
  const [failed, setFailed] = useState(false)
  const src = scene in SCENE_ART ? `/sound/image/${scene}.png` : null

  if (src && !failed) {
    return (
      <div className={`scene scene-photo ${className || ''}`}>
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      </div>
    )
  }

  const Cmp = SCENE_ART[scene] || DawnScene
  return <Cmp className={className} />
}
