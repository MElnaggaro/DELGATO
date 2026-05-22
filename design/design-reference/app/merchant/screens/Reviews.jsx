// app/merchant/screens/Reviews.jsx — Reviews list + merchant responses
const { useState: useStMR } = React;

function ReviewsScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [filter, setFilter] = useStMR('all');
  const [respond, setRespond] = useStMR(null);

  const list = filter === 'unresponded' ? m.reviews.filter(r => !r.response)
              : filter === 'low' ? m.reviews.filter(r => r.stars < 4)
              : m.reviews;

  return (
    <div className="dl-screen">
      <AppBar title="التقييمات" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        {/* Summary card */}
        <div style={{ marginTop: 14 }}>
          <div className="dl-card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 38, fontWeight: 700, color: 'var(--olive)', lineHeight: 1 }}>
                ٤٫٨
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 1, justifyContent: 'center', color: 'var(--gold)' }}>
                {[1,2,3,4,5].map(n => <Icon.star key={n} size={12}/>)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--ink-light)', marginTop: 4 }}>
                {REVIEW_STATS.total.toLocaleString('ar-EG')} تقييم
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {REVIEW_STATS.breakdown.map(b => (
                <div key={b.n} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5 }}>
                  <span style={{ width: 10, color: 'var(--ink-light)' }}>{b.n}</span>
                  <Icon.star size={10}/>
                  <div style={{ flex: 1, height: 5, borderRadius: 100, background: 'var(--canvas-200)', overflow: 'hidden' }}>
                    <div style={{ width: `${b.pct}%`, height: '100%', background: 'var(--gold)',
                      transition: 'width 600ms var(--ease-out)' }}/>
                  </div>
                  <span style={{ width: 24, textAlign: 'left', color: 'var(--ink-light)' }}>
                    {b.count.toLocaleString('ar-EG')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '14px 0 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { k: 'all', l: 'الكل', n: m.reviews.length },
            { k: 'unresponded', l: 'محتاج رد', n: m.reviews.filter(r => !r.response).length },
            { k: 'low', l: 'سلبية', n: m.reviews.filter(r => r.stars < 4).length },
          ].map(c => (
            <Chip key={c.k} active={filter === c.k} onClick={() => setFilter(c.k)}>
              {c.l} <span style={{ opacity: 0.7, marginInlineStart: 4 }}>· {c.n.toLocaleString('ar-EG')}</span>
            </Chip>
          ))}
        </div>

        {/* Reviews list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((r, i) => (
            <div key={r.id} className="dl-card dl-rise" style={{ animationDelay: `${i * 30}ms`, padding: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 100, background: 'var(--canvas-200)',
                  color: 'var(--olive)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {r.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{r.date}</div>
                  </div>
                  <div style={{ display:'flex', gap: 8, alignItems:'center', marginTop: 4 }}>
                    <div style={{ display: 'flex', gap: 1, color: 'var(--gold)' }}>
                      {[1,2,3,4,5].map(n => (
                        <Icon.star key={n} size={11} className={n > r.stars ? 'op-30' : ''}/>
                      ))}
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-light)' }}>{r.order}</span>
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

                  {/* Existing response */}
                  {r.response && (
                    <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(31,74,61,0.06)',
                      borderRadius: 10, borderInlineStart: '3px solid var(--olive)' }}>
                      <div style={{ fontSize: 11, color: 'var(--olive)', fontWeight: 700, marginBottom: 4 }}>
                        رد من المحل
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.55 }}>{r.response}</div>
                    </div>
                  )}

                  {/* Respond button */}
                  {!r.response && (
                    <button onClick={() => setRespond(r)}
                      style={{ all:'unset', cursor:'pointer', marginTop: 10, padding: '8px 12px',
                        background: 'var(--canvas-200)', color: 'var(--olive)', borderRadius: 8,
                        fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 12,
                        display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Icon.message size={14}/> رد على التقييم
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {respond && (
        <RespondSheet review={respond}
          onClose={() => setRespond(null)}
          onSend={(text) => {
            m.setReviews(prev => prev.map(x => x.id === respond.id ? { ...x, response: text } : x));
            m.showToast('اتبعت ردك للعميل', <Icon.check size={16}/>);
            setRespond(null);
          }}/>
      )}
    </div>
  );
}

function RespondSheet({ review, onClose, onSend }) {
  const [text, setText] = useStMR('');
  const presets = review.stars >= 4 ? [
    'شكراً لتعليقك! نورتنا.',
    'ربنا يبارك فيك — يلا تاني وتاني.',
    'كلامك بيعطينا طاقة. شكراً!',
  ] : [
    'ابعت رسالة — هنحل المشكلة معاك.',
    'آسفين على التجربة دي. هنشتغل علشان نحسّن.',
    'شكراً لتعليقك الصريح. هنراجع ونحسّن.',
  ];

  return (
    <Sheet title={`رد على ${review.name}`} onClose={onClose}>
      <div style={{ padding: '0 18px 24px' }}>
        <div style={{ padding: '10px 12px', background: 'var(--canvas-200)', borderRadius: 10,
          fontSize: 12.5, color: 'var(--ink-light)', lineHeight: 1.5, marginBottom: 14,
          display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--gold)', display:'inline-flex' }}>
            {[1,2,3,4,5].map(n => <Icon.star key={n} size={10} className={n > review.stars ? 'op-30' : ''}/>)}
          </span>
          <span>"{review.body}"</span>
        </div>

        <textarea autoFocus value={text} onChange={e => setText(e.target.value)}
          placeholder="اكتب رد بشري ومحترم. العميل هيشوف ردك."
          style={{ width:'100%', minHeight: 120, padding: 14, fontFamily:'var(--font-arabic)',
            borderRadius: 12, border: '1.5px solid var(--canvas-300)', background:'#fff',
            resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', lineHeight: 1.55 }}/>

        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-mute)', fontWeight: 600 }}>ردود جاهزة</div>
        <div style={{ marginTop: 8, display:'flex', flexWrap:'wrap', gap: 6 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setText(p)}
              className="dl-chip" style={{ maxWidth: '100%', whiteSpace: 'normal', textAlign: 'start',
                lineHeight: 1.4 }}>
              {p}
            </button>
          ))}
        </div>

        <Button variant="primary" full size="lg" disabled={text.trim().length < 5}
          style={{ marginTop: 18 }}
          onClick={() => onSend(text.trim())}>
          إرسال الرد
        </Button>
      </div>
    </Sheet>
  );
}

registerScreen('reviews', ReviewsScreen);
