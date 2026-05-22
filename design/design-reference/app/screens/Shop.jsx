// screens/Shop.jsx — Shop detail (with sticky header), Product detail sheet
const { useState: useStS, useEffect: useEfS, useRef: useRfS, useMemo: useMmS } = React;

// ─── Product tile (used in grid) ──────────────────────────────────
function ProductTile({ product, qty, onTap, onAdd, onChange }) {
  return (
    <div className="dl-item" style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid var(--canvas-300)',
      padding: 10, display: 'flex', flexDirection: 'column', gap: 8,
      position: 'relative', cursor: 'pointer',
    }} onClick={onTap}>
      <div style={{
        height: 96, borderRadius: 10, background: product.hue,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
        padding: 8, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          fontFamily: 'var(--font-arabic)', fontSize: 60, fontWeight: 700,
          color: 'rgba(15,26,23,0.10)', lineHeight: 1, position: 'absolute',
          top: 4, insetInlineEnd: 10,
        }}>{product.name[0]}</div>
        {product.tag && (
          <Badge variant={product.tag === 'عرض' ? 'pending' : 'solid-olive'}>
            {product.tag}
          </Badge>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 34 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{product.sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
          {product.price.toLocaleString('ar-EG')} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-light)' }}>ج.م</span>
        </div>
        {qty > 0 ? (
          <div onClick={e => e.stopPropagation()}>
            <Stepper compact value={qty} onChange={onChange} min={0} />
          </div>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onAdd(); }} aria-label="أضف"
            style={{
              width: 30, height: 30, borderRadius: 8, border: 0,
              background: 'var(--olive)', color: 'var(--canvas)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 100ms var(--ease-out)',
            }}
            onPointerDown={e => e.currentTarget.style.transform='scale(0.88)'}
            onPointerUp={e => e.currentTarget.style.transform=''}
            onPointerLeave={e => e.currentTarget.style.transform=''}>
            <Icon.plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shop screen ──────────────────────────────────────────────────
function ShopScreen({ shop }) {
  const nav = useNav();
  const app = useApp();
  const [sec, setSec] = useStS('الكل');
  const [scrolled, setScrolled] = useStS(false);

  // Build section list from products
  const sections = useMmS(() => {
    const s = ['الكل', ...new Set(PRODUCTS.map(p => p.section))];
    return s;
  }, []);
  const products = sec === 'الكل' ? PRODUCTS : PRODUCTS.filter(p => p.section === sec);

  const itemsInCart = useMmS(() => app.cart.reduce((acc, i) => { acc[i.id] = i.qty; return acc; }, {}), [app.cart]);
  const shopCart = app.cart.filter(i => i.shopId === shop.id);
  const subtotal = shopCart.reduce((s, i) => s + i.qty * i.price, 0);
  const cartCount = shopCart.reduce((n, i) => n + i.qty, 0);

  const setQty = (p, qty) => {
    if (qty <= 0) { app.setItemQty(p.id, 0); return; }
    // Merchant conflict: cart has items from another shop
    if (app.cart.length > 0 && app.cart[0].shopId && app.cart[0].shopId !== shop.id) {
      nav.push('merchantConflict', { existing: app.cart[0].shop, newShop: shop, newProduct: p });
      return;
    }
    const idx = app.cart.findIndex(i => i.id === p.id);
    if (idx === -1) app.addItem(p, shop, qty);
    else app.setItemQty(p.id, qty);
  };

  const isFav = app.favorites.includes(shop.id);

  return (
    <div className="dl-screen">
      <AppBar title={shop.name} onBack={() => nav.pop()}
        trailing={
          <div style={{ display:'flex', gap: 4 }}>
            <button onClick={() => app.toggleFav(shop.id)}
              style={{ background: 'transparent', border: 0, padding: 6, cursor: 'pointer', color: isFav ? '#C53B2C' : 'var(--ink)', display:'flex' }}>
              <Icon.heart size={22} />
            </button>
            <button style={{ background: 'transparent', border: 0, padding: 6, cursor: 'pointer', color: 'var(--ink)', display:'flex' }}>
              <Icon.share size={22} />
            </button>
          </div>
        }/>

      <div className="dl-scroll" onScroll={e => setScrolled(e.target.scrollTop > 8)}>
        {/* Shop hero */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{
            height: 158, borderRadius: 14, background: shop.bg, color: 'var(--canvas)',
            padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', insetBlockStart: -30, insetInlineEnd: -20,
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 180,
              color: 'rgba(250,248,243,0.07)', lineHeight: 0.85 }}>{shop.letter}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge variant="solid-gold">{shop.rating} ★</Badge>
              <Badge variant="ghost">{shop.cat}</Badge>
              {shop.tags?.slice(0, 1).map(t => <Badge key={t} variant="ghost">{t}</Badge>)}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-arabic)' }}>{shop.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.75)', marginTop: 6, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.clock size={13} /> {shop.eta}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.bike size={13} /> توصيل {shop.fee}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.pin size={13} /> {shop.distance}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--canvas-200)', borderRadius: 10,
            fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.55 }}>
            {shop.desc}
          </div>

          {/* Quick-action strip */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={() => nav.push('reviews', { shop })} className="dl-tappable"
              style={{ all:'unset', cursor:'pointer', flex: 1, background:'#fff',
                border: '1px solid var(--canvas-300)', borderRadius: 10, padding: '10px 12px',
                display:'flex', alignItems:'center', gap: 8 }}>
              <span style={{ color: 'var(--gold)', display:'inline-flex' }}><Icon.star size={16}/></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>التقييمات</div>
                <div style={{ fontSize: 10, color: 'var(--ink-light)' }}>{shop.rating} · شوف الكل</div>
              </div>
            </button>
            <button onClick={() => nav.push('contactMerchant', { shop })} className="dl-tappable"
              style={{ all:'unset', cursor:'pointer', flex: 1, background:'#fff',
                border: '1px solid var(--canvas-300)', borderRadius: 10, padding: '10px 12px',
                display:'flex', alignItems:'center', gap: 8 }}>
              <span style={{ color: 'var(--olive)', display:'inline-flex' }}><Icon.message size={16}/></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>تواصل مع المحل</div>
                <div style={{ fontSize: 10, color: 'var(--ink-light)' }}>رد في دقايق</div>
              </div>
            </button>
          </div>
        </div>

        {/* Category strip — sticky-ish */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 4,
          background: 'var(--canvas)',
          boxShadow: scrolled ? '0 1px 0 var(--canvas-300)' : 'none',
          transition: 'box-shadow 200ms var(--ease-out)',
          padding: '6px 18px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {sections.map(s => (
            <Chip key={s} active={sec === s} onClick={() => setSec(s)}>{s}</Chip>
          ))}
        </div>

        {/* Products grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 18px 140px',
        }}>
          {products.map((p, i) => (
            <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
              <ProductTile product={p}
                qty={itemsInCart[p.id] || 0}
                onTap={() => nav.push('product', { product: p, shop })}
                onAdd={() => { setQty(p, 1); app.showToast('اتضاف للسلة', <Icon.check size={16}/>); }}
                onChange={(n) => setQty(p, n)}/>
            </div>
          ))}
        </div>
      </div>

      {/* Floating mini-cart bar */}
      {cartCount > 0 && (
        <MiniCartBar count={cartCount} total={subtotal} shopName={shop.name}
          onClick={() => nav.push('cart')}/>
      )}
    </div>
  );
}

// ─── Product detail (full-screen, but feels like a sheet) ─────────
function ProductScreen({ product, shop }) {
  const nav = useNav();
  const app = useApp();
  const inCart = app.cart.find(i => i.id === product.id);
  const [qty, setQty] = useStS(inCart?.qty || 1);
  const [note, setNote] = useStS('');

  // Track recently viewed
  useEfS(() => {
    if (product?.id) app.pushRecent?.(product.id);
  }, []);

  // Soft-randomized 'out of stock' flag (some products unavailable). Tag-based:
  const unavailable = product.tag === 'موسم' && product.id === 'p12'; // demo

  const onAdd = () => {
    if (app.cart.length > 0 && app.cart[0].shopId && app.cart[0].shopId !== shop.id) {
      nav.push('merchantConflict', { existing: app.cart[0].shop, newShop: shop, newProduct: product });
      return;
    }
    if (inCart) app.setItemQty(product.id, qty);
    else app.addItem(product, shop, qty);
    app.showToast(`اتضاف ${qty.toLocaleString('ar-EG')}× ${product.name}`, <Icon.check size={16}/>);
    nav.pop();
  };

  if (unavailable) {
    // Inline render the unavailable screen
    return <UnavailableInline product={product} shop={shop} nav={nav} app={app}/>;
  }

  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title=""
        trailing={<button onClick={() => app.toggleFav(product.id)}
          style={{ background:'transparent', border: 0, padding: 6, color: 'var(--ink)', cursor:'pointer', display:'flex' }}>
          <Icon.heart size={22}/>
        </button>}/>
      <div className="dl-scroll">
        {/* Hero image (placeholder) — tap to open gallery */}
        <div onClick={() => nav.push('productGallery', { product })}
          className="dl-tappable" style={{ margin: '0 18px', height: 260, borderRadius: 16,
          background: product.hue, position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <div style={{ fontFamily:'var(--font-arabic)', fontWeight: 700, fontSize: 220,
            color: 'rgba(15,26,23,0.10)', lineHeight: 0.9 }}>{product.name[0]}</div>
          {product.tag && (
            <div style={{ position:'absolute', top: 14, insetInlineStart: 14 }}>
              <Badge variant={product.tag === 'عرض' ? 'pending' : 'solid-olive'}>{product.tag}</Badge>
            </div>
          )}
          <div style={{ position:'absolute', insetInlineEnd: 14, bottom: 14,
            background: 'rgba(15,26,23,0.5)', backdropFilter: 'blur(10px)',
            color: 'var(--canvas)', borderRadius: 100, padding: '6px 10px',
            fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon.layers size={12}/> <span>٤ صور</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ padding: '20px 18px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{product.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 6 }}>{product.sub}</div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--olive)' }}>
              {product.price.toLocaleString('ar-EG')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>ج.م</span>
          </div>
        </div>

        {/* Shop strip */}
        <div style={{ padding: '14px 18px 0' }}>
          <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '10px 14px', display:'flex', alignItems:'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 100, background: 'var(--olive)',
              color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16 }}>{shop.letter}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>تطلبه من</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{shop.name}</div>
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink-light)', display:'flex', alignItems:'center', gap: 4 }}>
              <Icon.clock size={13}/>{shop.eta}
            </span>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            الوصف
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink-light)', lineHeight: 1.7 }}>
            منتج طازج من اختيار {shop.name}. مناسب للاستهلاك اليومي للعيلة. التواريخ والصلاحية مكتوبة على العبوة.
          </div>
        </div>

        {/* Note to shop */}
        <div style={{ padding: '18px 18px 8px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            ملاحظة للمحل
            <span style={{ color: 'var(--ink-light)', fontWeight: 500, marginInlineStart: 6 }}>(اختياري)</span>
          </div>
          <input className="dl-input" value={note} onChange={e => setNote(e.target.value)}
            placeholder="مثلاً: من غير ثلج"/>
        </div>

        {/* Customize / Similar quick links */}
        <div style={{ padding: '8px 18px 24px', display:'flex', gap: 8 }}>
          <button onClick={() => nav.push('customize', { product, shop })}
            className="dl-tappable"
            style={{ all:'unset', cursor:'pointer', flex: 1, background:'#fff',
              border: '1px solid var(--canvas-300)', borderRadius: 10, padding: '12px 14px',
              display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ color: 'var(--olive)', display:'inline-flex' }}><Icon.settings size={16}/></span>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>خصّص الطلب</div>
          </button>
          <button onClick={() => nav.push('similar', { product })}
            className="dl-tappable"
            style={{ all:'unset', cursor:'pointer', flex: 1, background:'#fff',
              border: '1px solid var(--canvas-300)', borderRadius: 10, padding: '12px 14px',
              display:'flex', alignItems:'center', gap: 8 }}>
            <span style={{ color: 'var(--olive)', display:'inline-flex' }}><Icon.sparkle size={16}/></span>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>منتجات شبيهة</div>
          </button>
        </div>
      </div>

      {/* Sticky add bar */}
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)',
        display: 'flex', gap: 12, alignItems: 'center' }}>
        <Stepper value={qty} onChange={setQty} min={1}/>
        <Button variant="primary" size="lg" full onClick={onAdd}
          trailing={<span style={{ opacity: 0.85, fontSize: 13, fontWeight: 500 }}>
            · {(qty * product.price).toLocaleString('ar-EG')} ج.م</span>}>
          {inCart ? 'تحديث السلة' : 'أضف للسلة'}
        </Button>
      </div>
    </div>
  );
}

registerScreen('shop', ShopScreen);
registerScreen('product', ProductScreen);

// Inline unavailable view used when a product is out of stock
function UnavailableInline({ product, shop, nav, app }) {
  const alt = PRODUCTS.filter(p => p.id !== product?.id && p.section === product?.section).slice(0, 4);
  const [notify, setNotify] = React.useState(false);
  return (
    <div className="dl-screen">
      <AppBar onBack={() => nav.pop()} title=""/>
      <div className="dl-scroll">
        <div style={{ margin: '0 18px', height: 220, borderRadius: 16,
          background: product?.hue || 'var(--canvas-200)', position: 'relative', overflow: 'hidden',
          display:'flex', alignItems:'center', justifyContent:'center', opacity: 0.55, filter: 'grayscale(0.4)' }}>
          <div style={{ fontFamily:'var(--font-arabic)', fontWeight: 700, fontSize: 200,
            color: 'rgba(15,26,23,0.10)', lineHeight: 0.9 }}>{product?.name[0]}</div>
          <div style={{ position: 'absolute', insetInlineStart: 14, top: 14 }}>
            <Badge variant="issue">خلصت من المحل</Badge>
          </div>
        </div>
        <div style={{ padding: '20px 18px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{product?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 6 }}>{product?.sub}</div>
          <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(197,59,44,0.08)',
            borderRadius: 12, display:'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon.info size={16}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#A1271C' }}>المنتج ده مش متاح دلوقتي</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-light)', marginTop: 4, lineHeight: 1.5 }}>
                خلص من {shop?.name || 'المحل'}. هنخبرك أول ما يرجع، أو جرّب الاختيارات تحت.
              </div>
            </div>
          </div>
          <button onClick={() => { setNotify(!notify); app.showToast(notify ? 'تم الإلغاء' : 'هنخبرك أول ما يرجع', <Icon.bell size={16}/>); }}
            style={{ all:'unset', cursor:'pointer', width: '100%', marginTop: 14,
              padding: '14px 16px', borderRadius: 12,
              background: notify ? 'var(--olive)' : '#fff',
              border: notify ? 0 : '1.5px solid var(--olive)',
              color: notify ? 'var(--canvas)' : 'var(--olive)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-arabic)', fontWeight: 600, fontSize: 14 }}>
            {notify ? <><Icon.check size={18}/> هتخبرنا أول ما يرجع</> : <><Icon.bell size={18}/> خبّرني أول ما يرجع</>}
          </button>
        </div>
        <div style={{ padding: '24px 18px 24px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            اختيارات شبيهة متاحة دلوقتي
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
            {alt.map((p, i) => (
              <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <ProductTile product={p} qty={0}
                  onTap={() => nav.replace('product', { product: p, shop })}
                  onAdd={() => { app.addItem(p, shop, 1); app.showToast('اتضاف للسلة', <Icon.check size={16}/>); }}
                  onChange={() => {}}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
