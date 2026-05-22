// screens/OrdersExtras.jsx — Chat (with driver/merchant), CancelOrder, RefundRequest, Invoice
const { useState: useStOE, useEffect: useEfOE, useRef: useRfOE } = React;

// ── Chat ──────────────────────────────────────────────────────────
function ChatScreen({ kind = 'driver', name = 'محمود السيد', avatar = 'م' }) {
  const nav = useNav();
  const app = useApp();
  const [text, setText] = useStOE('');
  const [typing, setTyping] = useStOE(false);
  const listRef = useRfOE(null);
  const role = kind === 'merchant' ? 'المحل' : 'الكابتن';

  useEfOE(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [app.chat, typing]);

  const send = (t) => {
    const msg = (t || text).trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    app.setChat(prev => [...prev, { id: 'c' + Date.now(), from: 'me', text: msg, time }]);
    setText('');
    // Simulate other party reply
    setTyping(true);
    setTimeout(() => {
      const reply = kind === 'merchant'
        ? 'تمام، بنحضّر الطلب دلوقتي.'
        : 'تمام، أنا في الطريق، استنّى دقيقتين.';
      app.setChat(prev => [...prev, { id: 'c' + Date.now() + 1, from: kind, text: reply, time }]);
      setTyping(false);
    }, 1600);
  };

  return (
    <div className="dl-screen">
      <div className="dl-appbar">
        <button onClick={() => nav.pop()} aria-label="رجوع"
          style={{ background:'transparent', border: 0, padding: 6, cursor:'pointer', color:'var(--ink)', display:'flex' }}>
          <Icon.chevronRight size={24}/>
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 100, background: 'var(--olive)',
          color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{name}</div>
          <div style={{ fontSize: 11, color: 'var(--olive)', display:'flex', alignItems:'center', gap: 5, marginTop: 2 }}>
            <span className="dl-live-dot" style={{ width: 6, height: 6 }}/> {role} متصل دلوقتي
          </div>
        </div>
        <button style={{ background:'transparent', border: 0, padding: 6, cursor:'pointer', color: 'var(--olive)', display:'flex' }}>
          <Icon.phone size={22}/>
        </button>
      </div>

      <div ref={listRef} className="dl-scroll" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'center', background: 'var(--canvas-200)', borderRadius: 100,
          padding: '4px 12px', fontSize: 11, color: 'var(--ink-light)' }}>
          الطلب DLN-٢٠٤٧ · دلوقتي
        </div>
        {app.chat.map(m => (
          <div key={m.id} className="dl-fade-up" style={{
            alignSelf: m.from === 'me' ? 'flex-start' : 'flex-end',
            background: m.from === 'me' ? 'var(--olive)' : '#fff',
            color: m.from === 'me' ? 'var(--canvas)' : 'var(--ink)',
            border: m.from === 'me' ? 0 : '1px solid var(--canvas-300)',
            maxWidth: '78%', padding: '10px 14px', borderRadius: 14,
            borderBottomLeftRadius: m.from === 'me' ? 14 : 4,
            borderBottomRightRadius: m.from === 'me' ? 4 : 14,
            fontSize: 14, lineHeight: 1.5,
          }}>
            <div>{m.text}</div>
            <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'left' }} className="mono">{m.time}</div>
          </div>
        ))}
        {typing && (
          <div className="dl-fade-up" style={{ alignSelf: 'flex-end',
            background: '#fff', border: '1px solid var(--canvas-300)',
            padding: '12px 14px', borderRadius: 14, borderBottomRightRadius: 4,
            display:'flex', gap: 4 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: 100, background: 'var(--ink-mute)',
                animation: `dl-bump 1s ${i * 0.15}s infinite` }}/>
            ))}
          </div>
        )}
      </div>

      {/* Quick replies */}
      <div style={{ padding: '6px 18px 8px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {CHAT_QUICK.map(q => (
          <Chip key={q} onClick={() => send(q)}>{q}</Chip>
        ))}
      </div>

      <div style={{ padding: '8px 14px 18px', display: 'flex', gap: 8, alignItems: 'flex-end',
        borderTop: '1px solid var(--canvas-300)', background: 'var(--canvas)' }}>
        <button style={{ width: 40, height: 40, borderRadius: 100, border: 0,
          background: 'var(--canvas-200)', color: 'var(--ink-light)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.plus size={20}/>
        </button>
        <textarea value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="اكتب رسالة…" rows={1}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 22, border: '1.5px solid var(--canvas-300)',
            background: '#fff', resize:'none', outline:'none', fontFamily: 'var(--font-arabic)',
            fontSize: 14, color: 'var(--ink)', maxHeight: 100, lineHeight: 1.4 }}/>
        <button onClick={() => send()} disabled={!text.trim()}
          style={{ width: 40, height: 40, borderRadius: 100, border: 0,
            background: text.trim() ? 'var(--olive)' : 'var(--canvas-300)',
            color: 'var(--canvas)', cursor: text.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 150ms var(--ease-out)' }}>
          <Icon.arrowLeft size={20}/>
        </button>
      </div>
    </div>
  );
}

// ── Contact Merchant ─────────────────────────────────────────────
function ContactMerchantScreen({ shop }) {
  const nav = useNav();
  const merchantName = shop?.name || 'سوبر ماركت أبو حسن';
  return (
    <div className="dl-screen">
      <AppBar title="تواصل مع المحل" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '8px 18px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow-card)',
          display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 100, background: 'var(--olive)',
            color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 26 }}>{shop?.letter || 'أ'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{merchantName}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4 }}>{shop?.cat || 'بقالة'} · مفتوح دلوقتي</div>
          </div>
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ContactCard icon={<Icon.message size={20}/>} title="شات مع المحل" sub="رد في دقايق · أسرع طريقة"
            onClick={() => nav.push('chat', { kind: 'merchant', name: merchantName, avatar: shop?.letter || 'أ' })}/>
          <ContactCard icon={<Icon.phone size={20}/>} title="اتصل بالمحل" sub="٠١٠ ٢٣٤ ٥٦٧٨"/>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            أسباب التواصل
          </div>
          <div style={{ display:'flex', flexDirection: 'column', gap: 8 }}>
            {['استفسار عن منتج', 'تعديل على الطلب', 'مشكلة في الفاتورة', 'سؤال عن وقت التوصيل'].map(r => (
              <button key={r} className="dl-tappable"
                style={{ all:'unset', cursor:'pointer', padding: '14px 16px', background: '#fff',
                  borderRadius: 10, border: '1px solid var(--canvas-300)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                <span>{r}</span>
                <Icon.chevronLeft size={18}/>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="dl-tappable"
      style={{ all:'unset', cursor:'pointer',
        padding: '14px 16px', background: '#fff', borderRadius: 12,
        boxShadow: 'var(--shadow-card)', display:'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
        color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{sub}</div>
      </div>
      <Icon.chevronLeft size={18}/>
    </button>
  );
}

// ── Cancel Order ─────────────────────────────────────────────────
function CancelOrderScreen({ order }) {
  const nav = useNav();
  const app = useApp();
  const reasons = [
    'غلطت في الطلب',
    'هطلب من محل تاني',
    'التوصيل بياخد وقت طويل',
    'تغيرت ظروفي',
    'سبب تاني',
  ];
  const [reason, setReason] = useStOE(reasons[0]);
  const [detail, setDetail] = useStOE('');
  const [confirm, setConfirm] = useStOE(false);

  return (
    <div className="dl-screen">
      <AppBar title="إلغاء الطلب" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-fade-up" style={{ padding: '14px 16px', background: 'rgba(232,177,79,0.10)',
          borderRadius: 12, marginBottom: 16, display: 'flex', gap: 10, alignItems:'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,177,79,0.30)',
            color: '#8a6418', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
            <Icon.info size={16}/>
          </div>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>
            <strong>قبل ما تلغي:</strong> لو الكابتن استلم الطلب، ممكن نحوّل لإلغاء جزئي وتدفع رسوم بسيطة لتعويض الكابتن.
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          سبب الإلغاء
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reasons.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{ all:'unset', cursor:'pointer', padding: '14px 16px', background: '#fff',
                borderRadius: 10, border: `1.5px solid ${reason === r ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 150ms var(--ease-out)' }}>
              <div style={{ width: 20, height: 20, borderRadius: 100,
                border: `2px solid ${reason === r ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {reason === r && <div style={{ width: 10, height: 10, borderRadius: 100, background: 'var(--olive)' }}/>}
              </div>
              <span style={{ fontSize: 14, color: 'var(--ink)' }}>{r}</span>
            </button>
          ))}
        </div>

        {reason === 'سبب تاني' && (
          <div className="dl-fade-up" style={{ marginTop: 14 }}>
            <textarea value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="اكتب السبب بالتفصيل" rows={3}
              style={{ width:'100%', padding: 12, fontFamily:'var(--font-arabic)',
                borderRadius: 10, border: '1.5px solid var(--canvas-300)', background:'#fff',
                resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box' }}/>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)',
        display: 'flex', gap: 10 }}>
        <Button variant="ghost" full onClick={() => nav.pop()}>رجوع</Button>
        <Button variant="primary" full onClick={() => setConfirm(true)}
          style={{ background: '#C53B2C' }}>
          أكّد الإلغاء
        </Button>
      </div>
      {confirm && (
        <ConfirmDialog
          title="متأكد من إلغاء الطلب؟"
          body="مش هتقدر ترجع في القرار. الطلب هيتلغي على طول."
          confirm="إلغاء الطلب" cancel="تراجع" destructive
          onConfirm={() => {
            setConfirm(false);
            app.setOrders(prev => prev.map(o => o.id === order?.id ? { ...o, status: 'cancelled', statusText: 'متلغي', step: 0 } : o));
            app.showToast('اتلغى الطلب', <Icon.x size={16}/>);
            nav.reset('orders');
          }}
          onCancel={() => setConfirm(false)}/>
      )}
    </div>
  );
}

// ── Refund Request ───────────────────────────────────────────────
function RefundScreen({ order }) {
  const nav = useNav();
  const app = useApp();
  const [reason, setReason] = useStOE('');
  const [items, setItems] = useStOE([]);
  const [photos, setPhotos] = useStOE([]);
  const [submitted, setSubmitted] = useStOE(false);
  const list = [
    { name: 'لبن جهينة', qty: 2, price: 64 },
    { name: 'بيض بلدي', qty: 1, price: 145 },
    { name: 'خبز فينو', qty: 3, price: 36 },
  ];
  const toggleItem = (n) => setItems(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  const refundTotal = list.filter(it => items.includes(it.name)).reduce((s, it) => s + it.price, 0);

  if (submitted) {
    return (
      <div className="dl-screen">
        <div style={{ flex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center', gap: 22 }}>
          <div className="dl-success-ring">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path className="dl-check-path" d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div className="dl-fade-up" style={{ animationDelay: '380ms', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>وصلنا طلب الاسترجاع</div>
            <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 10, lineHeight: 1.6, maxWidth: 280 }}>
              فريقنا هيراجع الطلب ويرد عليك خلال ٢٤ ساعة. لو اتقبل، الفلوس هترجع على نفس طريقة الدفع.
            </div>
          </div>
          <div className="dl-fade-up" style={{ animationDelay: '520ms', background: 'var(--canvas-200)',
            borderRadius: 10, padding: '12px 16px', display:'flex', gap: 10, alignItems:'center' }}>
            <Icon.receipt size={16}/>
            <span style={{ fontSize: 13, color: 'var(--ink)' }}>رقم البلاغ</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>RFD-٤٠٧٢</span>
          </div>
          <div style={{ width: '100%' }}>
            <Button variant="primary" full onClick={() => nav.reset('orders')}>تم</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dl-screen">
      <AppBar title="طلب استرجاع" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          المنتجات اللي عايز ترجعها
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map(it => {
            const sel = items.includes(it.name);
            return (
              <button key={it.name} onClick={() => toggleItem(it.name)}
                style={{ all:'unset', cursor:'pointer',
                  background: '#fff', borderRadius: 12,
                  border: `1.5px solid ${sel ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center',
                  transition: 'all 150ms var(--ease-out)' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6,
                  border: `1.5px solid ${sel ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  background: sel ? 'var(--olive)' : '#fff',
                  color: 'var(--canvas)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {sel && <Icon.check size={14}/>}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--olive)' }}>{it.qty.toLocaleString('ar-EG')}× </span>{it.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{it.price.toLocaleString('ar-EG')} ج.م</div>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', margin: '20px 0 10px' }}>
          سبب الاسترجاع
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['منتج تالف', 'منتج ناقص', 'منتج غلط', 'منتج منتهي الصلاحية', 'تغليف ضعيف'].map(r => (
            <Chip key={r} active={reason === r} onClick={() => setReason(r)}>{r}</Chip>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', margin: '20px 0 10px' }}>
          صور توضّح المشكلة <span style={{ fontWeight: 500, color: 'var(--ink-light)' }}>(اختياري)</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <button key={i} onClick={() => setPhotos(p => [...p, i].slice(0, 3))}
              style={{ all:'unset', cursor:'pointer', width: 80, height: 80, borderRadius: 10,
                background: photos.includes(i) ? 'var(--canvas-200)' : '#fff',
                border: '1.5px dashed var(--canvas-300)',
                display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--ink-light)' }}>
              {photos.includes(i)
                ? <Icon.check size={20} className=""/>
                : <Icon.plus size={20}/>}
            </button>
          ))}
        </div>

        {items.length > 0 && (
          <div className="dl-fade-up" style={{ marginTop: 22, padding: '14px 16px', background: 'rgba(31,74,61,0.06)',
            borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13, color: 'var(--ink-light)' }}>مبلغ الاسترجاع المتوقع</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--olive)' }}>
              {refundTotal.toLocaleString('ar-EG')} <span style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={items.length === 0 || !reason}
          onClick={() => setSubmitted(true)}>
          إرسال الطلب
        </Button>
      </div>
    </div>
  );
}

// ── Invoice ──────────────────────────────────────────────────────
function InvoiceScreen({ order }) {
  const nav = useNav();
  const app = useApp();
  const o = order || app.orders[0];
  const items = [
    { name: 'لبن جهينة', qty: 2, price: 32 },
    { name: 'بيض بلدي', qty: 1, price: 145 },
    { name: 'خبز فينو', qty: 3, price: 12 },
  ];
  const sub = items.reduce((s, i) => s + i.qty * i.price, 0);
  const fee = 10;
  const tax = Math.round(sub * 0.05);
  const total = sub + fee + tax;
  return (
    <div className="dl-screen">
      <AppBar title="الفاتورة" onBack={() => nav.pop()}
        trailing={<button style={{ background:'transparent', border: 0, padding: 6, color: 'var(--olive)',
          fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 600, cursor:'pointer',
          display: 'flex', gap: 4, alignItems: 'center' }}>
          <Icon.download size={16}/> حفظ
        </button>}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-card" style={{ padding: 20 }}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            paddingBottom: 16, borderBottom: '1px solid var(--canvas-300)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 22, color: 'var(--olive)' }}>دلنجاتُو</div>
              <div style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.18em',
                fontSize: 9, color: 'var(--ink-mute)', marginTop: 2 }}>DELNGATO</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <Badge variant="active">مدفوع</Badge>
              <div className="mono" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, marginTop: 6 }}>{o?.id || 'DLN-٢٠٤٧'}</div>
            </div>
          </div>

          {/* Meta */}
          <div style={{ padding: '14px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>تاريخ الفاتورة</div>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>الأحد · ٣٠ يونيو ٢٠٢٦</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>المحل</div>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>{o?.shop || 'سوبر ماركت أبو حسن'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>العميل</div>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>أحمد محمد</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>طريقة الدفع</div>
              <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>كاش</div>
            </div>
          </div>

          {/* Items table */}
          <div style={{ borderTop: '1px solid var(--canvas-300)', paddingTop: 12 }}>
            <div style={{ display:'grid', gridTemplateColumns: '1fr 50px 80px', gap: 8,
              fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600, paddingBottom: 6, borderBottom: '1px solid var(--canvas-300)' }}>
              <div>المنتج</div>
              <div style={{ textAlign: 'center' }}>الكمية</div>
              <div style={{ textAlign: 'left' }}>السعر</div>
            </div>
            {items.map((it, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns: '1fr 50px 80px', gap: 8,
                fontSize: 13, padding: '10px 0', borderBottom: '1px solid var(--canvas-300)' }}>
                <div style={{ color: 'var(--ink)' }}>{it.name}</div>
                <div style={{ textAlign: 'center', color: 'var(--ink-light)' }} className="mono">{it.qty.toLocaleString('ar-EG')}</div>
                <div style={{ textAlign: 'left', color: 'var(--ink)', fontWeight: 600 }}>{(it.qty * it.price).toLocaleString('ar-EG')} ج.م</div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ paddingTop: 12 }}>
            <InvRow label="إجمالي المنتجات" value={`${sub.toLocaleString('ar-EG')} ج.م`}/>
            <InvRow label="رسوم التوصيل" value={`${fee.toLocaleString('ar-EG')} ج.م`}/>
            <InvRow label="ضريبة القيمة المضافة (٥٪)" value={`${tax.toLocaleString('ar-EG')} ج.م`}/>
            <hr className="dl-divider" style={{ margin: '10px 0' }}/>
            <InvRow label="الإجمالي" value={`${total.toLocaleString('ar-EG')} ج.م`} bold/>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--canvas-300)',
            fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', lineHeight: 1.6 }}>
            شكراً لاستخدامك دلنجاتُو · من الدلنجات · لأهل الدلنجات<br/>
            للاستفسار: <span className="mono">support@delngato.app</span>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="secondary" full leading={<Icon.share size={16}/>}>مشاركة الفاتورة</Button>
          <Button variant="ghost" full onClick={() => nav.push('refund', { order: o })}
            leading={<Icon.refresh size={16}/>}>طلب استرجاع لطلب</Button>
        </div>
      </div>
    </div>
  );
}

function InvRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ fontSize: bold ? 14 : 12.5, color: bold ? 'var(--ink)' : 'var(--ink-light)',
        fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 17 : 13, color: 'var(--ink)', fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  );
}

registerScreen('chat', ChatScreen);
registerScreen('contactMerchant', ContactMerchantScreen);
registerScreen('cancelOrder', CancelOrderScreen);
registerScreen('refund', RefundScreen);
registerScreen('invoice', InvoiceScreen);
