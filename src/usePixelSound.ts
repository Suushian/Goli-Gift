import { useEffect, useRef, useState } from 'react'

const storageKey = 'goli-gift:effects'
const patterns = {
  tap: [523, 659],
  page: [587, 784],
  sparkle: [523, 659, 784, 1047],
}

export function usePixelSound() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(storageKey) !== 'off' } catch { return true }
  })
  const context = useRef<AudioContext | null>(null)

  useEffect(() => {
    try { localStorage.setItem(storageKey, enabled ? 'on' : 'off') } catch { /* Optional preference. */ }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    let active = true
    async function click(event: MouseEvent) {
      const control = event.target instanceof Element && event.target.closest<HTMLElement>('.memories-page button:not(:disabled)')
      if (!control || control.hasAttribute('data-silent') || !window.AudioContext || !event.isTrusted) return
      try {
        const audio = context.current ?? (context.current = new AudioContext())
        if (audio.state === 'suspended') await audio.resume()
        if (!active || audio.state !== 'running') return
        const key = control.dataset.sound
        const notes = key === 'sparkle' || key === 'page' ? patterns[key] : patterns.tap
        notes.forEach((frequency, index) => {
          const start = audio.currentTime + index * .043
          const osc = audio.createOscillator()
          const gain = audio.createGain()
          osc.type = 'triangle'
          osc.frequency.value = frequency
          gain.gain.setValueAtTime(.001, start)
          gain.gain.exponentialRampToValueAtTime(.035, start + .012)
          gain.gain.exponentialRampToValueAtTime(.001, start + .083)
          osc.connect(gain).connect(audio.destination)
          osc.start(start)
          osc.stop(start + .09)
          osc.onended = () => { osc.disconnect(); gain.disconnect() }
        })
      } catch { /* Sound effects are optional. */ }
    }
    document.addEventListener('click', click, true)
    return () => { active = false; document.removeEventListener('click', click, true) }
  }, [enabled])

  useEffect(() => () => { void context.current?.close().catch(() => {}); context.current = null }, [])
  return { enabled, toggle: () => setEnabled((current) => !current) }
}
