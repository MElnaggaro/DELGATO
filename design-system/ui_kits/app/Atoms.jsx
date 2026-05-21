// Atoms.jsx — Delngato design-system primitives shared across screens.
// All Arabic-first. Compose into screens; do not duplicate styling.

const { useState, useRef, useEffect } = React;

// ── Top app bar with optional back chevron and trailing slot ─────────
function AppBar({ title, onBack, trailing, transparent = false }) {
  return (
    <div className={`dl-appbar ${transparent ? '' : ''}`}>
      {onBack && (
        <button onClick={onBack} aria-label="رجوع"
          style={{ background: 'transparent', border: 0, padding: 6, cursor: 'pointer', color: 'var(--ink)', display:'flex' }}>
          {/* Chevron points right in RTL — visually mirrored */}
          <Icon.chevronRight size={24} />
        </button>
      )}
      <div className="dl-appbar__title">{title}</div>
      {trailing}
    </div>
  );
}

// ── Bottom tab bar — one source of truth ─────────────────────────────
function BottomTabBar({ active, onTab, cartCount = 0 }) {
  const tabs = [
    { key: 'home', label: 'الرئيسية', Icon: Icon.home },
    { key: 'search', label: 'بحث', Icon: Icon.search },
    { key: 'cart', label: 'السلة', Icon: Icon.cart, badge: cartCount },
    { key: 'profile', label: 'حسابي', Icon: Icon.user },
  ];
  return (
    <nav className="dl-tabbar" role="tablist">
      {tabs.map(t => (
        <button key={t.key} className="dl-tab"
          data-active={active === t.key}
          onClick={() => onTab && onTab(t.key)}>
          <div style={{ position: 'relative' }}>
            <t.Icon size={22} />
            {t.badge > 0 && (
              <span style={{
                position: 'absolute', top: -4, insetInlineStart: -8,
                background: 'var(--gold)', color: 'var(--ink)',
                fontSize: 10, fontWeight: 700, borderRadius: 100,
                padding: '1px 6px', minWidth: 16, textAlign: 'center'
              }}>{t.badge}</span>
            )}
          </div>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────
function Button({ variant = 'primary', full, children, ...rest }) {
  const cls = `dl-btn dl-btn--${variant}${full ? ' dl-btn--full' : ''}`;
  return <button className={cls} {...rest}>{children}</button>;
}

// ── Badge / status pill ──────────────────────────────────────────────
function Badge({ variant = 'active', children }) {
  return <span className={`dl-badge dl-badge--${variant}`}>{children}</span>;
}

// ── Category chip ────────────────────────────────────────────────────
function Chip({ active, children, onClick }) {
  return (
    <button className={`dl-chip${active ? ' dl-chip--active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ── Shop card (list item) ────────────────────────────────────────────
function ShopCard({ shop, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer', display: 'flex', borderRadius: 12,
        background: '#fff', boxShadow: '0 1px 2px rgba(15,26,23,.04), 0 4px 12px rgba(15,26,23,.04)',
        overflow: 'hidden', width: '100%', boxSizing: 'border-box',
      }}>
      <div style={{
        width: 84, minWidth: 84, background: shop.bg || 'linear-gradient(135deg,#1F4A3D 0%,#173629 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--canvas)', fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 36,
      }}>{shop.letter}</div>
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shop.name}
          </div>
          <Badge variant={shop.open ? 'active' : 'issue'}>{shop.open ? 'مفتوح' : 'مغلق'}</Badge>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{shop.cat} · {shop.distance}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-light)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ color: 'var(--gold)', display:'inline-flex' }}><Icon.star size={13} /></span>
            {shop.rating}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.clock size={13} />{shop.eta}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-light)' }}>توصيل {shop.fee}</span>
        </div>
      </div>
    </button>
  );
}

// ── Quantity stepper ─────────────────────────────────────────────────
function Stepper({ value, onChange, min = 0, compact = false }) {
  const size = compact ? 28 : 36;
  const btn = {
    width: size, height: size, borderRadius: 8, border: 0, cursor: 'pointer',
    background: 'var(--olive)', color: 'var(--canvas)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const btnAlt = { ...btn, background: 'var(--canvas-200)', color: 'var(--olive)' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button style={value <= min ? { ...btnAlt, opacity: 0.5, cursor: 'not-allowed' } : btnAlt}
        onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Icon.minus size={compact ? 14 : 16} />
      </button>
      <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 600,
        fontFamily: 'var(--font-arabic)', fontSize: compact ? 14 : 16 }}>
        {value.toLocaleString('ar-EG')}
      </span>
      <button style={btn} onClick={() => onChange(value + 1)}>
        <Icon.plus size={compact ? 14 : 16} />
      </button>
    </div>
  );
}

// ── Order progress stepper ───────────────────────────────────────────
function OrderProgress({ step }) {
  const steps = ['تم الاستلام', 'يتم التحضير', 'في الطريق', 'تم التوصيل'];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {steps.map((_, i) => {
          const done = i < step;
          const cur = i === step;
          return (
            <React.Fragment key={i}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: done ? 'var(--olive)' : (cur ? '#fff' : 'var(--canvas-200)'),
                border: cur ? '2px solid var(--olive)' : 0,
                color: done ? 'var(--canvas)' : 'var(--olive)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, flexShrink: 0,
              }}>{done ? <Icon.check size={14} /> : (cur ? <span className="dl-live-dot" style={{ width: 8, height: 8 }} /> : '')}</div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--olive)' : 'var(--canvas-300)' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: 'var(--ink-light)', fontWeight: 500 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            color: i === step ? 'var(--olive)' : (i < step ? 'var(--ink)' : 'var(--ink-mute)'),
            fontWeight: i === step ? 700 : 500, flex: 1, textAlign: 'center'
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

// ── Search field (with magnifier glyph) ──────────────────────────────
function SearchField({ value, onChange, placeholder = 'ابحث عن محل أو منتج' }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <span style={{
        position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--ink-mute)', display: 'flex'
      }}><Icon.search size={18} /></span>
      <input className="dl-input" value={value} onChange={onChange}
        placeholder={placeholder}
        style={{ paddingInlineStart: 40, background: 'var(--canvas-200)', border: '1.5px solid transparent' }}/>
    </div>
  );
}

Object.assign(window, {
  AppBar, BottomTabBar, Button, Badge, Chip, ShopCard,
  Stepper, OrderProgress, SearchField,
});
