import { usePixelSound } from './usePixelSound'
import BirthdayGame from './BirthdayGame'
import roseCover from './assets/memories/savage-rose-cover.webp'
import SiteCompanion from './SiteCompanion'
import solarDamage from './assets/memories/solar-damage.webp'
import solarRepair from './assets/memories/solar-repair.webp'
import gardenCat from './assets/goli-cat.png'
import hug from './assets/memories/hug.webp'
import companion from './assets/memories/companion.webp'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import character from './assets/memories/character.webp'
import first from './assets/memories/photo-1.webp'
import beach from './assets/memories/photo-2.webp'
import together from './assets/memories/photo-3.webp'
import orange from './assets/memories/photo-4.webp'
import today from './assets/memories/photo-5.webp'

const trackUrl = 'https://soundcloud.com/koorowsh420/01-savage-rose'
const localTrack = import.meta.glob('./assets/memories/savage-rose.m4a', { eager: true, query: '?url', import: 'default' })['./assets/memories/savage-rose.m4a'] as string | undefined

function formatTime(seconds: number) {
  const full = Math.floor(seconds)
  return `${Math.floor(full / 60)}:${String(full % 60).padStart(2, '0')}`
}

function PixelMusicPlayer({ onPlayRequest }: { onPlayRequest: () => void }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playRejected, setPlayRejected] = useState(false)

  async function togglePlayback() {
    const element = audio.current
    if (!element) return
    if (!element.paused) { element.pause(); return }
    onPlayRequest()
    setPlayRejected(false)
    try { await element.play() } catch { setPlayRejected(true) }
  }

  return (
    <div className={`pixel-player${playing ? ' is-playing' : ''}`}>
      <div className="pixel-player-display">
        <span className="memory-record" aria-hidden="true">♫</span>
        <div><strong lang="en" dir="ltr">Savage Rose</strong><p lang="en" dir="ltr">Koorosh · Tamara &amp; Sami Low</p></div>
      </div>
      {localTrack && !failed ? (
        <>
          <audio ref={audio} preload="metadata" src={localTrack}
            onError={() => setFailed(true)} onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} />
          <div className="pixel-player-controls">
            <button type="button" data-silent onClick={togglePlayback}>{playing ? 'Ⅱ مکث' : '▶ پخش آهنگ'}</button>
            <div className="pixel-player-seek" dir="ltr">
              <input type="range" style={{ background: `linear-gradient(to right, #824675 ${duration ? time / duration * 100 : 0}%, #e3cee7 0)` }} aria-label="موقعیت پخش آهنگ" aria-valuetext={formatTime(time)} min={0} max={duration || 1} step="0.1" value={time} disabled={!duration} onChange={(event) => {
                if (!audio.current) return
                audio.current.currentTime = Number(event.currentTarget.value)
                setTime(audio.current.currentTime)
              }} />
              <div aria-hidden="true"><span>{formatTime(time)}</span><span>{formatTime(duration)}</span></div>
            </div>
          </div>
          {playRejected && <p role="status">پخش شروع نشد؛ دوباره امتحان کن.</p>}
        </>
      ) : <p role={failed ? 'status' : undefined}>{failed ? 'فایل آهنگ قابل پخش نیست.' : 'فایل محلی آهنگ هنوز اضافه نشده.'}</p>}
      <a href={trackUrl} target="_blank" rel="noopener noreferrer">منبع کاور و آهنگ · SoundCloud ↗</a>
    </div>
  )
}

const photos = [
  { src: first, alt: 'عکس کودکی با لباس قرمز و گوشواره‌های حلقه‌ای', caption: 'اینجا هنوز خیلی کوچولو بودی.' },
  { src: orange, alt: 'عکس کودکی با لباس نارنجی', caption: 'اینجا یکم بزرگ‌تر شدی.' },
  { src: together, alt: 'عکس دونفره با لباس‌های رنگی', caption: 'اینجا یه کم دیگه بزرگ‌تر شدی.' },
  { src: beach, alt: 'لبخند در میان شن‌ها', caption: 'اینجا باز هم یکم بزرگ‌تر شدی.' },
  { src: today, alt: 'پرتره با لباس روشن و گردنبند آبی', caption: 'و اینجا رسیدیم به توی امروز.' },
]

const stageLabels = ['خوشامد', 'آلبوم', 'آهنگ', 'روز تولد']

function StageProgress({ active }: { active: number }) {
  return (
    <ol className="stage-progress" aria-label="مراحل دفتر خاطرات">
      {stageLabels.map((label, index) => (
        <li key={label} aria-current={index === active ? 'step' : undefined} className={index < active ? 'is-past' : undefined}>
          <span aria-hidden="true">{['۱', '۲', '۳', '۴'][index]}</span>{label}
        </li>
      ))}
    </ol>
  )
}

export default function Memories({ onMusicStage, onFavoritePlay }: { onMusicStage: () => void; onFavoritePlay: () => void }) {
  const sound = usePixelSound()
  const soundControl = <button className="effects-toggle" type="button" data-silent aria-label="جلوه‌های صوتی" aria-pressed={sound.enabled} onClick={sound.toggle}>
    <span aria-hidden="true">{sound.enabled ? '♫' : '♪'}</span> افکت صدا: {sound.enabled ? 'روشن' : 'خاموش'}
  </button>
  const [paired, setPaired] = useState(false)
  const [hugging, setHugging] = useState(false)
  const [shift, setShift] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [near, setNear] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const partner = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)

  function closeToPartner(x: number, y: number) {
    const box = stage.current?.getBoundingClientRect()
    return !!box && x >= box.left - 35 && x <= box.right + 35 && y >= box.top - 25 && y <= box.bottom + 25
  }

  function pair() {
    setPaired(true)
    partner.current?.focus({ preventScroll: true })
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    drag.current = null
    setDragging(false)
    setNear(false)
    setShift({ x: 0, y: 0 })
    skipClick.current = current.moved
    if (current.moved && !cancelled && closeToPartner(event.clientX, event.clientY)) pair()
  }

  const [activePhoto, setActivePhoto] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [albumEnded, setAlbumEnded] = useState(false)
  const [albumOpen, setAlbumOpen] = useState(false)
  const [chapter, setChapter] = useState<'intro' | 'music' | 'event' | 'game'>('intro')
  const [gameVisited, setGameVisited] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const meter = useRef<HTMLSpanElement>(null)
  const elapsed = useRef(0)
  const photo = photos[activePhoto]
  const lastPhoto = photos.length - 1

  function resetMeter() {
    elapsed.current = 0
    if (meter.current) meter.current.style.transform = 'scaleX(0)'
  }

  function choosePhoto(index: number) {
    if (index < 0 || index > lastPhoto) return
    resetMeter()
    setAlbumEnded(false)
    setActivePhoto(index)
  }

  useEffect(() => {
    if (!albumOpen || !playing) return
    let frame: number
    let previous = performance.now()
    function tick(now: number) {
      if (document.visibilityState === 'visible') elapsed.current += Math.min(now - previous, 100)
      previous = now
      if (meter.current) meter.current.style.transform = `scaleX(${Math.min(elapsed.current / 5000, 1)})`
      if (elapsed.current >= 5000) {
        if (activePhoto === lastPhoto) {
          setAlbumEnded(true)
          setPlaying(false)
        } else {
          resetMeter()
          setActivePhoto(activePhoto + 1)
        }
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [albumOpen, playing, activePhoto, lastPhoto])

  function openAlbum() {
    document.querySelector<HTMLAudioElement>('.pixel-player audio')?.pause()
    choosePhoto(0)
    setPlaying(true)
    setAlbumOpen(true)
    dialog.current?.showModal()
  }

  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const title = chapter === 'intro' ? heading.current : document.getElementById(`memory-${chapter}`)
    title?.focus({ preventScroll: true })
  }, [chapter])

  return (
    <main className="memories-page">
      <header hidden={chapter !== 'intro' || albumOpen} className="memory-hero memory-screen">
        <div className="memory-stage-header">
          <span className="memory-stage-brand">✦ دفتر خاطرات</span>
          <div className="memory-stage-tools"><StageProgress active={0} />{soundControl}</div>
          <a className="memories-back" href="#/">برگشت به ورود ↗</a>
        </div>
        <div className="memory-hero-inner">
          <div>
            <p className="memories-kicker">فصل دوم · یک قصه به اسم تو</p>
            <h1 ref={heading} tabIndex={-1}>از کوچولویی تا امروز</h1>
            <p>از اون نگاه جدیِ کوچولویی تا توی امروز؛ این چند قاب رو برای تو کنار هم گذاشتم.</p>
            <button className="memory-cta" type="button" data-sound="page" onClick={openAlbum}>دیدن عکس‌ها ✦</button>
          </div>
          <figure className="memory-character">
            <div className="character-glow" aria-hidden="true" />
            <div className={`character-stage${near ? ' is-near' : ''}${hugging ? ' is-hugging' : ''}`} ref={stage}>
              <button ref={partner} type="button" className="character-action" aria-label={paired ? 'بغل کردن' : 'آوردن کاراکتر کنار من'} onClick={() => paired ? setHugging(!hugging) : pair()}>
                <img src={character} alt="" />
              </button>
              {paired && <button type="button" className="character-action" aria-label="بغل کردن" onClick={() => setHugging(!hugging)}><img src={companion} alt="" /></button>}
              <img className="hug-sprite" src={hug} alt="" aria-hidden="true" />
              {hugging && <span className="hug-heart" aria-hidden="true">♥</span>}
            </div>
            <figcaption aria-live="polite">{hugging ? 'یه بغل پیکسلی ♥' : paired ? 'روی هرکدوم بزن تا همو بغل کنن' : 'منو بکش کنار کاراکترت ↙'}</figcaption>
            {paired && <button type="button" onClick={() => {
              setHugging(false)
              setPaired(false)
              partner.current?.focus({ preventScroll: true })
            }}>برگشت به گوشه</button>}
          </figure>
        </div>
      </header>
      {(albumOpen || chapter === 'event' || chapter === 'game' || (chapter === 'intro' && !paired)) && <SiteCompanion
        portal={albumOpen ? dialog.current : null}
        compact={albumOpen || chapter !== 'intro'}
        dragging={dragging}
        shift={shift}
        allowClick={(event) => {
          const allowed = !skipClick.current || event.detail === 0
          skipClick.current = false
          return allowed
        }}
        dragHandlers={chapter === 'intro' && !albumOpen ? { onPointerDown: (event) => {
          if (!event.isPrimary || event.button !== 0) return
          skipClick.current = false
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
          event.currentTarget.setPointerCapture(event.pointerId)
        }, onPointerMove: (event) => {
          const current = drag.current
          if (!current || current.id !== event.pointerId) return
          const x = event.clientX - current.x
          const y = event.clientY - current.y
          if (!current.moved && Math.hypot(x, y) < 7) return
          current.moved = true
          setDragging(true)
          setShift({ x, y })
          setNear(closeToPartner(event.clientX, event.clientY))
        }, onPointerUp: (event) => finishDrag(event), onLostPointerCapture: (event) => finishDrag(event, true), onPointerCancel: (event) => finishDrag(event, true) } : undefined}
      />}
      <dialog ref={dialog} className="memory-slideshow" aria-label="آلبوم تمام‌صفحهٔ خاطرات" onClose={() => {
        setAlbumOpen(false)
        setPlaying(false)
        requestAnimationFrame(() => {
          const title = chapter === 'intro' ? heading.current : document.getElementById('memory-music')
          if (title && title.getClientRects().length) title.focus({ preventScroll: true })
        })
      }} onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          choosePhoto(activePhoto + (event.key === 'ArrowLeft' ? 1 : -1))
        }
      }}>
        <div className="slideshow-sky" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
        <div className="slideshow-cat" aria-hidden="true"><img src={gardenCat} alt="" /></div>
        <div className="slideshow-layout">
          <div className="slideshow-top">
            <button type="button" onClick={() => dialog.current?.close()}>بستن ×</button>
            <div className="memory-stage-tools"><StageProgress active={1} />{soundControl}</div>
            <button type="button" onClick={() => {
              if (albumEnded) choosePhoto(0)
              setPlaying(!playing)
            }}>{playing ? 'مکث' : albumEnded ? 'پخش دوباره' : 'ادامهٔ پخش'}</button>
          </div>
          <div className="slideshow-photo-area">
          <div className="slideshow-mat">
          <div className="album-timing">
            <span>قاب {['۱', '۲', '۳', '۴', '۵'][activePhoto]} از ۵</span>
            <div className="album-meter" aria-hidden="true"><span ref={meter} /></div>
          </div>
          <figure className="slideshow-frame" key={photo.src}>
            <img src={photo.src} alt={photo.alt} />
            <figcaption aria-live={playing ? 'off' : 'polite'}>{photo.caption}</figcaption>
          </figure>
          </div>
          </div>
          <div className="slideshow-controls">
            <div className="slideshow-dots" role="group" aria-label="انتخاب قاب">
              {photos.map(({ src }, index) => <button type="button" key={src} aria-label={`قاب ${index + 1}`} aria-current={index === activePhoto ? 'true' : undefined} onClick={() => choosePhoto(index)} />)}
            </div>
            <button type="button" disabled={activePhoto === 0} onClick={() => choosePhoto(activePhoto - 1)}>→ قبلی</button>
            {activePhoto < lastPhoto ? <button type="button" data-sound="page" onClick={() => choosePhoto(activePhoto + 1)}>بعدی ←</button> : <button type="button" onClick={() => {
              dialog.current?.close()
              onMusicStage()
              setChapter('music')
            }}>ادامهٔ خاطرات ←</button>}
          </div>
        </div>
      </dialog>
      {chapter === 'music' && <section hidden={albumOpen} className="memory-section memory-music memory-screen" aria-labelledby="memory-music">
        <div className="memory-stage-header">
          <span className="memory-stage-brand">♫ دفتر خاطرات</span>
          <div className="memory-stage-tools"><StageProgress active={2} />{soundControl}</div>
        </div>
        <div className="memory-music-layout">
          <figure className="memory-cover"><img src={roseCover} alt="کاور Savage Rose" /></figure>
          <div className="memory-screen-body">
            <p className="memories-kicker">یک مکث برای گوش دادن</p>
            <h2 id="memory-music" tabIndex={-1}>آهنگ مورد علاقه‌ات</h2>
            <PixelMusicPlayer onPlayRequest={onFavoritePlay} />
          </div>
        </div>
        <div className="memory-stage-nav">
          <button type="button" onClick={openAlbum}>→ دیدن دوبارهٔ عکس‌ها</button>
          <button type="button" onClick={() => setChapter('event')}>رویداد روز تولدت ←</button>
        </div>
      </section>}
      {chapter === 'event' && <section className="memory-section memory-event memory-screen" aria-labelledby="memory-event">
        <div className="memory-stage-header">
          <span className="memory-stage-brand">✧ دفتر خاطرات</span>
          <div className="memory-stage-tools"><StageProgress active={3} />{soundControl}</div>
        </div>
        <div className="memory-event-story">
          <p className="memories-kicker">روز تولدت · <time dateTime="2007-11-01">۱ نوامبر ۲۰۰۷</time></p>
          <h2 id="memory-event" tabIndex={-1}>نقشهٔ نجات پنل خورشیدی در مدار زمین</h2>
          <div className="event-beats" aria-label="زمان‌بندی رویداد">
            <span><strong>۱ نوامبر</strong> · آماده‌سازی ابزار</span>
            <span><strong>۳ نوامبر</strong> · تعمیر در مدار</span>
          </div>
          <p>همون روزی که تو به دنیا اومدی، خدمهٔ شاتل دیسکاوری در مدار زمین مشغول آماده‌کردن ابزار برای تعمیر یک پنل خورشیدیِ پاره‌شده در ایستگاه فضایی بین‌المللی بودند. ناسا پیاده‌روی فضایی را به تعویق انداخت تا تیم فرصت بیشتری برای آماده‌سازی داشته باشد.</p>
          <p>دو روز بعد، در ۳ نوامبر، فضانوردها پنل را تعمیر کردند و پنل دوباره به‌طور کامل باز شد.</p>
          <a href="https://www.army.mil/article/5894/army_astronaut_to_help_repair_damaged_solar_array">گزارش ۱ نوامبر و عکس پنل آسیب‌دیده</a>
          {' · '}
          <a href="https://www.nasa.gov/image-article/astronaut-scott-parazynski-works-near-solar-array/">عکس آرشیوی تعمیر در فضا</a>
        </div>
        <div className="memory-event-photos">
          <figure>
            <img src={solarDamage} alt="پنل خورشیدی آسیب‌دیدهٔ ایستگاه فضایی پیش از تعمیر" loading="lazy" />
            <figcaption>پنل آسیب‌دیده پیش از تعمیر · عکس: ناسا، <a href="https://commons.wikimedia.org/wiki/File:STS120SolarPanel.jpg">آرشیو ویکی‌مدیا</a></figcaption>
          </figure>
          <figure>
            <img src={solarRepair} alt="اسکات پارازینسکی کنار پنل خورشیدی در پیاده‌روی فضایی" loading="lazy" />
            <figcaption>پیاده‌روی فضایی برای تعمیر پنل، ۳ نوامبر ۲۰۰۷ · عکس: ناسا</figcaption>
          </figure>
        </div>
        <div className="memory-stage-nav">
          <button type="button" onClick={() => setChapter('music')}>→ برگشت به آهنگ</button>
          <button type="button" onClick={() => setChapter('intro')}>از اول ورق بزن ↻</button>
          <button className="memory-cta" type="button" data-sound="page" onClick={() => { setGameVisited(true); setChapter('game') }}>{gameVisited ? 'ادامهٔ بازی' : 'بریم سراغ بازی'} ←</button>
        </div>
      </section>}
      {gameVisited && <BirthdayGame soundControl={soundControl} active={chapter === 'game'} onBack={() => setChapter('event')} />}
    </main>
  )
}
