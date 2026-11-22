import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useBirthdayTune } from './useBirthdayTune'
import cat from './assets/goli-cat.png'
import tune from './assets/memories/birthday-tune.mp3'

const questions = [
  { prompt: 'سوشیان چی صدات می‌کنه؟', hint: 'همون اسم خودمونی که با شنیدنش می‌فهمی کار خودشه…', feedback: 'همین اسم وقتی از زبون سوشیان میاد، یه جور دیگه‌ست. ♥' },
  { prompt: 'حدس بزن سوشیان چقدر دوستت داره؟', hint: 'هر عدد یا کلمه‌ای که دلت می‌خواد بنویس.', feedback: 'حدست اشتباه بود! سوشیان به من گفته به اندازهٔ یه گوگول‌پلکس دوستت داره… تازه یکی هم بیشتر! ♥' },
  { prompt: 'اگه الان سوشیان کنارت بود، اول چی بهت می‌گفت؟', hint: 'با لحن خودش حدس بزن!', feedback: 'کاراکتر پیکسلیش یه سرنخ داد: «خوشگل منی.» 😌' },
  { prompt: 'اگه قرار باشه یه قاب تازه به آلبوممون اضافه کنیم، دوست داری کجا بگیریمش؟', hint: 'یه جای واقعی یا خیالی؛ هرچی دلت می‌خواد.', feedback: 'این یکی جواب درست و غلط نداره. شاید همین بشه قصهٔ قاب بعدی‌تون. ✦' },
]

const fa = new Intl.NumberFormat('fa')

export default function BirthdayGame({ active, onBack, soundControl }: { active: boolean; onBack: () => void; soundControl: ReactNode }) {
  const [mode, setMode] = useState<'invite' | 'quiz' | 'done' | 'gift'>('invite')
  const [draft, setDraft] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [index, setIndex] = useState(0)
  const title = useRef<HTMLHeadingElement>(null)
  const question = questions[index]
  const music = useBirthdayTune(active && mode === 'gift')

  useEffect(() => {
    if (!active) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    title.current?.focus({ preventScroll: true })
  }, [active, index, mode])

  function start() {
    setDraft('')
    setSubmitted(false)
    setIndex(0)
    setMode('quiz')
  }

  return (
    <section hidden={!active} className={`birthday-game${mode === 'gift' ? ' birthday-finale' : ''}`} aria-labelledby="game-title">
      <div className="game-panel">
        {mode !== 'gift' && <header className="game-header"><span>✦ فصل بعد · بازی</span>{soundControl}<button type="button" onClick={onBack}>→ برگشت به خاطرات</button></header>}
        {mode === 'invite' && <div className="game-welcome">
          <img src={cat} alt="" />
          <p className="game-kicker">چهار سؤال دربارهٔ شما دوتا</p>
          <h1 id="game-title" ref={title} tabIndex={-1}>آماده‌ای بازی کنیم؟</h1>
          <p>این‌بار سؤال‌ها دربارهٔ تو و سوشیانه. جواب‌ها رو با لحن خودت بنویس؛ خبری از تایمر و نمره نیست!</p>
          <button type="button" className="game-primary" onClick={start}>بزن بریم ←</button>
        </div>}
        {mode === 'quiz' && <div className="game-quiz">
          <p className="game-kicker">سؤال {fa.format(index + 1)} از {fa.format(questions.length)}</p>
          <progress max={questions.length} value={index + Number(submitted)} aria-label="پیشرفت بازی" />
          <h1 id="game-title" ref={title} tabIndex={-1}>{question.prompt}</h1>
          <form className="game-answer" onSubmit={(event) => {
            event.preventDefault()
            if (draft.trim() && !submitted) setSubmitted(true)
          }}>
            <label htmlFor="birthday-answer">{question.hint}</label>
            <input id="birthday-answer" dir="auto" autoComplete="off" enterKeyHint="done" value={draft} onChange={(event) => setDraft(event.target.value)} readOnly={submitted} maxLength={240} placeholder="جوابت رو اینجا بنویس…" />
            {!submitted && <button className="game-primary" type="submit" data-sound="sparkle" disabled={!draft.trim()}>ثبت جواب ✦</button>}
          </form>
          <p className={`game-feedback${submitted ? ' has-answer' : ''}`} aria-live="polite">{submitted && question.feedback}</p>
          {submitted && index === 1 && <details className="game-number-guide">
            <summary>یه گوگول‌پلکس یعنی چقدر؟ ✨</summary>
            <p>اول «گوگول»: یه ۱ که بعدش ۱۰۰ تا صفر میاد. حالا «گوگول‌پلکس»: یه ۱ که بعدش به تعدادِ یه گوگول صفر میاد! یعنی نه فقط صد تا صفر؛ تعداد صفرها خودش یه عدد ۱۰۱ رقمیه.</p>
            <p>بزرگ‌ترین عدد وجود نداره؛ به هر عددی که فکر کنی، می‌شه یکی اضافه کرد. سوشیان هم همین کارو کرد. ♥</p>
          </details>}
          {submitted && <button className="game-primary" type="button" onClick={() => {
            if (index === questions.length - 1) setMode('done')
            else {
              setDraft('')
              setSubmitted(false)
              setIndex(index + 1)
            }
          }}>{index === questions.length - 1 ? 'پایان بازی ✦' : 'سؤال بعدی ←'}</button>}
        </div>}
        {mode === 'done' && <div className="game-welcome">
          <img src={cat} alt="" />
          <p className="game-kicker">بازی تموم شد ✦</p>
          <h1 id="game-title" ref={title} tabIndex={-1}>این بازی برنده‌ش معلوم بود: تو ♥</h1>
          <p>مرسی که دفتر خاطرات رو تا آخر با من ورق زدی. ♥</p>
          <button className="game-primary" type="button" data-sound="sparkle" onClick={() => {
            setMode('gift')
            music.start(true)
          }}>بخاطر جوابای درستت توی بازی، وقتشه کادو تولدتو بگیری 🎁</button>
        </div>}
        {mode === 'gift' && <div className="game-welcome gift-content">
          <div className="gift-stage" aria-hidden="true">
            <span className="gift-spark">✦</span><span className="gift-icon">🎁</span><span className="gift-spark">♥</span>
          </div>
          <p className="game-kicker">از طرف سوشیان، برای تو ♥</p>
          <h1 id="game-title" ref={title} tabIndex={-1}>تولدت مبارک!</h1>
          <audio ref={music.audio} src={tune} preload="auto" loop hidden />
          <div className="gift-tune">
            <button type="button" data-silent onClick={music.toggle} aria-pressed={music.status === 'playing'}>
              <span className="gift-tune-ring" aria-hidden="true">{music.status === 'playing' ? '♫' : '♪'}</span>
              {music.status === 'playing' ? 'مکث آهنگ تولد' : 'پخش آهنگ تولد'}
            </button>
            {music.status === 'blocked' && <p role="status">پخش خودکار شروع نشد؛ یه بار روی دکمه بزن.</p>}
          </div>
          <div className="gift-letter">
            <p>الان که این متنو می‌خونی یه مدت از تولدت گذشته، ببخش که یه‌کم دیر شد — و شاید مثل خیلیای دیگه کادو تولدت یه چیز گرون یا فیزیکی نیست.</p>
            <p>زیاد طولش نمی‌دم؛ یادته خیلی وقت پیش به شوخی وصیت‌نامه نوشتیم و به هم نشونش دادیم؟ اون وصیت‌نامه می‌دونست که قراره جزوی از زندگی من بشی. همو از نزدیک ندیدیم یا همو تا حالا بغل نکردیم، ولی اگه بعد از سال‌ها دوباره به هم پیام بدیم، دوباره مثل همیشه صمیمی خواهیم بود.</p>
            <p>خوشحالم که این کادو واسه تو ساخته شد و قراره ذوق و خوشحال بودن تو رو سبب بشه.</p>
            <p>تولدت مبارک گلی من؛ واست آرزوی بهترین‌ها رو دارم و امیدوارم توی اون بخش از زندگیت که من توش نقش ندارم و بخش شخصی زندگیته، تو بهترین و موفق‌ترین حالتت باشی. اون بخشیم که به من مربوطه و من الان توشم، با منه و باهم اونو تو بهترین حالت می‌بریم. ♥</p>
          </div>
        </div>}
      </div>
    </section>
  )
}
