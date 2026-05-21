// screens/Orders.jsx — Orders history, Order detail, Rate, Notifications
const { useState: useStO, useEffect: useEfO } = React;

// ─── Orders history (tab) ─────────────────────────────────────────
function OrdersScreen() {
  const nav = useNav();
  const app = useApp();
  const [tab, setTab] = useStO('all');

  const filtered = tab === 'live' ? app.orders.filter(o => o.status === 'live')
                : tab === 'done' ? app.orders.filter(o => o.status === 'done')
                : app.orders;

  return (
    <div className="dl-screen">
      <div style={{ padding: '16px 18px 8px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>طلباتي</div>
      </div>
      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 8 }}>
        {[
          { k: 'all', l: 'الكل', n: app.orders.length },
          { k: 'live', l: 'شغّال', n: app.orders.filter(o => o.status === 'live').length },
          { k: 'done', l: 'متم', n: app.orders.filter(o => o.status === 'done').length },
        ].map(o => (
          <Chip key={o.k} active={tab === o.k} onClick={() => setTab(o.k)}>
            {o.l} {o.n > 0 && <span style={{ opacity: 0.7, marginInlineStart: 4 }}>· {o.n.toLocaleString('ar-EG')}</span>}
          </Chip>
        ))}
      </div>

      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Icon.receipt size={32}/>}
            title="مفيش طلبات هنا"
            body="أول ما تطلب أول طلب من دلنجاتُو هتلاقيه هنا."
            action={<Button variant="primary" onClick={() => nav.reset('home')}>تصفّح المحلات</Button>}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((o, i) => (
              <div key={o.id} className="dl-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <OrderCard order={o} onClick={() => nav.push('orderDetail', { order: o })}/>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomTabBar active="orders" cartCount={app.cartCount} onTab={(t) => nav.reset(t)}/>
    </div>
  );
}

function OrderCard({ order, onClick }) {
  const isLive = order.status === 'live';
  const isCancelled = order.status === 'cancelled';
  return (
    <div onClick={onClick} className="dl-tappable" style={{
      background: '#fff', borderRadius: 12, padding: 14,
      boxShadow: 'var(--shadow-card)', cursor: 'pointer',
      borderInlineStart: isLive ? '3px solid var(--olive)' : isCancelled ? '3px solid #C53B2C' : '3px solid transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 100, background: 'var(--olive)',
          color: 'var(--canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18 }}>{order.shopLetter}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{order.shop}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{order.id} · {order.date}</div>
        </div>
        {isLive ? <Badge variant="pending">
          <span className="dl-live-dot" style={{ width: 6, height: 6, marginInlineEnd: 2 }}/>
          {order.statusText}
        </Badge> : isCancelled ? <Badge variant="issue">{order.statusText}</Badge> : <Badge variant="active">{order.statusText}</Badge>}
      </div>
      {!isCancelled && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>
            {order.items.toLocaleString('ar-EG')} منتج
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
            {order.total.toLocaleString('ar-EG')} <span style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order detail ─────────────────────────────────────────────────
function OrderDetailScreen({ order }) {
  const nav = useNav();
  const app = useApp();
  const isLive = order.status === 'live';

  return (
    <div className="dl-screen">
      <AppBar title={order.id} onBack={() => nav.pop()}/>
      <div className="dl-scroll">
        <div style={{ padding: '0 18px 14px' }}>
          <div className="dl-card" style={{ padding: '16px 18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 12 }}>
              {isLive && <span className="dl-live-dot"/>}
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{order.statusText}</div>
            </div>
            <OrderProgress step={order.step}/>
            {isLive && (
              <div style={{ marginTop: 14 }}>
                <Button variant="secondary" full onClick={() => nav.push('tracking', { orderId: order.id })}>
                  تتبع مباشر للطلب
                </Button>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>المحل</div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 12, display:'flex', gap: 12, alignItems:'center', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 100, background: 'var(--olive)', color: 'var(--canvas)',
              display:'flex', alignItems:'center', justifyContent:'center', fontFamily: 'var(--font-arabic)',
              fontWeight: 700, fontSize: 20 }}>{order.shopLetter}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{order.shop}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>{order.date}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>المنتجات</div>
          <div className="dl-card" style={{ padding: '12px 16px' }}>
            {[
              { name: 'لبن جهينة', qty: 2, price: 64 },
              { name: 'بيض بلدي', qty: 1, price: 145 },
              { name: 'خبز فينو', qty: 3, price: 36 },
            ].map((it, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--canvas-300)' : 0, fontSize: 14 }}>
                <div style={{ color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--olive)', fontWeight: 700 }}>{it.qty.toLocaleString('ar-EG')}× </span>{it.name}
                </div>
                <div style={{ color: 'var(--ink)', fontWeight: 600 }}>{it.price.toLocaleString('ar-EG')} ج.م</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 18px 14px' }}>
          <div className="dl-card" style={{ padding: '14px 16px' }}>
            <OrdRow label="عنوان التوصيل" value="البيت · شارع الجلاء"/>
            <OrdRow label="طريقة الدفع" value="كاش عند الاستلام"/>
            <OrdRow label="رسوم التوصيل" value="١٠ ج.م"/>
            <hr className="dl-divider" style={{ margin: '10px 0' }}/>
            <OrdRow label="الإجمالي" value={`${order.total.toLocaleString('ar-EG')} ج.م`} bold/>
          </div>
        </div>

        <div style={{ padding: '0 18px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!isLive && order.status !== 'cancelled' && (
            <>
              <Button variant="primary" full onClick={() => {
                app.showToast('اتضاف الطلب للسلة', <Icon.refresh size={16}/>);
                nav.reset('cart');
              }}>إعادة الطلب</Button>
              <Button variant="ghost" full onClick={() => nav.push('rate')}>قيّم تجربتك</Button>
            </>
          )}
          <Button variant="ghost" full onClick={() => nav.push('support')}
            leading={<Icon.help size={18}/>}>محتاج مساعدة في الطلب؟</Button>
        </div>
      </div>
    </div>
  );
}

function OrdRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <span style={{ fontSize: bold ? 15 : 13, color: bold ? 'var(--ink)' : 'var(--ink-light)',
        fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 18 : 14, color: 'var(--ink)', fontWeight: bold ? 700 : 600 }}>{value}</span>
    </div>
  );
}

// ─── Rate order ───────────────────────────────────────────────────
function RateScreen() {
  const nav = useNav();
  const app = useApp();
  const [stars, setStars] = useStO(0);
  const [tags, setTags] = useStO([]);
  const [note, setNote] = useStO('');
  const labels = ['سيء', 'مش كويس', 'مقبول', 'كويس', 'ممتاز'];
  return (
    <div className="dl-screen">
      <AppBar title="قيّم تجربتك" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 100, background: 'var(--olive)', color: 'var(--canvas)',
            display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 28 }}>أ</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginTop: 12 }}>سوبر ماركت أبو حسن</div>
          <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>الطلب اتسلم بنجاح</div>
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 10 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setStars(n)}
              style={{ background:'transparent', border: 0, cursor:'pointer', padding: 4,
                color: stars >= n ? 'var(--gold)' : 'var(--canvas-300)',
                transition: 'transform 120ms var(--ease-out), color 120ms var(--ease-out)',
                transform: stars === n ? 'scale(1.15)' : '' }}>
              <Icon.star size={40}/>
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-light)', marginTop: 6, height: 20 }}>
          {stars > 0 ? labels[stars - 1] : ''}
        </div>

        {stars > 0 && (
          <>
            <div className="dl-fade-up" style={{ marginTop: 20, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em' }}>
              {stars >= 4 ? 'إيه اللي عجبك؟' : 'إيه اللي ممكن نحسنه؟'}
            </div>
            <div className="dl-fade-up" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(stars >= 4
                ? ['التوصيل سريع', 'المنتجات نضيفة', 'الكابتن مؤدب', 'الأسعار مناسبة', 'التطبيق سهل']
                : ['التوصيل اتأخر', 'منتج ناقص', 'تغليف ضعيف', 'الكابتن مش مؤدب', 'الأسعار غالية']
              ).map(t => (
                <Chip key={t} active={tags.includes(t)}
                  onClick={() => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t])}>
                  {t}
                </Chip>
              ))}
            </div>
            <div className="dl-fade-up" style={{ marginTop: 18 }}>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="اكتب ملاحظة (اختياري)"
                style={{ width:'100%', minHeight: 88, padding: 12, fontFamily:'var(--font-arabic)',
                  borderRadius: 10, border: '1.5px solid var(--canvas-300)', background:'#fff',
                  resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)' }}/>
            </div>
          </>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={stars === 0}
          onClick={() => { app.showToast('شكراً على رأيك', <Icon.check size={16}/>); nav.pop(); }}>
          إرسال التقييم
        </Button>
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────
function NotificationsScreen() {
  const nav = useNav();
  const app = useApp();
  useEfO(() => {
    const t = setTimeout(() => app.setNotifications(app.notifications.map(n => ({...n, read: true}))), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="dl-screen">
      <AppBar title="الإشعارات" onBack={() => nav.pop()}
        trailing={<button onClick={() => app.setNotifications([])}
          style={{ background:'transparent', border: 0, padding: 6, fontSize: 13,
                   color: 'var(--olive)', fontWeight: 600, cursor:'pointer', fontFamily:'var(--font-arabic)' }}>
          مسح الكل
        </button>}/>
      <div className="dl-scroll">
        {app.notifications.length === 0 ? (
          <EmptyState icon={<Icon.bell size={32}/>} title="مفيش إشعارات"
            body="هنخبرك على طول لما يحصل أي تحديث على طلباتك أو يكون فيه عرض."/>
        ) : (
          <div style={{ padding: '8px 0 24px' }}>
            {app.notifications.map((n, i) => (
              <div key={n.id} className="dl-rise dl-tappable" style={{
                animationDelay: `${i * 40}ms`,
                display: 'flex', gap: 12, padding: '14px 18px', alignItems: 'flex-start',
                background: n.read ? 'transparent' : 'rgba(232,177,79,0.06)',
                borderBottom: '1px solid var(--canvas-300)', cursor: 'pointer',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: n.accent === 'gold' ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)',
                  color: n.accent === 'gold' ? '#8a6418' : 'var(--olive)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {n.icon === 'bike' && <Icon.bike size={20}/>}
                  {n.icon === 'tag' && <Icon.tag size={20}/>}
                  {n.icon === 'check' && <Icon.check size={20}/>}
                  {n.icon === 'store' && <Icon.store size={20}/>}
                  {n.icon === 'info' && <Icon.info size={20}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap: 8, alignItems:'baseline' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)', whiteSpace:'nowrap' }}>{n.time}</div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 4, lineHeight: 1.5 }}>{n.body}</div>
                </div>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: 100, background: 'var(--gold)', marginTop: 8 }}/>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

registerScreen('orders', OrdersScreen);
registerScreen('orderDetail', OrderDetailScreen);
registerScreen('rate', RateScreen);
registerScreen('notifications', NotificationsScreen);
