// app/merchant/screens/Promotions.jsx — Discounts, coupons, combos, scheduled
const { useState: useStMPr } = React;

// ── Promotions list ──────────────────────────────────────────────
function PromotionsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [tab, setTab] = useStMPr('active');

  const filtered = tab === 'active' ? m.promos.filter(p => p.status === 'active')
                  : tab === 'scheduled' ? m.promos.filter(p => p.status === 'scheduled')
                  : tab === 'ended' ? m.promos.filter(p => p.status === 'ended')
                  : m.promos;

  return (
    <div className="dl-screen">
      <AppBar title="العروض والكوبونات" onBack={() => nav.pop()}
        trailing={<button onClick={() => nav.push('promoForm')}
          style={{ background:'transparent', border: 0, padding: 6, color: 'var(--olive)',
            fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700, cursor:'pointer',
            display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.plus size={16}/> عرض جديد
        </button>}/>

      {/* Stats strip */}
      <div style={{ padding: '8px 18px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <PromoStat label="عرض شغّال" value={m.promos.filter(p => p.status === 'active').length}/>
        <PromoStat label="استخدام اليوم" value="٢٤٨" sub="مرة"/>
        <PromoStat label="إيرادات العروض" value="١٢٬٤٢٠" sub="ج.م"/>
      </div>

      {/* Tabs */}
      <div style={{ padding: '4px 18px 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'active', l: 'شغّال', n: m.promos.filter(p => p.status === 'active').length },
          { k: 'scheduled', l: 'مجدول', n: m.promos.filter(p => p.status === 'scheduled').length },
          { k: 'ended', l: 'منتهي', n: m.promos.filter(p => p.status === 'ended').length },
        ].map(c => (
          <Chip key={c.k} active={tab === c.k} onClick={() => setTab(c.k)}>
            {c.l} <span style={{ opacity: 0.7, marginInlineStart: 4 }}>· {c.n.toLocaleString('ar-EG')}</span>
          </Chip>
        ))}
      </div>

      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Icon.tag size={32}/>}
            title={tab === 'active' ? 'مفيش عروض شغّالة' : tab === 'scheduled' ? 'مفيش عروض مجدولة' : 'مفيش عروض منتهية'}
            body="ابدأ بإنشاء أول عرض ولاحظ أثره على المبيعات."
            action={<Button variant="primary" onClick={() => nav.push('promoForm')}>عرض جديد</Button>}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((p, i) => (
              <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
                <PromoCard promo={p}
                  onClick={() => nav.push('promoForm', { promo: p })}
                  onToggle={() => {
                    m.setPromos(prev => prev.map(x => x.id === p.id ?
                      { ...x, status: x.status === 'active' ? 'ended' : 'active' } : x));
                    m.showToast(p.status === 'active' ? 'اتوقف العرض' : 'اتفعّل العرض', <Icon.check size={16}/>);
                  }}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PromoStat({ label, value, sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '12px 10px', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>{label}</div>
      <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--olive)' }}>
          {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        </span>
        {sub && <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>{sub}</span>}
      </div>
    </div>
  );
}

function PromoCard({ promo, onClick, onToggle }) {
  const kindLabel = { percent: 'نسبة خصم', flat: 'خصم ثابت', bogo: 'اشتري ١ خد ١', combo: 'كومبو' }[promo.kind];
  const kindIcon = { percent: <Icon.tag size={20}/>, flat: <Icon.tag size={20}/>, bogo: <Icon.heart size={20}/>, combo: <Icon.sparkle size={20}/> }[promo.kind];
  return (
    <div onClick={onClick} className="dl-tappable" style={{
      background: '#fff', borderRadius: 14, padding: 14,
      boxShadow: 'var(--shadow-card)', cursor: 'pointer',
      borderInlineStart: `3px solid ${promo.status === 'active' ? 'var(--olive)' : promo.status === 'scheduled' ? 'var(--gold)' : 'var(--canvas-300)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10,
          background: promo.status === 'active' ? 'var(--olive)' :
                      promo.status === 'scheduled' ? 'rgba(232,177,79,0.20)' : 'var(--canvas-200)',
          color: promo.status === 'active' ? 'var(--canvas)' :
                 promo.status === 'scheduled' ? '#8a6418' : 'var(--ink-mute)',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
          {kindIcon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap: 6, marginBottom: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{promo.title}</div>
            {promo.status === 'scheduled' && <Badge variant="pending">مجدول</Badge>}
            {promo.status === 'ended' && <Badge variant="issue">منتهي</Badge>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.4 }}>{promo.sub}</div>
        </div>
      </div>

      {/* Code */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <div className="mono" style={{ padding: '6px 10px', borderRadius: 6,
          background: 'var(--canvas-200)', color: 'var(--olive)',
          fontWeight: 700, fontSize: 12, letterSpacing: '0.08em' }}>{promo.code}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>
          {kindLabel}{promo.value ? ` · ${promo.value}${promo.kind === 'percent' ? '٪' : promo.kind === 'flat' ? ' ج.م' : ''}` : ''}
        </div>
        <div style={{ flex: 1 }}/>
        {promo.status !== 'ended' && (
          <button onClick={(e) => { e.stopPropagation(); onToggle?.(promo); }}
            style={{ width: 38, height: 22, borderRadius: 100, border: 0, cursor:'pointer',
              background: promo.status === 'active' ? 'var(--olive)' : 'var(--canvas-300)',
              position: 'relative', transition: 'background 200ms var(--ease-out)' }}>
            <span style={{ position: 'absolute', top: 3, insetInlineStart: promo.status === 'active' ? 19 : 3,
              width: 16, height: 16, borderRadius: 100, background: '#fff',
              transition: 'inset-inline-start 200ms var(--ease-out)' }}/>
          </button>
        )}
      </div>

      {/* Usage */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--canvas-300)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--ink-light)' }}>
        <span>
          {promo.startsAt} → {promo.endsAt}
        </span>
        <span>
          استخدام: <span style={{ color: 'var(--olive)', fontWeight: 700 }}>
            {promo.uses.toLocaleString('ar-EG')}{promo.cap ? ` / ${promo.cap.toLocaleString('ar-EG')}` : ''}
          </span>
        </span>
      </div>
    </div>
  );
}

// ── Promo form ───────────────────────────────────────────────────
function PromoFormScreen({ promo }) {
  const nav = useNav();
  const m = useMerchant();
  const isEdit = !!promo;
  const [kind, setKind] = useStMPr(promo?.kind || 'percent');
  const [title, setTitle] = useStMPr(promo?.title || '');
  const [code, setCode] = useStMPr(promo?.code || '');
  const [value, setValue] = useStMPr(promo?.value?.toString() || '');
  const [cap, setCap] = useStMPr(promo?.cap?.toString() || '');
  const [schedule, setSchedule] = useStMPr(promo?.status === 'scheduled');
  const [startsAt, setStartsAt] = useStMPr(promo?.startsAt || '');

  const valid = title.trim().length >= 3 && code.trim().length >= 3 && (kind === 'bogo' || (value && parseInt(value) > 0));

  const save = () => {
    if (!valid) return;
    const next = {
      id: promo?.id || ('pr' + Date.now()),
      kind, title: title.trim(), code: code.trim().toUpperCase(),
      value: kind === 'bogo' ? null : parseInt(value),
      sub: kind === 'percent' ? `${value}٪ خصم` :
           kind === 'flat' ? `خصم ${value} ج.م` :
           kind === 'combo' ? title :
           'اشتري ١ خد ١',
      status: schedule ? 'scheduled' : 'active',
      startsAt: schedule ? startsAt || 'بكرة' : 'كل يوم',
      endsAt: 'مستمر',
      uses: promo?.uses || 0,
      cap: cap ? parseInt(cap) : null,
    };
    if (isEdit) {
      m.setPromos(prev => prev.map(x => x.id === promo.id ? next : x));
      m.showToast('اتحفظ العرض', <Icon.check size={16}/>);
    } else {
      m.setPromos(prev => [next, ...prev]);
      m.showToast('اتعمل عرض جديد', <Icon.tag size={16}/>);
    }
    nav.pop();
  };

  return (
    <div className="dl-screen">
      <AppBar title={isEdit ? 'تعديل العرض' : 'عرض جديد'} onBack={() => nav.pop()}
        trailing={isEdit && (
          <button onClick={() => {
            m.setPromos(prev => prev.filter(p => p.id !== promo.id));
            m.showToast('اتمسح العرض', <Icon.trash size={16}/>);
            nav.pop();
          }}
            style={{ background:'transparent', border: 0, padding: 6, color: '#A1271C',
              cursor:'pointer', display:'flex' }}>
            <Icon.trash size={20}/>
          </button>
        )}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Kind picker */}
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', margin: '14px 0 10px' }}>
          نوع العرض
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { k: 'percent', l: 'نسبة خصم', s: 'مثلاً ٢٥٪', icon: <Icon.tag size={20}/> },
            { k: 'flat', l: 'مبلغ خصم', s: 'مثلاً ١٠ ج.م', icon: <Icon.tag size={20}/> },
            { k: 'combo', l: 'كومبو', s: 'منتجات معاً بسعر', icon: <Icon.sparkle size={20}/> },
            { k: 'bogo', l: 'اشتري ١ خد ١', s: 'منتج هدية', icon: <Icon.heart size={20}/> },
          ].map(o => (
            <button key={o.k} onClick={() => setKind(o.k)}
              style={{ all:'unset', cursor:'pointer', padding: 14, borderRadius: 12,
                background: '#fff',
                border: `1.5px solid ${kind === o.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10,
                background: kind === o.k ? 'var(--olive)' : 'var(--canvas-200)',
                color: kind === o.k ? 'var(--canvas)' : 'var(--olive)',
                display:'flex', alignItems:'center', justifyContent:'center' }}>{o.icon}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{o.l}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{o.s}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Details */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Fld label="عنوان العرض" sub="هيظهر للعميل في صفحة العروض">
            <input className="dl-input" autoFocus placeholder="مثلاً: خصم نهاية الأسبوع"
              value={title} onChange={e => setTitle(e.target.value)}/>
          </Fld>
          <Fld label="كود العرض" sub="بدون مسافات · أحرف وأرقام بس">
            <input dir="ltr" className="dl-input" placeholder="WEEKEND25"
              value={code} onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
              style={{ textAlign: 'left', letterSpacing: '0.10em', fontFamily: 'var(--font-mono)', fontWeight: 700 }}/>
          </Fld>

          {kind !== 'bogo' && (
            <Fld label={`القيمة ${kind === 'percent' ? '(نسبة مئوية)' : '(جنيه)'}`}>
              <div style={{ position: 'relative' }}>
                <input className="dl-input dl-input--lg" inputMode="numeric"
                  value={value} onChange={e => setValue(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{ textAlign: 'center', fontWeight: 700, fontSize: 22 }}/>
                <span style={{ position: 'absolute', insetInlineEnd: 16, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--ink-light)', fontSize: 14, fontWeight: 600 }}>
                  {kind === 'percent' ? '٪' : 'ج.م'}
                </span>
              </div>
            </Fld>
          )}

          <Fld label="حد الاستخدام" sub="اختياري — أقصى عدد مرات يستخدم">
            <input className="dl-input" inputMode="numeric" placeholder="مفيش حد"
              value={cap} onChange={e => setCap(e.target.value.replace(/[^0-9]/g, ''))}/>
          </Fld>

          <div className="dl-card" style={{ padding: 4 }}>
            <TogRow label="جدول للمستقبل"
              sub="العرض هيبدأ في تاريخ تختاره · مش هيشتغل دلوقتي"
              v={schedule} onChange={() => setSchedule(!schedule)}
              icon={<Icon.clock size={18}/>}/>
          </div>

          {schedule && (
            <Fld label="تاريخ بدء العرض">
              <input className="dl-input" placeholder="مثلاً: ١٠ مارس"
                value={startsAt} onChange={e => setStartsAt(e.target.value)}/>
            </Fld>
          )}
        </div>

        {/* Preview */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            معاينة العرض
          </div>
          <div style={{
            borderRadius: 14, padding: '16px 18px',
            background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
            color: 'var(--canvas)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', insetBlockStart: -20, insetInlineEnd: -10,
              width: 100, height: 100, borderRadius: '50%', background: 'rgba(250,248,243,0.08)' }}/>
            <Badge variant="solid-gold">
              {kind === 'percent' ? `-${value || '٠'}٪` :
               kind === 'flat' ? `-${value || '٠'} ج` :
               kind === 'bogo' ? '١+١' : 'كومبو'}
            </Badge>
            <div style={{ marginTop: 12, fontSize: 19, fontWeight: 700, position: 'relative' }}>
              {title || 'عنوان العرض'}
            </div>
            <div className="mono" style={{ marginTop: 8, padding: '5px 10px', borderRadius: 6, display:'inline-block',
              background: 'rgba(250,248,243,0.14)', fontSize: 11, letterSpacing: '0.12em',
              fontWeight: 700, position: 'relative' }}>
              {code || 'كود'}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!valid} onClick={save}>
          {isEdit ? 'حفظ التغييرات' : schedule ? 'جدولة العرض' : 'فعّل العرض'}
        </Button>
      </div>
    </div>
  );
}

registerScreen('promotions', PromotionsScreen);
registerScreen('promoForm', PromoFormScreen);
