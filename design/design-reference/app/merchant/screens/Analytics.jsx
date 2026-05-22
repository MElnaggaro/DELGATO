// app/merchant/screens/Analytics.jsx — Revenue, best sellers, cancellations, busy hours, ratings
const { useState: useStMAn } = React;

// ── Analytics hub ────────────────────────────────────────────────
function AnalyticsScreen() {
  const nav = useNav();
  const [range, setRange] = useStMAn('today');

  return (
    <div className="dl-screen">
      <AppBar title="التحليلات" onBack={() => nav.pop()}/>
      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'today', l: 'النهاردة' },
          { k: 'week', l: 'الأسبوع' },
          { k: 'month', l: 'الشهر' },
          { k: 'all', l: 'كل الفترة' },
        ].map(c => (
          <Chip key={c.k} active={range === c.k} onClick={() => setRange(c.k)}>{c.l}</Chip>
        ))}
      </div>

      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Headline metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <MetricTile label="الإيرادات"
            value={REVENUE_TODAY.toLocaleString('ar-EG')} sub="ج.م"
            icon={<Icon.zap size={14}/>} delta={+8}
            onClick={() => nav.push('revenueDetail')}/>
          <MetricTile label="الطلبات"
            value={ORDERS_TODAY.toLocaleString('ar-EG')} sub="طلب"
            icon={<Icon.receipt size={14}/>} delta={+12} accent="gold"/>
          <MetricTile label="متوسط الطلب"
            value={AVG_TICKET.toLocaleString('ar-EG')} sub="ج.م"
            icon={<Icon.tag size={14}/>} delta={-3}/>
          <MetricTile label="نسبة التحويل"
            value={`${CONVERSION.toLocaleString('ar-EG')}٪`}
            icon={<Icon.flame size={14}/>} delta={+5} accent="gold"
            onClick={() => nav.push('conversionDetail')}/>
        </div>

        {/* Revenue chart */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>إيرادات اليوم بالساعة</div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                ذروة الطلبات بين ٦–٨ م
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--olive)' }}>
              {REVENUE_TODAY.toLocaleString('ar-EG')} <span style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
            </div>
          </div>
          <BarChart data={HOURLY} highlightIdx={11} height={120}/>
        </div>

        {/* Detail tiles row */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <DetailTile icon={<Icon.flame size={20}/>} label="الأكثر مبيعاً"
            value={BEST_SELLERS[0].name}
            onClick={() => nav.push('bestSellers')}/>
          <DetailTile icon={<Icon.clock size={20}/>} label="ساعات الذروة"
            value="٦–٨ م"
            onClick={() => nav.push('busyHours')}/>
          <DetailTile icon={<Icon.x size={20}/>} label="معدل الإلغاء"
            value="٤٫٢٪" accent="red"
            onClick={() => nav.push('cancellations')}/>
          <DetailTile icon={<Icon.star size={20}/>} label="التقييم"
            value="٤٫٨" accent="gold"
            onClick={() => nav.push('reviews')}/>
        </div>

        {/* Best sellers preview */}
        <SectionHead title="الأكثر مبيعاً"
          action="عرض الكل"
          onAction={() => nav.push('bestSellers')}/>
        <div className="dl-card" style={{ padding: 4 }}>
          {BEST_SELLERS.slice(0, 4).map((b, i, a) => (
            <div key={b.name} style={{ padding: '12px 16px',
              borderBottom: i < a.length - 1 ? '1px solid var(--canvas-300)' : 0,
              display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 100, background: 'var(--canvas-200)',
                color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 11 }}>
                {(i + 1).toLocaleString('ar-EG')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{b.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                  بيع {b.sold.toLocaleString('ar-EG')} قطعة
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>
                  {b.revenue.toLocaleString('ar-EG')} <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
                </div>
                <div style={{ marginTop: 4, color: b.trend === 'up' ? 'var(--olive)' : b.trend === 'down' ? '#A1271C' : 'var(--ink-light)',
                  display: 'inline-flex' }}>
                  {b.trend === 'up' && <Icon.arrowUp size={12}/>}
                  {b.trend === 'down' && <Icon.arrowDown size={12}/>}
                  {b.trend === 'flat' && <span style={{ fontSize: 11 }}>—</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailTile({ icon, label, value, accent, onClick }) {
  const fg = accent === 'red' ? '#A1271C' : accent === 'gold' ? '#8a6418' : 'var(--olive)';
  const bg = accent === 'red' ? 'rgba(197,59,44,0.08)' : accent === 'gold' ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)';
  return (
    <button onClick={onClick} className="dl-tappable"
      style={{ all:'unset', cursor: 'pointer', background: '#fff', borderRadius: 12,
        boxShadow: 'var(--shadow-card)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color: fg,
        display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--ink-light)' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 2,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</div>
      </div>
      <Icon.chevronLeft size={16}/>
    </button>
  );
}

// ── Revenue detail ───────────────────────────────────────────────
function RevenueDetailScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen">
      <AppBar title="تفاصيل الإيرادات" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div className="dl-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>إيرادات هذا الأسبوع</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--olive)', marginTop: 4, lineHeight: 1 }}>
                {REVENUE_WEEK.toLocaleString('ar-EG')} <span style={{ fontSize: 14, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
              </div>
            </div>
            <Badge variant="active">+١٤٪</Badge>
          </div>
          <BarChart data={DAILY} highlightIdx={5} height={140}
            valueFmt={v => (v / 1000).toFixed(1).replace(/[0-9.]/g, d => d === '.' ? '٫' : '٠١٢٣٤٥٦٧٨٩'[d]) + ' ك'}/>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <SummaryRow label="أعلى يوم" value="الجمعة · ٦٬٨٤٠ ج.م"/>
            <SummaryRow label="أقل يوم" value="الأحد · ٣٬١٢٠ ج.م"/>
            <SummaryRow label="متوسط اليوم" value={Math.round(REVENUE_WEEK / 7).toLocaleString('ar-EG') + ' ج.م'}/>
            <SummaryRow label="هدف الأسبوع" value="٣٠٬٠٠٠ ج.م · ٨٨٪"/>
          </div>
        </div>

        <SectionHead title="تفصيل الإيرادات"/>
        <Group>
          <RvRow icon={<Icon.zap size={18}/>} label="مبيعات منتجات" value="٢٣٬٤٢٠ ج.م" pct="٨٨٪"/>
          <hr className="dl-divider"/>
          <RvRow icon={<Icon.tag size={18}/>} label="من خصومات وعروض" value="-٢٬٤٢٠ ج.م" pct="-٨٪" red/>
          <hr className="dl-divider"/>
          <RvRow icon={<Icon.bike size={18}/>} label="رسوم توصيل" value="٥٬٤٥٠ ج.م" sub="بتاخدها دلنجاتو"/>
          <hr className="dl-divider"/>
          <RvRow icon={<Icon.receipt size={18}/>} label="ضرائب القيمة المضافة" value="١٬٢١٥ ج.م"/>
        </Group>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ background: 'var(--canvas-200)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: 'var(--ink-light)' }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', marginTop: 2 }}>{value}</div>
    </div>
  );
}

function RvRow({ icon, label, value, pct, sub, red }) {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
        color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: red ? '#A1271C' : 'var(--ink)' }}>{value}</div>
        {pct && <div style={{ fontSize: 11, color: red ? '#A1271C' : 'var(--ink-light)', marginTop: 2 }}>{pct}</div>}
      </div>
    </div>
  );
}

// ── Best Sellers ─────────────────────────────────────────────────
function BestSellersScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen">
      <AppBar title="الأكثر مبيعاً" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div className="dl-card" style={{ padding: 4 }}>
          {BEST_SELLERS.map((b, i, a) => {
            const max = BEST_SELLERS[0].sold;
            const pct = (b.sold / max) * 100;
            return (
              <div key={b.name} className="dl-rise" style={{ animationDelay: `${i * 40}ms`,
                padding: '14px 16px',
                borderBottom: i < a.length - 1 ? '1px solid var(--canvas-300)' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 100,
                    background: i < 3 ? 'var(--gold)' : 'var(--canvas-200)',
                    color: i < 3 ? 'var(--ink)' : 'var(--olive)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 12 }}>
                    {(i + 1).toLocaleString('ar-EG')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                      {b.sold.toLocaleString('ar-EG')} قطعة · {b.revenue.toLocaleString('ar-EG')} ج.م
                    </div>
                  </div>
                  <div style={{ color: b.trend === 'up' ? 'var(--olive)' : b.trend === 'down' ? '#A1271C' : 'var(--ink-light)', display:'inline-flex' }}>
                    {b.trend === 'up' && <Icon.arrowUp size={16}/>}
                    {b.trend === 'down' && <Icon.arrowDown size={16}/>}
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 100, background: 'var(--canvas-200)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--olive)',
                    transition: 'width 600ms var(--ease-out)' }}/>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(31,74,61,0.06)', borderRadius: 10,
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10 }}>
          <Icon.sparkle size={14}/>
          <span>المنتجات اللي بتبيع كتير اعرضها في أول الواجهة. روح <span style={{ color:'var(--olive)', fontWeight:700 }}>صفحة المنتجات</span> وضبط الترتيب.</span>
        </div>
      </div>
    </div>
  );
}

// ── Cancellations ────────────────────────────────────────────────
function CancellationsScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen">
      <AppBar title="الإلغاءات والرفض" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div className="dl-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 100, background: 'rgba(197,59,44,0.10)',
              color: '#A1271C', display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
              <Icon.x size={26}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>معدل الإلغاء / الرفض</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#A1271C', lineHeight: 1, marginTop: 4 }}>
                ٤٫٢٪
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4 }}>
                ٣٢ طلب من ٧٦٠ هذا الشهر
              </div>
            </div>
            <Badge variant="active">-٠٫٨٪ من الشهر اللي فات</Badge>
          </div>
        </div>

        <SectionHead title="الأسباب الشائعة"/>
        <div className="dl-card" style={{ padding: 4 }}>
          {CANCEL_REASONS.map((r, i, a) => (
            <div key={r.reason} className="dl-rise" style={{ animationDelay: `${i * 40}ms`,
              padding: '12px 16px',
              borderBottom: i < a.length - 1 ? '1px solid var(--canvas-300)' : 0 }}>
              <div style={{ display:'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.reason}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                  {r.count.toLocaleString('ar-EG')} <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>طلب</span>
                </div>
              </div>
              <div style={{ height: 4, borderRadius: 100, background: 'var(--canvas-200)', overflow: 'hidden' }}>
                <div style={{ width: `${r.pct * 2}%`, height: '100%', background: '#C53B2C',
                  transition: 'width 600ms var(--ease-out)' }}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(232,177,79,0.10)', borderRadius: 10,
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10 }}>
          <Icon.flame size={14}/>
          <span>تقليل الرفض بسبب نفاد المنتج ممكن يرفع تقييمك. <span style={{ color: 'var(--olive)', fontWeight: 700 }}>راجع المخزن</span> دلوقتي.</span>
        </div>
      </div>
    </div>
  );
}

// ── Busy hours heatmap ───────────────────────────────────────────
function BusyHoursScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen">
      <AppBar title="ساعات الذروة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div style={{ background: 'rgba(31,74,61,0.06)', borderRadius: 10, padding: '12px 14px',
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10, marginBottom: 14 }}>
          <Icon.info size={14}/>
          <span>توزيع الطلبات على مدار الأسبوع. كل خانة = ساعة، اللون الأغمق = طلبات أكتر.</span>
        </div>

        <div className="dl-card" style={{ padding: 14 }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems:'center', gap: 6, marginBottom: 12, fontSize: 10, color: 'var(--ink-light)' }}>
            <span>قليل</span>
            {[0, 1, 2, 3, 4, 5].map(v => (
              <div key={v} style={{ width: 14, height: 10, borderRadius: 2,
                background: v === 0 ? 'var(--canvas-200)' : `rgba(31,74,61,${0.15 + v * 0.17})` }}/>
            ))}
            <span>كتير</span>
          </div>

          {/* Heatmap rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '38px repeat(20, 1fr)', gap: 2 }}>
              <span/>
              {Array.from({ length: 20 }, (_, i) => i + 4).map(h => (
                <span key={h} style={{ fontSize: 8, color: 'var(--ink-mute)', textAlign: 'center' }}>
                  {h <= 12 ? h.toLocaleString('ar-EG') : (h - 12).toLocaleString('ar-EG')}
                </span>
              ))}
            </div>
            {BUSY.map(d => (
              <div key={d.day} style={{ display: 'grid', gridTemplateColumns: '38px repeat(20, 1fr)', gap: 2, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--ink)', fontWeight: 600 }}>{d.day}</span>
                {d.hours.map((v, i) => (
                  <div key={i} style={{ aspectRatio: '1 / 1', borderRadius: 3,
                    background: v === 0 ? 'var(--canvas-200)' : `rgba(31,74,61,${0.15 + v * 0.17})` }}
                    title={`${v.toLocaleString('ar-EG')} طلب`}/>
                ))}
              </div>
            ))}
          </div>
        </div>

        <SectionHead title="رؤى"/>
        <Group>
          <RvRow icon={<Icon.flame size={18}/>} label="أعلى ساعة" value="٧–٨ م الجمعة" sub="٥٫٤ طلب/ساعة في المتوسط"/>
          <hr className="dl-divider"/>
          <RvRow icon={<Icon.clock size={18}/>} label="أقل ساعة" value="٤–٥ ص" sub="غالباً مفيش طلبات"/>
          <hr className="dl-divider"/>
          <RvRow icon={<Icon.user size={18}/>} label="اقتراح" value="ضيف عمالة الجمعة م" sub="بتجمع ٣٠٪ من إيرادات الأسبوع"/>
        </Group>
      </div>
    </div>
  );
}

// ── Conversion insights ──────────────────────────────────────────
function ConversionScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen">
      <AppBar title="نسبة التحويل" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '14px 18px 24px' }}>
        <div className="dl-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 100,
              background: 'rgba(232,177,79,0.18)', color: '#8a6418',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon.flame size={26}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>زائر زار وطلب</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--olive)', lineHeight: 1 }}>
                {CONVERSION.toLocaleString('ar-EG')}٪
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 4 }}>
                ٧ من كل ١٠ زيارة بتنتهي بطلب
              </div>
            </div>
            <Badge variant="active">+٥٪</Badge>
          </div>
        </div>

        <SectionHead title="مسار العميل"/>
        <div className="dl-card" style={{ padding: '12px 0' }}>
          {[
            { label: 'فتحوا المحل', value: '٤٤٧', pct: 100 },
            { label: 'تصفحوا المنتجات', value: '٣٨٢', pct: 85 },
            { label: 'ضافوا منتج للسلة', value: '٣١٨', pct: 71 },
            { label: 'بدأوا الدفع', value: '٢٧٤', pct: 61 },
            { label: 'أتموا الطلب', value: '٣٠٤', pct: 68 },
          ].map((s, i, a) => (
            <div key={s.label} style={{ padding: '10px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--ink)' }}>{s.label}</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.value}</span>
              </div>
              <div style={{ height: 6, borderRadius: 100, background: 'var(--canvas-200)', overflow: 'hidden' }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: 'var(--olive)',
                  transition: 'width 600ms var(--ease-out)' }}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(31,74,61,0.06)', borderRadius: 10,
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10 }}>
          <Icon.sparkle size={14}/>
          <span><strong style={{ color: 'var(--olive)' }}>٢٧٪ من اللي بيدخلوا</strong> ما بيكملوش الطلب. جرب تضيف عروض لتشجيعهم.</span>
        </div>
      </div>
    </div>
  );
}

registerScreen('analytics', AnalyticsScreen);
registerScreen('revenueDetail', RevenueDetailScreen);
registerScreen('bestSellers', BestSellersScreen);
registerScreen('cancellations', CancellationsScreen);
registerScreen('busyHours', BusyHoursScreen);
registerScreen('conversionDetail', ConversionScreen);
