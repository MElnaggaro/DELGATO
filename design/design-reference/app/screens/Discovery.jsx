// screens/Discovery.jsx — Deals, Promotions, Featured merchants, Nearby, Recommendations, RecentlyViewed
const { useState: useStD, useEffect: useEfD } = React;

// ── Deals (full screen, card-rich) ────────────────────────────────
function DealsScreen() {
  const nav = useNav();
  const app = useApp();
  const [tab, setTab] = useStD('all');

  const filtered = tab === 'all' ? DEALS
                  : tab === 'percent' ? DEALS.filter(d => d.kind === 'percent' || d.kind === 'flat')
                  : tab === 'cashback' ? DEALS.filter(d => d.kind === 'cashback')
                  : DEALS.filter(d => d.kind === 'bogo' || d.kind === 'hero');

  return (
    <div className="dl-screen">
      <AppBar title="العروض والخصومات" onBack={() => nav.pop()}/>

      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 8, overflowX:'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'all', l: 'الكل' },
          { k: 'percent', l: 'خصومات' },
          { k: 'cashback', l: 'كاش باك' },
          { k: 'bogo', l: 'هدايا' },
        ].map(c => (
          <Chip key={c.k} active={tab === c.k} onClick={() => setTab(c.k)}>{c.l}</Chip>
        ))}
      </div>

      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((d, i) => (
            <div key={d.id} className="dl-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <DealCard deal={d} onUse={() => {
                app.setAppliedPromo({ code: d.code, value: d.value, title: d.title });
                app.showToast(`اتفعّل كود ${d.code}`, <Icon.tag size={16}/>);
                if (d.shopId) {
                  const sh = SHOPS.find(s => s.id === d.shopId);
                  if (sh) nav.push('shop', { shop: sh });
                } else {
                  nav.pop();
                }
              }} onCopy={() => {
                app.showToast(`اتنسخ كود ${d.code}`, <Icon.copy size={16}/>);
              }}/>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: 14, background: 'var(--canvas-200)', borderRadius: 12,
          display: 'flex', gap: 10, fontSize: 12.5, color: 'var(--ink-light)', lineHeight: 1.6 }}>
          <Icon.info size={16}/>
          <span>كل العروض سارية حتى نهاية الشهر. كود واحد بس على الطلب.</span>
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal, onUse, onCopy }) {
  return (
    <div style={{
      borderRadius: 16, background: deal.bg, color: 'var(--canvas)', overflow: 'hidden',
      position: 'relative', padding: '18px 20px',
    }}>
      <div style={{ position: 'absolute', insetBlockStart: -20, insetInlineEnd: -10,
        width: 110, height: 110, borderRadius: '50%', background: 'rgba(250,248,243,0.08)' }}/>
      <div style={{ position: 'absolute', insetBlockEnd: -30, insetInlineStart: -20,
        width: 90, height: 90, borderRadius: '50%', background: 'rgba(250,248,243,0.06)' }}/>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent:'space-between', position: 'relative' }}>
        <Badge variant="solid-gold">{deal.value}</Badge>
        <div style={{ width: 44, height: 44, borderRadius: 12,
          background: 'rgba(250,248,243,0.14)', color: 'var(--canvas)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {deal.icon === 'bike' && <Icon.bike size={22}/>}
          {deal.icon === 'pill' && <Icon.pill size={22}/>}
          {deal.icon === 'wallet' && <Icon.wallet size={22}/>}
          {deal.icon === 'utensils' && <Icon.utensils size={22}/>}
          {deal.icon === 'tag' && <Icon.tag size={22}/>}
        </div>
      </div>

      <div style={{ marginTop: 16, position: 'relative' }}>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{deal.title}</div>
        <div style={{ fontSize: 13, color: 'rgba(250,248,243,0.78)', marginTop: 6, lineHeight: 1.5 }}>{deal.sub}</div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <button onClick={onCopy} style={{
          all:'unset', cursor:'pointer',
          background: 'rgba(250,248,243,0.14)', padding: '10px 14px', borderRadius: 10,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6, color: 'var(--canvas)', fontSize: 13,
        }}>
          {deal.code} <Icon.copy size={13}/>
        </button>
        <button onClick={onUse} style={{
          all:'unset', cursor:'pointer', flex: 1, textAlign: 'center',
          background: 'var(--canvas)', color: 'var(--olive)',
          padding: '12px 14px', borderRadius: 10, fontWeight: 700, fontSize: 14,
          fontFamily: 'var(--font-arabic)',
        }}>استخدم العرض</button>
      </div>
    </div>
  );
}

// ── Featured merchants ───────────────────────────────────────────
function FeaturedScreen() {
  const nav = useNav();
  const shops = SHOPS.filter(s => FEATURED_IDS.includes(s.id));
  return (
    <div className="dl-screen">
      <AppBar title="محلات مميزة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '8px 18px 24px' }}>
        <div className="dl-fade-up" style={{ background: 'var(--canvas-200)', borderRadius: 12, padding: '14px 16px',
          marginBottom: 14, display:'flex', gap: 10, alignItems:'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--olive)',
            color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.sparkle size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>المحلات اللي العيلة بتثق فيها</div>
            <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>الأفضل تقييماً والأكثر طلباً في الدلنجات</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shops.map((s, i) => (
            <div key={s.id} className="dl-rise" style={{ animationDelay: `${i * 50}ms`, position: 'relative' }}>
              <div style={{ position:'absolute', top: 10, insetInlineStart: 10, zIndex: 2 }}>
                <Badge variant="solid-gold">مميز</Badge>
              </div>
              <ShopCard shop={s} onClick={() => nav.push('shop', { shop: s })}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Nearby stores (map-ish) ──────────────────────────────────────
function NearbyScreen() {
  const nav = useNav();
  const [view, setView] = useStD('list');
  return (
    <div className="dl-screen">
      <AppBar title="محلات قريبة منك" onBack={() => nav.pop()}
        trailing={
          <div style={{ display: 'flex', background: 'var(--canvas-200)', borderRadius: 100, padding: 3 }}>
            <button onClick={() => setView('list')}
              style={{ all:'unset', cursor:'pointer', padding: '6px 12px', borderRadius: 100,
                background: view === 'list' ? '#fff' : 'transparent',
                fontSize: 12, fontWeight: 600,
                color: view === 'list' ? 'var(--ink)' : 'var(--ink-light)',
                boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>قائمة</button>
            <button onClick={() => setView('map')}
              style={{ all:'unset', cursor:'pointer', padding: '6px 12px', borderRadius: 100,
                background: view === 'map' ? '#fff' : 'transparent',
                fontSize: 12, fontWeight: 600,
                color: view === 'map' ? 'var(--ink)' : 'var(--ink-light)',
                boxShadow: view === 'map' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>خريطة</button>
          </div>
        }/>

      <div className="dl-scroll" style={{ padding: '4px 18px 24px' }}>
        {view === 'map' && (
          <div className="dl-fade-up" style={{ height: 220, borderRadius: 14, overflow: 'hidden', marginBottom: 16,
            background: 'linear-gradient(120deg, #E8E2D2 0%, #DDD4BE 100%)', position: 'relative', border: '1px solid var(--canvas-300)' }}>
            <svg viewBox="0 0 360 220" style={{ position:'absolute', inset: 0, width: '100%', height: '100%' }}>
              <g stroke="#FAF8F3" strokeWidth="14" fill="none" opacity="0.9">
                <path d="M -10 50 L 380 80"/>
                <path d="M -10 160 L 380 150"/>
                <path d="M 120 -10 L 90 230"/>
                <path d="M 260 -10 L 290 230"/>
              </g>
            </svg>
            {/* Shop markers */}
            {[
              { x: 95, y: 80, letter: 'أ', shopId: 'abuhassan' },
              { x: 180, y: 110, letter: 'ن', shopId: 'noor' },
              { x: 240, y: 70, letter: 'م', shopId: 'masry' },
              { x: 140, y: 170, letter: 'خ', shopId: 'khodar' },
              { x: 290, y: 145, letter: 'ح', shopId: 'halawa' },
            ].map((m, i) => (
              <div key={i} onClick={() => {
                const sh = SHOPS.find(s => s.id === m.shopId);
                if (sh) nav.push('shop', { shop: sh });
              }} style={{
                position:'absolute', top: m.y - 16, insetInlineStart: m.x - 16, width: 32, height: 32, borderRadius: 100,
                background: 'var(--olive)', color: 'var(--canvas)', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 14,
                boxShadow: '0 4px 12px rgba(15,26,23,0.24), 0 0 0 4px rgba(31,74,61,0.18)',
              }}>{m.letter}</div>
            ))}
            {/* User dot */}
            <div style={{
              position: 'absolute', top: 110, insetInlineStart: 180, transform: 'translate(-50%, -50%)',
              width: 14, height: 14, borderRadius: 100, background: '#2A6FDB',
              boxShadow: '0 0 0 4px rgba(42,111,219,0.3), 0 0 0 12px rgba(42,111,219,0.12)',
            }}/>
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em' }}>
            {SHOPS.length.toLocaleString('ar-EG')} محل · مرتب بالأقرب
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SHOPS.map((s, i) => (
            <div key={s.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
              <ShopCard shop={s} onClick={() => nav.push('shop', { shop: s })}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Recommendations ──────────────────────────────────────────────
function RecommendationsScreen() {
  const nav = useNav();
  const app = useApp();
  const recProducts = [PRODUCTS[1], PRODUCTS[3], PRODUCTS[7], PRODUCTS[11], PRODUCTS[4], PRODUCTS[2]];

  return (
    <div className="dl-screen">
      <AppBar title="مقترح ليك" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-fade-up" style={{ background: 'rgba(31,74,61,0.06)', borderRadius: 12, padding: '14px 16px',
          marginBottom: 16, display:'flex', gap: 10, alignItems:'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--olive)',
            color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.sparkle size={18}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>بناءً على طلباتك السابقة</div>
            <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>منتجات بنفتكر إنها هتعجبك</div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          منتجات تطلبها كتير
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, marginBottom: 22 }}>
          {recProducts.slice(0, 4).map((p, i) => (
            <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 40}ms` }}>
              <RecTile product={p} onClick={() => nav.push('product', { product: p, shop: SHOPS[0] })}
                onAdd={() => { app.addItem(p, SHOPS[0], 1); app.showToast('اتضاف للسلة', <Icon.check size={16}/>); }}/>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          جديد في الدلنجات
        </div>
        <div style={{ display:'flex', flexDirection: 'column', gap: 8 }}>
          {recProducts.slice(4).map((p, i) => (
            <div key={p.id} className="dl-card dl-tappable" style={{ padding: 10, display:'flex', gap: 12, alignItems:'center', cursor: 'pointer' }}
              onClick={() => nav.push('product', { product: p, shop: SHOPS[0] })}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: p.hue, display:'flex',
                alignItems:'center', justifyContent:'center', fontFamily:'var(--font-arabic)', fontWeight: 700, fontSize: 28, color: 'rgba(15,26,23,0.18)' }}>
                {p.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{p.sub}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>
                {p.price.toLocaleString('ar-EG')} <span style={{ fontSize: 11, color:'var(--ink-light)' }}>ج.م</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecTile({ product, onClick, onAdd }) {
  return (
    <div onClick={onClick} className="dl-item" style={{
      background: '#fff', borderRadius: 12, border: '1px solid var(--canvas-300)',
      padding: 10, display:'flex', flexDirection: 'column', gap: 6, cursor:'pointer',
    }}>
      <div style={{ height: 90, borderRadius: 10, background: product.hue,
        position: 'relative', overflow: 'hidden', padding: 8 }}>
        <div style={{ fontFamily: 'var(--font-arabic)', fontSize: 60, fontWeight: 700,
          color: 'rgba(15,26,23,0.10)', lineHeight: 1, position:'absolute', top: 4, insetInlineEnd: 10 }}>{product.name[0]}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{product.name}</div>
      <div style={{ display:'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>
          {product.price.toLocaleString('ar-EG')} <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onAdd(); }}
          style={{ width: 28, height: 28, borderRadius: 8, border: 0,
            background: 'var(--olive)', color: 'var(--canvas)', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon.plus size={16}/>
        </button>
      </div>
    </div>
  );
}

// ── Recently viewed ──────────────────────────────────────────────
function RecentlyViewedScreen() {
  const nav = useNav();
  const app = useApp();
  const items = app.recentlyViewed.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  return (
    <div className="dl-screen">
      <AppBar title="شفتها قبل كده" onBack={() => nav.pop()}
        trailing={items.length > 0 && <button onClick={() => { app.setRecentlyViewed([]); }}
          style={{ background:'transparent', border: 0, padding: 6, fontSize: 13,
                   color: 'var(--olive)', fontWeight: 600, cursor:'pointer', fontFamily:'var(--font-arabic)' }}>
          مسح
        </button>}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {items.length === 0 ? (
          <EmptyState icon={<Icon.clock size={32}/>}
            title="مفيش حاجة شفتها"
            body="المنتجات اللي تفتحها هتظهر هنا للوصول السريع."
            action={<Button variant="primary" onClick={() => nav.reset('home')}>تصفّح المحلات</Button>}/>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, paddingTop: 8 }}>
            {items.map((p, i) => (
              <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <RecTile product={p}
                  onClick={() => nav.push('product', { product: p, shop: SHOPS[0] })}
                  onAdd={() => { app.addItem(p, SHOPS[0], 1); app.showToast('اتضاف للسلة', <Icon.check size={16}/>); }}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

registerScreen('deals', DealsScreen);
registerScreen('featured', FeaturedScreen);
registerScreen('nearby', NearbyScreen);
registerScreen('recommendations', RecommendationsScreen);
registerScreen('recentlyViewed', RecentlyViewedScreen);
