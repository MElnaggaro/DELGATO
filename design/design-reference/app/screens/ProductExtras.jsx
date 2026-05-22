// screens/ProductExtras.jsx — Product gallery, Customize (add-ons / modifiers), Reviews, Similar, Unavailable
const { useState: useStPE, useEffect: useEfPE, useRef: useRfPE } = React;

// ── Product Gallery (full-screen swipeable hero) ─────────────────
function ProductGalleryScreen({ product }) {
  const nav = useNav();
  const [idx, setIdx] = useStPE(0);
  // We don't have real images; simulate 4 variant tiles using subtle hue variations.
  const baseHue = product.hue;
  const tiles = Array.from({ length: 4 }, (_, i) => ({
    id: i, hue: i === 0 ? baseHue : `hsl(${30 + i * 12}, ${20 - i * 3}%, ${88 - i * 2}%)`,
  }));

  return (
    <div className="dl-screen dl-screen--ink">
      <div style={{ padding: '14px 18px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => nav.pop()} style={{ background:'rgba(250,248,243,0.10)', border: 0, padding: 8,
          borderRadius: 100, color: 'var(--canvas)', cursor:'pointer', display:'flex' }}>
          <Icon.chevronRight size={20}/>
        </button>
        <div style={{ flex: 1, textAlign:'center', fontSize: 14, color: 'rgba(250,248,243,0.7)' }}>
          <span className="mono">{(idx + 1).toLocaleString('ar-EG')} / {tiles.length.toLocaleString('ar-EG')}</span>
        </div>
        <button style={{ background:'rgba(250,248,243,0.10)', border: 0, padding: 8,
          borderRadius: 100, color: 'var(--canvas)', cursor:'pointer', display:'flex' }}>
          <Icon.share size={20}/>
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div key={idx} className="dl-fade-up" style={{
          width: '100%', maxWidth: 320, aspectRatio: '1 / 1',
          background: tiles[idx].hue, borderRadius: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 240,
            color: 'rgba(15,26,23,0.10)', lineHeight: 0.9 }}>{product.name[0]}</div>
        </div>
      </div>

      <div style={{ padding: '0 18px 14px', display: 'flex', gap: 8, justifyContent: 'center' }}>
        {tiles.map((t, i) => (
          <button key={t.id} onClick={() => setIdx(i)}
            style={{ all:'unset', cursor:'pointer',
              width: 56, height: 56, borderRadius: 10, background: t.hue,
              border: idx === i ? '2px solid var(--gold)' : '2px solid transparent',
              transition: 'border-color 150ms var(--ease-out)' }}/>
        ))}
      </div>

      <div style={{ padding: '14px 18px 24px', color: 'var(--canvas)' }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{product.name}</div>
        <div style={{ fontSize: 13, color: 'rgba(250,248,243,0.7)', marginTop: 4 }}>{product.sub}</div>
      </div>
    </div>
  );
}

// ── Customize (add-ons / modifiers) ──────────────────────────────
function CustomizeScreen({ product, shop }) {
  const nav = useNav();
  const app = useApp();
  const [size, setSize] = useStPE('m');
  const [extras, setExtras] = useStPE([]);
  const [note, setNote] = useStPE('');
  const [qty, setQty] = useStPE(1);

  const sizeOpts = PRODUCT_ADDONS.size.options;
  const extraOpts = PRODUCT_ADDONS.extras.options;
  const sizeAdd = sizeOpts.find(s => s.id === size)?.price || 0;
  const extrasAdd = extras.reduce((s, id) => s + (extraOpts.find(o => o.id === id)?.price || 0), 0);
  const unit = product.price + sizeAdd + extrasAdd;
  const total = unit * qty;

  const toggleExtra = (id) => {
    setExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="dl-screen">
      <AppBar title="خصص طلبك" onBack={() => nav.pop()}/>

      <div className="dl-scroll">
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ display:'flex', gap: 14, alignItems:'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, background: product.hue,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 38, color: 'rgba(15,26,23,0.18)' }}>
              {product.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{product.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4 }}>{product.sub}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--olive)', marginTop: 6 }}>
                من {product.price.toLocaleString('ar-EG')} ج.م
              </div>
            </div>
          </div>
        </div>

        {/* Size — required, one-of */}
        <AddonGroup label="الحجم" required tag="مطلوب">
          {sizeOpts.map(o => (
            <button key={o.id} onClick={() => setSize(o.id)}
              style={{ all:'unset', cursor:'pointer', width: '100%',
                padding: '12px 14px', borderRadius: 12,
                background: '#fff', border: `1.5px solid ${size === o.id ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 150ms var(--ease-out)' }}>
              <div style={{ width: 20, height: 20, borderRadius: 100,
                border: `2px solid ${size === o.id ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {size === o.id && <div style={{ width: 10, height: 10, borderRadius: 100, background: 'var(--olive)' }}/>}
              </div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{o.name}</div>
              <div style={{ fontSize: 13, color: o.price > 0 ? 'var(--olive)' : 'var(--ink-light)', fontWeight: 600 }}>
                {o.price > 0 ? `+ ${o.price.toLocaleString('ar-EG')} ج.م` : 'مجاناً'}
              </div>
            </button>
          ))}
        </AddonGroup>

        {/* Extras — multi */}
        <AddonGroup label="إضافات" tag="اختياري · اختار اللي تحبه">
          {extraOpts.map(o => {
            const sel = extras.includes(o.id);
            return (
              <button key={o.id} onClick={() => toggleExtra(o.id)}
                style={{ all:'unset', cursor:'pointer', width: '100%',
                  padding: '12px 14px', borderRadius: 12,
                  background: '#fff', border: `1.5px solid ${sel ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'all 150ms var(--ease-out)' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6,
                  border: `1.5px solid ${sel ? 'var(--olive)' : 'var(--canvas-300)'}`,
                  background: sel ? 'var(--olive)' : '#fff',
                  color: 'var(--canvas)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {sel && <Icon.check size={14}/>}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{o.name}</div>
                <div style={{ fontSize: 13, color: o.price > 0 ? 'var(--olive)' : 'var(--ink-light)', fontWeight: 600 }}>
                  {o.price > 0 ? `+ ${o.price.toLocaleString('ar-EG')} ج.م` : 'مجاناً'}
                </div>
              </button>
            );
          })}
        </AddonGroup>

        {/* Note */}
        <AddonGroup label="ملاحظة للمحل" tag="اختياري">
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="مثلاً: لو الحجم الكبير مش متاح، نزّلوا وسط بدلاً منه."
            style={{ width:'100%', minHeight: 84, padding: 12, fontFamily:'var(--font-arabic)',
              borderRadius: 10, border: '1.5px solid var(--canvas-300)', background:'#fff',
              resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box' }}/>
        </AddonGroup>

        <div style={{ height: 100 }}/>
      </div>

      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)',
        borderTop: '1px solid var(--canvas-300)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <Stepper value={qty} onChange={setQty} min={1}/>
        <Button variant="primary" size="lg" full onClick={() => {
          app.addItem({ ...product, price: unit, sub: `${product.sub} · ${sizeOpts.find(s => s.id === size).name}` }, shop, qty);
          app.showToast(`اتضاف ${qty.toLocaleString('ar-EG')}× ${product.name}`, <Icon.check size={16}/>);
          nav.pop();
        }}
          trailing={<span style={{ opacity: 0.85, fontSize: 13, fontWeight: 500 }}>· {total.toLocaleString('ar-EG')} ج.م</span>}>
          أضف للسلة
        </Button>
      </div>
    </div>
  );
}

function AddonGroup({ label, required, tag, children }) {
  return (
    <div style={{ padding: '0 18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
          {label}{required && <span style={{ color: '#A1271C', marginInlineStart: 4 }}>*</span>}
        </div>
        {tag && <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{tag}</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

// ── Reviews ───────────────────────────────────────────────────────
function ReviewsScreen({ shop }) {
  const nav = useNav();
  const [filter, setFilter] = useStPE('all');

  const filtered = filter === 'all' ? REVIEWS
                  : filter === 'high' ? REVIEWS.filter(r => r.stars >= 4)
                  : REVIEWS.filter(r => r.stars < 4);

  const avg = (REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length).toFixed(1);
  const breakdown = [5, 4, 3, 2, 1].map(n => ({
    n, count: REVIEWS.filter(r => r.stars === n).length,
    pct: REVIEWS.filter(r => r.stars === n).length / REVIEWS.length * 100,
  }));

  return (
    <div className="dl-screen">
      <AppBar title={`تقييمات ${shop?.name || 'المحل'}`} onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--olive)', lineHeight: 1 }}>
              {avg.toString().replace(/[0-9.]/g, d => d === '.' ? '٫' : '٠١٢٣٤٥٦٧٨٩'[d])}
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 2, justifyContent: 'center', color: 'var(--gold)' }}>
              {[1,2,3,4,5].map(n => <Icon.star key={n} size={14}/>)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4 }}>
              {REVIEWS.length.toLocaleString('ar-EG')} تقييم
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {breakdown.map(b => (
              <div key={b.n} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                <span style={{ color: 'var(--ink-light)', width: 14 }}>{b.n}</span>
                <Icon.star size={11} className=""/>
                <div style={{ flex: 1, height: 6, borderRadius: 100, background: 'var(--canvas-200)', overflow: 'hidden' }}>
                  <div style={{ width: `${b.pct}%`, height: '100%', background: 'var(--gold)',
                    transition: 'width 480ms var(--ease-out)' }}/>
                </div>
                <span style={{ color: 'var(--ink-light)', minWidth: 18, textAlign: 'left' }}>
                  {b.count.toLocaleString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 0 10px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { k: 'all', l: 'الكل' },
            { k: 'high', l: 'الإيجابية ٤+' },
            { k: 'low', l: 'سلبية' },
          ].map(c => (
            <Chip key={c.k} active={filter === c.k} onClick={() => setFilter(c.k)}>{c.l}</Chip>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((r, i) => (
            <div key={r.id} className="dl-card dl-rise" style={{ animationDelay: `${i * 50}ms`, padding: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 100, background: 'var(--canvas-200)',
                  color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--font-arabic)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {r.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 4, color: 'var(--gold)' }}>
                    {[1,2,3,4,5].map(n => (
                      <Icon.star key={n} size={12} className={n > r.stars ? 'op-30' : ''}/>
                    ))}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 8, lineHeight: 1.6 }}>{r.body}</div>
                  {r.tags.length > 0 && (
                    <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginTop: 10 }}>
                      {r.tags.map(t => (
                        <span key={t} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100,
                          background: 'var(--canvas-200)', color: 'var(--ink-light)' }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Similar Products ─────────────────────────────────────────────
function SimilarScreen({ product }) {
  const nav = useNav();
  const app = useApp();
  const similar = PRODUCTS.filter(p => p.id !== product?.id && (p.section === product?.section || p.tag));
  return (
    <div className="dl-screen">
      <AppBar title="منتجات شبيهة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '8px 18px 24px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '10px 14px',
          fontSize: 12, color: 'var(--ink-light)', marginBottom: 12, display:'flex', gap: 10 }}>
          <Icon.sparkle size={14}/>
          <span>منتجات شبيهة بـ {product?.name || 'هذا المنتج'} من نفس المحل أو محلات تانية.</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
          {similar.map((p, i) => (
            <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
              <RecTile product={p}
                onClick={() => nav.push('product', { product: p, shop: SHOPS[0] })}
                onAdd={() => { app.addItem(p, SHOPS[0], 1); app.showToast('اتضاف للسلة', <Icon.check size={16}/>); }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Unavailable Product ──────────────────────────────────────────
function UnavailableProductScreen({ product, shop }) {
  const nav = useNav();
  const app = useApp();
  const [notify, setNotify] = useStPE(false);
  const alt = PRODUCTS.filter(p => p.id !== product?.id && p.section === product?.section).slice(0, 4);

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
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(197,59,44,0.15)',
              color: '#A1271C', display: 'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
              <Icon.info size={16}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#A1271C' }}>المنتج ده مش متاح دلوقتي</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-light)', marginTop: 4, lineHeight: 1.5 }}>
                خلص من {shop?.name || 'المحل'}. هنخبرك أول ما يرجع، أو جرّب الاختيارات الشبيهة تحت.
              </div>
            </div>
          </div>

          <button onClick={() => setNotify(!notify)}
            style={{ all:'unset', cursor:'pointer', width: '100%', marginTop: 14,
              padding: '14px 16px', borderRadius: 12,
              background: notify ? 'var(--olive)' : '#fff',
              border: notify ? 0 : '1.5px solid var(--olive)',
              color: notify ? 'var(--canvas)' : 'var(--olive)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-arabic)', fontWeight: 600, fontSize: 14,
              transition: 'all 200ms var(--ease-out)' }}>
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
                <RecTile product={p}
                  onClick={() => nav.replace('product', { product: p, shop })}
                  onAdd={() => { app.addItem(p, shop, 1); app.showToast('اتضاف للسلة', <Icon.check size={16}/>); }}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

registerScreen('productGallery', ProductGalleryScreen);
registerScreen('customize', CustomizeScreen);
registerScreen('reviews', ReviewsScreen);
registerScreen('similar', SimilarScreen);
registerScreen('unavailable', UnavailableProductScreen);
