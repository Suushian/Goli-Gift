import { useEffect, useRef } from 'react'

const level = 0.24
const fadeSeconds = 2

export function useBackgroundMusic(active: boolean) {
  const audio = useRef<HTMLAudioElement>(null)
  const graph = useRef<{ context: AudioContext; gain: GainNode } | null>(null)
  const frame = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  function cancelFade() {
    cancelAnimationFrame(frame.current)
    window.clearTimeout(timer.current)
    const output = graph.current
    if (output) output.gain.gain.cancelScheduledValues(output.context.currentTime)
  }

  function stop() {
    cancelFade()
    audio.current?.pause()
  }

  useEffect(() => {
    if (!active) stop()
  }, [active])

  useEffect(() => () => {
    stop()
    void graph.current?.context.close().catch(() => {})
    graph.current = null
  }, [])

  function start() {
    const track = audio.current
    if (!track) return
    cancelFade()
    if (!graph.current && window.AudioContext) {
      try {
        const context = new AudioContext()
        const gain = context.createGain()
        context.createMediaElementSource(track).connect(gain).connect(context.destination)
        graph.current = { context, gain }
      } catch { /* Fall back to the audio element's volume. */ }
    }
    const output = graph.current
    track.currentTime = 0
    track.volume = output ? 1 : level
    if (output) {
      output.gain.gain.setValueAtTime(level, output.context.currentTime)
      void output.context.resume().catch(() => {})
    }
    void track.play().catch(() => {})
  }

  function fadeOut() {
    const track = audio.current
    if (!track || track.paused) return
    cancelFade()
    const output = graph.current
    if (output) {
      const now = output.context.currentTime
      output.gain.gain.setValueAtTime(output.gain.gain.value, now)
      output.gain.gain.linearRampToValueAtTime(0, now + fadeSeconds)
      timer.current = window.setTimeout(stop, fadeSeconds * 1000)
    } else {
      const startTime = performance.now()
      const startVolume = track.volume
      function fade(now: number) {
        const remaining = Math.max(0, 1 - (now - startTime) / (fadeSeconds * 1000))
        track!.volume = startVolume * remaining
        if (remaining > 0) frame.current = requestAnimationFrame(fade)
        else stop()
      }
      frame.current = requestAnimationFrame(fade)
    }
  }

  return { audio, start, fadeOut, stop }
}
