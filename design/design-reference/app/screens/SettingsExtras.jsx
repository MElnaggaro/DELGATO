// screens/SettingsExtras.jsx — Privacy, Security, ChangePassword, DeleteAccount, ReportIssue, Language
const { useState: useStSE, useEffect: useEfSE } = React;

// ── Privacy ──────────────────────────────────────────────────────
function PrivacyScreen() {
  const nav = useNav();
  const app = useApp();
  const [p, setP] = useStSE({
    location: true, analytics: true, marketing: false, ads: false, share: false,
  });
  const t = (k) => setP({ ...p, [k]: !p[k] });
  return (
    <div className="dl-screen">
      <AppBar title="الخصوصية" onBack={() => nav.pop()}/>
      <div className="dl-scroll">
        <div style={{ padding: '14px 18px 8px', fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55 }}>
          تحكم في إيه اللي تشاركه مع دلنجاتُو. ساعتك تقدر تغيّر القرار في أي وقت.
        </div>

        <Group title="استخدام بياناتك">
          <PrTog label="مشاركة الموقع" sub="علشان نعرف نوصلك أسرع" v={p.location} onChange={() => t('location')}/>
          <hr className="dl-divider"/>
          <PrTog label="تحليلات الاستخدام" sub="بيساعدنا نحسّن التطبيق" v={p.analytics} onChange={() => t('analytics')}/>
          <hr className="dl-divider"/>
          <PrTog label="رسائل تسويقية" sub="عروض وأخبار محلات جديدة" v={p.marketing} onChange={() => t('marketing')}/>
        </Group>

        <Group title="إعلانات وشركاء">
          <PrTog label="إعلانات مخصصة" sub="مبنية على اهتماماتك" v={p.ads} onChange={() => t('ads')}/>
          <hr className="dl-divider"/>
          <PrTog label="مشاركة البيانات مع المحلات" sub="اسم وعنوان التوصيل بس" v={p.share} onChange={() => t('share')}/>
        </Group>

        <Group title="بياناتك">
          <ListRow icon={<Icon.download size={18}/>} label="حمّل نسخة من بياناتك"
            sub="هنبعتلك ملف على إيميلك خلال ٢٤ ساعة"
            onClick={() => app.showToast('هنبعتلك البيانات على إيميلك', <Icon.check size={16}/>)}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.trash size={18}/>} label="مسح سجل البحث"
            onClick={() => app.showToast('اتمسح سجل البحث', <Icon.check size={16}/>)}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.shieldCheck size={18}/>} label="سياسة الخصوصية الكاملة"
            sub="اقرأ كيف بنحمي بياناتك"
            onClick={() => {}}/>
        </Group>

        <div style={{ height: 28 }}/>
      </div>
    </div>
  );
}

function PrTog({ label, sub, v, onChange }) {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={onChange} role="switch" aria-checked={v}
        style={{ width: 44, height: 26, borderRadius: 100,
          background: v ? 'var(--olive)' : 'var(--canvas-300)',
          border: 0, cursor: 'pointer', position: 'relative',
          transition: 'background 200ms var(--ease-out)' }}>
        <span style={{ position:'absolute', top: 3, insetInlineStart: v ? 21 : 3,
          width: 20, height: 20, borderRadius: 100, background: '#fff',
          transition: 'inset-inline-start 200ms var(--ease-out)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}/>
      </button>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div style={{ padding: '6px 18px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// ── Security ─────────────────────────────────────────────────────
function SecurityScreen() {
  const nav = useNav();
  const [biom, setBiom] = useStSE(true);
  const [twofa, setTwofa] = useStSE(false);
  const [loginAlerts, setLoginAlerts] = useStSE(true);
  const sessions = [
    { id: 's1', device: 'iPhone 14 · iOS 17', loc: 'الدلنجات', current: true, time: 'الجلسة الحالية' },
    { id: 's2', device: 'Chrome · ويندوز', loc: 'الإسكندرية', current: false, time: 'إمبارح · ١:٢٠ م' },
    { id: 's3', device: 'Safari · iPad', loc: 'الدلنجات', current: false, time: 'الأسبوع اللي فات' },
  ];
  return (
    <div className="dl-screen">
      <AppBar title="الأمان" onBack={() => nav.pop()}/>
      <div className="dl-scroll">
        <Group title="حماية الحساب">
          <ListRow icon={<Icon.shieldCheck size={18}/>} label="تغيير كلمة السر"
            onClick={() => nav.push('changePassword')}/>
          <hr className="dl-divider"/>
          <PrTog label="الدخول بالبصمة"
            sub="افتح التطبيق ببصمة الإصبع أو الوش" v={biom} onChange={() => setBiom(!biom)}/>
          <hr className="dl-divider"/>
          <PrTog label="التحقق بخطوتين"
            sub="كود إضافي على واتساب لكل دخول جديد" v={twofa} onChange={() => setTwofa(!twofa)}/>
          <hr className="dl-divider"/>
          <PrTog label="تنبيهات الدخول"
            sub="نبّهني لما حد يدخل من جهاز جديد" v={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)}/>
        </Group>

        <Group title="الأجهزة المسجلة">
          {sessions.map((s, i, a) => (
            <div key={s.id}>
              <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10,
                  background: s.current ? 'var(--olive)' : 'var(--canvas-200)',
                  color: s.current ? 'var(--canvas)' : 'var(--olive)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon.shieldCheck size={18}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{s.device}</div>
                    {s.current && <Badge variant="active">حالي</Badge>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{s.loc} · {s.time}</div>
                </div>
                {!s.current && (
                  <button style={{ all:'unset', cursor:'pointer', color: '#A1271C', fontSize: 12, fontWeight: 600 }}>
                    تسجيل خروج
                  </button>
                )}
              </div>
              {i < a.length - 1 && <hr className="dl-divider"/>}
            </div>
          ))}
        </Group>

        <div style={{ padding: '4px 18px 28px' }}>
          <Button variant="ghost" full style={{ color: '#A1271C' }}
            leading={<Icon.logout size={16}/>}>
            تسجيل خروج من كل الأجهزة
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Change Password ──────────────────────────────────────────────
function ChangePasswordScreen() {
  const nav = useNav();
  const app = useApp();
  const [oldPw, setOldPw] = useStSE('');
  const [pw, setPw] = useStSE('');
  const [pw2, setPw2] = useStSE('');
  const valid = oldPw.length >= 6 && pw.length >= 6 && pw === pw2;
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : 3;
  const strColors = ['var(--canvas-300)', '#C53B2C', 'var(--gold)', 'var(--olive)'];

  return (
    <div className="dl-screen">
      <AppBar title="تغيير كلمة السر" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PwFld label="كلمة السر الحالية">
          <input className="dl-input dl-input--lg" type="password"
            value={oldPw} onChange={e => setOldPw(e.target.value)} autoFocus/>
        </PwFld>
        <button style={{ all:'unset', cursor:'pointer', textAlign:'start', marginTop: -4,
          color: 'var(--olive)', fontSize: 12, fontWeight: 600 }}
          onClick={() => nav.push('forgotPassword')}>
          نسيت كلمة السر الحالية؟
        </button>

        <PwFld label="كلمة سر جديدة">
          <input className="dl-input dl-input--lg" type="password"
            value={pw} onChange={e => setPw(e.target.value)}/>
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 100,
                background: strength >= i ? strColors[strength] : 'var(--canvas-300)',
                transition: 'all 200ms var(--ease-out)' }}/>
            ))}
          </div>
        </PwFld>
        <PwFld label="تأكيد كلمة السر الجديدة">
          <input className="dl-input dl-input--lg" type="password"
            value={pw2} onChange={e => setPw2(e.target.value)}/>
        </PwFld>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!valid}
          onClick={() => { app.showToast('اتغيرت كلمة السر بنجاح', <Icon.check size={16}/>); nav.pop(); }}>
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}

function PwFld({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>{label}</div>
      {children}
    </div>
  );
}

// ── Delete Account ───────────────────────────────────────────────
function DeleteAccountScreen() {
  const nav = useNav();
  const app = useApp();
  const [step, setStep] = useStSE(0); // 0 = warn, 1 = confirm with code
  const [code, setCode] = useStSE('');
  const [reason, setReason] = useStSE('');
  const reasons = ['مش بستخدم التطبيق', 'مفيش محلات قريبة', 'تجربة سيئة', 'مخاوف خصوصية', 'سبب تاني'];

  if (step === 0) {
    return (
      <div className="dl-screen">
        <AppBar title="حذف الحساب" onBack={() => nav.pop()}/>
        <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
          <div className="dl-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', marginTop: 14 }}>
            <div style={{ width: 88, height: 88, borderRadius: 100, background: 'rgba(197,59,44,0.10)',
              color: '#A1271C', display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 18 }}>
              <Icon.trash size={36}/>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>هتمسح حسابك خالص؟</div>
            <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 10, lineHeight: 1.6, maxWidth: 320 }}>
              مفيش رجوع. كل بياناتك، طلباتك، عناوينك، نقاطك، ورصيدك في المحفظة هيتمسحوا بشكل نهائي.
            </div>
          </div>

          <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            هتفقد:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { l: 'رصيد المحفظة', v: `${app.walletBalance.toLocaleString('ar-EG')} ج.م`, icon: <Icon.wallet size={18}/> },
              { l: 'النقاط المتراكمة', v: `${app.points.toLocaleString('ar-EG')} نقطة`, icon: <Icon.sparkle size={18}/> },
              { l: 'تاريخ الطلبات', v: `${app.orders.length.toLocaleString('ar-EG')} طلب`, icon: <Icon.receipt size={18}/> },
              { l: 'العناوين المحفوظة', v: `${app.addresses.length.toLocaleString('ar-EG')} عنوان`, icon: <Icon.pin size={18}/> },
            ].map((row, i) => (
              <div key={i} style={{ background: 'rgba(197,59,44,0.05)', borderRadius: 10, padding: 12,
                display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(197,59,44,0.10)',
                  color: '#A1271C', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {row.icon}
                </div>
                <div style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)' }}>{row.l}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#A1271C' }}>{row.v}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            ساعدنا نتحسن — ليه قررت تمسح؟
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {reasons.map(r => (
              <Chip key={r} active={reason === r} onClick={() => setReason(r)}>{r}</Chip>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)',
          display: 'flex', gap: 10 }}>
          <Button variant="ghost" full onClick={() => nav.pop()}>تراجع</Button>
          <Button variant="primary" full
            style={{ background: '#C53B2C' }}
            onClick={() => setStep(1)}>
            متابعة
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: confirm with code
  return (
    <div className="dl-screen">
      <AppBar title="تأكيد الحذف" onBack={() => setStep(0)}/>
      <div className="dl-scroll" style={{ padding: '20px 24px' }}>
        <div className="dl-fade-up" style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>اكتب "احذف" للتأكيد</div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.55 }}>
            علشان نتأكد إن القرار ده منك.
          </div>
        </div>
        <input className="dl-input dl-input--lg" autoFocus
          placeholder="احذف"
          value={code} onChange={e => setCode(e.target.value)}
          style={{ textAlign: 'center', letterSpacing: '0.06em', fontWeight: 700 }}/>

        {code === 'احذف' && (
          <div className="dl-fade-up" style={{ marginTop: 18, padding: '12px 14px',
            background: 'rgba(31,74,61,0.06)', borderRadius: 10,
            fontSize: 13, color: 'var(--ink)', display:'flex', gap: 10 }}>
            <Icon.check size={16} className=""/>
            <span>اتأكدنا — اضغط على زر الحذف تحت.</span>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={code !== 'احذف'}
          style={{ background: '#C53B2C' }}
          onClick={() => {
            app.showToast('تم حذف حسابك', <Icon.trash size={16}/>);
            window.__delngato_logout?.();
          }}>
          احذف حسابي نهائياً
        </Button>
      </div>
    </div>
  );
}

// ── Report Issue ─────────────────────────────────────────────────
function ReportIssueScreen() {
  const nav = useNav();
  const app = useApp();
  const [cat, setCat] = useStSE('');
  const [body, setBody] = useStSE('');
  const [photos, setPhotos] = useStSE([]);
  const cats = [
    { k: 'app', l: 'مشكلة في التطبيق', icon: <Icon.zap size={20}/> },
    { k: 'order', l: 'مشكلة في طلب', icon: <Icon.receipt size={20}/> },
    { k: 'payment', l: 'مشكلة في الدفع', icon: <Icon.card size={20}/> },
    { k: 'driver', l: 'مشكلة مع الكابتن', icon: <Icon.bike size={20}/> },
    { k: 'shop', l: 'مشكلة مع المحل', icon: <Icon.store size={20}/> },
    { k: 'other', l: 'حاجة تانية', icon: <Icon.info size={20}/> },
  ];

  return (
    <div className="dl-screen">
      <AppBar title="بلّغ عن مشكلة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '4px 18px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          نوع المشكلة
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {cats.map(c => (
            <button key={c.k} onClick={() => setCat(c.k)}
              style={{ all:'unset', cursor:'pointer', padding: 14, borderRadius: 12,
                background: '#fff',
                border: `1.5px solid ${cat === c.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display: 'flex', flexDirection: 'column', gap: 8,
                transition: 'all 150ms var(--ease-out)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10,
                background: cat === c.k ? 'var(--olive)' : 'var(--canvas-200)',
                color: cat === c.k ? 'var(--canvas)' : 'var(--olive)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{c.l}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          فاصلنا — إيه اللي حصل بالظبط؟
        </div>
        <textarea value={body} onChange={e => setBody(e.target.value)}
          placeholder="اكتب المشكلة بالتفصيل علشان نقدر نحلها بسرعة."
          style={{ width:'100%', minHeight: 140, padding: 14, fontFamily:'var(--font-arabic)',
            borderRadius: 12, border: '1.5px solid var(--canvas-300)', background:'#fff',
            resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', lineHeight: 1.55 }}/>

        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          صور <span style={{ fontWeight: 500, color: 'var(--ink-light)' }}>(اختياري)</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <button key={i} onClick={() => setPhotos(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
              style={{ all:'unset', cursor:'pointer', flex: 1, aspectRatio: '1 / 1', borderRadius: 10,
                background: photos.includes(i) ? 'var(--canvas-200)' : '#fff',
                border: '1.5px dashed var(--canvas-300)',
                display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--ink-light)' }}>
              {photos.includes(i)
                ? <Icon.check size={20} className=""/>
                : <Icon.plus size={20}/>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!cat || body.length < 10}
          onClick={() => { app.showToast('وصلنا بلاغك. هنرد عليك خلال ساعة', <Icon.check size={16}/>); nav.pop(); }}>
          إرسال البلاغ
        </Button>
      </div>
    </div>
  );
}

// ── Language picker ──────────────────────────────────────────────
function LanguageScreen() {
  const nav = useNav();
  const app = useApp();
  const [lang, setLang] = useStSE('ar');
  const langs = [
    { k: 'ar', l: 'العربية', s: 'Arabic', flag: '🇪🇬' },
    { k: 'en', l: 'الإنجليزية', s: 'English', flag: '🇺🇸', disabled: true },
  ];
  return (
    <div className="dl-screen">
      <AppBar title="اللغة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10, marginBottom: 14 }}>
          <Icon.globe size={14}/>
          <span>دلنجاتُو عربي بشكل أساسي. الإنجليزية في الطريق — هتيجي قريب.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {langs.map(l => (
            <button key={l.k} onClick={() => !l.disabled && setLang(l.k)}
              disabled={l.disabled}
              style={{ all:'unset', cursor: l.disabled ? 'not-allowed' : 'pointer',
                padding: '14px 16px', background: '#fff',
                borderRadius: 12,
                border: `1.5px solid ${lang === l.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display:'flex', alignItems:'center', gap: 12,
                opacity: l.disabled ? 0.55 : 1,
                transition: 'all 150ms var(--ease-out)' }}>
              <span style={{ fontSize: 28 }}>{l.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{l.l}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{l.s}</div>
              </div>
              {l.disabled && <Badge variant="pending">قريباً</Badge>}
              {!l.disabled && (
                <div style={{ width: 22, height: 22, borderRadius: 100,
                  border: `2px solid ${lang === l.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {lang === l.k && <div style={{ width: 12, height: 12, borderRadius: 100, background: 'var(--olive)' }}/>}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

registerScreen('privacy', PrivacyScreen);
registerScreen('security', SecurityScreen);
registerScreen('changePassword', ChangePasswordScreen);
registerScreen('deleteAccount', DeleteAccountScreen);
registerScreen('reportIssue', ReportIssueScreen);
registerScreen('language', LanguageScreen);
