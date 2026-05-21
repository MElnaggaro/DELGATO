// Home.jsx — main feed: address bar, search, categories, shops list
const { useState: useStateH } = React;

function Home({ onShop, onSearch, cart, onTab, active }) {
  const [cat, setCat] = useStateH('all');
  const filtered = cat === 'all' ? SHOPS : SHOPS.filter(s =>
    (cat === 'grocery' && s.cat === 'بقالة') ||
    (cat === 'pharmacy' && s.cat === 'صيدلية') ||
    (cat === 'food' && s.cat === 'أكل') ||
    (cat === 'sweets' && s.cat === 'حلويات') ||
    (cat === 'produce' && s.cat === 'خضار وفاكهة')
  );
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="dl-screen">
      {/* Header: address + bell */}
      <div style={{ padding: '14px 18px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 500, letterSpacing: '0.02em' }}>
            توصيل إلى
          </div>
          <button style={{
            all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
            gap: 4, fontFamily: 'var(--font-arabic)', whiteSpace: 'nowrap',
          }}>
            <span style={{ color: 'var(--olive)', display:'flex' }}><Icon.pin size={16} /></span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>شارع الجلاء</span>
            <span style={{ color: 'var(--ink-light)', display:'flex' }}><Icon.chevronLeft size={16} /></span>
          </button>
        </div>
        <button aria-label="إشعارات" style={{
          width: 40, height: 40, borderRadius: 100, border: 0, background: 'var(--canvas-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
          position: 'relative', cursor: 'pointer',
        }}>
          <Icon.bell size={20} />
          <span style={{
            position: 'absolute', top: 8, insetInlineEnd: 8, width: 8, height: 8,
            background: 'var(--gold)', borderRadius: 100, border: '2px solid var(--canvas-200)',
          }}/>
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '6px 18px 12px' }} onClick={onSearch}>
        <SearchField value="" onChange={() => {}} placeholder="ابحث عن محل أو منتج" />
      </div>

      <div className="dl-scroll">
        {/* Categories scroller */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 8px',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
        }}>
          {CATEGORIES.map(c => (
            <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>{c.label}</Chip>
          ))}
        </div>

        {/* Hero offer card */}
        <div style={{ padding: '8px 18px 16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
            color: 'var(--canvas)', borderRadius: 14, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ flex: 1 }}>
              <Badge variant="solid-gold">عرض اليوم</Badge>
              <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20, marginTop: 8, lineHeight: 1.25 }}>
                توصيل ببلاش<br/>على أول طلب
              </div>
              <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)', marginTop: 6 }}>
                استخدم كود <span style={{ fontWeight: 700, color: 'var(--gold)' }}>DLN10</span>
              </div>
            </div>
            <div style={{
              width: 72, height: 72, borderRadius: 100,
              background: 'rgba(232,177,79,0.25)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--gold)', flexShrink: 0,
            }}>
              <Icon.bike size={36} />
            </div>
          </div>
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 18px 12px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>محلات قريبة منك</div>
          <button style={{
            all: 'unset', cursor: 'pointer', color: 'var(--olive)', fontSize: 13, fontWeight: 600
          }}>عرض الكل</button>
        </div>

        {/* Shop list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 18px 24px' }}>
          {filtered.map(s => <ShopCard key={s.id} shop={s} onClick={() => onShop(s)} />)}
        </div>
      </div>

      <BottomTabBar active={active} onTab={onTab} cartCount={cartCount} />
    </div>
  );
}

window.Home = Home;
