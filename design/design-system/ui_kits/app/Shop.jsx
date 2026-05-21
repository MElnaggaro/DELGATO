// Shop.jsx — shop detail with hero, search, products grid, mini-cart bar
const { useState: useStateS, useMemo: useMemoS } = React;

function ProductTile({ product, qty, onAdd, onChange }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1px solid var(--canvas-300)',
      padding: 10, display: 'flex', flexDirection: 'column', gap: 8,
      position: 'relative',
    }}>
      <div style={{
        height: 96, borderRadius: 10, background: product.hue,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start',
        padding: 8, position: 'relative', overflow: 'hidden',
      }}>
        {/* placeholder glyph — first Arabic letter */}
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
          <Stepper compact value={qty} onChange={onChange} min={0} />
        ) : (
          <button onClick={onAdd} aria-label="أضف"
            style={{
              width: 30, height: 30, borderRadius: 8, border: 0,
              background: 'var(--olive)', color: 'var(--canvas)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            <Icon.plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Shop({ shop, onBack, cart, setCart, onCart }) {
  const [q] = useStateS('');
  const list = PRODUCTS;
  const itemsInCart = useMemoS(() => cart.reduce((acc, i) => { acc[i.id] = i.qty; return acc; }, {}), [cart]);
  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);

  const setQty = (p, qty) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === p.id);
      if (qty <= 0) return prev.filter(i => i.id !== p.id);
      if (idx === -1) return [...prev, { id: p.id, name: p.name, sub: p.sub, price: p.price, qty, hue: p.hue, shop: shop.name }];
      const out = [...prev]; out[idx] = { ...out[idx], qty }; return out;
    });
  };

  return (
    <div className="dl-screen">
      {/* Sticky app bar */}
      <AppBar title={shop.name} onBack={onBack}
        trailing={<button style={{ background: 'transparent', border: 0, padding: 6, cursor: 'pointer', color: 'var(--ink)', display:'flex' }}>
          <Icon.heart size={22} />
        </button>}/>

      <div className="dl-scroll">
        {/* Shop hero */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{
            height: 140, borderRadius: 14, background: shop.bg, color: 'var(--canvas)',
            padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', insetBlockStart: -20, insetInlineEnd: -20,
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 160,
              color: 'rgba(250,248,243,0.07)', lineHeight: 1 }}>{shop.letter}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge variant="solid-gold">{shop.rating} ★</Badge>
              <Badge variant="solid-olive" style={{ background: 'rgba(250,248,243,0.18)' }}>{shop.cat}</Badge>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-arabic)' }}>{shop.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.75)', marginTop: 4, display: 'flex', gap: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.clock size={13} /> {shop.eta}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.bike size={13} /> توصيل {shop.fee}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon.pin size={13} /> {shop.distance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky category strip */}
        <div style={{ display: 'flex', gap: 6, padding: '0 18px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['الكل', 'الأكثر طلباً', 'منتجات الألبان', 'مخبوزات', 'خضروات', 'مشروبات'].map((c, i) => (
            <Chip key={c} active={i === 0}>{c}</Chip>
          ))}
        </div>

        {/* Products grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 18px 140px',
        }}>
          {list.map(p => (
            <ProductTile key={p.id} product={p}
              qty={itemsInCart[p.id] || 0}
              onAdd={() => setQty(p, 1)}
              onChange={(n) => setQty(p, n)}/>
          ))}
        </div>
      </div>

      {/* Floating mini-cart bar */}
      {cartCount > 0 && (
        <div style={{
          position: 'absolute', insetInline: 16, bottom: 16,
          background: 'var(--olive)', color: 'var(--canvas)', borderRadius: 14,
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(15,26,23,0.22)', cursor: 'pointer',
        }} onClick={onCart}>
          <div style={{
            background: 'var(--gold)', color: 'var(--ink)', width: 28, height: 28, borderRadius: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>{cartCount.toLocaleString('ar-EG')}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>عرض السلة</div>
            <div style={{ fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>{shop.name}</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {subtotal.toLocaleString('ar-EG')} <span style={{ fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>ج.م</span>
          </div>
        </div>
      )}
    </div>
  );
}

window.Shop = Shop;
