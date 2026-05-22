// app/merchant/screens/Products.jsx — Product list, search/filter, add, edit, archived, stock alerts
const { useState: useStMP, useEffect: useEfMP } = React;

// ── Products list ─────────────────────────────────────────────────
function ProductsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [q, setQ] = useStMP('');
  const [filter, setFilter] = useStMP('available');
  const [actionFor, setActionFor] = useStMP(null);

  const visible = m.products.filter(p => {
    if (q && !p.name.includes(q) && !p.sub.includes(q)) return false;
    if (filter === 'available') return p.availability === 'available' || p.availability === 'low';
    if (filter === 'low') return p.availability === 'low' || p.availability === 'out';
    if (filter === 'archived') return p.availability === 'archived';
    return true;
  });

  const toggleAvail = (p) => {
    const next = p.availability === 'archived' || p.availability === 'out' ? 'available' : 'out';
    m.setProducts(prev => prev.map(x => x.id === p.id ? { ...x, availability: next } : x));
    m.showToast(next === 'available' ? `${p.name} اتفعّل` : `${p.name} اتوقف`,
      <Icon.check size={16}/>);
  };

  return (
    <div className="dl-screen">
      <div style={{ padding: '14px 18px 6px', display:'flex', alignItems:'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>المنتجات</div>
          <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>
            {m.products.filter(p => p.availability !== 'archived').length.toLocaleString('ar-EG')} منتج شغّال · {m.lowStockProducts.length.toLocaleString('ar-EG')} منخفض
          </div>
        </div>
        <button onClick={() => nav.push('stockAlerts')} aria-label="مخزون"
          style={{ width: 40, height: 40, borderRadius: 100, border: 0, background: 'var(--canvas-200)',
            color: 'var(--ink)', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            position: 'relative' }}>
          <Icon.package size={20}/>
          {m.lowStockProducts.length > 0 && (
            <span style={{ position: 'absolute', top: 8, insetInlineEnd: 8, width: 8, height: 8,
              background: 'var(--gold)', borderRadius: 100, border: '2px solid var(--canvas-200)' }}/>
          )}
        </button>
      </div>

      <div style={{ padding: '8px 18px 8px' }}>
        <SearchField value={q} onChange={e => setQ(e.target.value)}
          onClear={() => setQ('')}
          placeholder="ابحث في منتجات المحل"/>
      </div>

      <div style={{ padding: '4px 18px 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'available', l: 'كل المنتجات' },
          { k: 'low', l: 'مخزن منخفض' },
          { k: 'archived', l: 'مؤرشف' },
        ].map(c => (
          <Chip key={c.k} active={filter === c.k} onClick={() => setFilter(c.k)}>{c.l}</Chip>
        ))}
      </div>

      <div className="dl-scroll" style={{ padding: '0 18px 110px' }}>
        {visible.length === 0 ? (
          <EmptyState icon={<Icon.package size={32}/>} title="مفيش منتجات بالشروط دي"
            body="ضيف منتج جديد أو غيّر الفلتر."
            action={<Button variant="primary" onClick={() => nav.push('addProduct')}>منتج جديد</Button>}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visible.map((p, i) => (
              <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 20}ms` }}>
                <ProductRow product={p}
                  onClick={() => nav.push('editProduct', { product: p })}
                  onToggle={toggleAvail}/>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <button onClick={() => nav.push('addProduct')}
        aria-label="ضيف منتج"
        style={{ position: 'absolute', insetInlineStart: 18, bottom: 96,
          width: 56, height: 56, borderRadius: 100, border: 0,
          background: 'var(--olive)', color: 'var(--canvas)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(31,74,61,0.32)', zIndex: 10 }}>
        <Icon.plus size={26}/>
      </button>

      <MBottomTabBar active="products" badgeOrders={m.counts.new}
        onTab={(t) => nav.reset(t === 'more' ? 'more' : t)}/>
    </div>
  );
}

// ── Add / Edit Product ───────────────────────────────────────────
function ProductFormScreen({ product }) {
  const nav = useNav();
  const m = useMerchant();
  const isEdit = !!product;
  const [name, setName] = useStMP(product?.name || '');
  const [sub, setSub] = useStMP(product?.sub || '');
  const [price, setPrice] = useStMP(product?.price?.toString() || '');
  const [cost, setCost] = useStMP(product?.cost?.toString() || '');
  const [stock, setStock] = useStMP(product?.stock?.toString() || '');
  const [category, setCategory] = useStMP(product?.category || m.categories[0]?.name);
  const [available, setAvailable] = useStMP(product ? (product.availability !== 'out' && product.availability !== 'archived') : true);
  const [showActions, setShowActions] = useStMP(false);

  const valid = name.trim().length >= 2 && price && parseInt(price) > 0;

  const save = () => {
    if (!valid) return;
    if (isEdit) {
      m.setProducts(prev => prev.map(x => x.id === product.id ? {
        ...x, name, sub, price: parseInt(price), cost: parseInt(cost || 0), stock: parseInt(stock || 0), category,
        availability: !available ? 'out' : (parseInt(stock || 0) < 5 ? 'low' : 'available'),
      } : x));
      m.showToast(`اتحفظت تغييرات ${name}`, <Icon.check size={16}/>);
    } else {
      const id = 'p' + Date.now();
      m.setProducts(prev => [{
        id, name, sub, price: parseInt(price), cost: parseInt(cost || 0), stock: parseInt(stock || 0),
        category, hue: '#F2EEE3', soldToday: 0, sku: 'DM-NEW-' + (m.products.length + 1).toString().padStart(2, '0'),
        availability: !available ? 'out' : (parseInt(stock || 0) < 5 ? 'low' : 'available'),
      }, ...prev]);
      m.showToast(`اتضاف ${name}`, <Icon.check size={16}/>);
    }
    nav.pop();
  };

  return (
    <div className="dl-screen">
      <AppBar title={isEdit ? 'تعديل المنتج' : 'منتج جديد'} onBack={() => nav.pop()}
        trailing={isEdit && (
          <button onClick={() => setShowActions(true)}
            style={{ background:'transparent', border: 0, padding: 6, color: 'var(--ink)', cursor:'pointer', display:'flex' }}>
            <Icon.settings size={20}/>
          </button>
        )}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Image */}
        <div style={{ display:'flex', justifyContent:'center', padding: '14px 0 22px' }}>
          <div style={{ width: 110, height: 110, borderRadius: 14, background: product?.hue || '#F2EEE3',
            display:'flex', alignItems:'center', justifyContent:'center', position: 'relative',
            border: '1.5px dashed var(--canvas-300)' }}>
            <div style={{ fontFamily:'var(--font-arabic)', fontWeight: 700, fontSize: 64,
              color: 'rgba(15,26,23,0.10)' }}>{name[0] || '؟'}</div>
            <button style={{ position:'absolute', insetBlockEnd: -8, insetInlineEnd: -8,
              width: 34, height: 34, borderRadius: 100, background: 'var(--olive)',
              color: 'var(--canvas)', border: '3px solid var(--canvas)', cursor: 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.edit size={16}/>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Fld label="اسم المنتج">
            <input className="dl-input" placeholder="مثلاً: لبن جهينة" autoFocus
              value={name} onChange={e => setName(e.target.value)}/>
          </Fld>
          <Fld label="وصف قصير" sub="٧٠ حرف الحد الأقصى">
            <input className="dl-input" placeholder="مثلاً: كامل الدسم · ١ لتر"
              value={sub} onChange={e => setSub(e.target.value.slice(0, 70))}/>
          </Fld>
          <Fld label="القسم">
            <select className="dl-input" value={category} onChange={e => setCategory(e.target.value)}
              style={{ appearance: 'none', backgroundImage: 'none', cursor: 'pointer' }}>
              {m.categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Fld>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Fld label="سعر البيع (ج.م)">
              <input className="dl-input" inputMode="numeric"
                value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))}/>
            </Fld>
            <Fld label="تكلفة الشراء (ج.م)" sub="اختياري">
              <input className="dl-input" inputMode="numeric"
                value={cost} onChange={e => setCost(e.target.value.replace(/[^0-9]/g, ''))}/>
            </Fld>
          </div>

          {price && cost && parseInt(price) > 0 && parseInt(cost) > 0 && (
            <div className="dl-fade-up" style={{ padding: '10px 14px', background: 'rgba(31,74,61,0.06)',
              borderRadius: 10, display: 'flex', gap: 10, fontSize: 12, color: 'var(--ink-light)' }}>
              <Icon.flame size={14}/>
              <span>هامش الربح: <strong style={{ color: 'var(--olive)' }}>
                {Math.round(((parseInt(price) - parseInt(cost)) / parseInt(price)) * 100).toLocaleString('ar-EG')}٪
              </strong> · ربح {(parseInt(price) - parseInt(cost)).toLocaleString('ar-EG')} ج.م للقطعة</span>
            </div>
          )}

          <Fld label="الكمية في المخزن" sub="هنحذرك لما تقرب تخلص">
            <input className="dl-input" inputMode="numeric"
              value={stock} onChange={e => setStock(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="٠"/>
          </Fld>

          {/* Availability toggle */}
          <div className="dl-card" style={{ padding: 4 }}>
            <TogRow label="متاح للبيع" sub="العملاء يقدروا يشوفوه ويطلبوه دلوقتي"
              v={available} onChange={() => setAvailable(!available)}/>
          </div>

          {/* Add-on groups (linked to modifiers) */}
          <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
            display:'flex', alignItems:'center', gap: 10, cursor: 'pointer' }} onClick={() => nav.push('modifiers')}>
            <Icon.layers size={16}/>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>
              ربط بمجموعات الإضافات
            </div>
            <Icon.chevronLeft size={16}/>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!valid} onClick={save}>
          {isEdit ? 'حفظ التغييرات' : 'إضافة للمحل'}
        </Button>
      </div>

      {showActions && (
        <Sheet title={`إجراءات · ${name}`} onClose={() => setShowActions(false)}>
          <div style={{ padding: '4px 0 24px' }}>
            <ListRow icon={<Icon.copy size={18}/>} label="استنساخ المنتج" sub="ينشئ نسخة جديدة بنفس الإعدادات"
              onClick={() => {
                m.setProducts(prev => [{...product, id: 'p' + Date.now(), name: name + ' (نسخة)', soldToday: 0 }, ...prev]);
                m.showToast('اتعمل استنساخ', <Icon.copy size={16}/>);
                setShowActions(false); nav.pop();
              }}/>
            <hr className="dl-divider"/>
            <ListRow icon={<Icon.package size={18}/>} label="أرشفة المنتج" sub="هيختفي من القائمة بس بياناته محفوظة"
              onClick={() => {
                m.setProducts(prev => prev.map(p => p.id === product.id ? { ...p, availability: 'archived' } : p));
                m.showToast('اتأرشف المنتج', <Icon.check size={16}/>);
                setShowActions(false); nav.pop();
              }}/>
            <hr className="dl-divider"/>
            <ListRow icon={<Icon.trash size={18}/>} label="حذف نهائي" danger
              sub="مفيش رجوع · هيختفي خالص"
              onClick={() => {
                m.setProducts(prev => prev.filter(p => p.id !== product.id));
                m.showToast('اتحذف المنتج', <Icon.trash size={16}/>);
                setShowActions(false); nav.pop();
              }}/>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function Fld({ label, sub, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.03em' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>· {sub}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Stock Alerts ─────────────────────────────────────────────────
function StockAlertsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const low = m.products.filter(p => p.availability === 'low');
  const out = m.products.filter(p => p.availability === 'out');

  return (
    <div className="dl-screen">
      <AppBar title="تنبيهات المخزن" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {out.length === 0 && low.length === 0 ? (
          <EmptyState icon={<Icon.shieldCheck size={32}/>}
            title="كله تمام في المخزن"
            body="مفيش منتجات نفدت أو على وشك تخلص."/>
        ) : (
          <>
            {out.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, color: '#A1271C', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 10,
                  display:'flex', alignItems:'center', gap: 6 }}>
                  <Icon.info size={14}/> منتجات خلصت من المخزن · {out.length.toLocaleString('ar-EG')}
                </div>
                <div style={{ display:'flex', flexDirection: 'column', gap: 8 }}>
                  {out.map((p, i) => (
                    <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
                      <StockRow product={p}
                        onRestock={(qty) => {
                          m.setProducts(prev => prev.map(x => x.id === p.id ? {...x, stock: qty,
                            availability: qty < 5 ? 'low' : 'available' } : x));
                          m.showToast(`تم تموين ${p.name}`, <Icon.check size={16}/>);
                        }}/>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {low.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 12, color: '#8a6418', fontWeight: 700, letterSpacing: '0.04em', marginBottom: 10,
                  display:'flex', alignItems:'center', gap: 6 }}>
                  <Icon.flame size={14}/> منتجات قربت تخلص · {low.length.toLocaleString('ar-EG')}
                </div>
                <div style={{ display:'flex', flexDirection: 'column', gap: 8 }}>
                  {low.map((p, i) => (
                    <div key={p.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
                      <StockRow product={p}
                        onRestock={(qty) => {
                          m.setProducts(prev => prev.map(x => x.id === p.id ? {...x, stock: qty,
                            availability: qty < 5 ? 'low' : 'available' } : x));
                          m.showToast(`تم تموين ${p.name}`, <Icon.check size={16}/>);
                        }}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 22, padding: '12px 14px', background: 'var(--canvas-200)', borderRadius: 10,
              fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display:'flex', gap: 10 }}>
              <Icon.info size={14}/>
              <span>هنخبرك لما الكمية تقل عن ٥ قطع. تقدر تعدل الحد من إعدادات المنتج.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StockRow({ product, onRestock }) {
  const [adjust, setAdjust] = useStMP(false);
  const [qty, setQty] = useStMP(20);

  if (adjust) {
    return (
      <div className="dl-card dl-fade-up" style={{ padding: 14 }}>
        <div style={{ display:'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: product.hue,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 22, color: 'rgba(15,26,23,0.18)' }}>
            {product.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{product.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>
              الموجود حالياً: <span style={{ fontWeight: 700, color: product.stock === 0 ? '#A1271C' : '#8a6418' }}>
                {product.stock.toLocaleString('ar-EG')}
              </span>
            </div>
          </div>
        </div>
        <Fld label="كمية إضافية">
          <div style={{ display:'flex', gap: 10, alignItems: 'center' }}>
            <Stepper value={qty} onChange={setQty} min={1}/>
            <div style={{ flex: 1, textAlign: 'left', fontSize: 13, color: 'var(--ink-light)' }}>
              المخزن الجديد: <span style={{ fontWeight: 700, color: 'var(--olive)' }}>
                {(product.stock + qty).toLocaleString('ar-EG')}
              </span>
            </div>
          </div>
        </Fld>
        <div style={{ display:'flex', gap: 8, marginTop: 14 }}>
          <Button variant="ghost" full onClick={() => setAdjust(false)}>تراجع</Button>
          <Button variant="primary" full onClick={() => { onRestock(product.stock + qty); setAdjust(false); }}>
            تأكيد التموين
          </Button>
        </div>
      </div>
    );
  }

  const out = product.availability === 'out';
  return (
    <div className="dl-card" style={{ padding: 14, display:'flex', gap: 12, alignItems: 'center',
      borderInlineStart: `3px solid ${out ? '#C53B2C' : 'var(--gold)'}` }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: product.hue,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 22, color: 'rgba(15,26,23,0.18)' }}>
        {product.name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{product.name}</div>
        <div style={{ fontSize: 12, color: out ? '#A1271C' : '#8a6418', fontWeight: 600, marginTop: 2 }}>
          {out ? 'خلصان · ٠ قطعة' : `باقي ${product.stock.toLocaleString('ar-EG')} قطعة بس`}
        </div>
      </div>
      <Button variant="primary" onClick={() => setAdjust(true)} leading={<Icon.plus size={14}/>}>
        تموين
      </Button>
    </div>
  );
}

registerScreen('products', ProductsScreen);
registerScreen('addProduct', () => <ProductFormScreen/>);
registerScreen('editProduct', ProductFormScreen);
registerScreen('stockAlerts', StockAlertsScreen);
