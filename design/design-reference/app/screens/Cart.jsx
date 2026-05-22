// screens/Cart.jsx — Cart, Checkout, Payment (card), OrderSuccess, Tracking
const { useState: useStC, useEffect: useEfC, useRef: useRfC } = React;

// ─── Cart ─────────────────────────────────────────────────────────
function CartScreen() {
  const nav = useNav();
  const app = useApp();
  const [confirm, setConfirm] = useStC(null); // {id, name}

  if (app.cart.length === 0) {
    return (
      <div className="dl-screen">
        <AppBar title="السلة" onBack={() => nav.pop()}/>
        <EmptyState
          icon={<Icon.bag size={32}/>}
          title="السلة فاضية"
          body="ابدأ تطلب من محلات الدلنجات — بقالة، صيدلية، أكل وأكتر."
          action={<Button variant="primary" onClick={() => nav.reset('home')}>تصفّح المحلات</Button>}/>
      </div>
    );
  }

  const subtotal = app.cart.reduce((s, i) => s + i.qty * i.price, 0);
  const shopName = app.cart[0]?.shop || 'محل';

  const tryRemove = (item) => {
    if (item.qty === 0) return;
    setConfirm({ id: item.id, name: item.name });
  };

  return (
    <div className="dl-screen">
      <AppBar title="السلة" onBack={() => nav.pop()}/>

      <div className="dl-scroll" style={{ paddingBottom: 12 }}>
        {/* Shop strip */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ background: 'var(--canvas-200)', borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 100, background: 'var(--olive)',
              color: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18 }}>{shopName[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>تطلب من</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{shopName}</div>
            </div>
            <Badge variant="active">١٥–٢٠ د</Badge>
          </div>
        </div>

        {/* Items list */}
        <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {app.cart.map((item, i) => (
            <div key={item.id} className="dl-rise" style={{ animationDelay: `${i * 50}ms`,
              background: '#fff', borderRadius: 12, padding: 10, border: '1px solid var(--canvas-300)',
              display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: item.hue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 32,
                color: 'rgba(15,26,23,0.18)', flexShrink: 0 }}>{item.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{item.sub}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive)', marginTop: 4 }}>
                  {(item.qty * item.price).toLocaleString('ar-EG')} ج.م
                </div>
              </div>
              <div style={{ display:'flex', flexDirection: 'column', alignItems:'flex-end', gap: 4 }}>
                <Stepper compact value={item.qty} onChange={(n) => {
                  if (n === 0) tryRemove(item); else app.setItemQty(item.id, n);
                }} min={0} />
                <button onClick={() => tryRemove(item)} aria-label="حذف"
                  style={{ background:'transparent', border: 0, color: 'var(--ink-mute)', cursor:'pointer', display:'flex', padding: 4 }}>
                  <Icon.trash size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add more (gentle nudge) */}
        <div style={{ padding: '0 18px 14px' }}>
          <button onClick={() => nav.pop()} className="dl-tappable"
            style={{ all:'unset', cursor:'pointer', width: '100%',
              background: '#fff', border: '1.5px dashed var(--canvas-300)',
              borderRadius: 12, padding: '14px',
              display:'flex', alignItems:'center', justifyContent:'center', gap: 8,
              color: 'var(--olive)', fontFamily:'var(--font-arabic)', fontSize: 14, fontWeight: 600 }}>
            <Icon.plus size={18}/>أضف منتج تاني من {shopName}
          </button>
        </div>

        {/* Promo */}
        <div style={{ padding: '0 18px 14px' }}>
          <div className="dl-card" style={{ padding: '12px 14px', display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,177,79,0.18)',
              color: '#8a6418', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.tag size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>كود خصم</div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>عندك كود؟ استخدمه دلوقتي.</div>
            </div>
            <button style={{ all:'unset', cursor:'pointer', color: 'var(--olive)', fontSize: 13, fontWeight: 600 }}>
              إضافة
            </button>
          </div>
        </div>

        {/* Totals summary */}
        <div style={{ padding: '4px 18px 20px' }}>
          <div className="dl-card" style={{ padding: '14px 16px' }}>
            <Row label="إجمالي المنتجات" value={`${subtotal.toLocaleString('ar-EG')} ج.م`} />
            <Row label="رسوم التوصيل" value="١٠ ج.م" />
            <hr className="dl-divider" style={{ margin: '10px 0' }} />
            <Row label="الإجمالي" value={`${(subtotal + 10).toLocaleString('ar-EG')} ج.م`} bold />
          </div>
        </div>
      </div>

      {/* Sticky checkout bar */}
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full onClick={() => nav.push('checkout')}
          trailing={<span style={{ opacity: 0.7, fontSize: 13, fontWeight: 500 }}>
            · {(subtotal + 10).toLocaleString('ar-EG')} ج.م</span>}>
          متابعة للدفع
        </Button>
      </div>

      {confirm && (
        <ConfirmDialog
          title="نمسحه من السلة؟"
          body={`هتمسح "${confirm.name}" من السلة.`}
          confirm="مسح" cancel="رجوع" destructive
          onConfirm={() => { app.setItemQty(confirm.id, 0); setConfirm(null); }}
          onCancel={() => setConfirm(null)}/>
      )}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <span style={{ fontSize: bold ? 15 : 13, color: bold ? 'var(--ink)' : 'var(--ink-light)',
        fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 18 : 14, color: 'var(--ink)', fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────
function CheckoutScreen() {
  const nav = useNav();
  const app = useApp();
  const [pay, setPay] = useStC('cash');
  const [timing, setTiming] = useStC('asap');
  const [placing, setPlacing] = useStC(false);

  const subtotal = app.cart.reduce((s, i) => s + i.qty * i.price, 0);
  const delivery = 10;
  const total = subtotal + delivery;

  const placeOrder = () => {
    if (pay === 'card') { nav.push('payment'); return; }
    if (pay === 'wallet') { nav.push('walletPay'); return; }
    setPlacing(true);
    setTimeout(() => { nav.replace('orderSuccess'); }, 1000);
  };

  return (
    <div className="dl-screen">
      <AppBar title="مراجعة الطلب" onBack={() => nav.pop()}/>
      <div className="dl-scroll">
        {/* Address */}
        <Section label="عنوان التوصيل">
          <div className="dl-card dl-tappable" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', cursor:'pointer' }}
            onClick={() => nav.push('addresses')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
              color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.pin size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                {app.selectedAddress.label} · {app.selectedAddress.street}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{app.selectedAddress.detail}</div>
            </div>
            <Icon.chevronLeft size={18}/>
          </div>
        </Section>

        {/* Delivery time */}
        <Section label="وقت التوصيل">
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { k: 'asap', t: 'في أقرب وقت', s: '١٥–٢٠ د' },
              { k: 'sched', t: 'جدول وقت', s: app.scheduled ? `${app.scheduled.slot}` : 'اختر' },
            ].map(o => (
              <button key={o.k} onClick={() => {
                setTiming(o.k);
                if (o.k === 'sched') nav.push('scheduledDelivery');
              }}
                style={{
                  flex: 1, border: 0, cursor: 'pointer',
                  background: timing === o.k ? 'var(--olive)' : '#fff',
                  color: timing === o.k ? 'var(--canvas)' : 'var(--ink)',
                  borderRadius: 12, padding: '14px 12px',
                  display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start',
                  borderWidth: timing === o.k ? 0 : '1px',
                  borderStyle: 'solid', borderColor: 'var(--canvas-300)',
                  fontFamily: 'var(--font-arabic)',
                }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{o.t}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{o.s}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* Delivery note */}
        <Section label="ملاحظة للكابتن">
          <div className="dl-card dl-tappable" style={{ padding: '12px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => nav.push('deliveryNotes')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
              color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.message size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                {app.deliveryNote || 'ضيف ملاحظة للكابتن'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                {app.deliveryNote ? 'اضغط للتعديل' : 'مثلاً: اتصل قبل ما توصل'}
              </div>
            </div>
            <Icon.chevronLeft size={18}/>
          </div>
        </Section>

        {/* Promo code */}
        <Section label="كود الخصم">
          <div className="dl-card dl-tappable" style={{ padding: '12px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => nav.push('promoCode')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,177,79,0.18)',
              color: '#8a6418', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.tag size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              {app.appliedPromo ? (
                <>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--olive)' }}>
                    {app.appliedPromo.title} · {app.appliedPromo.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }} className="mono">
                    كود {app.appliedPromo.code}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                    عندك كود خصم؟
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>اضغط للإضافة</div>
                </>
              )}
            </div>
            {app.appliedPromo && (
              <button onClick={(e) => { e.stopPropagation(); app.setAppliedPromo(null); }}
                style={{ background:'transparent', border: 0, color: 'var(--ink-mute)', cursor:'pointer',
                  display:'flex', padding: 4 }}>
                <Icon.x size={16}/>
              </button>
            )}
            {!app.appliedPromo && <Icon.chevronLeft size={18}/>}
          </div>
        </Section>

        {/* Tip driver */}
        <Section label="إكرامية الكابتن">
          <div className="dl-card dl-tappable" style={{ padding: '12px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => nav.push('tipDriver')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
              color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.heart size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                {app.tip > 0 ? `${app.tip.toLocaleString('ar-EG')} ج.م إكرامية` : 'بلاش إكرامية'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                {app.tip > 0 ? 'هتروح للكابتن ١٠٠٪' : 'الإكرامية اختيارية وبتروح للكابتن'}
              </div>
            </div>
            <Icon.chevronLeft size={18}/>
          </div>
        </Section>

        {/* Payment */}
        <Section label="طريقة الدفع">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { k: 'cash', l: 'كاش عند الاستلام', s: 'ادفع للكابتن لما يوصل', icon: <Icon.cash size={20}/> },
              { k: 'card', l: 'بطاقة بنكية', s: 'فيزا · ماستركارد · ميزة', icon: <Icon.card size={20}/> },
              { k: 'wallet', l: `محفظة دلنجاتُو · ${app.walletBalance.toLocaleString('ar-EG')} ج.م`, s: 'كاش باك ١٠٪', icon: <Icon.wallet size={20}/> },
            ].map(o => (
              <button key={o.k} onClick={() => !o.disabled && setPay(o.k)} disabled={o.disabled}
                style={{ all:'unset', cursor: o.disabled ? 'not-allowed' : 'pointer',
                  background: '#fff', borderRadius: 12,
                  border: `1.5px solid ${pay === o.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center',
                  opacity: o.disabled ? 0.5 : 1, transition: 'all 150ms var(--ease-out)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10,
                  background: pay === o.k ? 'var(--olive)' : 'var(--canvas-200)',
                  color: pay === o.k ? 'var(--canvas)' : 'var(--olive)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>{o.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{o.l}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{o.s}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 100, border: `2px solid ${pay === o.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {pay === o.k && <div style={{ width: 10, height: 10, borderRadius: 100, background: 'var(--olive)' }}/>}
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Order summary */}
        <Section label="ملخص الطلب">
          <div className="dl-card" style={{ padding: '12px 16px' }}>
            {app.cart.map((it, i) => (
              <div key={it.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: i < app.cart.length - 1 ? '1px solid var(--canvas-300)' : 0,
              }}>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{it.qty.toLocaleString('ar-EG')}× </span>
                  {it.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>
                  {(it.qty * it.price).toLocaleString('ar-EG')} ج.م
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--canvas-300)' }}>
              <Row label="إجمالي المنتجات" value={`${subtotal.toLocaleString('ar-EG')} ج.م`} />
              <Row label="رسوم التوصيل" value={`${delivery.toLocaleString('ar-EG')} ج.م`} />
              <Row label="الإجمالي" value={`${total.toLocaleString('ar-EG')} ج.م`} bold/>
            </div>
          </div>
        </Section>

        {/* Privacy reassurance */}
        <div style={{ padding: '0 18px 24px', display:'flex', gap: 10, fontSize: 12, color: 'var(--ink-light)' }}>
          <Icon.shieldCheck size={16}/>
          <span style={{ lineHeight: 1.5 }}>طلبك مؤمَّن. لو حصل أي مشكلة، بنحلها معاك.</span>
        </div>
      </div>

      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={placing} onClick={placeOrder}
          trailing={!placing && <span style={{ opacity: 0.7, fontSize: 13, fontWeight: 500 }}>· {total.toLocaleString('ar-EG')} ج.م</span>}>
          {placing
            ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={20}/></span>
            : (pay === 'card' ? 'متابعة للدفع' : 'تأكيد الطلب')}
        </Button>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '14px 18px 0' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ─── Payment (card) ───────────────────────────────────────────────
function PaymentScreen() {
  const nav = useNav();
  const [num, setNum] = useStC('');
  const [name, setName] = useStC('');
  const [exp, setExp] = useStC('');
  const [cvv, setCvv] = useStC('');
  const [loading, setLoading] = useStC(false);
  const valid = num.replace(/\s/g, '').length >= 16 && name.length >= 3 && exp.length >= 5 && cvv.length >= 3;

  const fmtNum = (s) => s.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (s) => {
    const v = s.replace(/[^0-9]/g, '');
    return v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2, 4) : v;
  };

  return (
    <div className="dl-screen">
      <AppBar title="إضافة بطاقة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px' }}>
        {/* Card visual */}
        <div className="dl-fade-up" style={{
          height: 200, borderRadius: 16, padding: 20,
          background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
          color: 'var(--canvas)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top: -40, insetInlineEnd: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(232,177,79,0.18)' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ width: 38, height: 28, borderRadius: 4, background: 'var(--gold)' }}/>
            <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.18em', fontWeight: 700, fontSize: 14, color: 'var(--gold)' }}>DELNGATO</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 19, letterSpacing: '0.18em' }} dir="ltr">
            {fmtNum(num).padEnd(19, '•').replace(/•{4}/g, '•••• ').trim()}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.06em', marginBottom: 2 }}>اسم حامل البطاقة</div>
              <div style={{ color: 'var(--canvas)', fontSize: 13, fontFamily: 'var(--font-arabic)', fontWeight: 600 }}>
                {name || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.06em', marginBottom: 2 }}>الصلاحية</div>
              <div className="mono" style={{ color: 'var(--canvas)', fontSize: 13 }}>{exp || '••/••'}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 0 24px' }}>
          <FieldLbl label="رقم البطاقة">
            <input dir="ltr" className="dl-input" placeholder="1234 5678 9012 3456" inputMode="numeric"
              value={num} onChange={e => setNum(fmtNum(e.target.value).slice(0, 19))}
              style={{ textAlign: 'left', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}/>
          </FieldLbl>
          <FieldLbl label="اسم حامل البطاقة">
            <input className="dl-input" placeholder="مثلاً: أحمد محمد"
              value={name} onChange={e => setName(e.target.value)} />
          </FieldLbl>
          <div style={{ display:'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <FieldLbl label="الصلاحية (شهر/سنة)">
                <input dir="ltr" className="dl-input" placeholder="MM/YY" inputMode="numeric"
                  value={exp} onChange={e => setExp(fmtExp(e.target.value).slice(0, 5))}
                  style={{ textAlign: 'left', fontFamily: 'var(--font-mono)' }}/>
              </FieldLbl>
            </div>
            <div style={{ width: 110 }}>
              <FieldLbl label="CVV">
                <input dir="ltr" className="dl-input" placeholder="•••" inputMode="numeric"
                  value={cvv} onChange={e => setCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  style={{ textAlign: 'left', fontFamily: 'var(--font-mono)' }}/>
              </FieldLbl>
            </div>
          </div>

          <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-light)', marginTop: 4 }}>
            <Icon.shieldCheck size={16}/>
            <span>الدفع مؤمَّن بتشفير ٢٥٦-بت. بياناتك مش بنحفظها.</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!valid || loading} onClick={() => {
          setLoading(true);
          setTimeout(() => nav.replace('orderSuccess'), 1100);
        }}>
          {loading
            ? <span className="dl-spin" style={{ display:'inline-flex' }}><Icon.refresh size={20}/></span>
            : 'ادفع دلوقتي'}
        </Button>
      </div>
    </div>
  );
}

function FieldLbl({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Order Success ────────────────────────────────────────────────
function OrderSuccessScreen() {
  const nav = useNav();
  const app = useApp();
  const orderId = 'DLN-٢٠٤٧';

  useEfC(() => {
    // Inject the new order into state, clear cart
    app.clearCart();
    if (!app.orders.find(o => o.id === orderId)) {
      app.setOrders(prev => [{
        id: orderId, shop: 'سوبر ماركت أبو حسن', shopLetter: 'أ',
        status: 'live', statusText: 'يتم التحضير', date: 'دلوقتي',
        total: 187, items: 3, step: 1,
      }, ...prev]);
    }
  }, []);

  return (
    <div className="dl-screen">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 28px', alignItems: 'center' }}>
        <div style={{ flex: 1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap: 22 }}>
          <div className="dl-success-ring">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path className="dl-check-path" d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div className="dl-fade-up" style={{ animationDelay: '380ms', textAlign:'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)' }}>تم استلام طلبك</div>
            <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.6 }}>
              بيتجهزلك دلوقتي. هنخبرك على طول لما الكابتن يطلع.
            </div>
          </div>
          <div className="dl-fade-up" style={{ animationDelay: '520ms', background: 'var(--canvas-200)', borderRadius: 12, padding: '12px 18px',
            display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon.receipt size={18}/>
            <span style={{ fontSize: 13, color: 'var(--ink)' }}>رقم الطلب</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>{orderId}</span>
          </div>
          <div className="dl-fade-up" style={{ animationDelay: '640ms', display:'flex', gap: 10, fontSize: 13, color: 'var(--ink-light)' }}>
            <Icon.clock size={16}/>
            <span>توصيل متوقع <span style={{ color: 'var(--ink)', fontWeight: 600 }}>بعد ٢٠ دقيقة تقريباً</span></span>
          </div>
        </div>

        <div className="dl-fade-up" style={{ animationDelay: '760ms', width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" size="lg" full onClick={() => nav.replace('tracking', { orderId })}>
            تتبع طلبك
          </Button>
          <Button variant="ghost" full onClick={() => nav.reset('home')}>
            رجوع للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Tracking ─────────────────────────────────────────────────────
function TrackingScreen({ orderId = 'DLN-٢٠٤٧' }) {
  const nav = useNav();
  const app = useApp();
  const [step, setStep] = useStC(1);
  useEfC(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep(s => Math.min(3, s + 1)), 5000);
    return () => clearTimeout(t);
  }, [step]);

  const etaTime = ['بعد ٢٠ دقيقة', 'بعد ١٥ دقيقة', 'بعد ٧ دقايق', 'تم التوصيل'];
  const statusHead = ['تم استلام طلبك', 'بنحضّر طلبك دلوقتي', 'الكابتن في الطريق', 'وصل! استمتع'];

  return (
    <div className="dl-screen">
      <AppBar title="طلبك" onBack={() => nav.pop()}
        trailing={<button style={{ background:'transparent', border: 0, padding: 6, color: 'var(--ink)', cursor:'pointer', display:'flex' }}>
          <Icon.share size={22}/>
        </button>}/>

      <div className="dl-scroll">
        {/* Map */}
        <div style={{ height: 240, margin: '0 18px', borderRadius: 14, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(120deg, #E8E2D2 0%, #DDD4BE 100%)', border: '1px solid var(--canvas-300)' }}>
          <svg viewBox="0 0 360 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <g stroke="#FAF8F3" strokeWidth="14" fill="none" opacity="0.9">
              <path d="M -10 50 L 380 80"/>
              <path d="M -10 180 L 380 170"/>
              <path d="M 120 -10 L 90 250"/>
              <path d="M 260 -10 L 290 250"/>
            </g>
            <g stroke="#F2EEE3" strokeWidth="4" fill="none" strokeDasharray="6 6">
              <path d="M 60 220 C 90 160, 200 110, 300 40" pathLength="100"
                strokeDashoffset="0"/>
            </g>
            {/* destination pin */}
            <g transform="translate(60 220)">
              <circle r="11" fill="#FAF8F3"/>
              <circle r="9" fill="#1F4A3D"/>
              <circle r="3" fill="#FAF8F3"/>
            </g>
            {/* shop origin */}
            <g transform="translate(300 40)">
              <circle r="11" fill="#FAF8F3"/>
              <circle r="9" fill="#E8B14F"/>
              <text textAnchor="middle" y="3" fontSize="10" fontWeight="700" fill="#0F1A17" fontFamily="IBM Plex Sans Arabic">أ</text>
            </g>
            {/* courier marker (moves along the path) */}
            {(() => {
              // Position along path at t=step/3 from origin → destination
              // We approximate with cubic Bezier midpoints.
              const t = Math.max(0.05, Math.min(0.95, [0.15, 0.4, 0.7, 0.95][step]));
              // Cubic Bezier P0=(300,40), P1=(200,110), P2=(90,160), P3=(60,220)
              const bx = (1-t)**3*300 + 3*(1-t)**2*t*200 + 3*(1-t)*t*t*90 + t**3*60;
              const by = (1-t)**3*40  + 3*(1-t)**2*t*110 + 3*(1-t)*t*t*160 + t**3*220;
              return (
                <g transform={`translate(${bx} ${by})`} style={{ transition: 'transform 1200ms var(--ease-out)' }}>
                  <circle r="22" fill="rgba(31,74,61,0.16)"/>
                  <circle r="14" fill="#1F4A3D" stroke="#FAF8F3" strokeWidth="3"/>
                </g>
              );
            })()}
          </svg>
          <div style={{ position: 'absolute', top: 10, insetInlineStart: 10, background: 'rgba(250,248,243,0.92)',
            backdropFilter: 'blur(12px)', borderRadius: 100, padding: '6px 12px', fontSize: 12,
            color: 'var(--ink)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="dl-live-dot"/> مباشر
          </div>
        </div>

        {/* ETA + progress */}
        <div style={{ padding: '16px 18px 14px' }}>
          <div className="dl-card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>{statusHead[step]}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--olive)', marginTop: 2 }}>{etaTime[step]}</div>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{orderId}</div>
            </div>
            <OrderProgress step={step} />
          </div>
        </div>

        {/* Courier card */}
        {step >= 2 && step < 3 && (
          <div style={{ padding: '0 18px 14px' }}>
            <div className="dl-card dl-fade-up" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 100, background: 'var(--olive)',
                color: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 22 }}>م</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>الكابتن</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>محمود السيد</div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>موتوسيكل · لوحة ٢١٣٤ د ل</div>
              </div>
              <button style={{ width: 44, height: 44, borderRadius: 100, border: '1.5px solid var(--olive)',
                background: '#fff', color: 'var(--olive)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.phone size={20} />
              </button>
              <button onClick={() => nav.push('chat', { kind: 'driver', name: 'محمود السيد', avatar: 'م' })}
                style={{ width: 44, height: 44, borderRadius: 100, border: '1.5px solid var(--olive)',
                background: 'var(--olive)', color: 'var(--canvas)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.message size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Order details */}
        <div style={{ padding: '0 18px 24px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            تفاصيل الطلب
          </div>
          <div className="dl-card" style={{ padding: '12px 16px' }}>
            {[
              { name: 'لبن جهينة', qty: 2, price: 64 },
              { name: 'بيض بلدي', qty: 1, price: 145 },
              { name: 'خبز فينو', qty: 3, price: 36 },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--canvas-300)' : 0, fontSize: 14 }}>
                <div style={{ color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{it.qty.toLocaleString('ar-EG')}× </span>
                  {it.name}
                </div>
                <div style={{ color: 'var(--ink)', fontWeight: 600 }}>{it.price.toLocaleString('ar-EG')} ج.م</div>
              </div>
            ))}
          </div>
        </div>

        {step === 3 && (
          <div style={{ padding: '0 18px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="primary" full onClick={() => nav.reset('home')}>تم — شكراً لاستخدامك دلنجاتُو</Button>
            <Button variant="ghost" full onClick={() => nav.push('rate')}>قيّم تجربتك</Button>
          </div>
        )}

        {step < 2 && (
          <div style={{ padding: '0 18px 28px' }}>
            <Button variant="ghost" full style={{ color: '#A1271C' }}
              leading={<Icon.x size={16}/>}
              onClick={() => nav.push('cancelOrder', { order: { id: orderId } })}>
              إلغاء الطلب
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

registerScreen('cart', CartScreen);
registerScreen('checkout', CheckoutScreen);
registerScreen('payment', PaymentScreen);
registerScreen('orderSuccess', OrderSuccessScreen);
registerScreen('tracking', TrackingScreen);
