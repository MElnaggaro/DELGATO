// app/merchant/screens/Dashboard.jsx — Merchant dashboard with revenue, queue, alerts, ratings
const { useState: useStMD, useEffect: useEfMD } = React;

function DashboardScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [now, setNow] = useStMD(new Date());
  useEfMD(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const liveOrders = m.queue.filter(o => ['new','accepted','preparing','ready'].includes(o.status));
  const lowStock = m.lowStockProducts.length;
  const unreadNotif = m.notifications.filter(n => !n.read).length;
  const newOrders = m.counts.new;

  return (
    <div className="dl-screen">
      {/* Header */}
      <div style={{ padding: '14px 18px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12,
          background: m.store.bg, color: 'var(--canvas)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
          {m.store.letter}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', fontWeight: 500, letterSpacing: '0.02em' }}>
            صباح الخير
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {m.store.name}
          </div>
        </div>
        <button onClick={() => nav.push('notifications')} aria-label="إشعارات" style={{
          width: 40, height: 40, borderRadius: 100, border: 0, background: 'var(--canvas-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)',
          position: 'relative', cursor: 'pointer',
        }}>
          <Icon.bell size={20} />
          {unreadNotif > 0 && (
            <span style={{
              position: 'absolute', top: 8, insetInlineEnd: 8, width: 8, height: 8,
              background: 'var(--gold)', borderRadius: 100, border: '2px solid var(--canvas-200)',
            }}/>
          )}
        </button>
      </div>

      <div className="dl-scroll" style={{ paddingBottom: 12 }}>
        {/* Open / closed toggle */}
        <div style={{ padding: '10px 18px 14px' }}>
          <div style={{
            background: m.acceptingOrders ? 'var(--olive)' : '#2a201a',
            borderRadius: 14, padding: '14px 16px', color: 'var(--canvas)',
            display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden',
            transition: 'background 240ms var(--ease-out)',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12,
              background: m.acceptingOrders ? 'rgba(232,177,79,0.18)' : 'rgba(250,248,243,0.10)',
              color: m.acceptingOrders ? 'var(--gold)' : 'var(--canvas)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {m.acceptingOrders ? <Icon.store size={22}/> : <Icon.x size={22}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                <span className="dl-live-dot" style={{ width: 6, height: 6, background: m.acceptingOrders ? 'var(--gold)' : 'var(--canvas)' }}/>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  {m.acceptingOrders ? 'مفتوح وبتستقبل طلبات' : 'متوقف عن الاستقبال'}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(250,248,243,0.7)', marginTop: 2 }}>
                {m.acceptingOrders ? `وقت التحضير ${m.prepTime.toLocaleString('ar-EG')} د · شغّال لـ ١٠ م` : 'العملاء مش هيقدروا يطلبوا'}
              </div>
            </div>
            <button onClick={() => m.setAcceptingOrders(!m.acceptingOrders)}
              style={{ width: 50, height: 30, borderRadius: 100,
                background: m.acceptingOrders ? 'var(--gold)' : 'rgba(250,248,243,0.20)',
                border: 0, cursor: 'pointer', position: 'relative',
                transition: 'background 200ms var(--ease-out)' }}>
              <span style={{ position:'absolute', top: 3, insetInlineStart: m.acceptingOrders ? 23 : 3,
                width: 24, height: 24, borderRadius: 100, background: '#fff',
                transition: 'inset-inline-start 200ms var(--ease-out)' }}/>
            </button>
          </div>
        </div>

        {/* Revenue + orders metrics */}
        <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <MetricTile label="إيرادات النهاردة"
            value={REVENUE_TODAY.toLocaleString('ar-EG')} sub="ج.م"
            icon={<Icon.zap size={14}/>}
            delta={+8}
            onClick={() => nav.push('analytics')}/>
          <MetricTile label="طلبات النهاردة"
            value={ORDERS_TODAY.toLocaleString('ar-EG')} sub="طلب"
            icon={<Icon.receipt size={14}/>}
            delta={+12}
            accent="gold"
            onClick={() => nav.push('orders')}/>
          <MetricTile label="متوسط الطلب"
            value={AVG_TICKET.toLocaleString('ar-EG')} sub="ج.م"
            icon={<Icon.tag size={14}/>}/>
          <MetricTile label="نسبة التحويل"
            value={`${CONVERSION.toLocaleString('ar-EG')}٪`} sub="من زيارات"
            icon={<Icon.flame size={14}/>} accent="gold"/>
        </div>

        {/* Alerts strip */}
        {(newOrders > 0 || lowStock > 0) && (
          <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {newOrders > 0 && (
              <AlertCard
                color="var(--olive)"
                icon={<Icon.receipt size={20}/>}
                title={`${newOrders.toLocaleString('ar-EG')} طلب جديد محتاج رد`}
                body="رد عليهم في أول ٥ دقايق علشان تحافظ على تقييمك."
                cta="اعرض الطلبات"
                onClick={() => nav.push('orders')}
                pulse/>
            )}
            {lowStock > 0 && (
              <AlertCard
                color="var(--gold)"
                icon={<Icon.package size={20}/>}
                title={`${lowStock.toLocaleString('ar-EG')} منتج محتاج إعادة تموين`}
                body="منتجاتك دي قربت تخلص أو نفدت من المخزن."
                cta="إدارة المخزن"
                onClick={() => nav.push('stockAlerts')}/>
            )}
          </div>
        )}

        {/* Live queue preview */}
        <SectionHead title="الطلبات الشغّالة"
          action={`عرض الكل · ${m.counts.active.toLocaleString('ar-EG')}`}
          onAction={() => nav.push('orders')}/>
        <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {liveOrders.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--canvas-200)',
              borderRadius: 12, color: 'var(--ink-light)', fontSize: 13 }}>
              مفيش طلبات شغّالة دلوقتي · بنحضّر للموجة الجاية
            </div>
          ) : liveOrders.slice(0, 2).map((o, i) => (
            <div key={o.id} className="dl-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <OrderCard order={o}
                onClick={() => nav.push('orderDetail', { order: o })}
                onAccept={() => m.setOrderStatus(o.id, 'accepted')}
                onReject={() => nav.push('rejectOrder', { order: o })}
                onPrepare={() => m.setOrderStatus(o.id, 'preparing')}
                onReady={() => m.setOrderStatus(o.id, 'ready')}
                onHandover={() => m.setOrderStatus(o.id, 'picked')}/>
            </div>
          ))}
        </div>

        {/* Today sparkline */}
        <SectionHead title="إيرادات الأسبوع"
          action="التحليل الكامل"
          onAction={() => nav.push('analytics')}/>
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>إجمالي الأسبوع</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--olive)', marginTop: 2 }}>
                  {REVENUE_WEEK.toLocaleString('ar-EG')} <span style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
                </div>
              </div>
              <Badge variant="active">+١٤٪ من الأسبوع اللي فات</Badge>
            </div>
            <BarChart data={DAILY} highlightIdx={2}
              valueFmt={v => Math.round(v / 100).toLocaleString('ar-EG') + ' ٠٠'}/>
          </div>
        </div>

        {/* Ratings card */}
        <SectionHead title="تقييم المحل"
          action="عرض التقييمات"
          onAction={() => nav.push('reviews')}/>
        <div style={{ padding: '0 18px 18px' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: 'var(--shadow-card)',
            display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--olive)', lineHeight: 1 }}>
                ٤٫٨
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 1, justifyContent: 'center', color: 'var(--gold)' }}>
                {[1,2,3,4,5].map(n => <Icon.star key={n} size={11}/>)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-light)', marginTop: 4 }}>
                {REVIEW_STATS.total.toLocaleString('ar-EG')} تقييم
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {REVIEW_STATS.breakdown.map(b => (
                <div key={b.n} style={{ display:'flex', alignItems:'center', gap: 8, fontSize: 10.5 }}>
                  <span style={{ width: 10, color: 'var(--ink-light)' }}>{b.n}</span>
                  <Icon.star size={10}/>
                  <div style={{ flex: 1, height: 5, borderRadius: 100, background: 'var(--canvas-200)', overflow: 'hidden' }}>
                    <div style={{ width: `${b.pct}%`, height: '100%', background: 'var(--gold)',
                      transition: 'width 600ms var(--ease-out)' }}/>
                  </div>
                  <span style={{ width: 22, textAlign: 'left', color: 'var(--ink-light)' }}>
                    {b.count.toLocaleString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <SectionHead title="إجراءات سريعة"/>
        <div style={{ padding: '0 18px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
          {[
            { k: 'addProduct', l: 'منتج جديد', icon: <Icon.plus size={20}/> },
            { k: 'promotions', l: 'عروض', icon: <Icon.tag size={20}/> },
            { k: 'openingHours', l: 'مواعيد', icon: <Icon.clock size={20}/> },
            { k: 'payout', l: 'الأرباح', icon: <Icon.wallet size={20}/> },
          ].map(t => (
            <button key={t.k} onClick={() => nav.push(t.k)} className="dl-tappable"
              style={{ all:'unset', cursor:'pointer', background:'#fff', borderRadius: 12, padding: '14px 8px',
                textAlign:'center', boxShadow:'var(--shadow-card)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
                color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center', margin: '0 auto 8px' }}>
                {t.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{t.l}</div>
            </button>
          ))}
        </div>
      </div>

      <MBottomTabBar active="dashboard" badgeOrders={newOrders}
        onTab={(t) => nav.reset(t === 'more' ? 'more' : t)}/>
    </div>
  );
}

function AlertCard({ color, icon, title, body, cta, onClick, pulse }) {
  return (
    <div onClick={onClick} className="dl-tappable" style={{
      background: '#fff', borderRadius: 12, padding: '12px 14px',
      borderInlineStart: `3px solid ${color}`,
      boxShadow: 'var(--shadow-card)', cursor: 'pointer',
      display: 'flex', gap: 12, alignItems: 'center',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: color === 'var(--gold)' ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)',
        color: color === 'var(--gold)' ? '#8a6418' : 'var(--olive)',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0, position: 'relative',
      }}>
        {icon}
        {pulse && <span className="dl-live-dot" style={{
          position: 'absolute', top: -3, insetInlineEnd: -3,
          width: 10, height: 10, background: color,
        }}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-light)', marginTop: 2 }}>{body}</div>
      </div>
      <button style={{ all:'unset', cursor:'pointer', padding: '6px 10px', borderRadius: 8,
        background: 'var(--canvas-200)', color: 'var(--olive)', fontSize: 12, fontWeight: 700 }}>
        {cta}
      </button>
    </div>
  );
}

// ── "More" hub (for the 4th bottom tab) ─────────────────────────
function MoreScreen() {
  const nav = useNav();
  const m = useMerchant();
  return (
    <div className="dl-screen">
      <div style={{ padding: '14px 18px 6px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>المزيد</div>
      </div>
      <div className="dl-scroll">
        {/* Store summary */}
        <div style={{ padding: '12px 18px 16px' }}>
          <div onClick={() => nav.push('storeProfile')} className="dl-tappable" style={{
            background: 'var(--olive)', color: 'var(--canvas)', borderRadius: 14,
            padding: 16, display: 'flex', gap: 14, alignItems: 'center',
            position: 'relative', overflow: 'hidden', cursor: 'pointer',
          }}>
            <div style={{ position: 'absolute', insetBlockStart: -30, insetInlineEnd: -20,
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 180,
              color: 'rgba(232,177,79,0.10)', lineHeight: 0.85 }}>{m.store.letter}</div>
            <div style={{ width: 52, height: 52, borderRadius: 100, background: 'var(--canvas)', color: 'var(--olive)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 26, flexShrink: 0, position: 'relative' }}>
              {m.store.letter}
            </div>
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{m.store.name}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(250,248,243,0.7)', marginTop: 2 }}>
                {m.store.category} · {m.store.address}
              </div>
              <div style={{ display:'flex', gap: 10, marginTop: 8, fontSize: 11, color: 'rgba(250,248,243,0.7)' }}>
                <span><Icon.star size={11}/> {m.store.rating}</span>
                <span>· {m.store.reviewsCount.toLocaleString('ar-EG')} تقييم</span>
              </div>
            </div>
          </div>
        </div>

        <Group title="الإعدادات">
          <ListRow icon={<Icon.store size={18}/>} label="معلومات المحل"
            sub={`${m.store.address}`}
            onClick={() => nav.push('storeProfile')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.clock size={18}/>} label="مواعيد العمل"
            sub={m.tempClose ? 'مغلق مؤقتاً' : 'مفتوح ٨ ص — ١٠ م'}
            onClick={() => nav.push('openingHours')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.x size={18}/>} label="إغلاق مؤقت" danger={!!m.tempClose}
            sub={m.tempClose ? `${m.tempClose.reason} · ${m.tempClose.until}` : 'لو محتاج تقفل لفترة'}
            onClick={() => nav.push('tempClose')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.pin size={18}/>} label="نطاق التوصيل"
            value={`${m.deliveryRadius.toLocaleString('ar-EG')} كم`}
            onClick={() => nav.push('deliverySettings')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.clock size={18}/>} label="وقت التحضير"
            value={`${m.prepTime.toLocaleString('ar-EG')} د`}
            onClick={() => nav.push('prepTimeSettings')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.card size={18}/>} label="إعدادات الدفع"
            onClick={() => nav.push('paymentSettings')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.receipt size={18}/>} label="إعدادات الضرائب"
            value="٥٪"
            onClick={() => nav.push('taxSettings')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.sparkle size={18}/>} label="هوية المحل" sub="الشعار، الصور، الوصف"
            onClick={() => nav.push('branding')}/>
        </Group>

        <Group title="إدارة">
          <ListRow icon={<Icon.tag size={18}/>} label="العروض والكوبونات"
            sub={`${m.promos.filter(p => p.status === 'active').length.toLocaleString('ar-EG')} عرض شغّال`}
            onClick={() => nav.push('promotions')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.layers size={18}/>} label="الأقسام والإضافات"
            onClick={() => nav.push('catalog')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.flame size={18}/>} label="التحليلات والإحصائيات"
            onClick={() => nav.push('analytics')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.star size={18}/>} label="التقييمات والردود"
            sub={`${m.reviews.filter(r => !r.response).length.toLocaleString('ar-EG')} تقييم محتاج رد`}
            onClick={() => nav.push('reviews')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.user size={18}/>} label="الفريق"
            sub={`${m.staff.filter(s => s.active).length.toLocaleString('ar-EG')} موظف شغّال`}
            onClick={() => nav.push('staff')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.wallet size={18}/>} label="الأرباح والتحويلات"
            sub={`الدفعة الجاية ${PAYOUT.nextDate}`}
            onClick={() => nav.push('payout')}/>
        </Group>

        <Group title="المساعدة">
          <ListRow icon={<Icon.help size={18}/>} label="مركز المساعدة"
            onClick={() => nav.push('support')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.message size={18}/>} label="شات مع الدعم"
            onClick={() => nav.push('supportChat')}/>
          <hr className="dl-divider"/>
          <ListRow icon={<Icon.info size={18}/>} label="بلّغ عن مشكلة"
            onClick={() => nav.push('reportIssue')}/>
        </Group>

        <div style={{ padding: '8px 18px 28px' }}>
          <button onClick={() => { m.setAuthed(false); nav.reset('login'); }}
            style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap: 8,
              color: '#A1271C', fontFamily:'var(--font-arabic)', fontSize: 14, fontWeight: 600,
              padding: '12px 4px' }}>
            <Icon.logout size={18}/> تسجيل الخروج
          </button>
          <div style={{ textAlign:'center', fontSize: 11, color: 'var(--ink-mute)', marginTop: 12 }}>
            دلنجاتُو للتجار · إصدار ١٫٠٫٠
          </div>
        </div>
      </div>
      <MBottomTabBar active="more" badgeOrders={m.counts.new}
        onTab={(t) => nav.reset(t === 'more' ? 'more' : t)}/>
    </div>
  );
}

registerScreen('dashboard', DashboardScreen);
registerScreen('more', MoreScreen);
