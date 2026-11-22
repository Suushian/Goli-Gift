import { useEffect, useRef, useState } from 'react'

const startTimeoutMs = 3000

export type TuneStatus = 'idle' | 'playing' | 'paused' | 'blocked'

/**
 * Short birthday tune for the finale. `start()` is called straight from the gift
 * button so playback begins inside the click gesture (the most reliable path on
 * mobile Safari). The effect is only a fallback, and a manual control stays
 * visible because autoplay policy can still refuse.
 */
export function useBirthdayTune(active: boolean) {
  const audio = useRef<HTMLAudioElement>(null)
  const [status, setStatus] = useState<TuneStatus>('idle')

  function start(fromBeginning = false) {
    const track = audio.current
    if (!track) return
    if (track.error) track.load()
    track.volume = 1
    if (fromBeginning) track.currentTime = 0
    setStatus('playing')
    const guard = window.setTimeout(() => {
      if (track.paused) setStatus('blocked')
    }, startTimeoutMs)
    void track.play().then(
      () => { window.clearTimeout(guard); setStatus('playing') },
      () => { window.clearTimeout(guard); setStatus('blocked') },
    )
  }

  function toggle() {
    const track = audio.current
    if (!track) return
    if (!track.paused) { track.pause(); return }
    start()
  }

  useEffect(() => {
    const track = audio.current
    if (!active) {
      track?.pause()
      setStatus('idle')
      return
    }
    // Gesture-driven start normally already happened; retry quietly if it did not.
    if (track?.paused) start(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return { audio, status, start, toggle }
}
