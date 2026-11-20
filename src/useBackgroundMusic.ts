import { useEffect, useRef, useState } from 'react'

const fadeMs = 2000
const startupTimeoutMs = 4000

type Status = 'idle' | 'loading' | 'playing' | 'retry' | 'stopped'

export function useBackgroundMusic(active: boolean) {
  const audio = useRef<HTMLAudioElement>(null)
  const frame = useRef(0)
  const fadeTimer = useRef<number | undefined>(undefined)
  const startupTimer = useRef<number | undefined>(undefined)
  const attempt = useRef(0)
  const warmed = useRef(false)
  const [status, setStatus] = useState<Status>('idle')

  function clearTimers() {
    cancelAnimationFrame(frame.current)
    window.clearTimeout(fadeTimer.current)
    window.clearTimeout(startupTimer.current)
  }

  function stop() {
    attempt.current++
    clearTimers()
    audio.current?.pause()
    setStatus('stopped')
  }

  useEffect(() => {
    if (!active) {
      attempt.current++
      clearTimers()
      audio.current?.pause()
      setStatus('idle')
    }
  }, [active])

  useEffect(() => () => {
    attempt.current++
    clearTimers()
  }, [])

  function warm() {
    if (warmed.current || !audio.current) return
    // This is a hint, not load(): calling load() would abort an existing request.
    audio.current.preload = 'auto'
    warmed.current = true
  }

  function start() {
    const track = audio.current
    if (!track) return
    clearTimers()
    const currentAttempt = ++attempt.current
    track.volume = 1 // The asset itself is mastered at background volume.
    if (track.error) track.load()
    setStatus('loading')
    startupTimer.current = window.setTimeout(() => {
      if (attempt.current === currentAttempt) setStatus('retry')
    }, startupTimeoutMs)
    // Call play directly inside the unlock gesture, without awaiting a decode or AudioContext.
    void track.play().then(() => {
      if (attempt.current !== currentAttempt) return
      window.clearTimeout(startupTimer.current)
      setStatus('playing')
    }, () => {
      if (attempt.current !== currentAttempt) return
      window.clearTimeout(startupTimer.current)
      setStatus('retry')
    })
  }

  function fadeOut() {
    const track = audio.current
    // Cancel a pending start too, so delayed playback can't bleed into Savage Rose.
    if (!track || track.paused || track.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      stop()
      return
    }
    attempt.current++
    clearTimers()
    setStatus('stopped')
    const startedAt = performance.now()
    const startVolume = track.volume
    function fade(now: number) {
      if (!track) return
      track.volume = startVolume * Math.max(0, 1 - (now - startedAt) / fadeMs)
      if (now - startedAt < fadeMs) frame.current = requestAnimationFrame(fade)
    }
    frame.current = requestAnimationFrame(fade)
    fadeTimer.current = window.setTimeout(stop, fadeMs)
  }

  return { audio, status, warm, start, fadeOut, stop }
}
