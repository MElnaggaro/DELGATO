// Cart.jsx — review items, address, payment, totals, checkout
const { useState: useStateC } = React;

function Cart({ cart, setCart, onBack, onCheckout }) {
  const [pay, setPay] = useStateC('cash');

  if (cart.length === 0) {
    return (
      <div className="dl-screen">
        <AppBar title="السلة" onBack={onBack}/>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: 14, padding: 32,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 100, background: 'var(--canvas-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive)',
          }}><Icon.bag size={32} /></div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>السلة فاضية</div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', textAlign: 'center', maxWidth: 240 }}>
            ابدأ تطلب من محلات الدلنجات — بقالة، صيدلية، أكل وأكتر.
          </div>
          <Button variant="primary" onClick={onBack}>تصفح المحلات</Button>
        </div>
      </div>
    );
  }

  const setQty = (id, qty) => {
    setCart(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const delivery = 10;
  const total = subtotal + delivery;
  const shopName = cart[0]?.shop || 'محل';

  return (
    <div className="dl-screen">
      <AppBar title="السلة" onBack={onBack}/>

      <div className="dl-scroll" style={{ paddingBottom: 12 }}>
        {/* Shop strip */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{
            background: 'var(--canvas-200)', borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 100, background: 'var(--olive)',
              color: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18,
            }}>{shopName[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>تطلب من</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{shopName}</div>
            </div>
            <Badge variant="active">١٥–٢٠ د</Badge>
          </div>
        </div>

        {/* Items list */}
        <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cart.map(item => (
            <div key={item.id} style={{
              background: '#fff', borderRadius: 12, padding: 10,
              border: '1px solid var(--canvas-300)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 10, background: item.hue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 32,
                color: 'rgba(15,26,23,0.18)', flexShrink: 0,
              }}>{item.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{item.sub}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--olive)', marginTop: 4 }}>
                  {(item.qty * item.price).toLocaleString('ar-EG')} ج.م
                </div>
              </div>
              <Stepper compact value={item.qty} onChange={(n) => setQty(item.id, n)} min={0} />
            </div>
          ))}
        </div>

        {/* Address */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            عنوان التوصيل
          </div>
          <div className="dl-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
              color: 'var(--olive)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon.pin size={18} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>البيت · شارع الجلاء</div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>بجوار صيدلية مصر · الدلنجات</div>
            </div>
            <button style={{
              all: 'unset', cursor: 'pointer', color: 'var(--olive)',
              fontSize: 13, fontWeight: 600,
            }}>تغيير</button>
          </div>
        </div>

        {/* Payment */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            طريقة الدفع
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'cash', label: 'كاش عند الاستلام', icon: <Icon.cash size={18} /> },
              { key: 'card', label: 'بطاقة', icon: <Icon.card size={18} /> },
            ].map(p => (
              <button key={p.key} onClick={() => setPay(p.key)}
                style={{
                  flex: 1, border: 0, cursor: 'pointer',
                  background: pay === p.key ? 'var(--olive)' : '#fff',
                  color: pay === p.key ? 'var(--canvas)' : 'var(--ink)',
                  borderRadius: 12, padding: '14px 12px',
                  display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start',
                  borderWidth: pay === p.key ? 0 : '1px',
                  borderStyle: 'solid', borderColor: 'var(--canvas-300)',
                  fontFamily: 'var(--font-arabic)',
                }}>
                {p.icon}
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div style={{ padding: '4px 18px 20px' }}>
          <div className="dl-card" style={{ padding: '14px 16px' }}>
            <Row label="إجمالي المنتجات" value={`${subtotal.toLocaleString('ar-EG')} ج.م`} />
            <Row label="رسوم التوصيل" value={`${delivery.toLocaleString('ar-EG')} ج.م`} />
            <hr className="dl-divider" style={{ margin: '10px 0' }} />
            <Row label="الإجمالي" value={`${total.toLocaleString('ar-EG')} ج.م`} bold />
          </div>
        </div>
      </div>

      {/* Sticky checkout bar */}
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" full onClick={onCheckout}>
          <span>تأكيد الطلب</span>
          <span style={{ opacity: 0.7, fontSize: 13, fontWeight: 500, marginInlineStart: 8 }}>· {total.toLocaleString('ar-EG')} ج.م</span>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <span style={{
        fontSize: bold ? 15 : 13, color: bold ? 'var(--ink)' : 'var(--ink-light)',
        fontWeight: bold ? 700 : 500,
      }}>{label}</span>
      <span style={{
        fontSize: bold ? 18 : 14, color: 'var(--ink)', fontWeight: bold ? 700 : 600,
      }}>{value}</span>
    </div>
  );
}

window.Cart = Cart;
