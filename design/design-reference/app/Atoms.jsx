// Atoms.jsx — Shared primitives for Delngato app. Compose into screens.

const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

// ─── Top app bar ──────────────────────────────────────────────────
function AppBar({ title, onBack, trailing, subtitle, onScroll }) {
  return (
    <div className="dl-appbar">
      {onBack && (
        <button onClick={onBack} aria-label="رجوع"
          style={{ background: 'transparent', border: 0, padding: 6, cursor: 'pointer', color: 'var(--ink)', display:'flex' }}>
          <Icon.chevronRight size={24} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dl-appbar__title" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {trailing}
    </div>
  );
}

// ─── Bottom tabs ──────────────────────────────────────────────────
function BottomTabBar({ active, onTab, cartCount = 0 }) {
  const tabs = [
    { key: 'home', label: 'الرئيسية', Icon: Icon.home },
    { key: 'search', label: 'بحث', Icon: Icon.search },
    { key: 'orders', label: 'طلباتي', Icon: Icon.receipt },
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
            {t.key === 'orders' && cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, insetInlineStart: -8,
                background: 'var(--gold)', color: 'var(--ink)',
                fontSize: 10, fontWeight: 700, borderRadius: 100,
                padding: '1px 6px', minWidth: 16, textAlign: 'center'
              }}>{cartCount}</span>
            )}
          </div>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────
function Button({ variant = 'primary', full, size, children, leading, trailing, ...rest }) {
  const cls = `dl-btn dl-btn--${variant}${full ? ' dl-btn--full' : ''}${size === 'lg' ? ' dl-btn--lg' : ''}`;
  return (
    <button className={cls} {...rest}>
      {leading}
      <span>{children}</span>
      {trailing}
    </button>
  );
}

// ─── Badge / chip ─────────────────────────────────────────────────
function Badge({ variant = 'active', children }) {
  return <span className={`dl-badge dl-badge--${variant}`}>{children}</span>;
}
function Chip({ active, children, onClick, icon }) {
  return (
    <button className={`dl-chip${active ? ' dl-chip--active' : ''}`} onClick={onClick}>
      {icon}{children}
    </button>
  );
}

// ─── Shop card ────────────────────────────────────────────────────
function ShopCard({ shop, onClick, compact = false }) {
  return (
    <button onClick={onClick} className="dl-item"
      style={{
        all: 'unset', cursor: 'pointer', display: 'flex', borderRadius: 12,
        background: '#fff', boxShadow: 'var(--shadow-card)',
        overflow: 'hidden', width: '100%', boxSizing: 'border-box',
        opacity: shop.open ? 1 : 0.78,
      }}>
      <div style={{
        width: compact ? 64 : 84, minWidth: compact ? 64 : 84,
        background: shop.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--canvas)', fontFamily: 'var(--font-arabic)', fontWeight: 700,
        fontSize: compact ? 28 : 36, position: 'relative',
      }}>
        <span style={{ position:'absolute', fontSize: compact ? 64 : 96, color: 'rgba(250,248,243,0.10)', fontWeight: 700, top: -6, insetInlineEnd: 4 }}>{shop.letter}</span>
        <span style={{ position:'relative' }}>{shop.letter}</span>
      </div>
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

// ─── Quantity stepper (animated count bump) ───────────────────────
function Stepper({ value, onChange, min = 0, compact = false }) {
  const size = compact ? 28 : 36;
  const [bump, setBump] = useState(0);
  const numRef = useRef(null);
  useEffect(() => {
    if (numRef.current && bump > 0) {
      numRef.current.classList.remove('dl-bump');
      // restart animation
      void numRef.current.offsetWidth;
      numRef.current.classList.add('dl-bump');
    }
  }, [bump]);
  const change = (n) => { setBump(b => b+1); onChange(n); };
  const btn = {
    width: size, height: size, borderRadius: 8, border: 0, cursor: 'pointer',
    background: 'var(--olive)', color: 'var(--canvas)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 100ms var(--ease-out)',
  };
  const btnAlt = { ...btn, background: 'var(--canvas-200)', color: 'var(--olive)' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button style={value <= min ? { ...btnAlt, opacity: 0.5, cursor: 'not-allowed' } : btnAlt}
        onClick={() => change(Math.max(min, value - 1))} disabled={value <= min}
        onPointerDown={e => e.currentTarget.style.transform='scale(0.92)'}
        onPointerUp={e => e.currentTarget.style.transform=''}
        onPointerLeave={e => e.currentTarget.style.transform=''}>
        <Icon.minus size={compact ? 14 : 16} />
      </button>
      <span ref={numRef} style={{ display:'inline-block', minWidth: 22, textAlign: 'center', fontWeight: 600,
        fontFamily: 'var(--font-arabic)', fontSize: compact ? 14 : 16 }}>
        {value.toLocaleString('ar-EG')}
      </span>
      <button style={btn} onClick={() => change(value + 1)}
        onPointerDown={e => e.currentTarget.style.transform='scale(0.92)'}
        onPointerUp={e => e.currentTarget.style.transform=''}
        onPointerLeave={e => e.currentTarget.style.transform=''}>
        <Icon.plus size={compact ? 14 : 16} />
      </button>
    </div>
  );
}

// ─── Order progress stepper ───────────────────────────────────────
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
                transition: 'all 240ms var(--ease-out)',
              }}>{done ? <Icon.check size={14} /> : (cur ? <span className="dl-live-dot" style={{ width: 8, height: 8 }} /> : '')}</div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? 'var(--olive)' : 'var(--canvas-300)',
                  transition: 'background 320ms var(--ease-out)' }} />
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

// ─── Search field ─────────────────────────────────────────────────
function SearchField({ value, onChange, onFocus, placeholder = 'ابحث عن محل أو منتج', readOnly, autoFocus, onClear }) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <span style={{
        position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)',
        color: 'var(--ink-mute)', display: 'flex'
      }}><Icon.search size={18} /></span>
      <input className="dl-input" value={value} onChange={onChange}
        onFocus={onFocus} readOnly={readOnly} autoFocus={autoFocus}
        placeholder={placeholder}
        style={{ paddingInlineStart: 40, paddingInlineEnd: value ? 40 : 14, background: 'var(--canvas-200)', border: '1.5px solid transparent' }}/>
      {value && onClear && (
        <button onClick={onClear} aria-label="مسح"
          style={{ position:'absolute', insetInlineEnd: 8, top: '50%', transform:'translateY(-50%)',
                   background: 'var(--canvas-300)', border: 0, borderRadius: 100, width: 24, height: 24,
                   display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink)', cursor:'pointer' }}>
          <Icon.x size={14}/>
        </button>
      )}
    </div>
  );
}

// ─── Generic list row (used for settings/help/etc.) ───────────────
function ListRow({ icon, label, sub, value, trailing, onClick, danger }) {
  return (
    <div className="dl-row-tap" onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', cursor: onClick ? 'pointer' : 'default',
      }}>
      {icon && (
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: danger ? 'rgba(197,59,44,0.10)' : 'rgba(31,74,61,0.08)',
          color: danger ? '#A1271C' : 'var(--olive)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{icon}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? '#A1271C' : 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{sub}</div>}
      </div>
      {value && <div style={{ fontSize: 13, color: 'var(--ink-light)' }}>{value}</div>}
      {trailing !== undefined ? trailing : (onClick && <Icon.chevronLeft size={18} className="" />)}
    </div>
  );
}

// ─── Bottom sheet ─────────────────────────────────────────────────
function Sheet({ onClose, children, title, dismissOnScrim = true }) {
  return (
    <>
      <div className="dl-sheet-scrim" onClick={dismissOnScrim ? onClose : undefined}/>
      <div className="dl-sheet">
        <div className="dl-sheet__grip"/>
        {title && (
          <div style={{ padding: '12px 18px 4px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
            {onClose && (
              <button onClick={onClose} aria-label="إغلاق"
                style={{ background: 'var(--canvas-200)', border: 0, borderRadius: 100, width: 32, height: 32,
                  display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink)', cursor:'pointer' }}>
                <Icon.x size={16}/>
              </button>
            )}
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────────
function ConfirmDialog({ title, body, confirm = 'تأكيد', cancel = 'إلغاء', destructive, onConfirm, onCancel }) {
  return (
    <div className="dl-dialog-scrim" onClick={onCancel}>
      <div className="dl-dialog" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        {body && <div style={{ fontSize: 14, color: 'var(--ink-light)', marginTop: 8, lineHeight: 1.5 }}>{body}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onCancel}
            style={{ flex: 1, minHeight: 44, border: 0, background: 'var(--canvas-200)',
              borderRadius: 10, fontFamily: 'var(--font-arabic)', fontWeight: 600,
              color: 'var(--ink)', cursor: 'pointer' }}>{cancel}</button>
          <button onClick={onConfirm}
            style={{ flex: 1, minHeight: 44, border: 0,
              background: destructive ? '#C53B2C' : 'var(--olive)',
              color: 'var(--canvas)',
              borderRadius: 10, fontFamily: 'var(--font-arabic)', fontWeight: 600, cursor: 'pointer' }}>{confirm}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast (auto-dismiss) ────────────────────────────────────────
function Toast({ children, icon, onDone, ms = 2200 }) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), ms);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="dl-toast">
      {icon && <span style={{ color: 'var(--gold)', display:'flex' }}>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

// ─── Skeleton primitives ─────────────────────────────────────────
function Skel({ w, h = 12, r = 8, style }) {
  return <div className="dl-skel" style={{ width: w, height: h, borderRadius: r, ...style }}/>;
}
function ShopCardSkel() {
  return (
    <div style={{ display:'flex', gap: 0, background:'#fff', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div className="dl-skel" style={{ width: 84, height: 92, borderRadius: 0 }}/>
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skel w="60%" h={14}/>
        <Skel w="40%" h={11}/>
        <Skel w="70%" h={11}/>
      </div>
    </div>
  );
}

// ─── Offline banner ───────────────────────────────────────────────
function OfflineBanner() {
  return (
    <div className="dl-offline">
      <Icon.wifi_off size={14}/>
      <span>مفيش انترنت — هنوصلك أول ما يرجع.</span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────
function EmptyState({ icon, title, body, action }) {
  return (
    <div className="dl-empty">
      <div className="dl-empty__art">{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
      {body && <div style={{ fontSize: 14, color: 'var(--ink-light)', maxWidth: 260, lineHeight: 1.5 }}>{body}</div>}
      {action}
    </div>
  );
}

// ─── Mini cart bar (used in Shop) ─────────────────────────────────
function MiniCartBar({ count, total, shopName, onClick }) {
  return (
    <div className="dl-stick-in" style={{
      position: 'absolute', insetInline: 16, bottom: 16,
      background: 'var(--olive)', color: 'var(--canvas)', borderRadius: 14,
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 24px rgba(15,26,23,0.22)', cursor: 'pointer', zIndex: 5,
    }} onClick={onClick}>
      <div className="dl-pop" key={count} style={{
        background: 'var(--gold)', color: 'var(--ink)', width: 28, height: 28, borderRadius: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700,
      }}>{count.toLocaleString('ar-EG')}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>عرض السلة</div>
        <div style={{ fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>{shopName}</div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>
        {total.toLocaleString('ar-EG')} <span style={{ fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>ج.م</span>
      </div>
    </div>
  );
}

// ─── Logo mark (the "د" in olive circle) ─────────────────────────
function LogoMark({ size = 88 }) {
  return (
    <div style={{
      width: size, height: size, background: 'var(--olive)',
      borderRadius: '22%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--canvas)', fontFamily: 'var(--font-arabic)', fontWeight: 700,
      fontSize: size * 0.68, lineHeight: 1,
      boxShadow: '0 8px 24px rgba(15,26,23,0.18)',
    }}>د</div>
  );
}

Object.assign(window, {
  AppBar, BottomTabBar, Button, Badge, Chip, ShopCard,
  Stepper, OrderProgress, SearchField, ListRow,
  Sheet, ConfirmDialog, Toast, Skel, ShopCardSkel,
  OfflineBanner, EmptyState, MiniCartBar, LogoMark,
});
