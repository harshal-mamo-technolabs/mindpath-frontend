/**
 * Free yoga & meditation soundscapes — open to everyone, no purchase, no
 * sign-up. The low-friction top-of-funnel hook (spec §3.6). Presented as
 * illustrated "places" you can go, plus a build-your-own ambient mixer.
 *
 * Audio: royalty-free ambient loops from the Google Sound Library (CC BY 4.0),
 * stored in /public/audio/soundscapes/ (see CREDITS.md there). Each scene has a
 * `src`; each mixer layer has a `src` + a default `vol` so layers blend cleanly.
 */
const S = '/audio/soundscapes'

// `moodKey` is a stable filter category (never shown); title/mood display text is
// localized in the i18n `sound.scenes.<id>` keys (falling back to these English values).
export const SOUNDSCAPES = [
  { id: 'dawn-flow', title: 'Sunrise Flow', scene: 'dawn', moodKey: 'yoga', mood: 'Yoga · morning', len: '24:00', plays: '167k', src: `${S}/pad.ogg` },
  { id: 'rain-roof', title: 'Rain on a Tin Roof', scene: 'rain', moodKey: 'sleep', mood: 'Sleep · rainfall', len: '45:00', plays: '512k', src: `${S}/rain.ogg` },
  { id: 'ocean-far', title: 'Ocean, Far Off', scene: 'ocean', moodKey: 'nature', mood: 'Nature · tide', len: '42:00', plays: '402k', src: `${S}/waves.ogg` },
  { id: 'forest-dawn', title: 'Forest at Dawn', scene: 'forest', moodKey: 'nature', mood: 'Nature · birdsong', len: '38:00', plays: '356k', src: `${S}/forest.ogg` },
  { id: 'mountain-stream', title: 'Mountain Stream', scene: 'mountain', moodKey: 'nature', mood: 'Nature · water', len: '28:00', plays: '176k', src: `${S}/stream.ogg` },
  { id: 'night-drift', title: 'Drifting Off', scene: 'night', moodKey: 'sleep', mood: 'Sleep · deep', len: '30:00', plays: '388k', src: `${S}/night.ogg` },
  { id: 'embers', title: 'Low Embers', scene: 'ember', moodKey: 'focus', mood: 'Focus · warmth', len: '50:00', plays: '274k', src: `${S}/fire.ogg` },
  { id: 'box-breath', title: 'Box-Breathing Tones', scene: 'breath', moodKey: 'breathwork', mood: 'Breathwork', len: '12:00', plays: '129k', src: `${S}/chimes.ogg` },
  { id: 'deep-work', title: 'Deep Work Drones', scene: 'focus', moodKey: 'focus', mood: 'Focus · steady', len: '50:00', plays: '231k', src: `${S}/drone.ogg` },
]

// Filter keys (localized for display via i18n `sound.moods.<key>`).
export const MOODS = ['all', 'sleep', 'yoga', 'focus', 'nature', 'breathwork']

export const moodOf = (s) => s.moodKey

/** The build-your-own-quiet ambient layers (the signature interaction). */
export const AMBIENT = [
  { id: 'rain', label: 'Rain', scene: 'rain', accent: '#6450cf', src: `${S}/rain.ogg`, vol: 0.8 },
  { id: 'waves', label: 'Waves', scene: 'ocean', accent: '#1f5b57', src: `${S}/waves.ogg`, vol: 0.75 },
  { id: 'forest', label: 'Birdsong', scene: 'forest', accent: '#2e5f49', src: `${S}/forest.ogg`, vol: 0.6 },
  { id: 'wind', label: 'Wind', scene: 'breath', accent: '#b06a2c', src: `${S}/wind.ogg`, vol: 0.55 },
  { id: 'fire', label: 'Crackle', scene: 'ember', accent: '#b05f2c', src: `${S}/fire.ogg`, vol: 0.7 },
  { id: 'drone', label: 'Drone', scene: 'focus', accent: '#4d3da8', src: `${S}/drone.ogg`, vol: 0.5 },
]
