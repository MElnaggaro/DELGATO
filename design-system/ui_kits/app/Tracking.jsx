// Tracking.jsx — live order tracking screen with map placeholder + ETA
const { useState: useStateT, useEffect: useEffectT } = React;

function Tracking({ orderId = 'DLN-٢٠٤٧', onBack, onDone }) {
  // Auto-progress through steps for demo
  const [step, setStep] = useStateT(2); // 0..3
  useEffectT(() => {
    const t = setTimeout(() => setStep(s => Math.min(3, s + 1)), 6000);
    return () => clearTimeout(t);
  }, [step]);

  const etaLabels = ['تم استلام طلبك', 'بنحضّر طلبك دلوقتي', 'الكابتن في الطريق', 'تم التوصيل'];
  const etaTime = ['بعد ٢٠ دقيقة', 'بعد ١٥ دقيقة', 'بعد ٧ دقايق', 'استمتع'];

  return (
    <div className="dl-screen">
      <AppBar title="طلبك" onBack={onBack}/>

      <div className="dl-scroll">
        {/* Map placeholder */}
        <div style={{
          height: 220, margin: '0 18px',
          borderRadius: 14, overflow: 'hidden', position: 'relative',
          background: `
            linear-gradient(120deg, #E8E2D2 0%, #DDD4BE 100%)
          `,
          border: '1px solid var(--canvas-300)',
        }}>
          {/* Stylized streets */}
          <svg viewBox="0 0 360 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <g stroke="#FAF8F3" strokeWidth="14" fill="none" opacity="0.9">
              <path d="M -10 50 L 380 80"/>
              <path d="M -10 160 L 380 150"/>
              <path d="M 120 -10 L 90 230"/>
              <path d="M 260 -10 L 290 230"/>
            </g>
            <g stroke="#F2EEE3" strokeWidth="4" fill="none" strokeDasharray="6 6">
              <path d="M 60 200 C 90 140, 200 100, 300 40" />
            </g>
            {/* destination pin */}
            <g transform="translate(60 200)">
              <circle r="9" fill="#1F4A3D"/>
              <circle r="3" fill="#FAF8F3"/>
            </g>
            {/* courier marker */}
            <g transform="translate(220 92)">
              <circle r="18" fill="rgba(31,74,61,0.18)"/>
              <circle r="12" fill="#1F4A3D" stroke="#FAF8F3" strokeWidth="3"/>
            </g>
          </svg>
          <div style={{
            position: 'absolute', top: 10, insetInlineStart: 10,
            background: 'rgba(250,248,243,0.92)', backdropFilter: 'blur(12px)',
            borderRadius: 100, padding: '6px 12px', fontSize: 12,
            color: 'var(--ink)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="dl-live-dot"/> مباشر
          </div>
        </div>

        {/* ETA card */}
        <div style={{ padding: '16px 18px 14px' }}>
          <div className="dl-card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>الوقت المتوقع</div>
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
            <div className="dl-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 100,
                background: 'var(--olive)', color: 'var(--canvas)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 22,
              }}>م</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>الكابتن</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>محمود السيد</div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>موتوسيكل · لوحة ٢١٣٤ د ل</div>
              </div>
              <button style={{
                width: 44, height: 44, borderRadius: 100, border: '1.5px solid var(--olive)',
                background: '#fff', color: 'var(--olive)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Icon.phone size={20} /></button>
            </div>
          </div>
        )}

        {/* Items summary */}
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
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < 2 ? '1px solid var(--canvas-300)' : 0,
                fontSize: 14,
              }}>
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
          <div style={{ padding: '0 18px 28px' }}>
            <Button variant="primary" full onClick={onDone}>تم — شكراً لاستخدامك دلنجاتُو</Button>
          </div>
        )}
      </div>
    </div>
  );
}

window.Tracking = Tracking;
