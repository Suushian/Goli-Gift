import experience from './assets/memories/experience.m4a'
import { useBackgroundMusic } from './useBackgroundMusic'
import SiteCompanion from './SiteCompanion'
import { lazy, Suspense, useEffect, useState } from 'react'
import catImage from './assets/goli-cat.png'

const loadMemories = () => import('./Memories')
const Memories = lazy(loadMemories)

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

function normalizeCode(value: string) {
  const normalized = value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String(digit.charCodeAt(0) - (digit >= '۰' ? 0x06f0 : 0x0660)),
  )
  return normalized.replace(/[^0-9]/g, '').slice(0, 4)
}

function PixelCat() {
  return (
    <div className="cat-stage">
      <img className="cat-image" src={catImage} alt="بچه‌گربهٔ پیکسلی با پاپیون صورتی" />
    </div>
  )
}

const memoriesHash = '#/memories'
const progressKey = 'goli-gift:memories-unlocked'

function readProgress() {
  try { return sessionStorage.getItem(progressKey) === 'yes' } catch { return false }
}

function App() {
  const [unlocked, setUnlocked] = useState(readProgress)
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', syncHash)
    return () => window.removeEventListener('hashchange', syncHash)
  }, [])

  useEffect(() => {
    if (!unlocked && hash === memoriesHash) {
      window.history.replaceState(null, '', '#/')
      setHash('#/')
    }
  }, [hash, unlocked])

  const inMemories = unlocked && hash === memoriesHash
  const background = useBackgroundMusic(inMemories)

  return <>
    <audio ref={background.audio} src={experience} preload="metadata" loop hidden />
    {inMemories ? (
      <Suspense fallback={<main className="page-shell"><p className="page-note" role="status">دارم دفتر خاطرات رو باز می‌کنم…</p></main>}>
        <Memories onMusicStage={background.fadeOut} onFavoritePlay={background.stop}
          showBackgroundPlay={background.status === 'idle' || background.status === 'retry'}
          onBackgroundPlay={background.start} />
      </Suspense>
    ) : <>
      <Entry onIntent={background.warm} onUnlock={() => {
        background.start()
        try { sessionStorage.setItem(progressKey, 'yes') } catch { /* In-memory progress still works. */ }
        setUnlocked(true)
        window.location.hash = memoriesHash
        setHash(memoriesHash)
      }} />
      <SiteCompanion compact />
    </>}
  </>
}

function Entry({ onUnlock, onIntent }: { onUnlock: () => void; onIntent: () => void }) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error'>('idle')

  const expectedYear = import.meta.env.VITE_BIRTH_YEAR ?? '2007'
  const configured = /^[0-9]{4}$/.test(expectedYear)

  function updateCode(value: string) {
    setCode(normalizeCode(value))
    setMessage('')
    setStatus('idle')
  }

  function submit() {
    if (code.length !== 4) {
      setStatus('error')
      setMessage('رمز ورود باید چهار رقم باشد.')
      return
    }

    if (!configured) return

    if (code === expectedYear) {
      onUnlock()
    } else {
      setStatus('error')
      setMessage('اوه! این رمز درست نیست. دوباره امتحان کن.')
      setCode('')
    }
  }

  return (
    <main className="page-shell" dir="rtl">

      <section className="login-card" aria-labelledby="welcome-title">
        <div className="card-top-line" />
        <PixelCat />

        <div className="intro-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> یه چیز قشنگ منتظرته</span>
          <h1 id="welcome-title">سلام خوشگلم!</h1>
          <p>برای باز کردن درِ سورپرایزت، رمز رو وارد کن.</p>
        </div>

        <form className="entry-form" onFocus={onIntent} onPointerDown={onIntent} onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}>
          <div className="password-area">
            <div className="password-label-row">
              <label htmlFor="passcode">رمز ورود</label>
              <span className="digit-hint">۴ رقم</span>
            </div>
            <div className={`passcode-display ${status === 'error' ? 'has-error' : ''}`} dir="ltr">
              <input
                id="passcode"
                className="passcode-input"
                type="password"
                value={code}
                onChange={(event) => updateCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') updateCode('')
                }}
                inputMode="numeric"
                autoComplete="off"
                aria-describedby="passcode-hint passcode-feedback"
                aria-invalid={status === 'error'}
              />
              {[0, 1, 2, 3].map((index) => (
                <span
                  className={`digit-slot ${code[index] ? 'filled' : ''} ${index === code.length ? 'active' : ''}`}
                  key={index}
                  aria-hidden="true"
                >
                  {code[index] ? <span className="digit-mask">●</span> : <span className="digit-placeholder">✳</span>}
                </span>
              ))}
            </div>
            <p className="password-hint" id="passcode-hint"><span className="hint-icon">♥</span> راهنمایی: رمز ورود، سال به دنیا اومدنتـه</p>
          </div>

          <div className="keypad" aria-label="صفحه کلید اعداد">
            {keys.map((key) => (
              <button
                key={key}
                type="button"
                className={`key-button ${key === 'clear' ? 'utility-key' : ''} ${key === 'back' ? 'utility-key back-key' : ''}`}
                onClick={() => {
                  updateCode(key === 'clear' ? '' : key === 'back' ? code.slice(0, -1) : code + key)
                }}
                aria-label={key === 'clear' ? 'پاک کردن' : key === 'back' ? 'حذف رقم آخر' : key}
                disabled={key !== 'clear' && key !== 'back' && code.length >= 4}
              >
                {key === 'clear' ? 'پاک' : key === 'back' ? '⌫' : key}
              </button>
            ))}
          </div>

          <button className="submit-button" type="submit" disabled={!configured}>
            <span>ورود به سورپرایز</span>
            <span className="button-arrow">←</span>
          </button>
          <p id="passcode-feedback" className={`feedback ${configured ? status : 'error'}`} aria-live="polite">
            {configured ? message || ' ' : 'ورود هنوز فعال نشده است؛ سال تولد باید در تنظیمات پروژه ثبت شود.'}
          </p>
        </form>
        <div className="card-footer"><span>ساخته شده با کلی عشق</span><span className="footer-heart">♥</span></div>
      </section>

      <p className="page-note">یک دنیای کوچولو، فقط برای تو <span>✦</span></p>
    </main>
  )
}

export default App
