// screens/AuthExtras.jsx — Welcome, Register, ForgotPassword, ResetPassword, Biometric
const { useState: useStAE, useEffect: useEfAE, useRef: useRfAE } = React;

// ── Welcome (post-onboarding hub) ────────────────────────────────
function WelcomeScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen" style={{ background: 'var(--olive)' }}>
      <div style={{ flex: 1, padding: '40px 28px 28px', color: 'var(--canvas)',
        display: 'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ marginTop: 12 }}>
          <div style={{
            width: 68, height: 68, background: 'var(--canvas)',
            borderRadius: '22%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--olive)', fontFamily: 'var(--font-arabic)', fontWeight: 700,
            fontSize: 46, lineHeight: 1,
          }}>د</div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 32 }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 34, color: 'var(--canvas)', lineHeight: 1.15 }}>
            أهلاً بيك في<br/>دلنجاتُو
          </div>
          <div style={{ fontSize: 15, color: 'rgba(250,248,243,0.78)', marginTop: 14, lineHeight: 1.6, maxWidth: 280 }}>
            محلات الدلنجات كلها في تطبيق واحد. ابدأ بحساب جديد أو ادخل لو عندك حساب قبل كده.
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        <div className="dl-fade-up" style={{ animationDelay: '320ms', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => nav.push('register')}
            style={{ background: 'var(--canvas)', color: 'var(--olive)',
              border: 0, borderRadius: 12, minHeight: 56, fontFamily: 'var(--font-arabic)',
              fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
            أنشئ حساب جديد
          </button>
          <button onClick={() => nav.push('auth')}
            style={{ background: 'transparent', color: 'var(--canvas)',
              border: '1.5px solid rgba(250,248,243,0.4)', borderRadius: 12, minHeight: 56,
              fontFamily: 'var(--font-arabic)', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
            عندي حساب · تسجيل الدخول
          </button>
          <button onClick={() => nav.push('biometric')}
            style={{ all:'unset', cursor:'pointer', textAlign:'center', marginTop: 6,
              color: 'rgba(250,248,243,0.7)', fontSize: 13, fontFamily: 'var(--font-arabic)' }}>
            دخول سريع بالبصمة
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Register ─────────────────────────────────────────────────────
function RegisterScreen() {
  const nav = useNav();
  const app = useApp();
  const [name, setName] = useStAE('');
  const [phone, setPhone] = useStAE('');
  const [agree, setAgree] = useStAE(true);
  const [loading, setLoading] = useStAE(false);
  const valid = name.length >= 3 && phone.length >= 10 && agree;

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
            حساب جديد
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            خطوتين بس وحسابك جاهز.
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
              الاسم
            </div>
            <input className="dl-input dl-input--lg" placeholder="مثلاً: أحمد محمد"
              value={name} onChange={e => setName(e.target.value)} autoFocus/>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
              رقم التليفون
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
                style={{ flex: 1, textAlign: 'left', letterSpacing: '0.04em' }}/>
            </div>
          </div>

          <button onClick={() => setAgree(!agree)}
            style={{ all:'unset', cursor:'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4 }}>
            <span style={{
              width: 20, height: 20, borderRadius: 6, border: '1.5px solid',
              borderColor: agree ? 'var(--olive)' : 'var(--canvas-300)',
              background: agree ? 'var(--olive)' : '#fff',
              color: 'var(--canvas)', flexShrink: 0,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition: 'all 150ms var(--ease-out)' }}>
              {agree && <Icon.check size={14}/>}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-light)', lineHeight: 1.55 }}>
              موافق على <span style={{ color: 'var(--olive)', fontWeight: 600 }}>شروط الاستخدام</span> و<span style={{ color: 'var(--olive)', fontWeight: 600 }}>سياسة الخصوصية</span> الخاصة بدلنجاتُو.
            </span>
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 32 }}/>

        <Button variant="primary" size="lg" full disabled={!valid || loading} onClick={onContinue}>
          {loading ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={18}/></span> : 'تابع · ابعت كود التحقق'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button onClick={() => nav.replace('auth')} style={{ all:'unset', cursor:'pointer', fontSize: 13, color: 'var(--ink-light)' }}>
            عندي حساب · <span style={{ color: 'var(--olive)', fontWeight: 600 }}>تسجيل الدخول</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Forgot Password ──────────────────────────────────────────────
function ForgotPasswordScreen() {
  const nav = useNav();
  const [method, setMethod] = useStAE('sms');
  const [phone, setPhone] = useStAE('');
  const [loading, setLoading] = useStAE(false);
  const valid = phone.length >= 10;
  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title="" />
      <div className="dl-scroll" style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ marginTop: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>
            نسيت كلمة السر؟
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            مفيش مشكلة — هنبعتلك كود لإعادة الضبط.
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.03em' }}>
            رقم تليفونك
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

          <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.03em' }}>
            ابعتلي الكود على
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { k: 'sms', l: 'رسالة SMS', s: 'سريعة على رقم تليفونك', icon: <Icon.message size={20}/> },
              { k: 'wa', l: 'واتساب', s: 'رسالة على نفس الرقم', icon: <Icon.phone size={20}/> },
            ].map(o => (
              <button key={o.k} onClick={() => setMethod(o.k)}
                style={{ all:'unset', cursor:'pointer',
                  background: '#fff', borderRadius: 12,
                  border: `1.5px solid ${method === o.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center',
                  transition: 'all 150ms var(--ease-out)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10,
                  background: method === o.k ? 'var(--olive)' : 'var(--canvas-200)',
                  color: method === o.k ? 'var(--canvas)' : 'var(--olive)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>{o.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{o.l}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{o.s}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 100,
                  border: `2px solid ${method === o.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {method === o.k && <div style={{ width: 10, height: 10, borderRadius: 100, background: 'var(--olive)' }}/>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 24 }}/>

        <Button variant="primary" size="lg" full disabled={!valid || loading}
          onClick={() => { setLoading(true); setTimeout(() => nav.push('resetPassword'), 700); }}>
          {loading ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={18}/></span> : 'ابعت الكود'}
        </Button>
      </div>
    </div>
  );
}

// ── Reset Password ───────────────────────────────────────────────
function ResetPasswordScreen() {
  const nav = useNav();
  const app = useApp();
  const [pw, setPw] = useStAE('');
  const [pw2, setPw2] = useStAE('');
  const [show, setShow] = useStAE(false);
  const valid = pw.length >= 6 && pw === pw2;
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
  const strLabels = ['', 'ضعيفة', 'متوسطة', 'قوية'];
  const strColors = ['var(--canvas-300)', '#C53B2C', 'var(--gold)', 'var(--olive)'];

  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title="" />
      <div className="dl-scroll" style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ marginTop: 6 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>
            كلمة سر جديدة
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            ٦ حروف على الأقل. اختار كلمة مفيش حد يعرفها.
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
              كلمة السر الجديدة
            </div>
            <div style={{ position: 'relative' }}>
              <input className="dl-input dl-input--lg" type={show ? 'text' : 'password'}
                value={pw} onChange={e => setPw(e.target.value)} autoFocus
                style={{ paddingInlineEnd: 48 }}/>
              <button onClick={() => setShow(!show)}
                style={{ position: 'absolute', insetInlineEnd: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 0, color: 'var(--ink-light)', cursor: 'pointer', padding: 8 }}>
                {show ? <Icon.x size={18}/> : <Icon.search size={18}/>}
              </button>
            </div>
            {/* Strength bar */}
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 100,
                  background: strength >= i ? strColors[strength] : 'var(--canvas-300)',
                  transition: 'all 200ms var(--ease-out)' }}/>
              ))}
            </div>
            {strength > 0 && (
              <div style={{ fontSize: 11, color: strColors[strength], marginTop: 6, fontWeight: 600 }}>
                {strLabels[strength]}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
              تأكيد كلمة السر
            </div>
            <input className="dl-input dl-input--lg" type={show ? 'text' : 'password'}
              value={pw2} onChange={e => setPw2(e.target.value)}/>
            {pw2 && pw !== pw2 && (
              <div style={{ fontSize: 12, color: '#A1271C', marginTop: 6, display:'flex', gap: 6, alignItems:'center' }}>
                <Icon.info size={14}/> كلمتين السر مش متطابقتين.
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 32 }}/>

        <Button variant="primary" size="lg" full disabled={!valid}
          onClick={() => { app.showToast('اتغيرت كلمة السر بنجاح', <Icon.check size={16}/>); nav.reset('auth'); }}>
          حفظ وتسجيل الدخول
        </Button>
      </div>
    </div>
  );
}

// ── Biometric Login ──────────────────────────────────────────────
function BiometricScreen() {
  const nav = useNav();
  const app = useApp();
  const [state, setState] = useStAE('idle'); // idle | scanning | success | fail
  const [attempts, setAttempts] = useStAE(0);

  const onScan = () => {
    setState('scanning');
    setTimeout(() => {
      // Demo: succeed first attempt
      if (attempts === 0) {
        setState('success');
        setTimeout(() => {
          app.setAuthed(true);
          window.__delngato_resetToHome?.();
        }, 700);
      } else {
        setState('fail');
        setTimeout(() => setState('idle'), 1500);
      }
      setAttempts(a => a + 1);
    }, 1400);
  };

  const color = state === 'success' ? 'var(--olive)'
              : state === 'fail' ? '#C53B2C'
              : 'var(--olive)';
  const ringOp = state === 'scanning' ? 1 : state === 'success' ? 1 : 0.5;

  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title=""/>
      <div style={{ flex: 1, padding: '20px 28px 32px', display: 'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>دخول سريع</div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            استخدم بصمة الإصبع أو الوش لدخول حسابك في ثواني.
          </div>
        </div>

        <div style={{ flex: 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <button onClick={onScan} disabled={state === 'scanning' || state === 'success'}
            style={{ all: 'unset', cursor: state === 'idle' || state === 'fail' ? 'pointer' : 'default',
              position: 'relative', width: 200, height: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* concentric rings */}
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                position:'absolute', inset: -i * 20,
                borderRadius: '50%',
                border: '2px solid', borderColor: color,
                opacity: ringOp * (1 - i * 0.3),
                animation: state === 'scanning' ? `dl-pulse 1.6s ${i * 0.2}s infinite` : 'none',
                transition: 'border-color 200ms var(--ease-out)',
              }}/>
            ))}
            <div style={{
              width: 140, height: 140, borderRadius: 100,
              background: color, color: 'var(--canvas)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 200ms var(--ease-out), transform 200ms var(--ease-out)',
              transform: state === 'success' ? 'scale(1.06)' : '',
              boxShadow: '0 12px 32px rgba(31,74,61,0.28)',
            }}>
              {state === 'success' ? (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <path className="dl-check-path" d="M20 6 9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12C2 6.5 6.5 2 12 2c5.5 0 10 4.5 10 10"/>
                  <path d="M5 12a7 7 0 0 1 14 0v3"/>
                  <path d="M8 12a4 4 0 0 1 8 0v4a2 2 0 0 1-2 2"/>
                  <path d="M12 12v5"/>
                </svg>
              )}
            </div>
          </button>
        </div>

        <div className="dl-fade-up" style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: state === 'fail' ? '#A1271C' : 'var(--ink)' }}>
            {state === 'idle' && 'ضع إصبعك على المستشعر'}
            {state === 'scanning' && 'جاري التحقق…'}
            {state === 'success' && 'أهلاً بيك تاني'}
            {state === 'fail' && 'مش هي البصمة. جرب تاني.'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 6 }}>
            {state === 'idle' || state === 'fail' ? 'اضغط على الدائرة علشان تبدأ' : '\u00A0'}
          </div>
        </div>

        <button onClick={() => nav.push('auth')}
          style={{ all:'unset', cursor:'pointer', textAlign:'center',
            color: 'var(--olive)', fontFamily: 'var(--font-arabic)',
            fontSize: 14, fontWeight: 600, padding: 14 }}>
          دخول برقم التليفون بدلاً من ذلك
        </button>
      </div>
    </div>
  );
}

registerScreen('welcome', WelcomeScreen);
registerScreen('register', RegisterScreen);
registerScreen('forgotPassword', ForgotPasswordScreen);
registerScreen('resetPassword', ResetPasswordScreen);
registerScreen('biometric', BiometricScreen);
