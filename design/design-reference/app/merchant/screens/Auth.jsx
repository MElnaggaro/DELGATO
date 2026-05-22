// app/merchant/screens/Auth.jsx — Splash, Login, OTP, ForgotPassword
const { useState: useStMAU, useEffect: useEfMAU, useRef: useRfMAU } = React;

// ── Splash ────────────────────────────────────────────────────────
function SplashScreen() {
  const nav = useNav();
  useEfMAU(() => {
    const t = setTimeout(() => nav.replace('login'), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="dl-screen" style={{ background: 'var(--olive)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
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
            MERCHANT
          </div>
          <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.5)', marginTop: 6, fontFamily: 'var(--font-arabic)' }}>
            تطبيق التجار
          </div>
        </div>
      </div>
      <div style={{ padding: '0 0 36px', textAlign: 'center', color: 'rgba(250,248,243,0.45)', fontSize: 11 }}>
        لإدارة محلك بسرعة وسهولة
      </div>
    </div>
  );
}

// ── Login (phone + password) ─────────────────────────────────────
function LoginScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [phone, setPhone] = useStMAU('');
  const [pw, setPw] = useStMAU('');
  const [show, setShow] = useStMAU(false);
  const [loading, setLoading] = useStMAU(false);
  const [remember, setRemember] = useStMAU(true);
  const valid = phone.length >= 10 && pw.length >= 4;

  const onLogin = () => {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // demo: phone "0000000000" sends to OTP, anything else logs in directly
      if (phone.startsWith('0000')) {
        nav.push('otp');
      } else {
        m.setAuthed(true);
        nav.reset('dashboard');
      }
    }, 700);
  };

  return (
    <div className="dl-screen">
      <div className="dl-scroll" style={{ padding: '32px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        {/* Logo + brand */}
        <div className="dl-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, background: 'var(--olive)',
            borderRadius: '22%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--canvas)', fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 32 }}>د</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>دلنجاتُو</div>
            <div style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.18em',
              fontSize: 10, color: 'var(--olive)', marginTop: 4 }}>MERCHANT · للتجار</div>
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '100ms' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>
            أهلاً برجوعك
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            دخّل رقم تليفون المحل وكلمة السر علشان تدير طلباتك.
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '220ms', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
              رقم تليفون المحل
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '14px 14px', background: 'var(--canvas-200)', borderRadius: 12,
                minHeight: 56, fontFamily: 'var(--font-arabic)', fontWeight: 600, color: 'var(--ink)',
              }}>
                <span style={{ fontSize: 18 }}>🇪🇬</span>
                <span style={{ fontSize: 15 }} className="mono">+٢٠</span>
              </div>
              <input dir="ltr" className="dl-input dl-input--lg"
                placeholder="١٠ ١٢٣ ٤٥٦ ٧٨" inputMode="numeric"
                value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9٠-٩]/g, ''))}
                style={{ flex: 1, textAlign: 'left' }} autoFocus/>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
              كلمة السر
            </div>
            <div style={{ position: 'relative' }}>
              <input className="dl-input dl-input--lg" type={show ? 'text' : 'password'}
                value={pw} onChange={e => setPw(e.target.value)}
                style={{ paddingInlineEnd: 48 }}/>
              <button onClick={() => setShow(!show)}
                style={{ position: 'absolute', insetInlineEnd: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 0, color: 'var(--ink-light)', cursor: 'pointer', padding: 8 }}>
                {show ? <Icon.x size={18}/> : <Icon.search size={18}/>}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button onClick={() => setRemember(!remember)}
              style={{ all:'unset', cursor:'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                width: 18, height: 18, borderRadius: 6, border: '1.5px solid',
                borderColor: remember ? 'var(--olive)' : 'var(--canvas-300)',
                background: remember ? 'var(--olive)' : '#fff',
                color: 'var(--canvas)',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {remember && <Icon.check size={12}/>}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink)' }}>افتكرني</span>
            </button>
            <button onClick={() => nav.push('forgotPassword')}
              style={{ all:'unset', cursor:'pointer', fontSize: 13, color: 'var(--olive)', fontWeight: 600 }}>
              نسيت كلمة السر؟
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 24 }}/>

        <Button variant="primary" size="lg" full disabled={!valid || loading} onClick={onLogin}>
          {loading ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={18}/></span> : 'دخول للوحة القيادة'}
        </Button>

        <div style={{ marginTop: 18, padding: '12px 14px', background: 'var(--canvas-200)', borderRadius: 10,
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10 }}>
          <Icon.info size={14}/>
          <span>محلك مش مسجل لسة؟ <span style={{ color: 'var(--olive)', fontWeight: 700 }}>كلمنا</span> علشان نضمك لدلنجاتُو.</span>
        </div>
      </div>
    </div>
  );
}

// ── OTP (extra verification step) ────────────────────────────────
function OTPScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [code, setCode] = useStMAU('');
  const [error, setError] = useStMAU(false);
  const [counter, setCounter] = useStMAU(30);
  useEfMAU(() => {
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
        setTimeout(() => {
          if (next === '123456') { setError(true); setCode(''); }
          else { m.setAuthed(true); nav.reset('dashboard'); }
        }, 280);
      }
    }
  };

  const cells = Array.from({ length: 6 }, (_, i) => code[i] || '');
  const activeIdx = code.length;

  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title=""/>
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="dl-fade-up">
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>تأكيد إضافي</div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            بعتنالك كود من ٦ أرقام على واتساب رقم تليفون المحل. دخّله علشان نأكد إنك المالك.
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
                  اعادة إرسال
                </button>}
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        <Keypad onKey={press}/>
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

// ── Forgot Password ──────────────────────────────────────────────
function ForgotPasswordScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [phone, setPhone] = useStMAU('');
  const [loading, setLoading] = useStMAU(false);
  const [submitted, setSubmitted] = useStMAU(false);
  const valid = phone.length >= 10;

  if (submitted) {
    return (
      <div className="dl-screen">
        <AppBar onBack={() => nav.pop()} title=""/>
        <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
          <div className="dl-success-ring">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path className="dl-check-path" d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div className="dl-fade-up" style={{ animationDelay: '380ms', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>بعتنالك الرابط</div>
            <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
              رابط إعادة الضبط راح على واتساب رقم <span className="mono" dir="ltr">+20 {phone}</span>. افتحه في خلال ١٠ دقايق.
            </div>
          </div>
          <div className="dl-fade-up" style={{ animationDelay: '560ms', width: '100%' }}>
            <Button variant="primary" full size="lg" onClick={() => nav.reset('login')}>تمام · ارجع لتسجيل الدخول</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title=""/>
      <div className="dl-scroll" style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ marginTop: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>
            نسيت كلمة السر؟
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            هنبعتلك رابط على واتساب علشان تعيّن كلمة سر جديدة.
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.03em' }}>
            رقم تليفون المحل
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '14px 14px', background: 'var(--canvas-200)', borderRadius: 12,
              minHeight: 56, fontFamily: 'var(--font-arabic)', fontWeight: 600, color: 'var(--ink)',
            }}>
              <span style={{ fontSize: 18 }}>🇪🇬</span>
              <span style={{ fontSize: 15 }} className="mono">+٢٠</span>
            </div>
            <input dir="ltr" className="dl-input dl-input--lg" autoFocus
              placeholder="١٠ ١٢٣ ٤٥٦ ٧٨" inputMode="numeric"
              value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9٠-٩]/g, ''))}
              style={{ flex: 1, textAlign: 'left' }}/>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
            استخدم نفس الرقم اللي سجّلت بيه المحل في دلنجاتُو.
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 24 }}/>

        <Button variant="primary" size="lg" full disabled={!valid || loading}
          onClick={() => { setLoading(true); setTimeout(() => setSubmitted(true), 800); }}>
          {loading ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={18}/></span> : 'ابعت رابط إعادة الضبط'}
        </Button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => m.showToast('احنا جاهزين نساعدك', <Icon.message size={16}/>)}
            style={{ all:'unset', cursor:'pointer', fontSize: 13, color: 'var(--ink-light)' }}>
            مش معاك الرقم؟ <span style={{ color: 'var(--olive)', fontWeight: 600 }}>كلمنا على الدعم</span>
          </button>
        </div>
      </div>
    </div>
  );
}

registerScreen('splash', SplashScreen);
registerScreen('login', LoginScreen);
registerScreen('otp', OTPScreen);
registerScreen('forgotPassword', ForgotPasswordScreen);
