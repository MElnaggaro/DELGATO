// app/merchant/screens/Orders.jsx — Queue, OrderDetail (with prep timer), Reject, Issue, History
const { useState: useStMO, useEffect: useEfMO, useRef: useRfMO } = React;

// ── Orders queue ──────────────────────────────────────────────────
function OrdersScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [tab, setTab] = useStMO('new');

  const filtered = tab === 'new' ? m.queue.filter(o => o.status === 'new' || o.status === 'accepted')
                : tab === 'preparing' ? m.queue.filter(o => o.status === 'preparing')
                : tab === 'ready' ? m.queue.filter(o => o.status === 'ready' || o.status === 'picked')
                : m.history;

  return (
    <div className="dl-screen">
      <div style={{ padding: '14px 18px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>الطلبات</div>
          <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>
            {m.counts.active.toLocaleString('ar-EG')} طلب شغّال دلوقتي · {ORDERS_TODAY.toLocaleString('ar-EG')} اليوم كله
          </div>
        </div>
        <button onClick={() => nav.push('orderHistory')} aria-label="البحث في الطلبات"
          style={{ width: 40, height: 40, borderRadius: 100, border: 0, background: 'var(--canvas-200)',
            color: 'var(--ink)', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon.search size={20}/>
        </button>
      </div>

      {/* Status tabs */}
      <div style={{ padding: '8px 18px 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'new', l: 'جديد', n: m.counts.new + m.counts.accepted, accent: 'gold' },
          { k: 'preparing', l: 'بنحضّر', n: m.counts.preparing, accent: 'olive' },
          { k: 'ready', l: 'جاهز/تسليم', n: m.counts.ready + m.counts.picked, accent: 'olive' },
          { k: 'done', l: 'منتهي', n: m.history.length, accent: 'ink' },
        ].map(c => (
          <button key={c.k} onClick={() => setTab(c.k)}
            className={`dl-chip${tab === c.k ? ' dl-chip--active' : ''}`}>
            {c.l}
            {c.n > 0 && (
              <span style={{
                background: tab === c.k ? 'var(--gold)' : (c.accent === 'gold' ? 'var(--gold)' : 'var(--canvas-200)'),
                color: tab === c.k ? 'var(--ink)' : 'var(--ink)',
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 100, marginInlineStart: 4,
              }}>{c.n.toLocaleString('ar-EG')}</span>
            )}
          </button>
        ))}
      </div>

      <div className="dl-scroll" style={{ padding: '0 18px 14px' }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Icon.receipt size={32}/>}
            title={tab === 'new' ? 'مفيش طلبات جديدة' : tab === 'preparing' ? 'مفيش طلبات بتتحضّر' : 'مفيش طلبات هنا'}
            body={tab === 'new' ? 'لما يجي طلب جديد هتنبهك على طول.' : 'الطلبات هتظهر هنا أول ما تتحرك للحالة دي.'}/>
        ) : tab === 'done' ? (
          <HistoryList items={filtered} onClick={(o) => nav.push('orderDetail', { order: o })}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((o, i) => (
              <div key={o.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
                <OrderCard order={o}
                  onClick={() => nav.push('orderDetail', { order: o })}
                  onAccept={() => { m.setOrderStatus(o.id, 'accepted');
                    m.showToast('تم قبول الطلب', <Icon.check size={16}/>); }}
                  onReject={() => nav.push('rejectOrder', { order: o })}
                  onPrepare={() => { m.setOrderStatus(o.id, 'preparing');
                    m.showToast('ابدأ التحضير', <Icon.zap size={16}/>); }}
                  onReady={() => { m.setOrderStatus(o.id, 'ready');
                    m.showToast('الطلب جاهز · الكابتن هييجي يستلم', <Icon.bike size={16}/>); }}
                  onHandover={() => { m.setOrderStatus(o.id, 'picked');
                    m.showToast('تم التسليم للكابتن', <Icon.check size={16}/>); }}/>
              </div>
            ))}
          </div>
        )}
      </div>

      <MBottomTabBar active="orders" badgeOrders={m.counts.new}
        onTab={(t) => nav.reset(t === 'more' ? 'more' : t)}/>
    </div>
  );
}

function HistoryList({ items, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((o, i) => {
        const failed = o.status === 'rejected' || o.status === 'cancelled';
        return (
          <div key={o.id} onClick={() => onClick(o)} className="dl-tappable dl-rise"
            style={{ animationDelay: `${i * 20}ms`,
              background: '#fff', borderRadius: 12, padding: 14, boxShadow: 'var(--shadow-card)',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              borderInlineStart: failed ? '3px solid #C53B2C' : '3px solid transparent' }}>
            <div style={{ width: 40, height: 40, borderRadius: 100,
              background: failed ? 'rgba(197,59,44,0.10)' : 'rgba(31,74,61,0.08)',
              color: failed ? '#A1271C' : 'var(--olive)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {failed ? <Icon.x size={18}/> : <Icon.check size={18}/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{o.id}</span>
                <OrderStatusBadge status={o.status}/>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-light)', marginTop: 2 }}>
                {o.customerName} · {o.date}{o.reason ? ` · ${o.reason}` : ''}
              </div>
            </div>
            {!failed && (
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                {o.total.toLocaleString('ar-EG')} <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Order Detail (full lifecycle) ────────────────────────────────
function OrderDetailScreen({ order: initial }) {
  const nav = useNav();
  const m = useMerchant();
  // Re-read from queue so status updates live
  const order = m.queue.find(o => o.id === initial?.id) || initial;
  const [timer, setTimer] = useStMO(order?.timerSec || 0);
  const isActive = ['new', 'accepted', 'preparing'].includes(order?.status);

  useEfMO(() => {
    if (!isActive) return;
    const t = setInterval(() => setTimer(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isActive]);

  if (!order) {
    return (
      <div className="dl-screen">
        <AppBar title="الطلب" onBack={() => nav.pop()}/>
        <EmptyState icon={<Icon.receipt size={32}/>} title="مفيش طلب"
          body="الطلب اتسلم أو اتلغى."/>
      </div>
    );
  }

  const mm = Math.floor(timer / 60).toString().padStart(2, '0');
  const ss = (timer % 60).toString().padStart(2, '0');
  const fmt = (n) => n.replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const overdue = timer === 0 && order.status === 'preparing';

  return (
    <div className="dl-screen">
      <AppBar title={order.id} onBack={() => nav.pop()}
        trailing={
          <button onClick={() => nav.push('issueReport', { order })}
            style={{ background:'transparent', border: 0, padding: 6, color: '#A1271C',
              fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 600, cursor:'pointer',
              display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.info size={16}/> مشكلة
          </button>
        }/>

      <div className="dl-scroll">
        {/* Status header */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ background: 'var(--olive)', color: 'var(--canvas)', borderRadius: 14,
            padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', insetBlockStart: -30, insetInlineEnd: -20,
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 160,
              color: 'rgba(232,177,79,0.10)', lineHeight: 0.85 }}>{order.customerName?.[0]}</div>

            <div style={{ display:'flex', alignItems:'center', gap: 8, position: 'relative' }}>
              <OrderStatusBadge status={order.status}/>
              <div style={{ fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>· {order.placedAt}</div>
            </div>

            {isActive && (
              <div className="dl-fade-up" style={{ marginTop: 14, position: 'relative' }}>
                <div style={{ fontSize: 11, color: 'rgba(250,248,243,0.7)', marginBottom: 4 }}>
                  {order.status === 'new' ? 'باقي ترد على الطلب' : 'وقت التحضير المتبقي'}
                </div>
                <div className="mono" style={{ fontSize: 42, fontWeight: 700, lineHeight: 1,
                  color: overdue ? 'var(--gold)' : 'var(--canvas)' }}>
                  {fmt(mm)}:{fmt(ss)}
                </div>
                {overdue && (
                  <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginTop: 6 }}>
                    خلاص — يفضل يبقى جاهز دلوقتي
                  </div>
                )}
              </div>
            )}

            {!isActive && (
              <div style={{ marginTop: 14, position: 'relative' }}>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  {order.total.toLocaleString('ar-EG')} <span style={{ fontSize: 14, color: 'rgba(250,248,243,0.7)', fontWeight: 500 }}>ج.م</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)', marginTop: 4 }}>
                  {order.payment} · {order.items?.length?.toLocaleString('ar-EG') || 0} منتج
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            بيانات العميل
          </div>
          <div className="dl-card" style={{ padding: 14, display:'flex', gap: 12, alignItems:'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 100, background: 'var(--canvas-200)',
              color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
              {order.customerName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{order.customerName}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }} className="mono" dir="ltr">
                +20 {order.customerPhone}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4 }}>
                <Icon.pin size={11}/> {order.address} · {order.distance}
              </div>
            </div>
            <a href={`tel:+20${order.customerPhone}`}
              style={{ width: 40, height: 40, borderRadius: 100, border: '1.5px solid var(--olive)',
                background: '#fff', color: 'var(--olive)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <Icon.phone size={18}/>
            </a>
          </div>
        </div>

        {/* Items */}
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ display: 'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em' }}>
              المنتجات · {order.items?.length?.toLocaleString('ar-EG') || 0}
            </div>
            <button style={{ all:'unset', cursor:'pointer', color: 'var(--olive)', fontSize: 12, fontWeight: 600 }}>
              طباعة قائمة التجهيز
            </button>
          </div>
          <div className="dl-card" style={{ padding: '4px 16px' }}>
            {order.items?.map((it, i, a) => (
              <div key={i} style={{ padding: '12px 0',
                borderBottom: i < a.length - 1 ? '1px solid var(--canvas-300)' : 0,
                display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--canvas-200)',
                  color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 18 }}>
                  ×{it.qty.toLocaleString('ar-EG')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{it.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>{it.sub}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                  {(it.qty * it.price).toLocaleString('ar-EG')}
                  <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500, marginInlineStart: 3 }}>ج.م</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        {order.note && (
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{ background: 'rgba(232,177,79,0.10)', borderRadius: 12, padding: '12px 14px',
              display:'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon.message size={16}/>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
                <strong>ملاحظة العميل:</strong> {order.note}
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
        <div style={{ padding: '0 18px 18px' }}>
          <div className="dl-card" style={{ padding: '14px 16px' }}>
            <Row label="إجمالي المنتجات" value={`${order.subtotal?.toLocaleString('ar-EG') || 0} ج.م`}/>
            <Row label="رسوم التوصيل (دلنجاتو بتاخدها)" value={`${order.deliveryFee?.toLocaleString('ar-EG') || 0} ج.م`}/>
            <hr className="dl-divider" style={{ margin: '8px 0' }}/>
            <Row label="إجمالي الطلب" value={`${order.total?.toLocaleString('ar-EG') || 0} ج.م`} bold/>
            <hr className="dl-divider" style={{ margin: '8px 0' }}/>
            <Row label={`نصيب المحل (${order.payment})`} value={`${order.subtotal?.toLocaleString('ar-EG') || 0} ج.م`} subtle accent/>
          </div>
        </div>
      </div>

      {/* Action bar */}
      {isActive && (
        <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)',
          display: 'flex', gap: 10 }}>
          {order.status === 'new' && (
            <>
              <Button variant="secondary" full onClick={() => nav.push('rejectOrder', { order })}
                style={{ borderColor: '#C53B2C', color: '#A1271C' }}>
                رفض
              </Button>
              <Button variant="primary" full size="lg"
                onClick={() => { m.setOrderStatus(order.id, 'accepted'); m.showToast('قبلت الطلب · ابدأ التحضير', <Icon.check size={16}/>); }}>
                قبول الطلب
              </Button>
            </>
          )}
          {order.status === 'accepted' && (
            <Button variant="primary" full size="lg"
              onClick={() => { m.setOrderStatus(order.id, 'preparing'); m.showToast('بدأ التحضير', <Icon.zap size={16}/>); }}>
              ابدأ التحضير
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button variant="primary" full size="lg"
              onClick={() => { m.setOrderStatus(order.id, 'ready'); m.showToast('جاهز للاستلام', <Icon.bike size={16}/>); }}
              leading={<Icon.check size={18}/>}>
              الطلب جاهز للاستلام
            </Button>
          )}
        </div>
      )}

      {order.status === 'ready' && (
        <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
          <div style={{ padding: '10px 14px', background: 'rgba(232,177,79,0.10)', borderRadius: 10,
            marginBottom: 10, display:'flex', gap: 10, fontSize: 12, color: 'var(--ink-light)' }}>
            <Icon.info size={14}/>
            <span>منتظرين الكابتن. لو طوّل تواصل مع دعم دلنجاتو.</span>
          </div>
          <Button variant="primary" full size="lg"
            onClick={() => { m.setOrderStatus(order.id, 'picked'); m.showToast('تم تسليم الطلب للكابتن', <Icon.check size={16}/>); }}
            leading={<Icon.bike size={18}/>}>
            استلم الكابتن الطلب
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, subtle, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}>
      <span style={{ fontSize: bold ? 15 : 13, color: subtle ? 'var(--ink-light)' : (bold ? 'var(--ink)' : 'var(--ink-light)'),
        fontWeight: bold ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: bold ? 18 : 14, color: accent ? 'var(--olive)' : 'var(--ink)',
        fontWeight: bold || accent ? 700 : 600 }}>{value}</span>
    </div>
  );
}

// ── Reject Order ─────────────────────────────────────────────────
function RejectOrderScreen({ order }) {
  const nav = useNav();
  const m = useMerchant();
  const reasons = [
    'منتج غير متاح',
    'المحل بيقفل',
    'مفيش طاقم تحضير',
    'العنوان بعيد جداً',
    'دفعة مكررة',
    'سبب تاني',
  ];
  const [reason, setReason] = useStMO(reasons[0]);
  const [detail, setDetail] = useStMO('');

  return (
    <div className="dl-screen">
      <AppBar title="رفض الطلب" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-fade-up" style={{ padding: '14px 16px', background: 'rgba(197,59,44,0.06)',
          borderRadius: 12, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon.info size={16}/>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
            رفض الطلب بيأثر على تقييم المحل وممكن يقللك من نتائج البحث. لو ممكن، اقبل وحضّر بدلاً من الرفض.
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          سبب الرفض
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reasons.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{ all:'unset', cursor:'pointer', padding: '14px 16px', background: '#fff',
                borderRadius: 10, border: `1.5px solid ${reason === r ? '#C53B2C' : 'var(--canvas-300)'}`,
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 150ms var(--ease-out)' }}>
              <div style={{ width: 20, height: 20, borderRadius: 100,
                border: `2px solid ${reason === r ? '#C53B2C' : 'var(--canvas-300)'}`,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {reason === r && <div style={{ width: 10, height: 10, borderRadius: 100, background: '#C53B2C' }}/>}
              </div>
              <span style={{ fontSize: 14, color: 'var(--ink)' }}>{r}</span>
            </button>
          ))}
        </div>

        {reason === 'سبب تاني' && (
          <div className="dl-fade-up" style={{ marginTop: 14 }}>
            <textarea value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="اكتب التفاصيل علشان نقدر نوصلها للعميل"
              style={{ width:'100%', minHeight: 88, padding: 12, fontFamily:'var(--font-arabic)',
                borderRadius: 10, border: '1.5px solid var(--canvas-300)', background:'#fff',
                resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box' }}/>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)',
        display: 'flex', gap: 10 }}>
        <Button variant="ghost" full onClick={() => nav.pop()}>تراجع</Button>
        <Button variant="primary" full
          style={{ background: '#C53B2C' }}
          onClick={() => {
            m.finalizeOrder(order.id, 'rejected', reason);
            m.showToast('اترفض الطلب', <Icon.x size={16}/>);
            nav.pop();
          }}>
          أكّد الرفض
        </Button>
      </div>
    </div>
  );
}

// ── Issue Report (during order) ──────────────────────────────────
function IssueReportScreen({ order }) {
  const nav = useNav();
  const m = useMerchant();
  const [issue, setIssue] = useStMO('');
  const [body, setBody] = useStMO('');
  const issues = [
    { k: 'item_out', l: 'منتج خلصان' },
    { k: 'wrong_addr', l: 'العنوان مش واضح' },
    { k: 'customer_unreachable', l: 'العميل مش رد' },
    { k: 'delay', l: 'هتأخر في التحضير' },
    { k: 'damage', l: 'منتج تالف' },
    { k: 'other', l: 'حاجة تانية' },
  ];

  return (
    <div className="dl-screen">
      <AppBar title="بلّغ عن مشكلة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-fade-up" style={{ padding: '14px 16px', background: 'rgba(31,74,61,0.06)',
          borderRadius: 12, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon.shieldCheck size={16}/>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
            <strong>طلب {order?.id}</strong> · هنوصّل المشكلة لدعم دلنجاتو ولـ {order?.customerName} على طول.
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          نوع المشكلة
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {issues.map(o => (
            <button key={o.k} onClick={() => setIssue(o.k)}
              style={{ all:'unset', cursor:'pointer', padding: '12px 14px', background: '#fff',
                borderRadius: 10, border: `1.5px solid ${issue === o.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                fontSize: 13.5, fontWeight: 600, color: 'var(--ink)',
                transition: 'all 150ms var(--ease-out)' }}>
              {o.l}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', margin: '18px 0 8px' }}>
          فاصلنا — اكتب التفاصيل
        </div>
        <textarea value={body} onChange={e => setBody(e.target.value)}
          placeholder="اوصف المشكلة بالتفصيل علشان نحلها بسرعة."
          style={{ width:'100%', minHeight: 100, padding: 12, fontFamily:'var(--font-arabic)',
            borderRadius: 10, border: '1.5px solid var(--canvas-300)', background:'#fff',
            resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', lineHeight: 1.55 }}/>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!issue}
          onClick={() => { m.showToast('وصلت المشكلة لفريق دلنجاتو', <Icon.check size={16}/>); nav.pop(); }}>
          إرسال البلاغ
        </Button>
      </div>
    </div>
  );
}

// ── Order History (search/filter) ────────────────────────────────
function OrderHistoryScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [q, setQ] = useStMO('');
  const [filter, setFilter] = useStMO('all');

  const merged = [...m.queue, ...m.history];
  const filtered = merged.filter(o => {
    if (q && !o.id.includes(q) && !o.customerName.includes(q)) return false;
    if (filter === 'failed') return o.status === 'rejected' || o.status === 'cancelled';
    if (filter === 'done') return o.status === 'delivered';
    if (filter === 'live') return ['new','accepted','preparing','ready','picked'].includes(o.status);
    return true;
  });

  return (
    <div className="dl-screen">
      <AppBar title="سجل الطلبات" onBack={() => nav.pop()}/>
      <div style={{ padding: '4px 18px 8px' }}>
        <SearchField value={q} onChange={e => setQ(e.target.value)}
          onClear={() => setQ('')}
          placeholder="ابحث برقم الطلب أو اسم العميل"/>
      </div>
      <div style={{ padding: '8px 18px 12px', display:'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'all', l: 'الكل', n: merged.length },
          { k: 'live', l: 'شغّال', n: m.queue.length },
          { k: 'done', l: 'متم', n: m.history.filter(o => o.status === 'delivered').length },
          { k: 'failed', l: 'فاشل', n: m.history.filter(o => o.status === 'rejected' || o.status === 'cancelled').length },
        ].map(c => (
          <Chip key={c.k} active={filter === c.k} onClick={() => setFilter(c.k)}>
            {c.l} <span style={{ opacity: 0.7, marginInlineStart: 4 }}>· {c.n.toLocaleString('ar-EG')}</span>
          </Chip>
        ))}
      </div>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Icon.search size={32}/>} title="مفيش طلبات بالشروط دي"
            body="جرب كلمة بحث تانية أو غيّر الفلتر."/>
        ) : (
          <HistoryList items={filtered} onClick={(o) => nav.push('orderDetail', { order: o })}/>
        )}
      </div>
    </div>
  );
}

registerScreen('orders', OrdersScreen);
registerScreen('orderDetail', OrderDetailScreen);
registerScreen('rejectOrder', RejectOrderScreen);
registerScreen('issueReport', IssueReportScreen);
registerScreen('orderHistory', OrderHistoryScreen);
