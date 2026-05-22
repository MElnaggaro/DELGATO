// screens/CheckoutExtras.jsx — MerchantConflict, PromoCode, ScheduledDelivery, TipDriver, WalletPay, DeliveryNotes, MapPin, AddAddress
const { useState: useStCE, useEffect: useEfCE, useRef: useRfCE } = React;

// ── Merchant Conflict (sheet shown when adding from different shop) ─
function MerchantConflictScreen({ existing, newShop, newProduct }) {
  const nav = useNav();
  const app = useApp();

  const keep = () => nav.pop();
  const replace = () => {
    app.clearCart();
    if (newProduct) app.addItem(newProduct, newShop, 1);
    app.showToast('السلة اتفرّغت وبدأنا من جديد', <Icon.refresh size={16}/>);
    nav.pop();
    if (newShop) setTimeout(() => nav.push('shop', { shop: newShop }), 80);
  };

  return (
    <div className="dl-screen">
      <AppBar title="" onBack={() => nav.pop()}/>
      <div style={{ flex: 1, padding: '12px 24px 28px', display:'flex', flexDirection: 'column' }}>
        <div className="dl-fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign: 'center', marginTop: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 100, background: 'rgba(232,177,79,0.18)',
            color: '#8a6418', display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 18 }}>
            <Icon.bag size={36}/>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>
            سلتك من محل تاني
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 10, lineHeight: 1.6, maxWidth: 300 }}>
            عندك دلوقتي منتجات من <strong style={{ color:'var(--ink)' }}>{existing || 'سوبر ماركت أبو حسن'}</strong>.
            <br/>تقدر تطلب من محل واحد بس في المرة.
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '120ms', marginTop: 26 }}>
          <div className="dl-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 100, background: 'var(--olive)',
              color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18 }}>{(existing || 'أ')[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>السلة الحالية</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{existing || 'سوبر ماركت أبو حسن'}</div>
            </div>
            <Badge variant="active">{app.cart.length.toLocaleString('ar-EG')} منتج</Badge>
          </div>
          <div style={{ height: 14 }}/>
          <div className="dl-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            border: '1.5px solid var(--gold)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 100, background: 'var(--gold)',
              color: 'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18 }}>{newShop?.letter || 'م'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>المحل الجديد</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{newShop?.name || 'محل جديد'}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 18 }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" size="lg" full onClick={replace}>
            فضّي السلة وابدأ من جديد
          </Button>
          <Button variant="ghost" full onClick={keep}>
            خلي السلة زي ما هي
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Promo Code (sheet-style screen) ──────────────────────────────
function PromoCodeScreen() {
  const nav = useNav();
  const app = useApp();
  const [code, setCode] = useStCE(app.appliedPromo?.code || '');
  const [status, setStatus] = useStCE('idle'); // idle | checking | ok | invalid

  const tryCode = () => {
    setStatus('checking');
    setTimeout(() => {
      const known = DEALS.find(d => d.code.toUpperCase() === code.trim().toUpperCase());
      if (known) {
        setStatus('ok');
        app.setAppliedPromo({ code: known.code, value: known.value, title: known.title });
      } else {
        setStatus('invalid');
      }
    }, 700);
  };

  return (
    <div className="dl-screen">
      <AppBar title="كود الخصم" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '8px 18px 24px' }}>
        <div style={{ position: 'relative' }}>
          <input dir="ltr" className="dl-input dl-input--lg" autoFocus
            placeholder="DLN10" value={code}
            onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)); setStatus('idle'); }}
            style={{ textAlign: 'left', letterSpacing: '0.16em', fontFamily: 'var(--font-mono)', fontWeight: 700,
              paddingInlineEnd: 100 }}/>
          <button onClick={tryCode} disabled={code.length < 3 || status === 'checking' || status === 'ok'}
            style={{ position: 'absolute', insetInlineEnd: 6, top: 6, minHeight: 44,
              padding: '0 14px', borderRadius: 8, border: 0,
              background: status === 'ok' ? 'var(--olive)' : code.length < 3 ? 'var(--canvas-300)' : 'var(--olive)',
              color: 'var(--canvas)', cursor: code.length < 3 ? 'not-allowed' : 'pointer',
              fontFamily:'var(--font-arabic)', fontWeight: 600, fontSize: 13,
              opacity: code.length < 3 ? 0.6 : 1 }}>
            {status === 'checking'
              ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={16}/></span>
              : status === 'ok' ? <Icon.check size={16}/> : 'تطبيق'}
          </button>
        </div>

        {status === 'ok' && (
          <div className="dl-fade-up" style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(31,74,61,0.08)',
            borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--olive)',
              color: 'var(--canvas)', display: 'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.check size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>اتفعّل الكود</div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{app.appliedPromo?.title} · {app.appliedPromo?.value}</div>
            </div>
          </div>
        )}
        {status === 'invalid' && (
          <div className="dl-fade-up" style={{ marginTop: 14, padding: '14px 16px', background: 'rgba(197,59,44,0.08)',
            borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
            <Icon.info size={18} className=""/>
            <div style={{ fontSize: 13, color: '#A1271C', lineHeight: 1.5 }}>
              الكود غلط أو منتهي. اتأكد من الكتابة وحاول تاني.
            </div>
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', margin: '24px 0 10px' }}>
          أكواد متاحة ليك
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DEALS.slice(0, 4).map(d => (
            <button key={d.id} onClick={() => { setCode(d.code); setStatus('idle'); }}
              style={{ all:'unset', cursor:'pointer',
                background: '#fff', borderRadius: 12, padding: 12,
                border: '1px dashed var(--canvas-300)',
                display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--canvas-200)',
                color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon.tag size={18}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{d.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{d.sub}</div>
              </div>
              <div className="mono" style={{ background: 'var(--canvas-200)', padding: '6px 10px', borderRadius: 8,
                fontSize: 12, fontWeight: 700, color: 'var(--olive)', letterSpacing: '0.10em' }}>
                {d.code}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={status !== 'ok'} onClick={() => nav.pop()}>
          {status === 'ok' ? 'استخدم الكود' : 'متابعة'}
        </Button>
      </div>
    </div>
  );
}

// ── Scheduled Delivery ───────────────────────────────────────────
function ScheduledDeliveryScreen() {
  const nav = useNav();
  const app = useApp();
  const days = [
    { k: 'today', l: 'اليوم', sub: 'الأحد', enabled: true },
    { k: 'tom', l: 'بكرة', sub: 'الاتنين', enabled: true },
    { k: 'd2', l: 'بعد بكرة', sub: 'التلات', enabled: true },
    { k: 'd3', l: '٣١ يناير', sub: 'الأربع', enabled: true },
  ];
  const slots = ['٤–٥ م', '٥–٦ م', '٦–٧ م', '٧–٨ م', '٨–٩ م', '٩–١٠ م'];
  const [day, setDay] = useStCE(app.scheduled?.day || 'today');
  const [slot, setSlot] = useStCE(app.scheduled?.slot || slots[1]);

  return (
    <div className="dl-screen">
      <AppBar title="جدول التوصيل" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '4px 18px 24px' }}>
        <div className="dl-fade-up" style={{ background: 'rgba(232,177,79,0.10)', borderRadius: 12, padding: '12px 14px',
          display:'flex', gap: 10, alignItems:'center', marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,177,79,0.30)',
            color: '#8a6418', display: 'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.clock size={18}/>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-light)', lineHeight: 1.55 }}>
            اختار وقت يناسبك من ٤ م لـ ١٠ م. هنبعت طلبك في الوقت المحدد بالظبط.
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          اليوم
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 22 }}>
          {days.map(d => (
            <button key={d.k} onClick={() => setDay(d.k)}
              style={{ all:'unset', cursor:'pointer', minWidth: 80,
                padding: '12px 14px', borderRadius: 12,
                background: day === d.k ? 'var(--olive)' : '#fff',
                border: day === d.k ? 0 : '1.5px solid var(--canvas-300)',
                color: day === d.k ? 'var(--canvas)' : 'var(--ink)',
                textAlign: 'center',
                transition: 'all 150ms var(--ease-out)' }}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{d.sub}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{d.l}</div>
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          الوقت
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {slots.map((s, i) => {
            const taken = i === 2; // demo: one slot taken
            return (
              <button key={s} onClick={() => !taken && setSlot(s)} disabled={taken}
                style={{ all:'unset', cursor: taken ? 'not-allowed' : 'pointer',
                  padding: '14px 8px', borderRadius: 10, textAlign:'center',
                  background: slot === s ? 'var(--olive)' : taken ? 'var(--canvas-200)' : '#fff',
                  color: slot === s ? 'var(--canvas)' : taken ? 'var(--ink-mute)' : 'var(--ink)',
                  border: slot === s ? 0 : '1.5px solid var(--canvas-300)',
                  textDecoration: taken ? 'line-through' : 'none',
                  fontSize: 14, fontWeight: 600,
                  transition: 'all 150ms var(--ease-out)' }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => {
          app.setScheduled({ day, slot });
          app.showToast(`اتجدول الطلب · ${days.find(d => d.k === day).l} ${slot}`, <Icon.clock size={16}/>);
          nav.pop();
        }}>
          تأكيد الموعد
        </Button>
      </div>
    </div>
  );
}

// ── Tip Driver ───────────────────────────────────────────────────
function TipDriverScreen() {
  const nav = useNav();
  const app = useApp();
  const [tip, setTip] = useStCE(app.tip || 0);
  const opts = [0, 5, 10, 15, 20];
  const [custom, setCustom] = useStCE('');

  return (
    <div className="dl-screen">
      <AppBar title="إكرامية الكابتن" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '14px 0 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: 100, background: 'var(--olive)',
            color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 36, marginBottom: 14 }}>م</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>محمود السيد</div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 6, lineHeight: 1.55, maxWidth: 280 }}>
            ساب شغله علشان يوصلك طلبك في الوقت. الإكرامية بتروحله ١٠٠٪.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {opts.map(o => (
            <button key={o} onClick={() => { setTip(o); setCustom(''); }}
              style={{ all:'unset', cursor:'pointer', padding: '14px 4px', borderRadius: 12,
                background: tip === o && !custom ? 'var(--olive)' : '#fff',
                border: tip === o && !custom ? 0 : '1.5px solid var(--canvas-300)',
                color: tip === o && !custom ? 'var(--canvas)' : 'var(--ink)',
                textAlign: 'center', fontFamily: 'var(--font-arabic)',
                transition: 'all 150ms var(--ease-out)' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {o === 0 ? 'بلا' : o.toLocaleString('ar-EG')}
              </div>
              {o > 0 && <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>ج.م</div>}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
            مبلغ مخصص
          </div>
          <div style={{ position: 'relative' }}>
            <input dir="ltr" className="dl-input dl-input--lg" inputMode="numeric"
              placeholder="٢٥" value={custom}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g, '');
                setCustom(v); setTip(parseInt(v, 10) || 0);
              }}
              style={{ paddingInlineEnd: 50 }}/>
            <span style={{ position: 'absolute', insetInlineEnd: 14, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--ink-light)', fontSize: 13 }}>ج.م</span>
          </div>
        </div>

        {tip > 0 && (
          <div className="dl-fade-up" style={{ marginTop: 18, fontSize: 13, color: 'var(--ink-light)',
            background: 'rgba(31,74,61,0.06)', padding: '12px 14px', borderRadius: 10,
            display: 'flex', gap: 10 }}>
            <Icon.heart size={16}/>
            <span>هتدّي محمود <strong style={{ color: 'var(--olive)' }}>{tip.toLocaleString('ar-EG')} ج.م</strong> إكرامية. شكراً ليك.</span>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => {
          app.setTip(tip);
          if (tip > 0) app.showToast('شكراً — اتسجّلت الإكرامية', <Icon.heart size={16}/>);
          nav.pop();
        }}>
          {tip > 0 ? `تأكيد · ${tip.toLocaleString('ar-EG')} ج.م` : 'تخطي'}
        </Button>
      </div>
    </div>
  );
}

// ── Wallet Payment ───────────────────────────────────────────────
function WalletPayScreen() {
  const nav = useNav();
  const app = useApp();
  const [loading, setLoading] = useStCE(false);

  const subtotal = app.cart.reduce((s, i) => s + i.qty * i.price, 0);
  const total = subtotal + 10 + (app.tip || 0);
  const enough = app.walletBalance >= total;

  return (
    <div className="dl-screen">
      <AppBar title="الدفع من المحفظة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Wallet card */}
        <div className="dl-fade-up" style={{
          height: 180, borderRadius: 16, padding: 20,
          background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
          color: 'var(--canvas)', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ position:'absolute', top: -50, insetInlineEnd: -30, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(232,177,79,0.16)' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position: 'relative' }}>
            <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)' }}>محفظة دلنجاتُو</div>
            <Icon.wallet size={22}/>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 36, fontWeight: 700 }}>
              {app.walletBalance.toLocaleString('ar-EG')} <span style={{ fontSize: 16, color: 'rgba(250,248,243,0.7)', fontWeight: 500 }}>ج.م</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(250,248,243,0.6)', marginTop: 4 }}>الرصيد المتاح</div>
          </div>
        </div>

        {/* Summary */}
        <div className="dl-card" style={{ padding: '14px 16px', marginTop: 16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding: '4px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>إجمالي الطلب</span>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{total.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding: '4px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>هيتخصم من المحفظة</span>
            <span style={{ fontSize: 14, color: 'var(--olive)', fontWeight: 700 }}>− {total.toLocaleString('ar-EG')} ج.م</span>
          </div>
          <hr className="dl-divider" style={{ margin: '8px 0' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding: '4px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>الرصيد بعد الدفع</span>
            <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>
              {(app.walletBalance - total).toLocaleString('ar-EG')} ج.م
            </span>
          </div>
        </div>

        {!enough && (
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(197,59,44,0.08)',
            borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon.info size={16}/>
            <div style={{ flex: 1, fontSize: 13, color: '#A1271C', lineHeight: 1.5 }}>
              الرصيد مش كافي لتغطية الطلب. اشحن المحفظة الأول أو اختار طريقة دفع تانية.
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="secondary" full onClick={() => nav.push('wallet')}
            leading={<Icon.plus size={16}/>}>
            اشحن المحفظة
          </Button>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!enough || loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              app.setWalletBalance(app.walletBalance - total);
              nav.replace('orderSuccess');
            }, 1100);
          }}>
          {loading
            ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={20}/></span>
            : `ادفع ${total.toLocaleString('ar-EG')} ج.م`}
        </Button>
      </div>
    </div>
  );
}

// ── Delivery Notes ───────────────────────────────────────────────
function DeliveryNotesScreen() {
  const nav = useNav();
  const app = useApp();
  const [note, setNote] = useStCE(app.deliveryNote || '');
  const presets = [
    'اتصل بيا قبل ما توصل',
    'سيب الطلب عند البواب',
    'العمارة بيضا، الدور التالت',
    'لو مش لاقي مدخل، خد الجراج',
    'تليفون البيت مش شغّال — كلم الموبايل',
  ];
  return (
    <div className="dl-screen">
      <AppBar title="ملاحظة للكابتن" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '8px 18px 24px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55,
          display:'flex', gap: 10 }}>
          <Icon.info size={14}/>
          <span>أي ملاحظة هتكتبها هتظهر للكابتن وقت التوصيل.</span>
        </div>

        <div style={{ marginTop: 14 }}>
          <textarea autoFocus value={note} onChange={e => setNote(e.target.value)}
            placeholder="مثلاً: العمارة بيضا، الدور التاني"
            style={{ width:'100%', minHeight: 140, padding: 14, fontFamily:'var(--font-arabic)',
              borderRadius: 12, border: '1.5px solid var(--canvas-300)', background:'#fff',
              resize:'none', outline:'none', fontSize: 15, color: 'var(--ink)', boxSizing: 'border-box', lineHeight: 1.55 }}/>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'left', marginTop: 4 }}>
            {note.length.toLocaleString('ar-EG')} / ٢٠٠
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', margin: '18px 0 10px' }}>
          ملاحظات جاهزة
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {presets.map(p => (
            <Chip key={p} onClick={() => setNote(p)}>{p}</Chip>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => { app.setDeliveryNote(note); nav.pop(); }}>
          حفظ الملاحظة
        </Button>
      </div>
    </div>
  );
}

// ── Map Pin Selection ────────────────────────────────────────────
function MapPinScreen() {
  const nav = useNav();
  const [pos, setPos] = useStCE({ x: 180, y: 110 }); // center pin
  const [dragging, setDragging] = useStCE(false);
  const [zoom, setZoom] = useStCE(1);
  const mapRef = useRfCE(null);

  const onPointerDown = () => setDragging(true);
  const onPointerUp = () => setDragging(false);
  const onPointerMove = (e) => {
    if (!dragging || !mapRef.current) return;
    const r = mapRef.current.getBoundingClientRect();
    setPos({ x: Math.max(20, Math.min(r.width - 20, e.clientX - r.left)),
             y: Math.max(20, Math.min(r.height - 20, e.clientY - r.top)) });
  };

  return (
    <div className="dl-screen">
      <AppBar title="حدد على الخريطة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 0 24px', display: 'flex', flexDirection: 'column' }}>
        <div ref={mapRef}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setDragging(false)}
          style={{ height: 360, margin: '0 18px', borderRadius: 14, overflow: 'hidden',
            background: 'linear-gradient(120deg, #E8E2D2 0%, #DDD4BE 100%)',
            position: 'relative', border: '1px solid var(--canvas-300)',
            cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}>
          <svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice"
            style={{ position:'absolute', inset: 0, width: '100%', height: '100%', transform: `scale(${zoom})`,
              transition: 'transform 200ms var(--ease-out)' }}>
            <g stroke="#FAF8F3" strokeWidth="14" fill="none" opacity="0.9">
              <path d="M -10 50 L 380 80"/>
              <path d="M -10 180 L 380 170"/>
              <path d="M 120 -10 L 90 250"/>
              <path d="M 260 -10 L 290 250"/>
            </g>
            <g stroke="#FAF8F3" strokeWidth="5" fill="none" opacity="0.6">
              <path d="M -10 110 L 380 130"/>
              <path d="M 200 -10 L 220 250"/>
            </g>
          </svg>

          {/* Draggable pin */}
          <div onPointerDown={onPointerDown} onPointerUp={onPointerUp}
            style={{ position: 'absolute', insetInlineStart: pos.x, top: pos.y, transform: 'translate(-50%, -100%)',
              transition: dragging ? 'none' : 'transform 220ms var(--ease-out)',
              cursor: 'grab', filter: 'drop-shadow(0 6px 8px rgba(15,26,23,0.18))' }}>
            <svg width="44" height="56" viewBox="0 0 44 56">
              <path d="M22 0C12.06 0 4 8.06 4 18c0 14 18 38 18 38s18-24 18-38c0-9.94-8.06-18-18-18z" fill="#1F4A3D"/>
              <circle cx="22" cy="18" r="7" fill="#FAF8F3"/>
            </svg>
          </div>

          {/* Zoom controls */}
          <div style={{ position: 'absolute', insetInlineEnd: 12, top: 12, display: 'flex', flexDirection: 'column', gap: 4,
            background: '#fff', borderRadius: 10, padding: 4, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.2))}
              style={{ all:'unset', cursor:'pointer', width: 32, height: 32, display:'flex',
                alignItems:'center', justifyContent:'center', color: 'var(--ink)' }}><Icon.plus size={16}/></button>
            <hr className="dl-divider"/>
            <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
              style={{ all:'unset', cursor:'pointer', width: 32, height: 32, display:'flex',
                alignItems:'center', justifyContent:'center', color: 'var(--ink)' }}><Icon.minus size={16}/></button>
          </div>

          {/* Recenter */}
          <button onClick={() => { setPos({ x: 180, y: 110 }); setZoom(1); }}
            style={{ position: 'absolute', insetInlineEnd: 12, bottom: 12,
              width: 44, height: 44, borderRadius: 100, background: '#fff', border: 0, cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.14)', color: 'var(--olive)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.navigation size={18}/>
          </button>
        </div>

        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            العنوان المكتشف
          </div>
          <div className="dl-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems:'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
              color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.pin size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>شارع الجلاء</div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>بجوار صيدلية مصر · الدلنجات</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 18px 0', display: 'flex', gap: 10, fontSize: 12, color: 'var(--ink-light)' }}>
          <Icon.info size={14}/>
          <span>حرّك الدبوس على المكان بالظبط — هيساعد الكابتن يلاقيك أسرع.</span>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => nav.replace('addressSetup')}>
          أكّد المكان
        </Button>
      </div>
    </div>
  );
}

registerScreen('merchantConflict', MerchantConflictScreen);
registerScreen('promoCode', PromoCodeScreen);
registerScreen('scheduledDelivery', ScheduledDeliveryScreen);
registerScreen('tipDriver', TipDriverScreen);
registerScreen('walletPay', WalletPayScreen);
registerScreen('deliveryNotes', DeliveryNotesScreen);
registerScreen('mapPin', MapPinScreen);
