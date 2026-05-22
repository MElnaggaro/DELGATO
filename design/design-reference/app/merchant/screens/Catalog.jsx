// app/merchant/screens/Catalog.jsx — Categories, Modifiers/Addons, Pricing
const { useState: useStMC } = React;

// ── Catalog hub ───────────────────────────────────────────────────
function CatalogScreen() {
  const nav = useNav();
  const m = useMerchant();
  return (
    <div className="dl-screen">
      <AppBar title="الأقسام والإضافات" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <CatalogTile icon={<Icon.layers size={20}/>} label="الأقسام"
            value={m.categories.filter(c => c.visible).length} onClick={() => nav.push('categories')}/>
          <CatalogTile icon={<Icon.sparkle size={20}/>} label="الإضافات"
            value={m.modifiers.length} onClick={() => nav.push('modifiers')}/>
          <CatalogTile icon={<Icon.tag size={20}/>} label="الأسعار"
            value={m.products.length} onClick={() => nav.push('pricing')}/>
        </div>

        <div style={{ marginTop: 22 }}>
          <SectionHead title="إجراءات سريعة"/>
        </div>
        <Group>
          <ListRow icon={<Icon.plus size={18}/>} label="إضافة قسم جديد"
            onClick={() => nav.push('categories')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.layers size={18}/>} label="إنشاء مجموعة إضافات"
            sub="مثلاً: أحجام، تعديلات، تغليف"
            onClick={() => nav.push('modifiers')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.flame size={18}/>} label="تعديل أسعار بالجملة"
            sub="رفع/خفض ثابت على مجموعة منتجات"
            onClick={() => nav.push('pricing')}/>
        </Group>
      </div>
    </div>
  );
}

function CatalogTile({ icon, label, value, onClick }) {
  return (
    <button onClick={onClick} className="dl-tappable"
      style={{ all:'unset', cursor:'pointer', background: '#fff', borderRadius: 12, padding: '14px 8px',
        boxShadow: 'var(--shadow-card)', textAlign: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
        color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center', margin: '0 auto 8px' }}>
        {icon}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--olive)' }}>
        {value.toLocaleString('ar-EG')}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{label}</div>
    </button>
  );
}

// ── Categories ────────────────────────────────────────────────────
function CategoriesScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [adding, setAdding] = useStMC(false);
  const [newName, setNewName] = useStMC('');

  const toggleVisible = (c) => {
    m.setCategories(prev => prev.map(x => x.id === c.id ? { ...x, visible: !x.visible } : x));
  };
  const removeCat = (id) => {
    m.setCategories(prev => prev.filter(c => c.id !== id));
    m.showToast('اتمسح القسم', <Icon.check size={16}/>);
  };

  return (
    <div className="dl-screen">
      <AppBar title="الأقسام" onBack={() => nav.pop()}
        trailing={<button onClick={() => setAdding(true)}
          style={{ background:'transparent', border: 0, padding: 6, color: 'var(--olive)',
            fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700, cursor:'pointer',
            display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.plus size={16}/> ضيف
        </button>}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10,
          marginBottom: 14 }}>
          <Icon.info size={14}/>
          <span>الأقسام بتساعد العميل يلاقي منتجاتك بسرعة. اسحب لإعادة الترتيب.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {m.categories.map((c, i) => (
            <div key={c.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 12,
                border: '1px solid var(--canvas-300)',
                display:'flex', gap: 12, alignItems:'center',
                opacity: c.visible ? 1 : 0.55 }}>
                <button style={{ background:'transparent', border: 0, color: 'var(--ink-mute)',
                  cursor: 'grab', padding: 4, display: 'flex' }}>
                  <Icon.layers size={16}/>
                </button>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
                  color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {c.icon === 'leaf' && <Icon.leaf size={18}/>}
                  {c.icon === 'cookie' && <Icon.cookie size={18}/>}
                  {c.icon === 'store' && <Icon.store size={18}/>}
                  {c.icon === 'package' && <Icon.package size={18}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                    {c.count.toLocaleString('ar-EG')} منتج
                  </div>
                </div>
                <button onClick={() => toggleVisible(c)}
                  style={{ width: 38, height: 22, borderRadius: 100, border: 0, cursor: 'pointer',
                    background: c.visible ? 'var(--olive)' : 'var(--canvas-300)',
                    position: 'relative', transition: 'background 200ms var(--ease-out)' }}>
                  <span style={{ position:'absolute', top: 3, insetInlineStart: c.visible ? 19 : 3,
                    width: 16, height: 16, borderRadius: 100, background: '#fff',
                    transition: 'inset-inline-start 200ms var(--ease-out)' }}/>
                </button>
                <button onClick={() => removeCat(c.id)}
                  style={{ background:'transparent', border: 0, padding: 6, color: 'var(--ink-mute)', cursor: 'pointer', display:'flex' }}>
                  <Icon.trash size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {adding && (
        <Sheet title="إضافة قسم جديد" onClose={() => { setAdding(false); setNewName(''); }}>
          <div style={{ padding: '4px 18px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6 }}>اسم القسم</div>
            <input className="dl-input dl-input--lg" autoFocus
              placeholder="مثلاً: مأكولات مجمدة"
              value={newName} onChange={e => setNewName(e.target.value)}/>
            <Button variant="primary" full size="lg" style={{ marginTop: 14 }}
              disabled={newName.trim().length < 2}
              onClick={() => {
                m.setCategories(prev => [...prev, { id: 'c' + Date.now(), name: newName.trim(), count: 0, icon: 'package', visible: true }]);
                m.showToast('اتضاف قسم جديد', <Icon.check size={16}/>);
                setAdding(false); setNewName('');
              }}>
              إضافة القسم
            </Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ── Modifiers list ────────────────────────────────────────────────
function ModifiersScreen() {
  const nav = useNav();
  const m = useMerchant();

  return (
    <div className="dl-screen">
      <AppBar title="مجموعات الإضافات" onBack={() => nav.pop()}
        trailing={<button onClick={() => nav.push('modifierForm')}
          style={{ background:'transparent', border: 0, padding: 6, color: 'var(--olive)',
            fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700, cursor:'pointer',
            display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.plus size={16}/> ضيف
        </button>}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10,
          marginBottom: 14 }}>
          <Icon.info size={14}/>
          <span>مجموعات الإضافات بتسمح للعميل يخصص الطلب — مثل الأحجام، الإضافات، أو الملاحظات.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {m.modifiers.map((mod, i) => (
            <div key={mod.id} className="dl-card dl-rise dl-tappable"
              style={{ animationDelay: `${i * 30}ms`, padding: 14, cursor: 'pointer' }}
              onClick={() => nav.push('modifierForm', { modifier: mod })}>
              <div style={{ display:'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{mod.name}</div>
                    {mod.required && <Badge variant="issue">مطلوب</Badge>}
                    <Badge variant="active">{mod.kind === 'one' ? 'اختيار واحد' : 'متعدد'}</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4 }}>
                    {mod.options.length.toLocaleString('ar-EG')} خيار · مربوط بـ {mod.appliesTo.toLocaleString('ar-EG')} منتج
                  </div>
                </div>
                <Icon.chevronLeft size={18}/>
              </div>
              <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
                {mod.options.map(o => (
                  <span key={o.name} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100,
                    background: 'var(--canvas-200)', color: 'var(--ink)' }}>
                    {o.name}{o.price > 0 ? ` +${o.price}` : o.price < 0 ? ` ${o.price}` : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Modifier form ─────────────────────────────────────────────────
function ModifierFormScreen({ modifier }) {
  const nav = useNav();
  const m = useMerchant();
  const isEdit = !!modifier;
  const [name, setName] = useStMC(modifier?.name || '');
  const [kind, setKind] = useStMC(modifier?.kind || 'one');
  const [required, setRequired] = useStMC(modifier?.required || false);
  const [options, setOptions] = useStMC(modifier?.options || [{ name: '', price: 0 }]);

  const addOpt = () => setOptions(o => [...o, { name: '', price: 0 }]);
  const removeOpt = (i) => setOptions(o => o.filter((_, x) => x !== i));
  const updateOpt = (i, field, value) => setOptions(o => o.map((opt, x) => x === i ? { ...opt, [field]: value } : opt));

  const valid = name.trim().length >= 2 && options.filter(o => o.name.trim()).length >= 1;

  const save = () => {
    if (!valid) return;
    const cleaned = options.filter(o => o.name.trim()).map(o => ({ name: o.name.trim(), price: parseInt(o.price) || 0 }));
    if (isEdit) {
      m.setModifiers(prev => prev.map(x => x.id === modifier.id ? { ...x, name, kind, required, options: cleaned } : x));
      m.showToast('اتحفظت المجموعة', <Icon.check size={16}/>);
    } else {
      m.setModifiers(prev => [...prev, { id: 'm' + Date.now(), name, kind, required, options: cleaned, appliesTo: 0 }]);
      m.showToast('اتضافت مجموعة جديدة', <Icon.check size={16}/>);
    }
    nav.pop();
  };

  return (
    <div className="dl-screen">
      <AppBar title={isEdit ? 'تعديل المجموعة' : 'مجموعة جديدة'} onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px' }}>
        <Fld label="اسم المجموعة">
          <input className="dl-input dl-input--lg" autoFocus placeholder="مثلاً: الحجم"
            value={name} onChange={e => setName(e.target.value)}/>
        </Fld>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>
            نوع الاختيار
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { k: 'one', l: 'اختيار واحد', s: 'الحجم، النوع' },
              { k: 'multi', l: 'اختيار متعدد', s: 'إضافات، توابل' },
            ].map(o => (
              <button key={o.k} onClick={() => setKind(o.k)}
                style={{ all:'unset', cursor:'pointer', flex: 1, padding: 12, borderRadius: 10,
                  background: kind === o.k ? 'var(--olive)' : '#fff',
                  border: kind === o.k ? 0 : '1.5px solid var(--canvas-300)',
                  color: kind === o.k ? 'var(--canvas)' : 'var(--ink)' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{o.l}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{o.s}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="dl-card" style={{ padding: 4, marginTop: 14 }}>
          <TogRow label="مطلوب" sub="العميل لازم يختار قبل ما يضيف للسلة"
            v={required} onChange={() => setRequired(!required)}/>
        </div>

        <div style={{ marginTop: 18, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em' }}>الخيارات</div>
          <button onClick={addOpt} style={{ all:'unset', cursor:'pointer', color: 'var(--olive)', fontSize: 13, fontWeight: 700,
            display:'flex', alignItems:'center', gap: 4 }}>
            <Icon.plus size={14}/> ضيف خيار
          </button>
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((o, i) => (
            <div key={i} className="dl-card" style={{ padding: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="dl-input" placeholder="اسم الخيار" style={{ flex: 1, minHeight: 44 }}
                value={o.name} onChange={e => updateOpt(i, 'name', e.target.value)}/>
              <div style={{ position: 'relative', width: 100 }}>
                <input className="dl-input" placeholder="٠"
                  style={{ minHeight: 44, paddingInlineEnd: 28, textAlign: 'left' }}
                  inputMode="numeric"
                  value={o.price} onChange={e => updateOpt(i, 'price', e.target.value.replace(/[^0-9\-]/g, ''))}/>
                <span style={{ position: 'absolute', insetInlineEnd: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--ink-light)', fontSize: 11 }}>ج.م</span>
              </div>
              {options.length > 1 && (
                <button onClick={() => removeOpt(i)}
                  style={{ background:'transparent', border: 0, color: 'var(--ink-mute)',
                    cursor:'pointer', padding: 6, display:'flex' }}>
                  <Icon.trash size={16}/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!valid} onClick={save}>
          {isEdit ? 'حفظ التغييرات' : 'إنشاء المجموعة'}
        </Button>
      </div>
    </div>
  );
}

// ── Pricing controls ─────────────────────────────────────────────
function PricingScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [op, setOp] = useStMC('up'); // up | down
  const [mode, setMode] = useStMC('percent'); // percent | flat
  const [value, setValue] = useStMC('5');
  const [scope, setScope] = useStMC('all'); // all | category
  const [category, setCategory] = useStMC(m.categories[0]?.name);

  const v = parseInt(value) || 0;

  const apply = () => {
    const sign = op === 'up' ? 1 : -1;
    m.setProducts(prev => prev.map(p => {
      if (scope === 'category' && p.category !== category) return p;
      const newPrice = mode === 'percent'
        ? Math.max(1, Math.round(p.price * (1 + sign * v / 100)))
        : Math.max(1, p.price + sign * v);
      return { ...p, price: newPrice };
    }));
    m.showToast('اتطبقت الأسعار الجديدة', <Icon.check size={16}/>);
    nav.pop();
  };

  return (
    <div className="dl-screen">
      <AppBar title="تعديل الأسعار" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10,
          marginBottom: 18 }}>
          <Icon.info size={14}/>
          <span>تقدر تعدل أسعار مجموعة منتجات مرة واحدة. التغيير بيتطبق على طول.</span>
        </div>

        {/* Direction */}
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          النوع
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { k: 'up', l: 'رفع الأسعار', icon: <Icon.arrowUp size={18}/>, color: 'var(--olive)' },
            { k: 'down', l: 'خفض الأسعار', icon: <Icon.arrowDown size={18}/>, color: '#C53B2C' },
          ].map(o => (
            <button key={o.k} onClick={() => setOp(o.k)}
              style={{ all:'unset', cursor:'pointer', flex: 1, padding: 14, borderRadius: 12,
                background: '#fff',
                border: `1.5px solid ${op === o.k ? o.color : 'var(--canvas-300)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ color: o.color, display: 'inline-flex' }}>{o.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{o.l}</div>
            </button>
          ))}
        </div>

        {/* Mode */}
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginTop: 18, marginBottom: 8 }}>
          القيمة
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setMode('percent')}
            style={{ all:'unset', cursor:'pointer', flex: 1, padding: 12, borderRadius: 10, textAlign: 'center',
              background: mode === 'percent' ? 'var(--olive)' : '#fff',
              color: mode === 'percent' ? 'var(--canvas)' : 'var(--ink)',
              border: mode === 'percent' ? 0 : '1.5px solid var(--canvas-300)',
              fontWeight: 700 }}>نسبة مئوية ٪</button>
          <button onClick={() => setMode('flat')}
            style={{ all:'unset', cursor:'pointer', flex: 1, padding: 12, borderRadius: 10, textAlign: 'center',
              background: mode === 'flat' ? 'var(--olive)' : '#fff',
              color: mode === 'flat' ? 'var(--canvas)' : 'var(--ink)',
              border: mode === 'flat' ? 0 : '1.5px solid var(--canvas-300)',
              fontWeight: 700 }}>مبلغ ثابت</button>
        </div>
        <div style={{ marginTop: 10, position: 'relative' }}>
          <input className="dl-input dl-input--lg" inputMode="numeric"
            value={value} onChange={e => setValue(e.target.value.replace(/[^0-9]/g, ''))}
            style={{ textAlign: 'center', fontWeight: 700, fontSize: 24, paddingInlineEnd: 50 }}/>
          <span style={{ position: 'absolute', insetInlineEnd: 16, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--ink-light)', fontSize: 14, fontWeight: 600 }}>
            {mode === 'percent' ? '٪' : 'ج.م'}
          </span>
        </div>

        {/* Scope */}
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginTop: 18, marginBottom: 8 }}>
          تطبيق على
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setScope('all')}
            style={{ all:'unset', cursor:'pointer', padding: '14px 16px', borderRadius: 10, background: '#fff',
              border: `1.5px solid ${scope === 'all' ? 'var(--olive)' : 'var(--canvas-300)'}`,
              display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: 100,
              border: `2px solid ${scope === 'all' ? 'var(--olive)' : 'var(--canvas-300)'}`,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {scope === 'all' && <div style={{ width: 10, height: 10, borderRadius: 100, background: 'var(--olive)' }}/>}
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
              كل منتجات المحل ({m.products.length.toLocaleString('ar-EG')})
            </div>
          </button>
          <button onClick={() => setScope('category')}
            style={{ all:'unset', cursor:'pointer', padding: '14px 16px', borderRadius: 10, background: '#fff',
              border: `1.5px solid ${scope === 'category' ? 'var(--olive)' : 'var(--canvas-300)'}`,
              display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: 100,
              border: `2px solid ${scope === 'category' ? 'var(--olive)' : 'var(--canvas-300)'}`,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {scope === 'category' && <div style={{ width: 10, height: 10, borderRadius: 100, background: 'var(--olive)' }}/>}
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>قسم معين فقط</div>
          </button>
          {scope === 'category' && (
            <div className="dl-fade-up" style={{ marginInlineStart: 30 }}>
              <select className="dl-input" value={category} onChange={e => setCategory(e.target.value)}>
                {m.categories.map(c => <option key={c.id} value={c.name}>{c.name} · {c.count.toLocaleString('ar-EG')} منتج</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Preview */}
        <div style={{ marginTop: 22, padding: '14px 16px', background: 'var(--canvas-200)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 8 }}>معاينة على عينة</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {m.products.slice(0, 3).map(p => {
              const sign = op === 'up' ? 1 : -1;
              const newPrice = mode === 'percent'
                ? Math.max(1, Math.round(p.price * (1 + sign * v / 100)))
                : Math.max(1, p.price + sign * v);
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink)' }}>{p.name}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span className="mono" style={{ color: 'var(--ink-light)', textDecoration: 'line-through' }}>
                      {p.price.toLocaleString('ar-EG')}
                    </span>
                    <span className="mono" style={{ color: op === 'up' ? 'var(--olive)' : '#A1271C', fontWeight: 700 }}>
                      {newPrice.toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={v === 0} onClick={apply}>
          طبّق التغيير
        </Button>
      </div>
    </div>
  );
}

registerScreen('catalog', CatalogScreen);
registerScreen('categories', CategoriesScreen);
registerScreen('modifiers', ModifiersScreen);
registerScreen('modifierForm', ModifierFormScreen);
registerScreen('pricing', PricingScreen);
