// screens/Onboarding.jsx — Splash, Onboarding carousel, Auth, OTP, Location, Address
const { useState: useStateOb, useEffect: useEffectOb, useRef: useRefOb } = React;

// ── Splash ────────────────────────────────────────────────────────
function SplashScreen() {
  const nav = useNav();
  useEffectOb(() => {
    const t = setTimeout(() => nav.replace('onboarding'), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="dl-screen" style={{ background: 'var(--olive)' }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 20,
      }}>
        <div className="dl-logo-in" style={{
          width: 96, height: 96, background: 'var(--canvas)',
          borderRadius: '22%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--olive)', fontFamily: 'var(--font-arabic)', fontWeight: 700,
          fontSize: 64, lineHeight: 1, boxShadow: '0 12px 32px rgba(0,0,0,0.32)',
        }}>د</div>
        <div className="dl-fade-up" style={{ animationDelay: '420ms', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 32, color: 'var(--canvas)', lineHeight: 1.1 }}>
            دلنجاتُو
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'rgba(250,248,243,0.6)', letterSpacing: '0.24em' }}>
            DELNGATO
          </div>
        </div>
      </div>
      <div style={{ padding: '0 0 36px', textAlign: 'center', color: 'rgba(250,248,243,0.5)', fontSize: 11 }}>
        من الدلنجات · لأهل الدلنجات
      </div>
    </div>
  );
}

// ── Onboarding (3-slide carousel) ─────────────────────────────────
const ONB_SLIDES = [
  { letter: 'د', title: 'محلات الدلنجات\nفي جيبك',
    sub: 'بقالة، صيدلية، أكل، حلويات — كلها من المحلات اللي حواليك.',
    bg: 'linear-gradient(135deg,#1F4A3D 0%,#173629 100%)', icon: 'store' },
  { letter: 'ل', title: 'اطلب بدون مكالمة',
    sub: 'تتبع طلبك لحد ما يوصلك — بدقيقة بالظبط.',
    bg: 'linear-gradient(135deg,#2C5C4B 0%,#1F4A3D 100%)', icon: 'bike' },
  { letter: 'ن', title: 'كاش أو من الأبلكيشن',
    sub: 'اختار اللي يريحك. بدون رسوم خفية، بدون مفاجآت.',
    bg: 'linear-gradient(135deg,#3C6B4F 0%,#234731 100%)', icon: 'wallet' },
];

function OnboardingCarousel() {
  const nav = useNav();
  const [i, setI] = useStateOb(0);
  const slide = ONB_SLIDES[i];
  return (
    <div className="dl-screen" style={{ padding: 0 }}>
      {/* Big hero panel — full bleed at top */}
      <div key={i} className="dl-rise" style={{
        flex: '0 0 56%', minHeight: 0, background: slide.bg, color: 'var(--canvas)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '76px 28px 28px',
      }}>
        {/* Skip */}
        <button onClick={() => nav.replace('welcome')}
          style={{ position:'absolute', top: 74, insetInlineStart: 24, background: 'transparent', border: 0,
                   color: 'rgba(250,248,243,0.8)', fontFamily: 'var(--font-arabic)', fontSize: 14, fontWeight: 500, cursor:'pointer' }}>
          تخطي
        </button>
        {/* Decorative letter */}
        <div key={'letter-'+i} className="dl-pop" style={{
          position: 'absolute', insetInlineEnd: -30, top: 60,
          fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 320,
          color: 'rgba(250,248,243,0.08)', lineHeight: 0.85, userSelect: 'none',
        }}>{slide.letter}</div>
        {/* Sparkle / decorative icon */}
        <div style={{
          position:'absolute', insetInlineEnd: 36, top: 110,
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(250,248,243,0.12)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--canvas)',
        }}>
          {slide.icon === 'store' && <Icon.store size={28}/>}
          {slide.icon === 'bike' && <Icon.bike size={28}/>}
          {slide.icon === 'wallet' && <Icon.wallet size={28}/>}
        </div>
      </div>

      {/* Lower content */}
      <div style={{
        flex: 1, padding: '28px 28px 24px', background: 'var(--canvas)',
        display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'space-between',
      }}>
        <div key={'txt-'+i} className="dl-fade-up">
          <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 28, color: 'var(--ink)', lineHeight: 1.2, whiteSpace: 'pre-line' }}>
            {slide.title}
          </div>
          <div style={{ fontSize: 15, color: 'var(--ink-light)', marginTop: 10, lineHeight: 1.55 }}>
            {slide.sub}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {ONB_SLIDES.map((_, k) => (
              <span key={k} onClick={() => setI(k)} style={{
                width: k === i ? 24 : 8, height: 8, borderRadius: 100,
                background: k === i ? 'var(--olive)' : 'var(--canvas-300)',
                cursor: 'pointer', transition: 'all 240ms var(--ease-out)',
              }}/>
            ))}
          </div>
          {/* CTA */}
          <Button variant="primary" size="lg" full onClick={() => {
            if (i < ONB_SLIDES.length - 1) setI(i + 1);
            else nav.replace('welcome');
          }}>{i < ONB_SLIDES.length - 1 ? 'التالي' : 'يلا نبدأ'}</Button>
          <button onClick={() => nav.replace('auth')}
            style={{ all:'unset', cursor:'pointer', textAlign:'center', fontFamily:'var(--font-arabic)',
                     fontSize: 13, color: 'var(--ink-light)' }}>
            عندي حساب · تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Phone Auth ────────────────────────────────────────────────────
function AuthScreen() {
  const nav = useNav();
  const app = useApp();
  const [phone, setPhone] = useStateOb('');
  const [loading, setLoading] = useStateOb(false);
  const valid = phone.length >= 10;

  const onContinue = () => {
    if (!valid) return;
    setLoading(true);
    app.setPhone(phone);
    setTimeout(() => { setLoading(false); nav.push('otp'); }, 700);
  };

  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title="" />
      <div className="dl-scroll" style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ marginTop: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>
            دخّل رقم تليفونك
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            هنبعتلك كود تحقق على واتساب — بدون كلمة سر، بدون تعقيد.
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 28 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '14px 14px', background: 'var(--canvas-200)', borderRadius: 12,
              minHeight: 56, fontFamily: 'var(--font-arabic)', fontWeight: 600, color: 'var(--ink)',
            }}>
              <span style={{ fontSize: 18 }}>🇪🇬</span>
              <span style={{ fontSize: 15 }} className="mono">+٢٠</span>
            </div>
            <input
              dir="ltr" autoFocus
              className="dl-input dl-input--lg"
              placeholder="١٠ ١٢٣ ٤٥٦ ٧٨"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^0-9٠-٩]/g, ''))}
              style={{ flex: 1, textAlign: 'left', letterSpacing: '0.04em' }}/>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 10, lineHeight: 1.55 }}>
            باستخدامك دلنجاتُو، أنت موافق على <span style={{ color: 'var(--olive)', fontWeight: 600 }}>شروط الاستخدام</span> و<span style={{ color: 'var(--olive)', fontWeight: 600 }}>سياسة الخصوصية</span>.
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        <Button variant="primary" size="lg" full disabled={!valid || loading} onClick={onContinue}>
          {loading ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={18}/></span> : 'متابعة'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button onClick={() => nav.push('forgotPassword')}
            style={{ all:'unset', cursor:'pointer', fontSize: 13, color: 'var(--ink-light)' }}>
            مشكلة في الدخول؟ <span style={{ color: 'var(--olive)', fontWeight: 600 }}>نسيت كلمة السر</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── OTP ──────────────────────────────────────────────────────────
function OTPScreen() {
  const nav = useNav();
  const app = useApp();
  const [code, setCode] = useStateOb('');
  const [error, setError] = useStateOb(false);
  const [counter, setCounter] = useStateOb(30);
  useEffectOb(() => {
    if (counter <= 0) return;
    const t = setTimeout(() => setCounter(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [counter]);

  const press = (k) => {
    setError(false);
    if (k === 'del') setCode(c => c.slice(0, -1));
    else if (code.length < 6) {
      const next = code + k;
      setCode(next);
      if (next.length === 6) {
        // Demo: 6 = ok; "123456" = error
        setTimeout(() => {
          if (next === '123456') { setError(true); setCode(''); }
          else { app.setAuthed(true); nav.replace('locationPerm'); }
        }, 280);
      }
    }
  };

  const cells = Array.from({ length: 6 }, (_, i) => code[i] || '');
  const activeIdx = code.length;

  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title="" />
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="dl-fade-up">
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>
            دخّل الكود
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            بعتنالك كود من ٦ أرقام على <span className="mono" style={{ color: 'var(--ink)', fontWeight: 600 }} dir="ltr">+20 {app.phone}</span>
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 28 }}>
          <div className="dl-otp">
            {cells.map((c, i) => (
              <div key={i} className="dl-otp__cell"
                data-filled={!!c} data-active={i === activeIdx && !error}
                style={{ borderColor: error ? '#C53B2C' : undefined }}>
                {c && <span dir="ltr">{c.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d])}</span>}
              </div>
            ))}
          </div>
          {error && (
            <div className="dl-fade-up" style={{ marginTop: 14, fontSize: 13, color: '#A1271C', textAlign: 'center' }}>
              الكود غلط. جرب تاني.
            </div>
          )}
          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--ink-light)' }}>
            {counter > 0
              ? <>اعادة إرسال الكود بعد <span className="mono" style={{ color: 'var(--ink)', fontWeight: 600 }}>{counter.toLocaleString('ar-EG')} ث</span></>
              : <button onClick={() => setCounter(30)} style={{ all:'unset', cursor:'pointer', color: 'var(--olive)', fontWeight: 600 }}>
                  اعادة إرسال الكود
                </button>}
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* Keypad */}
        <Keypad onKey={press} />
      </div>
    </div>
  );
}

function Keypad({ onKey }) {
  const keys = ['1','2','3','4','5','6','7','8','9'];
  return (
    <div className="dl-keypad">
      {keys.map(k => (
        <button key={k} className="dl-keypad__key" onClick={() => onKey(k)}>
          {k.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d])}
        </button>
      ))}
      <button className="dl-keypad__key dl-keypad__key--clear" disabled style={{ visibility:'hidden' }}/>
      <button className="dl-keypad__key" onClick={() => onKey('0')}>٠</button>
      <button className="dl-keypad__key dl-keypad__key--clear" onClick={() => onKey('del')}>
        <span style={{ display:'inline-flex', verticalAlign:'middle', color: 'var(--ink-light)' }}>
          <Icon.x size={20}/>
        </span>
      </button>
    </div>
  );
}

// ── Location permission ──────────────────────────────────────────
function LocationPermScreen() {
  const nav = useNav();
  const onAllow = () => nav.replace('addressSetup');
  const onManual = () => nav.replace('addressSetup', { manual: true });
  return (
    <div className="dl-screen">
      <div style={{ flex: 1, padding: '32px 28px 28px', display: 'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 24 }}>
          {/* Map visual */}
          <div style={{
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #F4EFE0 0%, #E8E2D2 70%, #DDD4BE 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', marginBottom: 28,
          }}>
            <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
              <g stroke="#FAF8F3" strokeWidth="10" fill="none">
                <path d="M-10 70 L 210 90"/>
                <path d="M-10 140 L 210 130"/>
                <path d="M 80 -10 L 70 210"/>
                <path d="M 140 -10 L 150 210"/>
              </g>
            </svg>
            <div className="dl-pop" style={{ position: 'relative', width: 56, height: 56, borderRadius: 100,
              background: 'var(--olive)', color: 'var(--canvas)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 6px rgba(31,74,61,0.14), 0 0 0 14px rgba(31,74,61,0.06)' }}>
              <Icon.pin size={28}/>
            </div>
          </div>

          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>
            فين بنوصلك؟
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55, maxWidth: 300 }}>
            خلينا نعرف مكانك علشان نوصلك أقرب محلات الدلنجات بأسرع وقت.
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" size="lg" full onClick={onAllow}
            leading={<Icon.navigation size={18}/>}>
            استخدم مكاني دلوقتي
          </Button>
          <Button variant="ghost" size="lg" full onClick={onManual}>
            أكتب العنوان يدوياً
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Address Setup (map confirmation) ──────────────────────────────
function AddressSetupScreen({ manual }) {
  const nav = useNav();
  const app = useApp();
  const [step, setStep] = useStateOb(manual ? 1 : 0); // 0 detecting, 1 confirm
  const [label, setLabel] = useStateOb('البيت');
  const [building, setBuilding] = useStateOb('');
  useEffectOb(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 1400);
      return () => clearTimeout(t);
    }
  }, [step]);

  if (step === 0) {
    return (
      <div className="dl-screen">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 100, background: 'rgba(31,74,61,0.08)',
            color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.navigation size={28}/></span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>بنحدد مكانك دلوقتي…</div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)' }}>بياخد ثانيتين بس.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dl-screen">
      <AppBar title="تأكيد العنوان" onBack={() => nav.pop()} />
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Map placeholder */}
        <div onClick={() => nav.push('mapPin')} className="dl-tappable"
          style={{ height: 220, borderRadius: 14, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(120deg, #E8E2D2 0%, #DDD4BE 100%)',
          border: '1px solid var(--canvas-300)', cursor: 'pointer' }}>
          <svg viewBox="0 0 360 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <g stroke="#FAF8F3" strokeWidth="14" fill="none" opacity="0.9">
              <path d="M -10 50 L 380 80"/>
              <path d="M -10 160 L 380 150"/>
              <path d="M 120 -10 L 90 230"/>
              <path d="M 260 -10 L 290 230"/>
            </g>
          </svg>
          {/* Center pin */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div className="dl-pop" style={{ width: 44, height: 44, borderRadius: 100, background: 'var(--olive)',
              color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow: '0 0 0 6px rgba(31,74,61,0.16), 0 8px 14px rgba(15,26,23,0.18)' }}>
              <Icon.pin size={22}/>
            </div>
          </div>
          <div style={{ position: 'absolute', insetInlineEnd: 12, bottom: 12,
            background: 'rgba(15,26,23,0.7)', backdropFilter: 'blur(10px)', color: 'var(--canvas)',
            borderRadius: 100, padding: '6px 12px', fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.navigation size={12}/> اضغط للتعديل
          </div>
        </div>

        {/* Detected address card */}
        <div className="dl-card" style={{ padding: 14, marginTop: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
            color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.pin size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>شارع الجلاء</div>
            <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>بجوار صيدلية مصر · الدلنجات</div>
          </div>
        </div>

        {/* Form */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>اسم المكان</div>
            <div style={{ display: 'flex', gap: 8, flexWrap:'wrap' }}>
              {[
                { k:'البيت', icon: <Icon.home size={16}/> },
                { k:'الشغل', icon: <Icon.store size={16}/> },
                { k:'تاني', icon: <Icon.pin size={16}/> },
              ].map(o => (
                <button key={o.k} onClick={() => setLabel(o.k)}
                  className={`dl-chip ${label === o.k ? 'dl-chip--active' : ''}`}>
                  {o.icon}{o.k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>تفاصيل إضافية</div>
            <input className="dl-input" placeholder="رقم العمارة، الدور، الشقة…"
              value={building} onChange={e => setBuilding(e.target.value)}/>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" full size="lg" onClick={() => {
          app.setAddresses(prev => [
            { id: 'a-new', label, icon: 'home', street: 'شارع الجلاء', detail: building || 'بجوار صيدلية مصر · الدلنجات', selected: true },
            ...prev.map(a => ({ ...a, selected: false })),
          ]);
          app.setSelectedAddress({ label, street: 'شارع الجلاء', detail: building || 'بجوار صيدلية مصر · الدلنجات' });
          window.__delngato_resetToHome?.();
        }}>
          خلصت — يلا للرئيسية
        </Button>
      </div>
    </div>
  );
}

registerScreen('splash', SplashScreen);
registerScreen('onboarding', OnboardingCarousel);
registerScreen('auth', AuthScreen);
registerScreen('otp', OTPScreen);
registerScreen('locationPerm', LocationPermScreen);
registerScreen('addressSetup', AddressSetupScreen);
