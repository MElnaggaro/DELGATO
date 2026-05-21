// Onboarding.jsx — splash + value props + start CTA
const { useState: useStateOnb } = React;

function Onboarding({ onContinue }) {
  return (
    <div className="dl-screen" style={{ background: 'var(--canvas)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px 28px 28px' }}>

        {/* Hero — logo + Arabic display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', marginTop: 36 }}>
          <div style={{
            width: 88, height: 88, background: 'var(--olive)',
            borderRadius: '22%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--canvas)', fontFamily: 'var(--font-arabic)', fontWeight: 700,
            fontSize: 60, lineHeight: 1, boxShadow: '0 8px 24px rgba(15,26,23,0.18)'
          }}>د</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 44, color: 'var(--olive)', lineHeight: 1.1 }}>
              دلنجاتُو
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink-light)', letterSpacing: '0.18em' }}>
              DELNGATO
            </div>
          </div>

          <p style={{
            fontFamily: 'var(--font-arabic)', fontWeight: 500, fontSize: 20,
            color: 'var(--ink)', textAlign: 'center', lineHeight: 1.45, margin: 0,
            maxWidth: 300, textWrap: 'balance',
          }}>
            اطلب من محلات الدلنجات.<br/>
            <span style={{ color: 'var(--ink-light)', fontWeight: 400 }}>
              تلاقي طلبك عندك في دقايق — بدون مكالمة.
            </span>
          </p>
        </div>

        {/* Three value rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBlock: 12 }}>
          {[
            { icon: <Icon.bag size={22} />, t: 'محلات حقيقية من بلدك', s: 'بقالة، صيدلية، أكل، حلويات — كلها في مكان واحد.' },
            { icon: <Icon.bike size={22} />, t: 'توصيل في دقايق', s: 'تتبع طلبك لحد ما يوصل لباب البيت.' },
            { icon: <Icon.card size={22} />, t: 'ادفع كاش أو من الأبلكيشن', s: 'اختار اللي يريحك. بدون رسوم خفية.' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(31,74,61,0.08)', color: 'var(--olive)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{r.t}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 2 }}>{r.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="primary" full onClick={onContinue}>ابدأ دلوقتي</Button>
          <Button variant="ghost" full onClick={onContinue}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-light)' }}>عندي حساب — تسجيل الدخول</span>
          </Button>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 4 }}>
            بالاستمرار، أنت موافق على <span style={{ color: 'var(--olive)' }}>شروط الاستخدام</span> و<span style={{ color: 'var(--olive)' }}>سياسة الخصوصية</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
