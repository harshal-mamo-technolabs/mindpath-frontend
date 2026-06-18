/**
 * Free yoga & meditation soundscapes — open to everyone, no purchase, no
 * sign-up. The low-friction top-of-funnel hook (spec §3.6). Presented as
 * illustrated "places" you can go, plus a build-your-own ambient mixer.
 */
export const SOUNDSCAPES = [
  { id: 'dawn-flow', title: 'Sunrise Flow', scene: 'dawn', mood: 'Yoga · morning', len: '24:00', plays: '167k' },
  { id: 'rain-roof', title: 'Rain on a Tin Roof', scene: 'rain', mood: 'Sleep · rainfall', len: '45:00', plays: '512k' },
  { id: 'ocean-far', title: 'Ocean, Far Off', scene: 'ocean', mood: 'Nature · tide', len: '42:00', plays: '402k' },
  { id: 'forest-dawn', title: 'Forest at Dawn', scene: 'forest', mood: 'Nature · birdsong', len: '38:00', plays: '356k' },
  { id: 'mountain-stream', title: 'Mountain Stream', scene: 'mountain', mood: 'Nature · water', len: '28:00', plays: '176k' },
  { id: 'night-drift', title: 'Drifting Off', scene: 'night', mood: 'Sleep · deep', len: '30:00', plays: '388k' },
  { id: 'embers', title: 'Low Embers', scene: 'ember', mood: 'Focus · warmth', len: '50:00', plays: '274k' },
  { id: 'box-breath', title: 'Box-Breathing Tones', scene: 'breath', mood: 'Breathwork', len: '12:00', plays: '129k' },
  { id: 'deep-work', title: 'Deep Work Drones', scene: 'focus', mood: 'Focus · steady', len: '50:00', plays: '231k' },
]

export const MOODS = ['All', 'Sleep', 'Yoga', 'Focus', 'Nature', 'Breathwork']

export const moodOf = (s) => s.mood.split(' · ')[0].split(' ')[0]

/** The build-your-own-quiet ambient layers (the signature interaction). */
export const AMBIENT = [
  { id: 'rain', label: 'Rain', scene: 'rain', accent: '#6450cf' },
  { id: 'waves', label: 'Waves', scene: 'ocean', accent: '#1f5b57' },
  { id: 'forest', label: 'Birdsong', scene: 'forest', accent: '#2e5f49' },
  { id: 'wind', label: 'Wind', scene: 'breath', accent: '#b06a2c' },
  { id: 'fire', label: 'Crackle', scene: 'ember', accent: '#b05f2c' },
  { id: 'drone', label: 'Drone', scene: 'focus', accent: '#4d3da8' },
]
