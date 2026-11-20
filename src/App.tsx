import { useCallback, useEffect, useState } from 'react'

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

function PixelCat() {
  return (
    <div className="cat-stage" aria-label="گربه پیکسلی در حال استراحت" role="img">
      <span className="cat-spark spark-one">✦</span>
      <span className="cat-spark spark-two">·</span>
      <svg className="pixel-cat" viewBox="0 0 160 132" shapeRendering="crispEdges" aria-hidden="true">
        <ellipse cx="82" cy="119" rx="49" ry="6" fill="#e9d9d6" opacity=".7" />
        <g>
          <path d="M35 39V15H59V27H101V15H125V39H137V85H125V103H35V85H23V39Z" fill="#493b55" />
          <path d="M41 39V23H53V35H65V29H95V35H107V23H119V39H131V81H119V97H41V81H29V39Z" fill="#f4c7a9" />
          <path d="M47 39V29H53V41H65V35H95V41H107V29H113V39H125V57H113V51H101V57H89V51H77V57H65V51H53V57H41V39Z" fill="#f7d6bd" />
          <path d="M41 63H53V69H41ZM107 63H119V69H107Z" fill="#493b55" />
          <path d="M53 69H65V75H53ZM95 69H107V75H95Z" fill="#493b55" />
          <path d="M77 75H89V81H77Z" fill="#d98d91" />
          <path d="M71 81H77V87H71ZM89 81H95V87H89Z" fill="#493b55" />
          <path d="M47 87H59V93H47ZM101 87H113V93H101Z" fill="#e99e9d" opacity=".85" />
          <path d="M29 45H41V57H29ZM119 45H131V57H119Z" fill="#f7d6bd" />
          <path d="M59 99H101V111H59Z" fill="#f4c7a9" />
          <path d="M47 105H59V111H47ZM101 105H113V111H101Z" fill="#493b55" />
          <path d="M53 111H71V117H53ZM89 111H107V117H89Z" fill="#493b55" />
          <path d="M65 99H95V105H65Z" fill="#fff0e4" />
          <path d="M23 75H35V93H23ZM131 75H143V93H131Z" fill="#493b55" />
          <path d="M17 87H29V99H17ZM137 87H149V99H137Z" fill="#493b55" />
          <path d="M23 93H35V105H23ZM131 93H143V105H131Z" fill="#f4c7a9" />
        </g>
        <path d="M80 91H86V97H80Z" fill="#f08eaa" />
        <path d="M65 45H71V51H65ZM89 45H95V51H89Z" fill="#fff8f2" opacity=".8" />
      </svg>
      <span className="cat-heart">♥</span>
    </div>
  )
}

function App() {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

  const appendDigit = useCallback((digit: string) => {
    setCode((current) => current.length < 4 ? current + digit : current)
    setMessage('')
    setStatus('idle')
  }, [])

  const removeDigit = useCallback(() => {
    setCode((current) => current.slice(0, -1))
    setMessage('')
    setStatus('idle')
  }, [])

  const clearCode = useCallback(() => {
    setCode('')
    setMessage('')
    setStatus('idle')
  }, [])

  const submit = useCallback(() => {
    if (code.length !== 4) {
      setStatus('error')
      setMessage('رمز ورود باید چهار رقم باشد.')
      return
    }

    const expectedYear = import.meta.env.VITE_BIRTH_YEAR
    if (!expectedYear) {
      setStatus('error')
      setMessage('برای فعال شدن ورود، سال تولد باید در تنظیمات پروژه ثبت شود.')
      return
    }

    if (code === expectedYear) {
      setStatus('success')
      setMessage('درست حدس زدی! به‌زودی سورپرایزت شروع می‌شه.')
    } else {
      setStatus('error')
      setMessage('اوه! این رمز درست نیست. دوباره امتحان کن.')
      setCode('')
    }
  }, [code])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (/^[0-9]$/.test(event.key)) appendDigit(event.key)
      else if (event.key === 'Backspace') removeDigit()
      else if (event.key === 'Enter') submit()
      else if (event.key === 'Escape') clearCode()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [appendDigit, clearCode, removeDigit, submit])

  return (
    <main className="page-shell" dir="rtl">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="tiny-star star-a">✳</div>
      <div className="tiny-star star-b">✦</div>
      <div className="tiny-star star-c">✧</div>

      <section className="login-card" aria-labelledby="welcome-title">
        <div className="card-top-line" />
        <PixelCat />

        <div className="intro-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> یه چیز قشنگ منتظرته</span>
          <h1 id="welcome-title">سلام خوشگلم!</h1>
          <p>برای باز کردن درِ سورپرایزت، رمز رو وارد کن.</p>
        </div>

        <div className="password-area">
          <div className="password-label-row">
            <label htmlFor="passcode">رمز ورود</label>
            <span className="digit-hint">۴ رقم</span>
          </div>
          <div className={`passcode-display ${status === 'error' ? 'has-error' : ''}`} dir="ltr">
            <input
              id="passcode"
              className="sr-only"
              value={code}
              onChange={(event) => {
                const next = event.target.value.replace(/\D/g, '').slice(0, 4)
                setCode(next)
                setMessage('')
                setStatus('idle')
              }}
              inputMode="numeric"
              autoComplete="off"
              aria-label="رمز چهار رقمی"
              maxLength={4}
            />
            {[0, 1, 2, 3].map((index) => (
              <button
                className={`digit-slot ${code[index] ? 'filled' : ''} ${index === code.length ? 'active' : ''}`}
                key={index}
                type="button"
                onClick={() => document.getElementById('passcode')?.focus()}
                aria-label={code[index] ? `رقم ${index + 1} وارد شده` : `رقم ${index + 1} خالی`}
              >
                {code[index] ? <span className="digit-mask">●</span> : <span className="digit-placeholder">✳</span>}
              </button>
            ))}
          </div>
          <p className="password-hint"><span className="hint-icon">♥</span> راهنمایی: رمز ورود، سال به دنیا اومدنتـه</p>
        </div>

        <div className="keypad" aria-label="صفحه کلید اعداد">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              className={`key-button ${key === 'clear' ? 'utility-key' : ''} ${key === 'back' ? 'utility-key back-key' : ''}`}
              onClick={() => key === 'clear' ? clearCode() : key === 'back' ? removeDigit() : appendDigit(key)}
              aria-label={key === 'clear' ? 'پاک کردن' : key === 'back' ? 'حذف رقم آخر' : key}
              disabled={key !== 'clear' && key !== 'back' && code.length >= 4}
            >
              {key === 'clear' ? 'پاک' : key === 'back' ? '⌫' : key}
            </button>
          ))}
        </div>

        <button className="submit-button" type="button" onClick={submit}>
          <span>ورود به سورپرایز</span>
          <span className="button-arrow">←</span>
        </button>
        <p className={`feedback ${status}`} aria-live="polite">{message || ' '}</p>
        <div className="card-footer"><span>ساخته شده با کلی عشق</span><span className="footer-heart">♥</span></div>
      </section>

      <p className="page-note">یک دنیای کوچولو، فقط برای تو <span>✦</span></p>
    </main>
  )
}

export default App