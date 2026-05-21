// screens/Profile.jsx — Profile, Addresses (list + edit), Support, Settings, Edit profile, Favorites
const { useState: useStP, useEffect: useEfP } = React;

// ─── Profile tab ──────────────────────────────────────────────────
function ProfileScreen() {
  const nav = useNav();
  const app = useApp();
  const [confirm, setConfirm] = useStP(false);

  return (
    <div className="dl-screen">
      <div className="dl-scroll">
        {/* Header card */}
        <div style={{ padding: '18px 18px 12px' }}>
          <div style={{
            background: 'var(--olive)', color: 'var(--canvas)', borderRadius: 16,
            padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', top: -30, insetInlineEnd: -20,
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 180,
              color: 'rgba(232,177,79,0.10)', lineHeight: 0.85 }}>د</div>
            <div style={{ width: 56, height: 56, borderRadius: 100, background: 'var(--canvas)', color: 'var(--olive)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 26, flexShrink: 0 }}>أ</div>
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>أحمد محمد</div>
              <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)', marginTop: 2 }} className="mono" dir="ltr">+20 {app.phone || '10 234 5678'}</div>
            </div>
            <button onClick={() => nav.push('editProfile')}
              style={{ background:'rgba(250,248,243,0.14)', border: 0, color: 'var(--canvas)', borderRadius: 10,
                padding: '8px 12px', fontFamily:'var(--font-arabic)', fontSize: 13, fontWeight: 600, cursor:'pointer',
                position: 'relative' }}>
              تعديل
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { l: 'طلب متم', v: app.orders.filter(o => o.status === 'done').length },
            { l: 'محل مفضل', v: app.favorites.length },
            { l: 'عنوان', v: app.addresses.length },
          ].map(s => (
            <div key={s.l} style={{ background: '#fff', borderRadius: 12, padding: '12px 10px', textAlign:'center',
              boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--olive)' }}>{s.v.toLocaleString('ar-EG')}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <Group title="الحساب">
          <ListRow icon={<Icon.pin size={18}/>} label="عناويني" sub={`${app.addresses.length.toLocaleString('ar-EG')} عناوين محفوظة`}
            onClick={() => nav.push('addresses')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.card size={18}/>} label="طرق الدفع" sub="ضيف بطاقة أو محفظة"
            onClick={() => nav.push('paymentMethods')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.heart size={18}/>} label="المحلات المفضلة" sub={`${app.favorites.length.toLocaleString('ar-EG')} محلات`}
            onClick={() => nav.push('favorites')}/>
        </Group>

        <Group title="التطبيق">
          <ListRow icon={<Icon.bell size={18}/>} label="الإشعارات" sub="مفعّلة"
            onClick={() => nav.push('notificationSettings')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.globe size={18}/>} label="اللغة" value="العربية"
            onClick={() => {}}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.shieldCheck size={18}/>} label="الخصوصية والأمان"
            onClick={() => {}}/>
        </Group>

        <Group title="المساعدة">
          <ListRow icon={<Icon.help size={18}/>} label="مركز المساعدة"
            onClick={() => nav.push('support')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.message size={18}/>} label="تواصل معانا"
            sub="جاهزين لرد على أي سؤال"
            onClick={() => nav.push('support')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.info size={18}/>} label="عن دلنجاتُو"
            sub="إصدار ١٫٠٫٠"
            onClick={() => {}}/>
        </Group>

        <div style={{ padding: '8px 18px 28px' }}>
          <button onClick={() => setConfirm(true)}
            style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap: 8,
              color: '#A1271C', fontFamily:'var(--font-arabic)', fontSize: 14, fontWeight: 600,
              padding: '12px 4px' }}>
            <Icon.logout size={18}/> تسجيل الخروج
          </button>
          <div style={{ textAlign:'center', fontSize: 11, color: 'var(--ink-mute)', marginTop: 18 }}>
            من الدلنجات · لأهل الدلنجات · ©  ٢٠٢٦
          </div>
        </div>
      </div>

      <BottomTabBar active="profile" cartCount={app.cartCount} onTab={(t) => nav.reset(t)}/>

      {confirm && (
        <ConfirmDialog
          title="تخرج من حسابك؟"
          body="هتحتاج تدخل رقم تليفونك تاني علشان ترجع."
          confirm="خروج" cancel="إلغاء" destructive
          onConfirm={() => { setConfirm(false); app.setAuthed(false); window.__delngato_logout?.(); }}
          onCancel={() => setConfirm(false)}/>
      )}
    </div>
  );
}

function Group({ title, children }) {
  return (
    <div style={{ padding: '4px 18px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Edit Profile ─────────────────────────────────────────────────
function EditProfileScreen() {
  const nav = useNav();
  const app = useApp();
  const [name, setName] = useStP('أحمد محمد');
  const [email, setEmail] = useStP('');
  return (
    <div className="dl-screen">
      <AppBar title="تعديل البيانات" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '18px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 88, height: 88, borderRadius: 100, background: 'var(--olive)', color: 'var(--canvas)',
            display:'flex', alignItems:'center', justifyContent:'center', fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 40,
            position: 'relative' }}>
            أ
            <button style={{ position:'absolute', insetInlineEnd: -4, insetBlockEnd: -4,
              width: 30, height: 30, borderRadius: 100, background: 'var(--canvas)',
              border: '2px solid var(--canvas)', color: 'var(--olive)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-card)' }}>
              <Icon.edit size={14}/>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Fld label="الاسم">
            <input className="dl-input" value={name} onChange={e => setName(e.target.value)}/>
          </Fld>
          <Fld label="رقم التليفون">
            <input dir="ltr" className="dl-input mono" readOnly
              value={'+20 ' + (app.phone || '10 234 5678')}
              style={{ textAlign:'left', background: 'var(--canvas-200)', color: 'var(--ink-light)' }}/>
          </Fld>
          <Fld label="الإيميل (اختياري)">
            <input className="dl-input" dir="ltr" placeholder="name@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ textAlign:'left' }}/>
          </Fld>
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" full size="lg" onClick={() => { app.showToast('اتحفظت التغييرات', <Icon.check size={16}/>); nav.pop(); }}>
          حفظ
        </Button>
      </div>
    </div>
  );
}

function Fld({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.03em' }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Addresses list ───────────────────────────────────────────────
function AddressesScreen() {
  const nav = useNav();
  const app = useApp();
  return (
    <div className="dl-screen">
      <AppBar title="عناويني" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {app.addresses.map((a, i) => (
            <div key={a.id} className="dl-rise dl-tappable" style={{
              animationDelay: `${i * 50}ms`,
              background: '#fff', borderRadius: 12, padding: 14, boxShadow: 'var(--shadow-card)',
              display: 'flex', gap: 12, alignItems: 'center', cursor:'pointer',
              border: a.selected ? '1.5px solid var(--olive)' : '1.5px solid transparent',
            }} onClick={() => {
              app.setAddresses(prev => prev.map(x => ({ ...x, selected: x.id === a.id })));
              app.setSelectedAddress(a);
              app.showToast(`اتم تغيير عنوان التوصيل إلى ${a.label}`, <Icon.pin size={16}/>);
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: a.selected ? 'var(--olive)' : 'rgba(31,74,61,0.08)',
                color: a.selected ? 'var(--canvas)' : 'var(--olive)',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
              }}>
                {a.icon === 'home' ? <Icon.home size={20}/>
                : a.icon === 'store' ? <Icon.store size={20}/>
                : <Icon.pin size={20}/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{a.label}</div>
                  {a.selected && <Badge variant="active">الحالي</Badge>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 2 }}>{a.street}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{a.detail}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); }}
                style={{ background:'transparent', border: 0, color: 'var(--ink-mute)', cursor: 'pointer', padding: 6, display:'flex' }}>
                <Icon.edit size={18}/>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => nav.push('addressSetup', { manual: true })}
          className="dl-tappable"
          style={{ marginTop: 14, all:'unset', cursor:'pointer', width: '100%',
            background:'#fff', border: '1.5px dashed var(--canvas-300)', borderRadius: 12,
            padding: '16px', display:'flex', alignItems:'center', justifyContent:'center',
            gap: 8, color: 'var(--olive)', fontFamily:'var(--font-arabic)', fontSize: 14, fontWeight: 600 }}>
          <Icon.plus size={18}/> ضيف عنوان جديد
        </button>
      </div>
    </div>
  );
}

// ─── Favorites ────────────────────────────────────────────────────
function FavoritesScreen() {
  const nav = useNav();
  const app = useApp();
  const favShops = SHOPS.filter(s => app.favorites.includes(s.id));
  return (
    <div className="dl-screen">
      <AppBar title="المحلات المفضلة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        {favShops.length === 0 ? (
          <EmptyState icon={<Icon.heart size={32}/>}
            title="مفيش محلات مفضلة"
            body="اضغط القلب على أي محل علشان تضيفه هنا للوصول السريع."
            action={<Button variant="primary" onClick={() => nav.reset('home')}>تصفّح المحلات</Button>}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {favShops.map((s, i) => (
              <div key={s.id} className="dl-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <ShopCard shop={s} onClick={() => nav.push('shop', { shop: s })}/>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payment methods ──────────────────────────────────────────────
function PaymentMethodsScreen() {
  const nav = useNav();
  const [methods, setMethods] = useStP([
    { id: 'm1', kind: 'card', last4: '٤٢٣٢', brand: 'فيزا', exp: '٠٨/٢٧', def: true },
  ]);
  return (
    <div className="dl-screen">
      <AppBar title="طرق الدفع" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {methods.map(m => (
            <div key={m.id} className="dl-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--olive)',
                color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon.card size={20}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', display:'flex', alignItems:'center', gap: 6 }}>
                  {m.brand} <span className="mono" dir="ltr">•••• {m.last4}</span>
                  {m.def && <Badge variant="active">افتراضي</Badge>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>صلاحية <span className="mono">{m.exp}</span></div>
              </div>
              <button style={{ background:'transparent', border: 0, color: 'var(--ink-mute)', cursor:'pointer', padding: 4, display:'flex' }}>
                <Icon.trash size={18}/>
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => nav.push('payment')}
          className="dl-tappable"
          style={{ marginTop: 14, all:'unset', cursor:'pointer', width: '100%',
            background:'#fff', border: '1.5px dashed var(--canvas-300)', borderRadius: 12,
            padding: '16px', display:'flex', alignItems:'center', justifyContent:'center',
            gap: 8, color: 'var(--olive)', fontFamily:'var(--font-arabic)', fontSize: 14, fontWeight: 600 }}>
          <Icon.plus size={18}/> ضيف طريقة دفع جديدة
        </button>

        <div style={{ marginTop: 22, background: 'var(--canvas-200)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', display:'flex', gap: 10, lineHeight: 1.5 }}>
          <Icon.shieldCheck size={16}/>
          <span>كل البطاقات مؤمَّنة بتشفير ٢٥٦-بت. دلنجاتُو مش بتحفظ بيانات بطاقتك.</span>
        </div>
      </div>
    </div>
  );
}

// ─── Notification settings ────────────────────────────────────────
function NotificationSettingsScreen() {
  const nav = useNav();
  const [s, setS] = useStP({ orders: true, promos: true, news: false, push: true, sms: true });
  const t = (k) => setS({ ...s, [k]: !s[k] });
  return (
    <div className="dl-screen">
      <AppBar title="إعدادات الإشعارات" onBack={() => nav.pop()}/>
      <div className="dl-scroll">
        <Group title="نوع الإشعار">
          <Toggle label="تحديثات الطلبات" sub="حالة الطلب، الكابتن، التوصيل" v={s.orders} onChange={() => t('orders')}/>
          <hr className="dl-divider"/>
          <Toggle label="عروض وخصومات" sub="آخر العروض من المحلات" v={s.promos} onChange={() => t('promos')}/>
          <hr className="dl-divider"/>
          <Toggle label="أخبار دلنجاتُو" sub="محلات جديدة وميزات جديدة" v={s.news} onChange={() => t('news')}/>
        </Group>
        <Group title="القناة">
          <Toggle label="إشعارات داخل التطبيق" v={s.push} onChange={() => t('push')}/>
          <hr className="dl-divider"/>
          <Toggle label="رسائل SMS" v={s.sms} onChange={() => t('sms')}/>
        </Group>
      </div>
    </div>
  );
}

function Toggle({ label, sub, v, onChange }) {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
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

// ─── Support ─────────────────────────────────────────────────────
function SupportScreen() {
  const nav = useNav();
  const app = useApp();
  const faqs = [
    { q: 'ازاي أعدّل عنواني؟', a: 'من شاشة "حسابي" → "عناويني" تقدر تضيف، تعدّل، أو تختار العنوان الأساسي.' },
    { q: 'ازاي ألغي طلب؟', a: 'تقدر تلغي الطلب من شاشة التتبع لو لسه ما طلعش من المحل. بعد كده اتصل بينا.' },
    { q: 'الدفع كاش متاح؟', a: 'آه — كل المحلات بتقبل دفع كاش عند الاستلام، ومش هتدفع أي رسوم زيادة.' },
    { q: 'مفيش محل بلدي في التطبيق؟', a: 'كلمنا واحنا هنضيفه. بنشتغل علشان نضم كل محلات الدلنجات الواحد بعد التاني.' },
  ];
  const [open, setOpen] = useStP(null);
  return (
    <div className="dl-screen">
      <AppBar title="مركز المساعدة" onBack={() => nav.pop()}/>
      <div className="dl-scroll">
        {/* Quick contact tiles */}
        <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ContactTile icon={<Icon.phone size={22}/>} title="اتصل بينا" sub="٩ ص — ١ ص" accent="olive"/>
          <ContactTile icon={<Icon.message size={22}/>} title="شات مباشر" sub="رد في دقايق" accent="gold"/>
        </div>

        {/* FAQ */}
        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            أسئلة شائعة
          </div>
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            {faqs.map((f, i) => (
              <div key={i}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  style={{ all:'unset', cursor:'pointer', width: '100%', boxSizing: 'border-box',
                    padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{f.q}</span>
                  <span style={{ color: 'var(--ink-light)', display:'flex',
                    transition: 'transform 200ms var(--ease-out)',
                    transform: open === i ? 'rotate(180deg)' : '' }}>
                    <Icon.chevronDown size={18}/>
                  </span>
                </button>
                {open === i && (
                  <div className="dl-fade-up" style={{ padding: '0 16px 14px', fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.7 }}>
                    {f.a}
                  </div>
                )}
                {i < faqs.length - 1 && <hr className="dl-divider"/>}
              </div>
            ))}
          </div>
        </div>

        {/* Report a problem */}
        <div style={{ padding: '0 18px 28px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            بلّغ عن مشكلة
          </div>
          <textarea placeholder="اكتب المشكلة بالتفصيل — احنا بنحلها."
            style={{ width:'100%', minHeight: 100, padding: 12, fontFamily:'var(--font-arabic)',
              borderRadius: 10, border: '1.5px solid var(--canvas-300)', background:'#fff',
              resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)' }}/>
          <Button variant="primary" full style={{ marginTop: 12 }}
            onClick={() => { app.showToast('وصلتنا المشكلة. هنرد عليك في ساعة', <Icon.check size={16}/>); nav.pop(); }}>
            إرسال البلاغ
          </Button>
        </div>
      </div>
    </div>
  );
}

function ContactTile({ icon, title, sub, accent }) {
  const bg = accent === 'gold' ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)';
  const fg = accent === 'gold' ? '#8a6418' : 'var(--olive)';
  return (
    <button className="dl-tappable"
      style={{ all:'unset', cursor:'pointer', background:'#fff', borderRadius: 12,
        padding: 14, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color: fg,
        display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{sub}</div>
    </button>
  );
}

registerScreen('profile', ProfileScreen);
registerScreen('editProfile', EditProfileScreen);
registerScreen('addresses', AddressesScreen);
registerScreen('favorites', FavoritesScreen);
registerScreen('paymentMethods', PaymentMethodsScreen);
registerScreen('notificationSettings', NotificationSettingsScreen);
registerScreen('support', SupportScreen);
