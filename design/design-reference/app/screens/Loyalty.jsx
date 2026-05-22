// screens/Loyalty.jsx — Wallet, Rewards, Referral, Points, Cashback
const { useState: useStL, useEffect: useEfL, useRef: useRfL } = React;

// ── Wallet ────────────────────────────────────────────────────────
function WalletScreen() {
  const nav = useNav();
  const app = useApp();
  const [topup, setTopup] = useStL(false);

  return (
    <div className="dl-screen">
      <AppBar title="المحفظة" onBack={() => nav.pop()}
        trailing={<button onClick={() => nav.push('walletHistory')}
          style={{ background:'transparent', border: 0, padding: 6, color: 'var(--olive)',
            fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 600, cursor:'pointer' }}>
          السجل
        </button>}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Wallet card */}
        <div className="dl-fade-up" style={{
          height: 200, borderRadius: 18, padding: 22,
          background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
          color: 'var(--canvas)', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ position:'absolute', top: -50, insetInlineEnd: -30, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(232,177,79,0.16)' }}/>
          <div style={{ position:'absolute', bottom: -60, insetInlineStart: -30, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(250,248,243,0.05)' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)' }}>الرصيد المتاح</div>
              <div style={{ fontSize: 40, fontWeight: 700, marginTop: 4, lineHeight: 1 }}>
                {app.walletBalance.toLocaleString('ar-EG')} <span style={{ fontSize: 16, color: 'rgba(250,248,243,0.7)', fontWeight: 500 }}>ج.م</span>
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(250,248,243,0.14)',
              color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon.wallet size={22}/>
            </div>
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 18 }}>
            <Tile label="كاش باك الشهر" value={`${CASHBACK_THIS_MONTH.toLocaleString('ar-EG')} ج.م`}/>
            <Tile label="نقاط" value={app.points.toLocaleString('ar-EG')}/>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <QuickAction icon={<Icon.plus size={20}/>} label="شحن" onClick={() => setTopup(true)}/>
          <QuickAction icon={<Icon.share size={20}/>} label="تحويل" onClick={() => app.showToast('متاحة قريباً', <Icon.info size={16}/>)}/>
          <QuickAction icon={<Icon.zap size={20}/>} label="ادفع" onClick={() => app.cart.length > 0 ? nav.push('walletPay') : app.showToast('السلة فاضية', <Icon.bag size={16}/>)}/>
        </div>

        {/* Cashback banner */}
        <div onClick={() => nav.push('cashback')} className="dl-tappable" style={{
          marginTop: 18, padding: '14px 16px', background: 'rgba(232,177,79,0.10)',
          borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center', cursor:'pointer',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,177,79,0.30)',
            color: '#8a6418', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.flame size={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>كاش باك ١٠٪ على كل طلب</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-light)', marginTop: 2 }}>للأسبوع ده فقط — استخدم المحفظة في الدفع</div>
          </div>
          <Icon.chevronLeft size={18}/>
        </div>

        {/* Recent transactions */}
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em' }}>آخر المعاملات</div>
          <button onClick={() => nav.push('walletHistory')}
            style={{ all:'unset', cursor:'pointer', color: 'var(--olive)', fontSize: 13, fontWeight: 600 }}>
            عرض الكل
          </button>
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {app.walletTx.slice(0, 4).map((tx, i) => <TxRow key={tx.id} tx={tx} idx={i}/>)}
        </div>
      </div>

      {topup && <TopupSheet onClose={() => setTopup(false)} onTopup={(amt) => {
        app.setWalletBalance(app.walletBalance + amt);
        app.setWalletTx(prev => [{ id: 'tx' + Date.now(), kind: 'in',
          title: `شحن المحفظة · ${amt.toLocaleString('ar-EG')} ج.م`, date: 'دلوقتي', amount: amt }, ...prev]);
        setTopup(false);
        app.showToast(`اتشحنت المحفظة بـ ${amt.toLocaleString('ar-EG')} ج.م`, <Icon.check size={16}/>);
      }}/>}
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'rgba(250,248,243,0.6)', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, color: 'var(--gold)' }}>{value}</div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="dl-tappable"
      style={{ all:'unset', cursor:'pointer', background: '#fff',
        boxShadow: 'var(--shadow-card)', borderRadius: 12, padding: '14px 8px',
        display:'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
        color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
    </button>
  );
}

function TxRow({ tx, idx }) {
  const inFlow = tx.kind === 'in';
  return (
    <div className="dl-card dl-rise" style={{ animationDelay: `${idx * 30}ms`, padding: 12, display:'flex', gap: 12, alignItems:'center' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: inFlow ? 'rgba(31,74,61,0.08)' : 'rgba(197,59,44,0.08)',
        color: inFlow ? 'var(--olive)' : '#A1271C',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {inFlow ? <Icon.arrowDown size={18}/> : <Icon.arrowUp size={18}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>{tx.date}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: inFlow ? 'var(--olive)' : 'var(--ink)' }}>
        {inFlow ? '+' : ''}{tx.amount.toLocaleString('ar-EG')} <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
      </div>
    </div>
  );
}

function TopupSheet({ onClose, onTopup }) {
  const [amt, setAmt] = useStL(50);
  const opts = [50, 100, 200, 500];
  return (
    <Sheet title="شحن المحفظة" onClose={onClose}>
      <div style={{ padding: '14px 18px 24px' }}>
        <div style={{ background: 'var(--canvas-200)', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>مبلغ الشحن</div>
          <div style={{ fontSize: 38, fontWeight: 700, color: 'var(--olive)', marginTop: 4, lineHeight: 1 }}>
            {amt.toLocaleString('ar-EG')} <span style={{ fontSize: 14, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {opts.map(o => (
            <button key={o} onClick={() => setAmt(o)}
              style={{ all:'unset', cursor:'pointer', padding: '12px 4px', borderRadius: 10,
                background: amt === o ? 'var(--olive)' : '#fff',
                color: amt === o ? 'var(--canvas)' : 'var(--ink)',
                border: amt === o ? 0 : '1.5px solid var(--canvas-300)',
                textAlign: 'center', fontWeight: 700, fontSize: 14,
                transition: 'all 150ms var(--ease-out)' }}>
              {o.toLocaleString('ar-EG')}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em' }}>الشحن من</div>
          {[
            { l: 'فيزا •••• ٤٢٣٢', icon: <Icon.card size={20}/>, def: true },
            { l: 'فودافون كاش', icon: <Icon.phone size={20}/> },
            { l: 'إنستاباي', icon: <Icon.zap size={20}/> },
          ].map((m, i) => (
            <div key={i} className="dl-card" style={{ padding: 12, display:'flex', gap: 10, alignItems:'center',
              border: i === 0 ? '1.5px solid var(--olive)' : '1.5px solid transparent' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--canvas-200)',
                color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {m.icon}
              </div>
              <div style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>{m.l}</div>
              {m.def && <Badge variant="active">افتراضي</Badge>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <Button variant="primary" size="lg" full onClick={() => onTopup(amt)}>
            اشحن {amt.toLocaleString('ar-EG')} ج.م
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

// ── Wallet History (full screen) ─────────────────────────────────
function WalletHistoryScreen() {
  const nav = useNav();
  const app = useApp();
  const [filter, setFilter] = useStL('all');
  const list = filter === 'in' ? app.walletTx.filter(tx => tx.kind === 'in')
              : filter === 'out' ? app.walletTx.filter(tx => tx.kind === 'out')
              : app.walletTx;
  return (
    <div className="dl-screen">
      <AppBar title="سجل المعاملات" onBack={() => nav.pop()}/>
      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 8 }}>
        {[
          { k: 'all', l: 'الكل' },
          { k: 'in', l: 'وارد' },
          { k: 'out', l: 'مدفوع' },
        ].map(c => (
          <Chip key={c.k} active={filter === c.k} onClick={() => setFilter(c.k)}>{c.l}</Chip>
        ))}
      </div>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ display:'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((tx, i) => <TxRow key={tx.id} tx={tx} idx={i}/>)}
        </div>
      </div>
    </div>
  );
}

// ── Points ────────────────────────────────────────────────────────
function PointsScreen() {
  const nav = useNav();
  const app = useApp();
  // Tier system
  const tiers = [
    { name: 'فضي', cost: 0, color: '#A6B0B0', icon: 'sparkle' },
    { name: 'ذهبي', cost: 1500, color: '#E8B14F', icon: 'sparkle' },
    { name: 'ماسي', cost: 5000, color: '#1F4A3D', icon: 'sparkle' },
  ];
  const currentTier = tiers.findLast?.(t => app.points >= t.cost) || tiers[0];
  const nextTier = tiers.find(t => t.cost > app.points);
  const pct = nextTier ? Math.min(100, (app.points / nextTier.cost) * 100) : 100;

  return (
    <div className="dl-screen">
      <AppBar title="نقاط دلنجاتُو" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Hero */}
        <div className="dl-fade-up" style={{ background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
          color: 'var(--canvas)', borderRadius: 18, padding: 22, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', top: -40, insetInlineEnd: -30, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(232,177,79,0.12)' }}/>
          <div style={{ position: 'relative' }}>
            <Badge variant="solid-gold">{currentTier.name}</Badge>
            <div style={{ fontSize: 48, fontWeight: 700, marginTop: 14, lineHeight: 1 }}>
              {app.points.toLocaleString('ar-EG')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(250,248,243,0.7)', marginTop: 6 }}>نقطة في رصيدك</div>

            {nextTier && (
              <div style={{ marginTop: 18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize: 11, color: 'rgba(250,248,243,0.7)', marginBottom: 6 }}>
                  <span>التقدم لمستوى {nextTier.name}</span>
                  <span>{(nextTier.cost - app.points).toLocaleString('ar-EG')} نقطة باقية</span>
                </div>
                <div style={{ height: 8, borderRadius: 100, background: 'rgba(250,248,243,0.16)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 100, background: 'var(--gold)',
                    width: `${pct}%`, transition: 'width 800ms var(--ease-out)' }}/>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How to earn */}
        <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          ازاي تكسب نقاط
        </div>
        <div className="dl-card" style={{ padding: '4px 0' }}>
          {[
            { l: '١ نقطة على كل جنيه', s: 'في كل طلب توصلك على البيت', icon: <Icon.bag size={18}/> },
            { l: '٥٠ نقطة هدية', s: 'لما تقيّم طلبك بصدق', icon: <Icon.star size={18}/> },
            { l: '٢٠٠ نقطة', s: 'لما تدعو صديق ويعمل أول طلب', icon: <Icon.user size={18}/> },
            { l: '× ٢ نقاط', s: 'يوم جمعة على كل طلباتك', icon: <Icon.flame size={18}/> },
          ].map((e, i, a) => (
            <div key={i}>
              <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(31,74,61,0.08)',
                  color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {e.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{e.l}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{e.s}</div>
                </div>
              </div>
              {i < a.length - 1 && <hr className="dl-divider"/>}
            </div>
          ))}
        </div>

        <Button variant="primary" full size="lg" style={{ marginTop: 22 }} onClick={() => nav.push('rewards')}>
          استبدل النقاط
        </Button>
      </div>
    </div>
  );
}

// ── Rewards Catalog ──────────────────────────────────────────────
function RewardsScreen() {
  const nav = useNav();
  const app = useApp();
  const [confirm, setConfirm] = useStL(null);

  const redeem = (r) => {
    if (app.points < r.cost) return;
    app.setPoints(app.points - r.cost);
    app.showToast(`اتم استبدال "${r.title}"`, <Icon.check size={16}/>);
    setConfirm(null);
  };

  return (
    <div className="dl-screen">
      <AppBar title="استبدال النقاط" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-fade-up" style={{
          background: 'rgba(31,74,61,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 100, background: 'var(--olive)',
            color: 'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon.sparkle size={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>رصيدك</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--olive)' }}>
              {app.points.toLocaleString('ar-EG')} <span style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>نقطة</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REWARDS.map((r, i) => {
            const canRedeem = app.points >= r.cost;
            return (
              <div key={r.id} className="dl-rise" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="dl-card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center',
                  opacity: canRedeem ? 1 : 0.65 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12,
                    background: canRedeem ? 'var(--olive)' : 'var(--canvas-200)',
                    color: canRedeem ? 'var(--canvas)' : 'var(--ink-mute)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
                    {r.icon === 'bike' && <Icon.bike size={22}/>}
                    {r.icon === 'tag' && <Icon.tag size={22}/>}
                    {r.icon === 'sparkle' && <Icon.sparkle size={22}/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4, lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                  <button onClick={() => canRedeem && setConfirm(r)}
                    disabled={!canRedeem}
                    style={{ all:'unset', cursor: canRedeem ? 'pointer' : 'not-allowed',
                      padding: '10px 14px', borderRadius: 10,
                      background: canRedeem ? 'var(--olive)' : 'var(--canvas-200)',
                      color: canRedeem ? 'var(--canvas)' : 'var(--ink-mute)',
                      fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 13,
                      whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {r.cost.toLocaleString('ar-EG')} نقطة
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          title={`استبدال "${confirm.title}"`}
          body={`هتدفع ${confirm.cost.toLocaleString('ar-EG')} نقطة من رصيدك. هتقدر تستخدم المكافأة في طلبك التالي.`}
          confirm="استبدال" cancel="رجوع"
          onConfirm={() => redeem(confirm)}
          onCancel={() => setConfirm(null)}/>
      )}
    </div>
  );
}

// ── Referral ─────────────────────────────────────────────────────
function ReferralScreen() {
  const nav = useNav();
  const app = useApp();
  const code = 'AHMED20';
  const link = 'delngato.app/r/' + code;
  const [copied, setCopied] = useStL(false);

  const invited = [
    { name: 'يوسف حلمي', status: 'completed', reward: 30 },
    { name: 'سارة عبد الله', status: 'completed', reward: 30 },
    { name: 'محمود سعد', status: 'pending', reward: 0 },
  ];

  return (
    <div className="dl-screen">
      <AppBar title="ادعِ صديق" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Hero card */}
        <div className="dl-fade-up" style={{
          background: 'linear-gradient(135deg, #E8B14F 0%, #C9933A 100%)',
          borderRadius: 18, padding: 22, color: 'var(--ink)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position:'absolute', top: -30, insetInlineEnd: -30, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(31,74,61,0.10)' }}/>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(31,74,61,0.14)',
            color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center', position: 'relative' }}>
            <Icon.heart size={24}/>
          </div>
          <div style={{ marginTop: 16, fontSize: 24, fontWeight: 700, lineHeight: 1.25, position: 'relative' }}>
            ادعِ صاحبك<br/>وهتاخدوا ٣٠ ج.م لكل واحد
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(15,26,23,0.7)', lineHeight: 1.55, position: 'relative' }}>
            هو ياخد خصم ٣٠ ج.م على أول طلب · وانت بتاخد ٣٠ ج.م كاش على المحفظة
          </div>
        </div>

        {/* Code box */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
            كودك الخاص
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, padding: '14px 16px', background: '#fff',
              border: '1.5px dashed var(--canvas-300)', borderRadius: 12,
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18,
              letterSpacing: '0.14em', textAlign: 'center', color: 'var(--olive)' }}>
              {code}
            </div>
            <button onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); app.showToast('اتنسخ الكود', <Icon.copy size={16}/>); setTimeout(() => setCopied(false), 1500); }}
              style={{ all:'unset', cursor:'pointer', minHeight: 52,
                padding: '0 14px', borderRadius: 12,
                background: 'var(--olive)', color: 'var(--canvas)',
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-arabic)', fontWeight: 600 }}>
              {copied ? <Icon.check size={18}/> : <Icon.copy size={18}/>}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button variant="secondary" full leading={<Icon.share size={16}/>}
            onClick={() => app.showToast(`اتنشر "${link}" على واتساب`, <Icon.message size={16}/>)}>
            مشاركة على واتساب
          </Button>
          <Button variant="ghost" full leading={<Icon.external size={16}/>}
            onClick={() => app.showToast('اتفتحت مشاركة', <Icon.share size={16}/>)}>
            مشاركة بطرق تانية
          </Button>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>أصحاب انضموا</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--olive)', marginTop: 4 }}>٣</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>كسبت من الدعوات</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--olive)', marginTop: 4 }}>
              ٦٠ <span style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
            </div>
          </div>
        </div>

        {/* Invited list */}
        <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          أصحاب دعيتهم
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {invited.map((p, i) => (
            <div key={i} className="dl-card" style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 100, background: 'var(--canvas-200)',
                color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16 }}>
                {p.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', marginTop: 2 }}>
                  {p.status === 'completed' ? 'عمل أول طلب' : 'لسه ما طلبش'}
                </div>
              </div>
              {p.status === 'completed' ? (
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--olive)' }}>
                  +{p.reward.toLocaleString('ar-EG')} <span style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
                </div>
              ) : <Badge variant="pending">قيد الانتظار</Badge>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cashback ─────────────────────────────────────────────────────
function CashbackScreen() {
  const nav = useNav();
  return (
    <div className="dl-screen">
      <AppBar title="الكاش باك" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div className="dl-fade-up" style={{
          background: 'linear-gradient(135deg, #1F4A3D 0%, #173629 100%)',
          color: 'var(--canvas)', borderRadius: 18, padding: 22, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, insetInlineEnd: -20, width: 160, height: 160,
            borderRadius: '50%', background: 'rgba(232,177,79,0.18)' }}/>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(232,177,79,0.20)',
            color: 'var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', position: 'relative' }}>
            <Icon.flame size={24}/>
          </div>
          <div style={{ marginTop: 16, fontSize: 28, fontWeight: 700, lineHeight: 1.25, position: 'relative' }}>
            كاش باك ١٠٪<br/>على كل طلبات الأسبوع
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(250,248,243,0.78)', lineHeight: 1.55, position: 'relative' }}>
            استخدم محفظة دلنجاتُو في الدفع وارجعلك ١٠٪ من قيمة الطلب على طول.
          </div>
        </div>

        {/* This month */}
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="dl-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>كاش باك الشهر ده</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--olive)', marginTop: 6 }}>
              {CASHBACK_THIS_MONTH.toLocaleString('ar-EG')} <span style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
            </div>
          </div>
          <div className="dl-card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-light)' }}>إجمالي الكاش باك</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)', marginTop: 6 }}>
              ١٤٢ <span style={{ fontSize: 12, color: 'var(--ink-light)', fontWeight: 500 }}>ج.م</span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div style={{ marginTop: 22, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          ازاي يشتغل؟
        </div>
        <div className="dl-card" style={{ padding: 4 }}>
          {[
            { n: '١', l: 'اطلب اللي انت عايزه', s: 'من أي محل في الدلنجات' },
            { n: '٢', l: 'ادفع من المحفظة', s: 'في خطوة الدفع، اختار "محفظة"' },
            { n: '٣', l: 'الكاش باك على طول', s: 'ترجع المحفظة فلوس على طول · ١٠٪ من قيمة الطلب' },
          ].map((s, i, a) => (
            <div key={i}>
              <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 100, background: 'var(--olive)',
                  color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16 }}>{s.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.l}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{s.s}</div>
                </div>
              </div>
              {i < a.length - 1 && <hr className="dl-divider"/>}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: '12px 14px', background: 'var(--canvas-200)', borderRadius: 10,
          fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.55, display: 'flex', gap: 10 }}>
          <Icon.info size={14}/>
          <span>أقصى كاش باك ٢٠٠ ج.م في الشهر. الدفع كاش وبالبطاقة مش بيستحق كاش باك.</span>
        </div>
      </div>
    </div>
  );
}

registerScreen('wallet', WalletScreen);
registerScreen('walletHistory', WalletHistoryScreen);
registerScreen('points', PointsScreen);
registerScreen('rewards', RewardsScreen);
registerScreen('referral', ReferralScreen);
registerScreen('cashback', CashbackScreen);
