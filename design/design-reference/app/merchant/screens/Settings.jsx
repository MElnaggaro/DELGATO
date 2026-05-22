// app/merchant/screens/Settings.jsx — Store profile, branding, hours, temp closure, delivery, prep, payment, tax, payout
const { useState: useStMS, useEffect: useEfMS } = React;

// ── Store Profile ────────────────────────────────────────────────
function StoreProfileScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [name, setName] = useStMS(m.store.name);
  const [category, setCategory] = useStMS(m.store.category);
  const [address, setAddress] = useStMS(m.store.address);
  const [phone, setPhone] = useStMS(m.store.phone);
  const [desc, setDesc] = useStMS('بقالة بلدي بكل اللي محتاجه — من اللبن للمعلبات.');

  const save = () => {
    m.setStore({ ...m.store, name, category, address, phone });
    m.showToast('اتحفظت بيانات المحل', <Icon.check size={16}/>);
    nav.pop();
  };

  return (
    <div className="dl-screen">
      <AppBar title="معلومات المحل" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <Fld label="اسم المحل">
          <input className="dl-input" value={name} onChange={e => setName(e.target.value)}/>
        </Fld>
        <div style={{ height: 14 }}/>
        <Fld label="القسم">
          <select className="dl-input" value={category} onChange={e => setCategory(e.target.value)}>
            <option>بقالة</option>
            <option>صيدلية</option>
            <option>أكل</option>
            <option>حلويات</option>
            <option>خضار وفاكهة</option>
          </select>
        </Fld>
        <div style={{ height: 14 }}/>
        <Fld label="العنوان">
          <input className="dl-input" value={address} onChange={e => setAddress(e.target.value)}/>
        </Fld>
        <div style={{ height: 14 }}/>
        <Fld label="رقم التليفون">
          <input dir="ltr" className="dl-input" value={phone} onChange={e => setPhone(e.target.value)}
            style={{ textAlign: 'left' }}/>
        </Fld>
        <div style={{ height: 14 }}/>
        <Fld label="وصف المحل" sub="بيظهر للعميل قبل ما يطلب">
          <textarea value={desc} onChange={e => setDesc(e.target.value.slice(0, 200))}
            style={{ width:'100%', minHeight: 80, padding: 12, fontFamily:'var(--font-arabic)',
              borderRadius: 10, border: '1.5px solid var(--canvas-300)', background:'#fff',
              resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', lineHeight: 1.55 }}/>
          <div style={{ textAlign: 'left', fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>
            {desc.length.toLocaleString('ar-EG')} / ٢٠٠
          </div>
        </Fld>

        <SectionHead title="معلومات قانونية"/>
        <Group>
          <ListRow icon={<Icon.shieldCheck size={18}/>} label="السجل التجاري" sub="٤٢٣ ٤٥٦ ٧٨٩" onClick={() => {}}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.receipt size={18}/>} label="البطاقة الضريبية" sub="٣٣٣-٤٤٤-٥٥٥" onClick={() => {}}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.user size={18}/>} label="بيانات المالك" value={m.store.ownerName} onClick={() => {}}/>
        </Group>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={save}>حفظ التغييرات</Button>
      </div>
    </div>
  );
}

function Fld({ label, sub, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.03em' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>· {sub}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Branding ─────────────────────────────────────────────────────
function BrandingScreen() {
  const nav = useNav();
  const m = useMerchant();
  const colors = [
    { name: 'زيتوني', bg: 'linear-gradient(135deg,#1F4A3D 0%,#173629 100%)' },
    { name: 'ذهبي', bg: 'linear-gradient(135deg,#E8B14F 0%,#C9933A 100%)' },
    { name: 'بني', bg: 'linear-gradient(135deg,#A66B2C 0%,#7A4D1F 100%)' },
    { name: 'أخضر فاتح', bg: 'linear-gradient(135deg,#3C6B4F 0%,#234731 100%)' },
    { name: 'رمادي', bg: 'linear-gradient(135deg,#3A5247 0%,#23362D 100%)' },
  ];
  const [picked, setPicked] = useStMS(0);

  return (
    <div className="dl-screen">
      <AppBar title="هوية المحل" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Preview */}
        <div style={{ marginTop: 14, height: 180, borderRadius: 16, background: colors[picked].bg,
          color: 'var(--canvas)', padding: 18, position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ position: 'absolute', insetBlockStart: -40, insetInlineEnd: -20,
            fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 220,
            color: 'rgba(250,248,243,0.08)', lineHeight: 0.85 }}>{m.store.letter}</div>
          <div style={{ display:'flex', gap: 8, position: 'relative' }}>
            <Badge variant="solid-gold">٤٫٨ ★</Badge>
            <Badge variant="ghost">{m.store.category}</Badge>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{m.store.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.75)', marginTop: 6 }}>
              {m.store.address}
            </div>
          </div>
        </div>

        {/* Logo upload */}
        <SectionHead title="الشعار"/>
        <Group>
          <div style={{ padding: 16, display:'flex', gap: 14, alignItems:'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--olive)', borderRadius: 16,
              display:'flex', alignItems:'center', justifyContent:'center',
              color: 'var(--canvas)', fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 36 }}>
              {m.store.letter}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>شعار المحل</div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                ١٠٢٤×١٠٢٤ مربع · PNG أو JPG
              </div>
            </div>
            <Button variant="secondary">تغيير</Button>
          </div>
        </Group>

        {/* Color picker */}
        <SectionHead title="اللون الأساسي"/>
        <div style={{ padding: '0 18px 0', display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {colors.map((c, i) => (
            <button key={c.name} onClick={() => setPicked(i)}
              style={{ all:'unset', cursor:'pointer', display:'flex', flexDirection: 'column',
                alignItems: 'center', gap: 8, minWidth: 70 }}>
              <div style={{ width: 56, height: 56, borderRadius: 100, background: c.bg,
                border: picked === i ? '3px solid var(--gold)' : '3px solid transparent',
                transition: 'border-color 150ms var(--ease-out)' }}/>
              <div style={{ fontSize: 11, color: 'var(--ink)', fontWeight: picked === i ? 700 : 500 }}>{c.name}</div>
            </button>
          ))}
        </div>

        {/* Cover photos */}
        <SectionHead title="صور الواجهة" action="ضيف صورة"/>
        <div style={{ padding: '0 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ aspectRatio: '1 / 1', borderRadius: 10,
              background: '#fff', border: '1.5px dashed var(--canvas-300)',
              display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--ink-light)' }}>
              <Icon.plus size={20}/>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => { m.showToast('اتحفظت الهوية', <Icon.check size={16}/>); nav.pop(); }}>
          حفظ
        </Button>
      </div>
    </div>
  );
}

// ── Opening Hours ────────────────────────────────────────────────
function OpeningHoursScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [hours, setHours] = useStMS(m.hours);
  const toggleClosed = (i) => setHours(h => h.map((d, x) => x === i ? { ...d, closed: !d.closed } : d));

  return (
    <div className="dl-screen">
      <AppBar title="مواعيد العمل" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ background: 'rgba(31,74,61,0.06)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10, marginTop: 14, marginBottom: 14 }}>
          <Icon.clock size={14}/>
          <span>المحل بياخد طلبات في الأوقات دي بس. تقدر تقفل يوم بالضغط على الزر جنبه.</span>
        </div>

        <div className="dl-card" style={{ padding: 4 }}>
          {hours.map((d, i, a) => (
            <div key={d.day}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                opacity: d.closed ? 0.55 : 1 }}>
                <div style={{ width: 60, fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{d.day}</div>
                <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
                  {d.closed ? (
                    <span style={{ fontSize: 13, color: 'var(--ink-light)', fontStyle: 'italic' }}>مغلق</span>
                  ) : (
                    <>
                      <span className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>{d.open}</span>
                      <span style={{ color: 'var(--ink-mute)' }}>—</span>
                      <span className="mono" style={{ fontSize: 13, color: 'var(--ink)' }}>{d.close}</span>
                    </>
                  )}
                </div>
                <button onClick={() => toggleClosed(i)}
                  style={{ width: 38, height: 22, borderRadius: 100, border: 0, cursor: 'pointer',
                    background: !d.closed ? 'var(--olive)' : 'var(--canvas-300)',
                    position: 'relative', transition: 'background 200ms var(--ease-out)' }}>
                  <span style={{ position:'absolute', top: 3, insetInlineStart: !d.closed ? 19 : 3,
                    width: 16, height: 16, borderRadius: 100, background: '#fff',
                    transition: 'inset-inline-start 200ms var(--ease-out)' }}/>
                </button>
              </div>
              {i < a.length - 1 && <hr className="dl-divider"/>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <Button variant="secondary" full leading={<Icon.copy size={16}/>}>نسخ الأحد على كل الأيام</Button>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => { m.setHours(hours); m.showToast('اتحفظت المواعيد', <Icon.check size={16}/>); nav.pop(); }}>
          حفظ
        </Button>
      </div>
    </div>
  );
}

// ── Temporary closure ────────────────────────────────────────────
function TempCloseScreen() {
  const nav = useNav();
  const m = useMerchant();
  const reasons = ['عدم توافر طاقم', 'صيانة', 'مناسبة عائلية', 'إجازة', 'سبب آخر'];
  const durations = ['ساعة', '٤ ساعات', 'بقية اليوم', 'يومين', 'حتى إشعار آخر'];
  const [reason, setReason] = useStMS(m.tempClose?.reason || reasons[0]);
  const [duration, setDuration] = useStMS(m.tempClose?.until || durations[2]);
  const isClosed = !!m.tempClose;

  return (
    <div className="dl-screen">
      <AppBar title="إغلاق مؤقت" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {isClosed && (
          <div className="dl-fade-up" style={{ marginTop: 14, padding: '14px 16px',
            background: 'rgba(197,59,44,0.10)', borderRadius: 12,
            display:'flex', gap: 10, alignItems:'flex-start' }}>
            <Icon.info size={16}/>
            <div style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.55 }}>
              <strong>المحل مغلق دلوقتي:</strong> {m.tempClose.reason} · {m.tempClose.until}
              <button onClick={() => { m.setTempClose(null); m.showToast('فتح المحل تاني', <Icon.check size={16}/>); }}
                style={{ all:'unset', cursor:'pointer', display: 'block', marginTop: 8, color: 'var(--olive)', fontWeight: 700, fontSize: 13 }}>
                افتح المحل دلوقتي
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.6 }}>
          الإغلاق المؤقت بيخفي المحل من بحث العملاء. الطلبات الجارية هتكمل عادي.
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          السبب
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reasons.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{ all:'unset', cursor:'pointer', padding: '14px 16px', background: '#fff',
                borderRadius: 10, border: `1.5px solid ${reason === r ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display:'flex', alignItems:'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 100,
                border: `2px solid ${reason === r ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {reason === r && <div style={{ width: 10, height: 10, borderRadius: 100, background: 'var(--olive)' }}/>}
              </div>
              <span style={{ fontSize: 14, color: 'var(--ink)' }}>{r}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          المدة
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {durations.map(d => (
            <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>{d}</Chip>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full style={{ background: '#C53B2C' }}
          onClick={() => {
            m.setTempClose({ reason, until: duration });
            m.showToast('اتقفل المحل مؤقتاً', <Icon.x size={16}/>);
            nav.pop();
          }}>
          أكّد الإغلاق
        </Button>
      </div>
    </div>
  );
}

// ── Delivery settings ────────────────────────────────────────────
function DeliverySettingsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [radius, setRadius] = useStMS(m.deliveryRadius);
  return (
    <div className="dl-screen">
      <AppBar title="نطاق التوصيل" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ marginTop: 14, height: 240, borderRadius: 14, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(120deg, #E8E2D2 0%, #DDD4BE 100%)',
          border: '1px solid var(--canvas-300)' }}>
          <svg viewBox="0 0 360 240" style={{ position:'absolute', inset: 0, width: '100%', height: '100%' }}>
            <g stroke="#FAF8F3" strokeWidth="14" fill="none" opacity="0.9">
              <path d="M -10 50 L 380 80"/>
              <path d="M -10 180 L 380 170"/>
              <path d="M 120 -10 L 90 250"/>
              <path d="M 260 -10 L 290 250"/>
            </g>
          </svg>
          {/* Center pin + radius circle */}
          <div style={{ position: 'absolute', inset: 0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{
              width: 80 + radius * 30, height: 80 + radius * 30, borderRadius: '50%',
              background: 'rgba(31,74,61,0.16)',
              border: '2px dashed rgba(31,74,61,0.40)',
              transition: 'all 240ms var(--ease-out)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 100, background: 'var(--olive)',
                color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16 }}>{m.store.letter}</div>
            </div>
          </div>
          {/* Range badge */}
          <div style={{ position: 'absolute', insetInlineEnd: 12, top: 12,
            background: 'rgba(15,26,23,0.7)', backdropFilter: 'blur(10px)', color: 'var(--canvas)',
            borderRadius: 100, padding: '6px 12px', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.navigation size={12}/> {radius.toLocaleString('ar-EG')} كم
          </div>
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          نطاق التوصيل ({radius.toLocaleString('ar-EG')} كم)
        </div>
        <input type="range" min="1" max="10" step="1"
          value={radius} onChange={e => setRadius(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--olive)' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-light)', marginTop: 4 }}>
          <span>١ كم</span>
          <span>١٠ كم</span>
        </div>

        <div style={{ marginTop: 18, padding: '12px 14px', background: 'var(--canvas-200)', borderRadius: 10,
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10 }}>
          <Icon.info size={14}/>
          <span>كل ما النطاق يكبر، عملاء أكتر يقدروا يطلبوا — بس الكابتن هياخد وقت أكتر للتوصيل.</span>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => { m.setDeliveryRadius(radius); m.showToast('اتحفظ النطاق', <Icon.check size={16}/>); nav.pop(); }}>
          حفظ
        </Button>
      </div>
    </div>
  );
}

// ── Prep time settings ───────────────────────────────────────────
function PrepTimeSettingsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [t, setT] = useStMS(m.prepTime);
  const opts = [5, 10, 15, 20, 30, 45, 60];
  return (
    <div className="dl-screen">
      <AppBar title="وقت التحضير" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10, marginBottom: 18 }}>
          <Icon.clock size={14}/>
          <span>الوقت اللي بياخده المحل علشان يحضّر طلب عادي. العميل بيشوفه قبل ما يطلب.</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', textAlign: 'center',
          boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>وقت التحضير الافتراضي</div>
          <div style={{ fontSize: 56, fontWeight: 700, color: 'var(--olive)', marginTop: 6, lineHeight: 1 }}>
            {t.toLocaleString('ar-EG')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>دقيقة</div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {opts.map(o => (
            <button key={o} onClick={() => setT(o)}
              style={{ all:'unset', cursor:'pointer', padding: '14px 4px', borderRadius: 12,
                background: t === o ? 'var(--olive)' : '#fff',
                color: t === o ? 'var(--canvas)' : 'var(--ink)',
                border: t === o ? 0 : '1.5px solid var(--canvas-300)',
                textAlign: 'center', fontFamily: 'var(--font-arabic)',
                fontWeight: 700, fontSize: 14 }}>
              {o.toLocaleString('ar-EG')} د
            </button>
          ))}
        </div>

        <SectionHead title="أوقات الذروة"/>
        <div className="dl-card" style={{ padding: 4 }}>
          <TogRow label="أضف ٥ دقايق في الذروة" sub="من ٦ م لـ ٩ م"
            v={true} onChange={() => {}}/>
          <hr className="dl-divider"/>
          <TogRow label="أوقف الطلبات لو المحل اتزحم" sub="بعد ١٠ طلبات شغّالة"
            v={false} onChange={() => {}}/>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => { m.setPrepTime(t); m.showToast('اتحفظ الوقت', <Icon.check size={16}/>); nav.pop(); }}>
          حفظ
        </Button>
      </div>
    </div>
  );
}

// ── Payment Settings ─────────────────────────────────────────────
function PaymentSettingsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [accept, setAccept] = useStMS({ cash: true, card: true, wallet: true });
  return (
    <div className="dl-screen">
      <AppBar title="إعدادات الدفع" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <SectionHead title="طرق الدفع المقبولة"/>
        <Group>
          <TogRow icon={<Icon.cash size={18}/>} label="كاش عند الاستلام"
            sub="العميل يدفع للكابتن لما يوصل"
            v={accept.cash} onChange={() => setAccept(a => ({ ...a, cash: !a.cash }))}/>
          <hr className="dl-divider"/>
          <TogRow icon={<Icon.card size={18}/>} label="بطاقة بنكية"
            sub="فيزا · ماستركارد · ميزة"
            v={accept.card} onChange={() => setAccept(a => ({ ...a, card: !a.card }))}/>
          <hr className="dl-divider"/>
          <TogRow icon={<Icon.wallet size={18}/>} label="محفظة دلنجاتو"
            sub="كاش باك ١٠٪ للعميل"
            v={accept.wallet} onChange={() => setAccept(a => ({ ...a, wallet: !a.wallet }))}/>
        </Group>

        <SectionHead title="حساب البنك"/>
        <Group>
          <ListRow icon={<Icon.shieldCheck size={18}/>} label={PAYOUT.bank} sub={PAYOUT.bankAccount}
            onClick={() => {}}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.plus size={18}/>} label="ضيف حساب بنكي تاني"
            onClick={() => {}}/>
        </Group>

        <SectionHead title="جدول التحويلات"/>
        <Group>
          <ListRow icon={<Icon.clock size={18}/>} label="تكرار التحويل" value="أسبوعياً · الجمعة"/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.tag size={18}/>} label="نسبة دلنجاتو" value="٧٪ من كل طلب"/>
        </Group>

        <div style={{ padding: '0 0 24px', marginTop: 18 }}>
          <Button variant="ghost" full onClick={() => nav.push('payout')}
            leading={<Icon.wallet size={16}/>}>
            عرض سجل التحويلات
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Tax Settings ─────────────────────────────────────────────────
function TaxSettingsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [vatEnabled, setVatEnabled] = useStMS(true);
  const [rate, setRate] = useStMS(5);
  const [included, setIncluded] = useStMS(false);
  return (
    <div className="dl-screen">
      <AppBar title="إعدادات الضرائب" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <SectionHead title="القيمة المضافة"/>
        <Group>
          <TogRow label="تفعيل ضريبة القيمة المضافة"
            sub="لو محلك مسجل ضريبياً"
            v={vatEnabled} onChange={() => setVatEnabled(!vatEnabled)}/>
        </Group>

        {vatEnabled && (
          <>
            <SectionHead title="النسبة"/>
            <div style={{ padding: '0 18px 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[5, 10, 14].map(r => (
                <button key={r} onClick={() => setRate(r)}
                  style={{ all:'unset', cursor:'pointer', padding: '14px 4px', borderRadius: 12,
                    background: rate === r ? 'var(--olive)' : '#fff',
                    color: rate === r ? 'var(--canvas)' : 'var(--ink)',
                    border: rate === r ? 0 : '1.5px solid var(--canvas-300)',
                    textAlign: 'center', fontWeight: 700, fontSize: 16 }}>
                  {r.toLocaleString('ar-EG')}٪
                </button>
              ))}
              <button style={{ all:'unset', cursor:'pointer', padding: '14px 4px', borderRadius: 12,
                background: '#fff', border: '1.5px solid var(--canvas-300)',
                color: 'var(--ink-light)', textAlign: 'center', fontSize: 12 }}>
                مخصص
              </button>
            </div>

            <SectionHead title="طريقة التطبيق"/>
            <Group>
              <TogRow label="السعر شامل الضريبة"
                sub={included ? 'الضريبة جوه السعر المعروض' : 'الضريبة بتزيد على السعر النهائي'}
                v={included} onChange={() => setIncluded(!included)}/>
            </Group>

            <div style={{ padding: '14px 18px 0' }}>
              <div className="dl-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', marginBottom: 10 }}>معاينة الفاتورة</div>
                <Row label="إجمالي المنتجات" value="١٠٠ ج.م"/>
                <Row label={`الضريبة (${rate.toLocaleString('ar-EG')}٪)`} value={`${rate.toLocaleString('ar-EG')} ج.م`}/>
                <Row label="رسوم التوصيل" value="١٠ ج.م"/>
                <hr className="dl-divider" style={{ margin: '8px 0' }}/>
                <Row label="الإجمالي" value={`${(110 + rate).toLocaleString('ar-EG')} ج.م`} bold/>
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => { m.showToast('اتحفظت الإعدادات', <Icon.check size={16}/>); nav.pop(); }}>
          حفظ
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ fontSize: bold ? 14 : 13, color: bold ? 'var(--ink)' : 'var(--ink-light)',
        fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 13, color: 'var(--ink)', fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  );
}

// ── Payout History ────────────────────────────────────────────────
function PayoutScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen">
      <AppBar title="الأرباح والتحويلات" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Next payout */}
        <div className="dl-fade-up" style={{ marginTop: 14, padding: 20, borderRadius: 16,
          background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)', color: 'var(--canvas)',
          position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', top: -40, insetInlineEnd: -20, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(232,177,79,0.16)' }}/>
          <div style={{ position: 'relative' }}>
            <Badge variant="solid-gold">الدفعة الجاية</Badge>
            <div style={{ marginTop: 14, fontSize: 40, fontWeight: 700, lineHeight: 1 }}>
              {PAYOUT.pending.toLocaleString('ar-EG')} <span style={{ fontSize: 16, color: 'rgba(250,248,243,0.7)', fontWeight: 500 }}>ج.م</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)', marginTop: 8 }}>
              {PAYOUT.nextDate} · على {PAYOUT.bank} {PAYOUT.bankAccount}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <MetricTile label="إيرادات الشهر"
            value={PAYOUT.thisMonth.toLocaleString('ar-EG')} sub="ج.م"
            icon={<Icon.zap size={14}/>}/>
          <MetricTile label="الشهر اللي فات"
            value={PAYOUT.lastMonth.toLocaleString('ar-EG')} sub="ج.م"
            icon={<Icon.clock size={14}/>}/>
        </div>

        <SectionHead title="سجل التحويلات"/>
        <Group>
          {PAYOUT.history.map((p, i, a) => (
            <div key={p.ref}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
                  color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon.check size={18}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                    {p.amount.toLocaleString('ar-EG')} ج.م
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }} className="mono">
                    {p.date} · {p.ref}
                  </div>
                </div>
                <Badge variant="active">تم</Badge>
              </div>
              {i < a.length - 1 && <hr className="dl-divider"/>}
            </div>
          ))}
        </Group>
      </div>
    </div>
  );
}

registerScreen('storeProfile', StoreProfileScreen);
registerScreen('branding', BrandingScreen);
registerScreen('openingHours', OpeningHoursScreen);
registerScreen('tempClose', TempCloseScreen);
registerScreen('deliverySettings', DeliverySettingsScreen);
registerScreen('prepTimeSettings', PrepTimeSettingsScreen);
registerScreen('paymentSettings', PaymentSettingsScreen);
registerScreen('taxSettings', TaxSettingsScreen);
registerScreen('payout', PayoutScreen);
