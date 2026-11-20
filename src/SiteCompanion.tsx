import wink from './assets/memories/wink.webp'
import laugh from './assets/memories/laugh.webp'
import kiss from './assets/memories/kiss.webp'
import companion from './assets/memories/companion.webp'
import { useEffect, useRef, useState, type HTMLAttributes, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'

const lines = [
  'خوشگل منی.',
  'خوشت اومدده هااا!',
  'بخورمت.',
  'میام می‌خورمتا!',
  'بازم زدی؟ خودت خواستی دیگه 😌',
  'باشه، فعلاً فقط یه بوس پیکسلی: موچ!',
  'حالا برو عکس‌هاتو ببین… من همین‌جا منتظرتم ♥',
]

const spontaneousLines = [
  'امروز خوشگل به نظر میای ✨',
  'لبخندشو ببین… آخه مگه می‌شه آدم ذوق نکنه؟',
  'یه لحظه صبر کن… فقط می‌خواستم بگم خیلی دوستت دارم ♥',
  'اون کوچولوی توی عکس‌ها می‌دونه چقدر دوست‌داشتنی بوده؟',
  'الان لبخند زدی؟ همینو می‌خواستم 😌',
  'من این گوشه‌م، اگه یه بغل پیکسلی خواستی!',
]

const poses = [wink, laugh, kiss, wink, laugh, kiss, companion]

type Props = {
  portal?: HTMLElement | null
  compact?: boolean
  dragging?: boolean
  shift?: { x: number; y: number }
  allowClick?: (event: MouseEvent<HTMLButtonElement>) => boolean
  dragHandlers?: Pick<HTMLAttributes<HTMLButtonElement>, 'onPointerDown' | 'onPointerMove' | 'onPointerUp' | 'onPointerCancel' | 'onLostPointerCapture'>
}

export default function SiteCompanion({ portal, compact, dragging, shift = { x: 0, y: 0 }, allowClick, dragHandlers }: Props) {
  const [taps, setTaps] = useState(0)
  const [clickMessageVisible, setClickMessageVisible] = useState(false)
  const clickMessageTimer = useRef<number | undefined>(undefined)
  const [spontaneousLine, setSpontaneousLine] = useState('')
  const lastSpontaneous = useRef('')
  const [shownPose, setShownPose] = useState(companion)
  const sprite = useRef<HTMLSpanElement>(null)
  const poseTimer = useRef<number | undefined>(undefined)
  const jump = useRef<Animation | null>(null)

  useEffect(() => () => {
    window.clearTimeout(clickMessageTimer.current)
    window.clearTimeout(poseTimer.current)
    jump.current?.cancel()
  }, [])

  function reactToTap() {
    setSpontaneousLine('')
    setClickMessageVisible(true)
    window.clearTimeout(clickMessageTimer.current)
    clickMessageTimer.current = window.setTimeout(() => setClickMessageVisible(false), 5000)
    const nextPose = poses[taps % poses.length]
    setTaps(taps + 1)
    window.clearTimeout(poseTimer.current)
    jump.current?.cancel()
    if (!sprite.current?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShownPose(nextPose)
      return
    }
    jump.current = sprite.current.animate([
      { transform: 'translateY(0) scale(1.06, .93)', offset: 0 },
      { transform: 'translateY(-20px) scale(.97, 1.04)', offset: .43 },
      { transform: 'translateY(0) scale(1.05, .94)', offset: .82 },
      { transform: 'none', offset: 1 },
    ], { duration: 340, easing: 'ease-in-out' })
    poseTimer.current = window.setTimeout(() => setShownPose(nextPose), 150)
  }
  useEffect(() => {
    if (dragging) return
    let timer: number
    let dismiss: number | undefined

    function schedule() {
      timer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          const choices = spontaneousLines.filter((line) => line !== lastSpontaneous.current)
          const line = choices[Math.floor(Math.random() * choices.length)]
          lastSpontaneous.current = line
          setSpontaneousLine(line)
          dismiss = window.setTimeout(() => setSpontaneousLine(''), 6500)
        }
        schedule()
      }, 12000 + Math.floor(Math.random() * 17001))
    }

    setSpontaneousLine('')
    schedule()
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(dismiss)
    }
  }, [dragging, taps])

  const widget = (
    <div className={`memory-companion${dragging ? ' is-dragging' : ''}${compact ? ' is-compact' : ''}${dragHandlers ? ' is-draggable' : ''}`} style={{ translate: `${shift.x}px ${shift.y}px` }}>
        <div className="companion-speech" aria-live="polite" aria-atomic="true">
          {(spontaneousLine || clickMessageVisible) && <span key={spontaneousLine || taps} className={spontaneousLine ? undefined : 'click-speech'}>{spontaneousLine || lines[(taps - 1) % lines.length]}</span>}
        </div>
        <button className="companion-button" type="button" onClick={(event) => {
          if (!allowClick || allowClick(event)) reactToTap()
        }} {...dragHandlers}>
          <span className="companion-sprite" ref={sprite} aria-hidden="true">
            {[companion, wink, laugh, kiss].map((pose) => (
              <img key={pose} src={pose} alt="" className={pose === shownPose ? 'is-current' : undefined} />
            ))}
          </span>
          <span>روی من بزن 👀</span>
        </button>
      </div>
  )
  return portal ? createPortal(widget, portal) : widget
}
