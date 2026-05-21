// screens/Home.jsx — Home tab, Search tab, Category browse
const { useState: useStH, useEffect: useEfH, useRef: useRfH } = React;

// ─── Home ─────────────────────────────────────────────────────────
function HomeScreen() {
  const nav = useNav();
  const app = useApp();
  const [cat, setCat] = useStH('all');
  const [loading, setLoading] = useStH(true);
  const [pulling, setPulling] = useStH(false);
  const [pullY, setPullY] = useStH(0);
  const scrollRef = useRfH(null);

  useEfH(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Pull-to-refresh: simulate via touch on container
  const onTouchStart = (e) => {
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    el._startY = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    const el = scrollRef.current;
    if (!el || !el._startY) return;
    const dy = e.touches[0].clientY - el._startY;
    if (dy > 0 && el.scrollTop === 0) {
      setPullY(Math.min(80, dy * 0.6));
    }
  };
  const onTouchEnd = () => {
    if (pullY > 50) {
      setPulling(true);
      setPullY(50);
      setTimeout(() => { setPulling(false); setPullY(0); app.showToast('تم تحديث المحلات', <Icon.check size={16}/>); }, 1100);
    } else setPullY(0);
    if (scrollRef.current) scrollRef.current._startY = null;
  };

  const filtered = cat === 'all' ? SHOPS : SHOPS.filter(s => s.catKey === cat);

  return (
    <div className="dl-screen">
      {app.offline && <OfflineBanner/>}

      {/* Header: address + bell */}
      <div style={{ padding: '14px 18px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 500, letterSpacing: '0.02em' }}>
            توصيل إلى
          </div>
          <button onClick={() => nav.push('addresses')} style={{
            all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
            gap: 4, fontFamily: 'var(--font-arabic)', whiteSpace: 'nowrap',
          }}>
            <span style={{ color: 'var(--olive)', display:'flex' }}><Icon.pin size={16} /></span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{app.selectedAddress.label} · {app.selectedAddress.street}</span>
            <span style={{ color: 'var(--ink-light)', display:'flex' }}><Icon.chevronDown size={16} /></span>
          </button>
        </div>
        <button onClick={() => nav.push('notifications')} aria-label="إشعارات" style={{
          width: 40, height: 40, borderRadius: 100, border: 0, background: 'var(--canvas-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
          position: 'relative', cursor: 'pointer',
        }}>
          <Icon.bell size={20} />
          {app.notifications.filter(n => !n.read).length > 0 && (
            <span style={{
              position: 'absolute', top: 8, insetInlineEnd: 8, width: 8, height: 8,
              background: 'var(--gold)', borderRadius: 100, border: '2px solid var(--canvas-200)',
            }}/>
          )}
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '6px 18px 12px' }} onClick={() => nav.push('search')}>
        <SearchField value="" onChange={() => {}} readOnly placeholder="ابحث عن محل أو منتج" />
      </div>

      {/* Pull-to-refresh indicator */}
      <div style={{ height: pullY, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--olive)', transition: pullY === 0 ? 'height 200ms var(--ease-out)' : 'none' }}>
        {pullY > 0 && (
          <span className={pulling ? 'dl-spin' : ''}
            style={{ display:'inline-flex', transform: !pulling ? `rotate(${pullY * 4}deg)` : '' }}>
            <Icon.refresh size={20}/>
          </span>
        )}
      </div>

      <div className="dl-scroll" ref={scrollRef}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* Categories scroller (icons) */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORIES.filter(c => c.key !== 'all').map(c => (
              <button key={c.key} onClick={() => nav.push('category', { catKey: c.key })}
                style={{ all:'unset', cursor:'pointer', display:'flex', flexDirection:'column',
                  alignItems:'center', gap: 8, minWidth: 64,
                  WebkitTapHighlightColor: 'transparent' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--canvas-200)',
                  color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center',
                  transition: 'transform 120ms var(--ease-out)' }}>
                  {c.icon === 'store' && <Icon.store size={26}/>}
                  {c.icon === 'pill' && <Icon.pill size={26}/>}
                  {c.icon === 'utensils' && <Icon.utensils size={26}/>}
                  {c.icon === 'cookie' && <Icon.cookie size={26}/>}
                  {c.icon === 'leaf' && <Icon.leaf size={26}/>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Active order banner */}
        {app.orders.find(o => o.status === 'live') && (
          <div style={{ padding: '0 18px 14px' }}>
            <ActiveOrderBanner order={app.orders.find(o => o.status === 'live')}
              onClick={() => nav.push('tracking', { orderId: 'DLN-٢٠٤٧' })}/>
          </div>
        )}

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 8px', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)}>{c.label}</Chip>
          ))}
        </div>

        {/* Hero offer */}
        <div style={{ padding: '8px 18px 16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
            color: 'var(--canvas)', borderRadius: 14, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden',
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
          <button onClick={() => setCat('all')} style={{
            all: 'unset', cursor: 'pointer', color: 'var(--olive)', fontSize: 13, fontWeight: 600
          }}>عرض الكل</button>
        </div>

        {/* Shop list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 18px 24px' }}>
          {loading ? (
            <>
              <ShopCardSkel/><ShopCardSkel/><ShopCardSkel/>
            </>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Icon.store size={32}/>}
              title="مفيش محلات في القسم ده دلوقتي"
              body="جرب قسم تاني أو تابعنا لما يفتح محلات جديدة قريبة منك."
              action={<Button variant="ghost" onClick={() => setCat('all')}>اعرض كل المحلات</Button>}/>
          ) : (
            filtered.map((s, i) => (
              <div key={s.id} className="dl-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <ShopCard shop={s} onClick={() => nav.push('shop', { shop: s })} />
              </div>
            ))
          )}
        </div>
      </div>

      <BottomTabBar active="home" cartCount={app.cartCount} onTab={(t) => nav.reset(t)}/>
    </div>
  );
}

// ─── Active order banner ──────────────────────────────────────────
function ActiveOrderBanner({ order, onClick }) {
  return (
    <div onClick={onClick} className="dl-tappable" style={{
      background: 'var(--ink)', color: 'var(--canvas)', borderRadius: 14,
      padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,177,79,0.18)',
        color: 'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
        <Icon.bike size={20}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
          <span className="dl-live-dot"/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>طلب شغّال</span>
          <span className="mono" style={{ fontSize: 11, color: 'rgba(250,248,243,0.5)' }}>{order.id}</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)', marginTop: 4 }}>
          {order.statusText} · {order.shop}
        </div>
      </div>
      <Icon.chevronLeft size={20}/>
    </div>
  );
}

// ─── Search ───────────────────────────────────────────────────────
function SearchScreen() {
  const nav = useNav();
  const app = useApp();
  const [q, setQ] = useStH('');
  const [recent, setRecent] = useStH(RECENT_SEARCHES);

  const matches = q.trim() ? PRODUCTS.filter(p => p.name.includes(q)).slice(0, 8) : [];
  const shopMatches = q.trim() ? SHOPS.filter(s => s.name.includes(q) || s.cat.includes(q)).slice(0, 4) : [];

  const submitSearch = (text) => {
    setQ(text);
    if (text && !recent.includes(text)) setRecent([text, ...recent].slice(0, 6));
  };

  return (
    <div className="dl-screen">
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <SearchField value={q} autoFocus
          onChange={e => setQ(e.target.value)}
          onClear={() => setQ('')}
          placeholder="ابحث عن محل أو منتج"/>
        <button onClick={() => nav.reset('home')} style={{ all:'unset', cursor:'pointer', fontFamily:'var(--font-arabic)', fontSize: 14, fontWeight: 600, color: 'var(--olive)' }}>
          إلغاء
        </button>
      </div>

      <div className="dl-scroll">
        {!q.trim() ? (
          <>
            {/* Recent */}
            {recent.length > 0 && (
              <div style={{ padding: '12px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em' }}>بحثت عنها قبل كده</div>
                  <button onClick={() => setRecent([])} style={{ all:'unset', cursor:'pointer', fontSize: 12, color: 'var(--ink-light)' }}>
                    مسح الكل
                  </button>
                </div>
                <div style={{ display:'flex', gap: 8, flexWrap: 'wrap' }}>
                  {recent.map(r => (
                    <Chip key={r} onClick={() => submitSearch(r)}>{r}</Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div style={{ padding: '12px 18px' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10, display:'flex', alignItems:'center', gap: 6 }}>
                <Icon.flame size={14}/> الأكثر بحثاً اليوم
              </div>
              <div style={{ display:'flex', gap: 8, flexWrap: 'wrap' }}>
                {TRENDING_SEARCHES.map(t => (
                  <Chip key={t} icon={<Icon.search size={14}/>} onClick={() => submitSearch(t)}>{t}</Chip>
                ))}
              </div>
            </div>

            {/* Popular categories */}
            <div style={{ padding: '12px 18px 24px' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
                تصفّح حسب القسم
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {CATEGORIES.filter(c => c.key !== 'all').map(c => (
                  <button key={c.key} onClick={() => { nav.reset('home'); setTimeout(() => nav.push('category', { catKey: c.key }), 120); }}
                    className="dl-tappable"
                    style={{ all:'unset', cursor:'pointer', background:'#fff', border:'1px solid var(--canvas-300)',
                      borderRadius: 12, padding: 14, display:'flex', alignItems:'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--canvas-200)',
                      color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {c.icon === 'store' && <Icon.store size={20}/>}
                      {c.icon === 'pill' && <Icon.pill size={20}/>}
                      {c.icon === 'utensils' && <Icon.utensils size={20}/>}
                      {c.icon === 'cookie' && <Icon.cookie size={20}/>}
                      {c.icon === 'leaf' && <Icon.leaf size={20}/>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{c.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (matches.length === 0 && shopMatches.length === 0) ? (
          <EmptyState
            icon={<Icon.search size={32}/>}
            title="ملقيناش حاجة بهذا الاسم"
            body={`ولا منتج ولا محل اسمه "${q}" — جرب كلمة تانية.`}/>
        ) : (
          <>
            {shopMatches.length > 0 && (
              <div style={{ padding: '14px 18px 6px' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
                  محلات · {shopMatches.length.toLocaleString('ar-EG')} نتيجة
                </div>
                <div style={{ display:'flex', flexDirection: 'column', gap: 8 }}>
                  {shopMatches.map(s => (
                    <ShopCard key={s.id} shop={s} compact onClick={() => { submitSearch(q); nav.push('shop', { shop: s }); }}/>
                  ))}
                </div>
              </div>
            )}
            {matches.length > 0 && (
              <div style={{ padding: '14px 18px 24px' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
                  منتجات · {matches.length.toLocaleString('ar-EG')} نتيجة
                </div>
                <div style={{ display:'flex', flexDirection: 'column', gap: 8 }}>
                  {matches.map(p => (
                    <div key={p.id} className="dl-card dl-tappable" style={{ padding: 10, display:'flex', gap: 12, alignItems:'center', cursor: 'pointer' }}
                      onClick={() => { submitSearch(q); nav.push('product', { product: p, shop: SHOPS[0] }); }}>
                      <div style={{ width: 52, height: 52, borderRadius: 10, background: p.hue, display:'flex',
                        alignItems:'center', justifyContent:'center', fontFamily:'var(--font-arabic)', fontWeight: 700, fontSize: 28, color: 'rgba(15,26,23,0.18)' }}>
                        {p.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{p.sub} · سوبر ماركت أبو حسن</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>{p.price.toLocaleString('ar-EG')} <span style={{ fontSize: 11, color:'var(--ink-light)' }}>ج.م</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomTabBar active="search" cartCount={app.cartCount} onTab={(t) => nav.reset(t)}/>
    </div>
  );
}

// ─── Category browse (e.g. all pharmacies) ────────────────────────
function CategoryScreen({ catKey }) {
  const nav = useNav();
  const cat = CATEGORIES.find(c => c.key === catKey) || CATEGORIES[0];
  const shops = SHOPS.filter(s => s.catKey === catKey);
  return (
    <div className="dl-screen">
      <AppBar title={cat.label} onBack={() => nav.pop()}
        trailing={<button style={{ background:'transparent', border: 0, padding: 6, color: 'var(--ink)', cursor: 'pointer', display:'flex' }}>
          <Icon.filter size={20}/>
        </button>}/>
      <div className="dl-scroll">
        <div style={{ padding: '0 18px 14px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['الأقرب', 'الأعلى تقييماً', 'مفتوح دلوقتي', 'توصيل أسرع'].map((c, i) => (
            <Chip key={c} active={i === 0}>{c}</Chip>
          ))}
        </div>
        <div style={{ padding: '0 18px 24px', display:'flex', flexDirection: 'column', gap: 10 }}>
          {shops.map((s, i) => (
            <div key={s.id} className="dl-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <ShopCard shop={s} onClick={() => nav.push('shop', { shop: s })}/>
            </div>
          ))}
          {shops.length === 0 && (
            <EmptyState icon={<Icon.store size={32}/>} title="مفيش محلات في القسم ده"
              body="بنشتغل علشان نضيف محلات أكتر قريباً."
              action={<Button variant="ghost" onClick={() => nav.pop()}>ارجع للرئيسية</Button>}/>
          )}
        </div>
      </div>
    </div>
  );
}

registerScreen('home', HomeScreen);
registerScreen('search', SearchScreen);
registerScreen('category', CategoryScreen);
