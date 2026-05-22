// app/merchant/screens/StaffSupport.jsx — Staff/roles, Support, Support chat, Report issue, Notifications
const { useState: useStMSS, useEffect: useEfMSS, useRef: useRfMSS } = React;

// ── Staff list ───────────────────────────────────────────────────
function StaffScreen() {
  const nav = useNav();
  const m = useMerchant();
  return (
    <div className="dl-screen">
      <AppBar title="الفريق" onBack={() => nav.pop()}
        trailing={<button onClick={() => nav.push('staffForm')}
          style={{ background:'transparent', border: 0, padding: 6, color: 'var(--olive)',
            fontFamily: 'var(--font-arabic)', fontSize: 13, fontWeight: 700, cursor:'pointer',
            display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon.plus size={16}/> موظف
        </button>}/>
      <div className="dl-scroll" style={{ padding: '0 18px 24px' }}>
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          {m.staff.filter(s => s.active).length.toLocaleString('ar-EG')} موظف شغّال · {m.staff.length.toLocaleString('ar-EG')} إجمالي
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {m.staff.map((s, i) => (
            <div key={s.id} className="dl-rise" style={{ animationDelay: `${i * 30}ms` }}>
              <div onClick={() => nav.push('staffForm', { member: s })} className="dl-tappable"
                style={{ background: '#fff', borderRadius: 12, padding: 14,
                  boxShadow: 'var(--shadow-card)', display: 'flex', gap: 12, alignItems: 'center',
                  cursor: 'pointer', opacity: s.active ? 1 : 0.55 }}>
                <div style={{ width: 48, height: 48, borderRadius: 100,
                  background: s.owner ? 'var(--olive)' : 'var(--canvas-200)',
                  color: s.owner ? 'var(--canvas)' : 'var(--olive)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                  {s.letter}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)' }}>{s.name}</div>
                    {s.owner && <Badge variant="solid-gold">المالك</Badge>}
                    {!s.active && <Badge variant="issue">معطّل</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{s.role}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {s.perms.slice(0, 3).map(p => {
                      const perm = PERMISSIONS.find(x => x.key === p);
                      return perm && (
                        <span key={p} style={{ fontSize: 10.5, padding: '3px 8px', borderRadius: 100,
                          background: 'var(--canvas-200)', color: 'var(--ink)' }}>
                          {perm.label}
                        </span>
                      );
                    })}
                    {s.perms.length > 3 && (
                      <span style={{ fontSize: 10.5, color: 'var(--ink-light)', padding: '3px 4px' }}>
                        +{(s.perms.length - 3).toLocaleString('ar-EG')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Staff form ───────────────────────────────────────────────────
function StaffFormScreen({ member }) {
  const nav = useNav();
  const m = useMerchant();
  const isEdit = !!member;
  const [name, setName] = useStMSS(member?.name || '');
  const [phone, setPhone] = useStMSS(member?.phone || '');
  const [role, setRole] = useStMSS(member?.role || ROLE_TEMPLATES[1].name);
  const [perms, setPerms] = useStMSS(member?.perms || ROLE_TEMPLATES[1].perms);
  const [active, setActive] = useStMSS(member?.active !== false);
  const [confirm, setConfirm] = useStMSS(false);

  const togglePerm = (key) => {
    setPerms(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);
  };
  const applyTemplate = (t) => {
    setRole(t.name);
    setPerms(t.perms);
  };

  const valid = name.trim().length >= 2 && phone.length >= 10;

  const save = () => {
    if (!valid) return;
    if (isEdit) {
      m.setStaff(prev => prev.map(x => x.id === member.id ?
        { ...x, name, phone, role, perms, active } : x));
      m.showToast(`اتحفظت بيانات ${name}`, <Icon.check size={16}/>);
    } else {
      m.setStaff(prev => [...prev, {
        id: 's' + Date.now(), name, phone, role, perms, active,
        letter: name[0], owner: false,
      }]);
      m.showToast('اتضاف موظف جديد', <Icon.check size={16}/>);
    }
    nav.pop();
  };

  return (
    <div className="dl-screen">
      <AppBar title={isEdit ? 'تعديل بيانات الموظف' : 'موظف جديد'} onBack={() => nav.pop()}
        trailing={isEdit && !member.owner && (
          <button onClick={() => setConfirm(true)}
            style={{ background:'transparent', border: 0, padding: 6, color: '#A1271C',
              cursor:'pointer', display:'flex' }}>
            <Icon.trash size={20}/>
          </button>
        )}/>
      <div className="dl-scroll" style={{ padding: '14px 18px' }}>
        <Fld label="الاسم">
          <input className="dl-input" autoFocus placeholder="مثلاً: محمد علي"
            value={name} onChange={e => setName(e.target.value)}/>
        </Fld>
        <div style={{ height: 14 }}/>
        <Fld label="رقم التليفون">
          <input dir="ltr" className="dl-input" placeholder="٠١٠ ١٢٣ ٤٥٦٧"
            value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9٠-٩ ]/g, ''))}
            style={{ textAlign: 'left' }}/>
        </Fld>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          الدور
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ROLE_TEMPLATES.map(t => (
            <Chip key={t.id} active={role === t.name} onClick={() => applyTemplate(t)}>{t.name}</Chip>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          الصلاحيات
        </div>
        <div className="dl-card" style={{ padding: 4 }}>
          {PERMISSIONS.map((p, i, a) => (
            <div key={p.key}>
              <TogRow icon={
                p.icon === 'receipt' ? <Icon.receipt size={18}/> :
                p.icon === 'package' ? <Icon.package size={18}/> :
                p.icon === 'layers' ? <Icon.layers size={18}/> :
                p.icon === 'user' ? <Icon.user size={18}/> :
                <Icon.settings size={18}/>
              } label={p.label} v={perms.includes(p.key)} onChange={() => togglePerm(p.key)}/>
              {i < a.length - 1 && <hr className="dl-divider"/>}
            </div>
          ))}
        </div>

        {isEdit && !member.owner && (
          <div style={{ marginTop: 14 }}>
            <div className="dl-card" style={{ padding: 4 }}>
              <TogRow label="حساب مفعّل" sub="لو متعطل، الموظف مش هيقدر يدخل"
                v={active} onChange={() => setActive(!active)}/>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!valid} onClick={save}>
          {isEdit ? 'حفظ التغييرات' : 'إنشاء الحساب'}
        </Button>
      </div>

      {confirm && (
        <ConfirmDialog
          title={`حذف ${member.name}؟`}
          body="هتلغي وصوله للتطبيق. مش هيقدر يدخل تاني."
          confirm="حذف" cancel="تراجع" destructive
          onConfirm={() => {
            m.setStaff(prev => prev.filter(s => s.id !== member.id));
            m.showToast('اتحذف الموظف', <Icon.trash size={16}/>);
            setConfirm(false);
            nav.pop();
          }}
          onCancel={() => setConfirm(false)}/>
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

// ── Support ───────────────────────────────────────────────────────
function SupportScreen() {
  const nav = useNav();
  const m = useMerchant();
  const faqs = [
    { q: 'إزاي أضيف منتج جديد؟', a: 'من شاشة "المنتجات" اضغط على زر + في الأسفل. املأ البيانات واحفظ.' },
    { q: 'إزاي أرفض طلب من غير ما يأثر على تقييمي؟', a: 'حاول تقبل وتعلم العميل لو فيه تأخير قبل ما ترفض. الرفض المتكرر بيقلل ترتيبك.' },
    { q: 'إمتى بيتم تحويل الأرباح؟', a: 'أسبوعياً كل جمعة الصبح على حسابك البنكي. تقدر تشوف الجدول من إعدادات الدفع.' },
    { q: 'إزاي أعمل عرض على منتج معين؟', a: 'من "العروض والكوبونات" اعمل عرض جديد واختار نوعه. تقدر تربطه بمنتج أو قسم.' },
    { q: 'مين بيستلم الإكرامية؟', a: 'الإكرامية كلها بتروح للكابتن — دلنجاتو ما بتاخدش منها أي نسبة.' },
    { q: 'إزاي أضيف موظف جديد؟', a: 'من "الفريق" اضغط على ضيف موظف، وحدد صلاحياته. هيوصله رابط دخول.' },
  ];
  const [open, setOpen] = useStMSS(null);

  return (
    <div className="dl-screen">
      <AppBar title="مركز المساعدة" onBack={() => nav.pop()}/>
      <div className="dl-scroll">
        <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ContactTile icon={<Icon.message size={22}/>} title="شات مع الدعم" sub="رد في دقايق · الأسرع"
            onClick={() => nav.push('supportChat')} accent="olive"/>
          <ContactTile icon={<Icon.phone size={22}/>} title="اتصل بنا" sub="٩ ص — ١٢ ص"
            onClick={() => {}} accent="gold"/>
        </div>

        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            أسئلة شائعة
          </div>
          <div className="dl-card" style={{ overflow: 'hidden' }}>
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

        <div style={{ padding: '0 18px 28px' }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
            موارد إضافية
          </div>
          <Group>
            <ListRow icon={<Icon.layers size={18}/>} label="دليل البدء" sub="ابدأ معانا في ٥ دقايق" onClick={() => {}}/>
            <hr className="dl-divider"/>
            <ListRow icon={<Icon.flame size={18}/>} label="ازاي تزود مبيعاتك؟" sub="مقالة من فريق دلنجاتو" onClick={() => {}}/>
            <hr className="dl-divider"/>
            <ListRow icon={<Icon.info size={18}/>} label="بلّغ عن مشكلة"
              onClick={() => nav.push('reportIssue')}/>
          </Group>
        </div>
      </div>
    </div>
  );
}

function ContactTile({ icon, title, sub, accent, onClick }) {
  const bg = accent === 'gold' ? 'rgba(232,177,79,0.18)' : 'rgba(31,74,61,0.08)';
  const fg = accent === 'gold' ? '#8a6418' : 'var(--olive)';
  return (
    <button onClick={onClick} className="dl-tappable"
      style={{ all:'unset', cursor:'pointer', background:'#fff', borderRadius: 12,
        padding: 14, boxShadow: 'var(--shadow-card)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, color: fg,
        display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{sub}</div>
    </button>
  );
}

// ── Support Chat ─────────────────────────────────────────────────
function SupportChatScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [messages, setMessages] = useStMSS([
    { id: 1, from: 'support', text: 'أهلاً! أنا منى من فريق دعم دلنجاتو. ازاي ممكن أساعدك النهاردة؟', time: '٧:٣٠' },
  ]);
  const [text, setText] = useStMSS('');
  const [typing, setTyping] = useStMSS(false);
  const listRef = useRfMSS(null);

  useEfMSS(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing]);

  const send = (t) => {
    const msg = (t || text).trim();
    if (!msg) return;
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), from: 'me', text: msg, time }]);
    setText('');
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, from: 'support',
        text: 'استلمت طلبك. خليني أراجع وأرد عليك في ثواني.', time }]);
      setTyping(false);
    }, 1700);
  };

  const quick = ['مشكلة في طلب', 'سؤال عن التحويلات', 'إعدادات المحل', 'بلاغ عن خطأ'];

  return (
    <div className="dl-screen">
      <div className="dl-appbar">
        <button onClick={() => nav.pop()} aria-label="رجوع"
          style={{ background:'transparent', border: 0, padding: 6, cursor:'pointer', color:'var(--ink)', display:'flex' }}>
          <Icon.chevronRight size={24}/>
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 100, background: 'var(--olive)',
          color: 'var(--canvas)', display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily: 'var(--font-arabic)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>د</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>دعم دلنجاتو</div>
          <div style={{ fontSize: 11, color: 'var(--olive)', display:'flex', alignItems:'center', gap: 5, marginTop: 2 }}>
            <span className="dl-live-dot" style={{ width: 6, height: 6 }}/> متصلين دلوقتي
          </div>
        </div>
      </div>

      <div ref={listRef} className="dl-scroll" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'center', background: 'var(--canvas-200)', borderRadius: 100,
          padding: '4px 12px', fontSize: 11, color: 'var(--ink-light)' }}>
          النهاردة · ٧:٣٠ م
        </div>
        {messages.map(msg => (
          <div key={msg.id} className="dl-fade-up" style={{
            alignSelf: msg.from === 'me' ? 'flex-start' : 'flex-end',
            background: msg.from === 'me' ? 'var(--olive)' : '#fff',
            color: msg.from === 'me' ? 'var(--canvas)' : 'var(--ink)',
            border: msg.from === 'me' ? 0 : '1px solid var(--canvas-300)',
            maxWidth: '78%', padding: '10px 14px', borderRadius: 14,
            borderBottomLeftRadius: msg.from === 'me' ? 14 : 4,
            borderBottomRightRadius: msg.from === 'me' ? 4 : 14,
            fontSize: 14, lineHeight: 1.5,
          }}>
            <div>{msg.text}</div>
            <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'left' }} className="mono">{msg.time}</div>
          </div>
        ))}
        {typing && (
          <div className="dl-fade-up" style={{ alignSelf: 'flex-end',
            background: '#fff', border: '1px solid var(--canvas-300)',
            padding: '12px 14px', borderRadius: 14, borderBottomRightRadius: 4,
            display:'flex', gap: 4 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: 100, background: 'var(--ink-mute)',
                animation: `dl-bump 1s ${i * 0.15}s infinite` }}/>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '6px 18px 8px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {quick.map(q => <Chip key={q} onClick={() => send(q)}>{q}</Chip>)}
      </div>

      <div style={{ padding: '8px 14px 18px', display: 'flex', gap: 8, alignItems: 'flex-end',
        borderTop: '1px solid var(--canvas-300)', background: 'var(--canvas)' }}>
        <button style={{ width: 40, height: 40, borderRadius: 100, border: 0,
          background: 'var(--canvas-200)', color: 'var(--ink-light)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.plus size={20}/>
        </button>
        <textarea value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="اكتب رسالة…" rows={1}
          style={{ flex: 1, padding: '10px 14px', borderRadius: 22, border: '1.5px solid var(--canvas-300)',
            background: '#fff', resize:'none', outline:'none', fontFamily: 'var(--font-arabic)',
            fontSize: 14, color: 'var(--ink)', maxHeight: 100, lineHeight: 1.4 }}/>
        <button onClick={() => send()} disabled={!text.trim()}
          style={{ width: 40, height: 40, borderRadius: 100, border: 0,
            background: text.trim() ? 'var(--olive)' : 'var(--canvas-300)',
            color: 'var(--canvas)', cursor: text.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon.arrowLeft size={20}/>
        </button>
      </div>
    </div>
  );
}

// ── Report Issue ─────────────────────────────────────────────────
function ReportIssueScreen() {
  const nav = useNav();
  const m = useMerchant();
  const [cat, setCat] = useStMSS('');
  const [body, setBody] = useStMSS('');
  const [photos, setPhotos] = useStMSS([]);
  const cats = [
    { k: 'app', l: 'مشكلة في التطبيق', icon: <Icon.zap size={20}/> },
    { k: 'order', l: 'مشكلة في طلب', icon: <Icon.receipt size={20}/> },
    { k: 'payment', l: 'مشكلة في التحويلات', icon: <Icon.wallet size={20}/> },
    { k: 'driver', l: 'مشكلة مع كابتن', icon: <Icon.bike size={20}/> },
    { k: 'customer', l: 'مشكلة مع عميل', icon: <Icon.user size={20}/> },
    { k: 'other', l: 'حاجة تانية', icon: <Icon.info size={20}/> },
  ];
  return (
    <div className="dl-screen">
      <AppBar title="بلّغ عن مشكلة" onBack={() => nav.pop()}/>
      <div className="dl-scroll" style={{ padding: '4px 18px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          نوع المشكلة
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {cats.map(c => (
            <button key={c.k} onClick={() => setCat(c.k)}
              style={{ all:'unset', cursor:'pointer', padding: 14, borderRadius: 12,
                background: '#fff',
                border: `1.5px solid ${cat === c.k ? 'var(--olive)' : 'var(--canvas-300)'}`,
                display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10,
                background: cat === c.k ? 'var(--olive)' : 'var(--canvas-200)',
                color: cat === c.k ? 'var(--canvas)' : 'var(--olive)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{c.l}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>
          فاصلنا بالتفصيل
        </div>
        <textarea value={body} onChange={e => setBody(e.target.value)}
          placeholder="اكتب المشكلة بكل اللي حصل علشان نحلها بسرعة."
          style={{ width:'100%', minHeight: 140, padding: 14, fontFamily:'var(--font-arabic)',
            borderRadius: 12, border: '1.5px solid var(--canvas-300)', background:'#fff',
            resize:'none', outline:'none', fontSize: 14, color: 'var(--ink)', boxSizing: 'border-box', lineHeight: 1.55 }}/>

        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-mute)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
          صور <span style={{ fontWeight: 500, color: 'var(--ink-light)' }}>(اختياري)</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <button key={i} onClick={() => setPhotos(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}
              style={{ all:'unset', cursor:'pointer', flex: 1, aspectRatio: '1 / 1', borderRadius: 10,
                background: photos.includes(i) ? 'var(--canvas-200)' : '#fff',
                border: '1.5px dashed var(--canvas-300)',
                display:'flex', alignItems:'center', justifyContent:'center', color: 'var(--ink-light)' }}>
              {photos.includes(i) ? <Icon.check size={20}/> : <Icon.plus size={20}/>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 18px 24px', background: 'var(--canvas)', borderTop: '1px solid var(--canvas-300)' }}>
        <Button variant="primary" size="lg" full disabled={!cat || body.length < 10}
          onClick={() => { m.showToast('وصلنا بلاغك. هنرد عليك خلال ساعة', <Icon.check size={16}/>); nav.pop(); }}>
          إرسال البلاغ
        </Button>
      </div>
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────
function NotificationsScreen() {
  const nav = useNav();
  const m = useMerchant();
  useEfMSS(() => {
    const t = setTimeout(() => m.setNotifications(m.notifications.map(n => ({ ...n, read: true }))), 800);
    return () => clearTimeout(t);
  }, []);

  const [tab, setTab] = useStMSS('all');
  const list = tab === 'orders' ? m.notifications.filter(n => n.kind === 'order')
              : tab === 'stock' ? m.notifications.filter(n => n.kind === 'stock')
              : tab === 'campaigns' ? m.notifications.filter(n => n.kind === 'campaign')
              : m.notifications;

  return (
    <div className="dl-screen">
      <AppBar title="الإشعارات" onBack={() => nav.pop()}
        trailing={<button onClick={() => m.setNotifications([])}
          style={{ background:'transparent', border: 0, padding: 6, fontSize: 13,
            color: 'var(--olive)', fontWeight: 600, cursor:'pointer', fontFamily:'var(--font-arabic)' }}>
          مسح الكل
        </button>}/>

      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { k: 'all', l: 'الكل' },
          { k: 'orders', l: 'طلبات' },
          { k: 'stock', l: 'مخزن' },
          { k: 'campaigns', l: 'عروض' },
        ].map(c => (
          <Chip key={c.k} active={tab === c.k} onClick={() => setTab(c.k)}>{c.l}</Chip>
        ))}
      </div>

      <div className="dl-scroll">
        {list.length === 0 ? (
          <EmptyState icon={<Icon.bell size={32}/>} title="مفيش إشعارات"
            body="هنخبرك على طول لما يحصل أي حدث."/>
        ) : (
          <div style={{ padding: '4px 0 24px' }}>
            {list.map((n, i) => (
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
                  {n.icon === 'receipt' && <Icon.receipt size={20}/>}
                  {n.icon === 'package' && <Icon.package size={20}/>}
                  {n.icon === 'star' && <Icon.star size={20}/>}
                  {n.icon === 'flame' && <Icon.flame size={20}/>}
                  {n.icon === 'info' && <Icon.info size={20}/>}
                  {n.icon === 'check' && <Icon.check size={20}/>}
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

registerScreen('staff', StaffScreen);
registerScreen('staffForm', StaffFormScreen);
registerScreen('support', SupportScreen);
registerScreen('supportChat', SupportChatScreen);
registerScreen('reportIssue', ReportIssueScreen);
registerScreen('notifications', NotificationsScreen);
