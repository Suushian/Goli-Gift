import { useCallback, useEffect, useState } from 'react'
import catImage from './assets/goli-cat.png'

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back']

function PixelCat() {
  return (
    <div className="cat-stage">
      <img className="cat-image" src={catImage} alt="گربه‌ی پیکسلی در حال استراحت" />
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