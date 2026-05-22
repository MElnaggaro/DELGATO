// app/merchant/Atoms.jsx — Merchant-specific UI primitives
// Reuses customer Atoms (AppBar, Button, Badge, Chip, etc.); adds OrderCard, MetricTile, Sparkline, MBottomTabBar, StockBadge.

const { useState: useStMA, useEffect: useEfMA, useRef: useRfMA } = React;

// ── Bottom tab bar (4 tabs: dashboard, orders, products, more) ─────
function MBottomTabBar({ active, onTab, badgeOrders = 0 }) {
  const tabs = [
    { key: 'dashboard', label: 'لوحة القيادة', Icon: Icon.layers },
    { key: 'orders', label: 'الطلبات', Icon: Icon.receipt },
    { key: 'products', label: 'المنتجات', Icon: Icon.package },
    { key: 'more', label: 'المزيد', Icon: Icon.settings },
  ];
  return (
    <nav className="dl-tabbar" role="tablist">
      {tabs.map(t => (
        <button key={t.key} className="dl-tab"
          data-active={active === t.key}
          onClick={() => onTab && onTab(t.key)}>
          <div style={{ position: 'relative' }}>
            <t.Icon size={22} />
            {t.key === 'orders' && badgeOrders > 0 && (
              <span style={{
                position: 'absolute', top: -4, insetInlineStart: -8,
                background: 'var(--gold)', color: 'var(--ink)',
                fontSize: 10, fontWeight: 700, borderRadius: 100,
                padding: '1px 6px', minWidth: 16, textAlign: 'center'
              }}>{badgeOrders.toLocaleString('ar-EG')}</span>
            )}
          </div>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Metric tile (revenue, orders, etc.) ────────────────────────────
function MetricTile({ label, value, sub, accent = 'olive', delta, icon, onClick }) {
  const bg = accent === 'olive' ? 'rgba(31,74,61,0.06)'
           : accent === 'gold' ? 'rgba(232,177,79,0.10)'
           : accent === 'ink' ? 'var(--canvas-200)'
           : '#fff';
  const fg = accent === 'gold' ? '#8a6418' : 'var(--olive)';
  return (
    <div onClick={onClick} className={onClick ? 'dl-tappable' : ''}
      style={{
        background: '#fff', borderRadius: 14, padding: '14px 16px',
        boxShadow: 'var(--shadow-card)', cursor: onClick ? 'pointer' : 'default',
        display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, color: fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{sub}</div>}
      </div>
      {delta !== undefined && (
        <div style={{ display:'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
          color: delta > 0 ? 'var(--olive)' : delta < 0 ? '#A1271C' : 'var(--ink-light)' }}>
          {delta > 0 && <Icon.arrowUp size={12}/>}
          {delta < 0 && <Icon.arrowDown size={12}/>}
          <span>{delta > 0 ? '+' : ''}{delta}٪ من امبارح</span>
        </div>
      )}
    </div>
  );
}

// ── Order queue card ───────────────────────────────────────────────
function OrderCard({ order, onClick, onAccept, onReject, onPrepare, onReady, onHandover }) {
  const isNew = order.status === 'new';
  const isAccepted = order.status === 'accepted';
  const isPreparing = order.status === 'preparing';
  const isReady = order.status === 'ready';
  const isPicked = order.status === 'picked';

  const statusColor = isNew ? 'var(--gold)'
                    : isAccepted ? 'var(--olive)'
                    : isPreparing ? 'var(--olive)'
                    : isReady ? 'var(--olive)'
                    : 'var(--ink-light)';

  return (
    <div onClick={onClick} className="dl-tappable" style={{
      background: '#fff', borderRadius: 14, padding: 14,
      boxShadow: 'var(--shadow-card)', cursor: onClick ? 'pointer' : 'default',
      borderInlineStart: `3px solid ${statusColor}`,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap: 8 }}>
            <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{order.id}</span>
            {order.payment && (
              <span style={{ fontSize: 11, color: 'var(--ink-light)' }}>
                · {order.payment}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
            {order.customerName} · {order.placedAt}
          </div>
        </div>
        <OrderStatusBadge status={order.status}/>
      </div>

      {/* Items strip */}
      <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 12 }}>
        {order.items?.slice(0, 3).map((it, i) => (
          <span key={i} style={{ display: 'inline-block', marginInlineEnd: 10 }}>
            <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{it.qty.toLocaleString('ar-EG')}×</span>{' '}
            {it.name}
          </span>
        ))}
        {order.items?.length > 3 && (
          <span style={{ color: 'var(--ink-light)' }}>· +{(order.items.length - 3).toLocaleString('ar-EG')} منتج</span>
        )}
      </div>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        paddingTop: 10, borderTop: '1px solid var(--canvas-300)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
          {order.total.toLocaleString('ar-EG')} <span style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {isNew && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onReject?.(order); }}
                style={{ all:'unset', cursor:'pointer', padding: '8px 12px', borderRadius: 8,
                  background: '#fff', border: '1.5px solid var(--canvas-300)',
                  fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                رفض
              </button>
              <button onClick={(e) => { e.stopPropagation(); onAccept?.(order); }}
                style={{ all:'unset', cursor:'pointer', padding: '8px 14px', borderRadius: 8,
                  background: 'var(--olive)', color: 'var(--canvas)',
                  fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700 }}>
                قبول
              </button>
            </>
          )}
          {isAccepted && (
            <button onClick={(e) => { e.stopPropagation(); onPrepare?.(order); }}
              style={{ all:'unset', cursor:'pointer', padding: '8px 14px', borderRadius: 8,
                background: 'var(--olive)', color: 'var(--canvas)',
                fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700 }}>
              ابدأ التحضير
            </button>
          )}
          {isPreparing && (
            <button onClick={(e) => { e.stopPropagation(); onReady?.(order); }}
              style={{ all:'unset', cursor:'pointer', padding: '8px 14px', borderRadius: 8,
                background: 'var(--olive)', color: 'var(--canvas)',
                fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700 }}>
              جاهز
            </button>
          )}
          {isReady && (
            <button onClick={(e) => { e.stopPropagation(); onHandover?.(order); }}
              style={{ all:'unset', cursor:'pointer', padding: '8px 14px', borderRadius: 8,
                background: 'var(--ink)', color: 'var(--canvas)',
                fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700 }}>
              تسليم للكابتن
            </button>
          )}
          {isPicked && order.driverName && (
            <span style={{ fontSize: 12, color: 'var(--ink-light)', display:'flex', alignItems:'center', gap: 4 }}>
              <Icon.bike size={14}/> مع {order.driverName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  if (status === 'new') return <Badge variant="pending">جديد</Badge>;
  if (status === 'accepted') return <Badge variant="active">مقبول</Badge>;
  if (status === 'preparing') return <Badge variant="active">
    <span className="dl-live-dot" style={{ width: 6, height: 6 }}/>بنحضّر
  </Badge>;
  if (status === 'ready') return <Badge variant="solid-gold">جاهز للاستلام</Badge>;
  if (status === 'picked') return <Badge variant="solid-olive">مع الكابتن</Badge>;
  if (status === 'delivered') return <Badge variant="active">اتسلم</Badge>;
  if (status === 'rejected') return <Badge variant="issue">مرفوض</Badge>;
  if (status === 'cancelled') return <Badge variant="issue">متلغي</Badge>;
  return null;
}

// ── Product row (list item) ───────────────────────────────────────
function ProductRow({ product, onToggle, onClick }) {
  const avail = product.availability;
  return (
    <div className="dl-tappable" onClick={onClick}
      style={{ display:'flex', gap: 12, padding: 12, background:'#fff',
        borderRadius: 12, alignItems:'center', cursor: 'pointer',
        opacity: avail === 'archived' ? 0.65 : 1, border: '1px solid var(--canvas-300)' }}>
      <div style={{ width: 56, height: 56, borderRadius: 10, background: product.hue,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0,
        fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 28, color: 'rgba(15,26,23,0.18)' }}>
        {product.name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display:'flex', gap: 6, alignItems:'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.name}</div>
          {product.tag && <Badge variant={product.tag === 'عرض' ? 'pending' : 'active'}>{product.tag}</Badge>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{product.sub}</div>
        <div style={{ display:'flex', gap: 12, marginTop: 6, fontSize: 11, color: 'var(--ink-light)' }}>
          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
            {product.price.toLocaleString('ar-EG')} <span style={{ fontWeight: 500, color: 'var(--ink-light)' }}>ج.م</span>
          </span>
          <StockBadge avail={avail} stock={product.stock}/>
          <span>· بيع اليوم {product.soldToday.toLocaleString('ar-EG')}</span>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onToggle?.(product); }}
        role="switch" aria-checked={avail !== 'archived' && avail !== 'out'}
        style={{ width: 36, height: 22, borderRadius: 100, border: 0, cursor:'pointer',
          background: (avail === 'archived' || avail === 'out') ? 'var(--canvas-300)' : 'var(--olive)',
          position: 'relative', transition: 'background 200ms var(--ease-out)' }}>
        <span style={{ position: 'absolute', top: 3, insetInlineStart: (avail === 'archived' || avail === 'out') ? 3 : 17,
          width: 16, height: 16, borderRadius: 100, background: '#fff',
          transition: 'inset-inline-start 200ms var(--ease-out)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}/>
      </button>
    </div>
  );
}

function StockBadge({ avail, stock }) {
  if (avail === 'archived') return <span style={{ color: 'var(--ink-mute)' }}>مؤرشف</span>;
  if (avail === 'out') return <span style={{ color: '#A1271C', fontWeight: 600 }}>خلصان</span>;
  if (avail === 'low') return <span style={{ color: '#8a6418', fontWeight: 600 }}>قليل · {stock?.toLocaleString('ar-EG')}</span>;
  return <span>المخزن {stock?.toLocaleString('ar-EG')}</span>;
}

// ── Sparkline / bar chart ─────────────────────────────────────────
function BarChart({ data, height = 100, color = 'var(--olive)', accentColor = 'var(--gold)', highlightIdx, valueFmt }) {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = (d.v / max) * (height - 28);
        const accent = i === highlightIdx;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, color: accent ? 'var(--ink)' : 'var(--ink-mute)', fontWeight: 600,
              textAlign: 'center', minHeight: 12 }}>
              {accent && (valueFmt ? valueFmt(d.v) : d.v.toLocaleString('ar-EG'))}
            </div>
            <div style={{ width: '100%', height: Math.max(2, h), borderRadius: 4,
              background: accent ? accentColor : color, opacity: d.v === 0 ? 0.18 : 1,
              transition: 'height 400ms var(--ease-out)' }}/>
            <div style={{ fontSize: 9.5, color: accent ? 'var(--ink)' : 'var(--ink-light)', textAlign: 'center',
              fontWeight: accent ? 700 : 500 }}>{d.h || d.d || ''}</div>
          </div>
        );
      })}
    </div>
  );
}

// Mini line sparkline (for small spaces)
function Sparkline({ data, color = 'var(--olive)', width = 80, height = 24 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height}>
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Section title with optional right-side link ────────────────────
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding: '4px 18px 10px' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
      {action && (
        <button onClick={onAction} style={{
          all: 'unset', cursor: 'pointer', color: 'var(--olive)', fontSize: 13, fontWeight: 600
        }}>{action}</button>
      )}
    </div>
  );
}

// ── Group wrapper (used in settings/etc.) ──────────────────────────
function Group({ title, children }) {
  return (
    <div style={{ padding: '6px 18px 14px' }}>
      {title && (
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          {title}
        </div>
      )}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// ── Toggle row (used in settings) ──────────────────────────────────
function TogRow({ label, sub, v, onChange, icon }) {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
          color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{sub}</div>}
      </div>
      <button onClick={onChange} role="switch" aria-checked={v}
        style={{ width: 44, height: 26, borderRadius: 100,
          background: v ? 'var(--olive)' : 'var(--canvas-300)',
          border: 0, cursor: 'pointer', position: 'relative',
          transition: 'background 200ms var(--ease-out)' }}>
        <span style={{ position:'absolute', top: 3, insetInlineStart: v ? 21 : 3,
          width: 20, height: 20, borderRadius: 100, background: '#fff',
          transition: 'inset-inline-start 200ms var(--ease-out)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}/>
      </button>
    </div>
  );
}

Object.assign(window, {
  MBottomTabBar, MetricTile, OrderCard, OrderStatusBadge, ProductRow, StockBadge,
  BarChart, Sparkline, SectionHead, Group, TogRow,
});
