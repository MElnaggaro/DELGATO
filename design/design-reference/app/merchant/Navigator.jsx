// app/merchant/Navigator.jsx — Merchant-side Navigator + Provider.
// Same stack model as customer, but its own context (orders, products, store).

const MNavContext = React.createContext(null);
const MerchantContext = React.createContext(null);

function useNav() { return React.useContext(MNavContext); }
function useMerchant() { return React.useContext(MerchantContext); }

function Navigator({ initial = 'splash', initialStack, children }) {
  const [stack, setStack] = React.useState(initialStack || [{ id: 1, screen: initial }]);
  const [transition, setTransition] = React.useState({ kind: 'idle' });
  const seq = React.useRef(2);

  const push = (screen, params) => {
    setTransition({ kind: 'pushing' });
    setStack(s => [...s, { id: seq.current++, screen, params }]);
    setTimeout(() => setTransition({ kind: 'idle' }), 340);
  };
  const pop = (n = 1) => {
    if (stack.length <= 1) return;
    setTransition({ kind: 'popping' });
    setTimeout(() => {
      setStack(s => s.slice(0, -n));
      setTransition({ kind: 'idle' });
    }, 290);
  };
  const replace = (screen, params) => {
    setTransition({ kind: 'fading' });
    setStack(s => [...s.slice(0, -1), { id: seq.current++, screen, params }]);
    setTimeout(() => setTransition({ kind: 'idle' }), 240);
  };
  const reset = (screen, params) => {
    setTransition({ kind: 'fading' });
    setStack([{ id: seq.current++, screen, params }]);
    setTimeout(() => setTransition({ kind: 'idle' }), 240);
  };

  const top = stack[stack.length - 1];
  const beneath = stack.length > 1 ? stack[stack.length - 2] : null;

  let layers = [];
  if (transition.kind === 'pushing') {
    layers = [
      { key: beneath?.id, frame: beneath, anim: 'push-out' },
      { key: top.id, frame: top, anim: 'push-in' },
    ].filter(l => l.frame);
  } else if (transition.kind === 'popping') {
    layers = [
      { key: beneath?.id, frame: beneath, anim: 'pop-in' },
      { key: top.id, frame: top, anim: 'pop-out' },
    ].filter(l => l.frame);
  } else if (transition.kind === 'fading') {
    layers = [{ key: top.id, frame: top, anim: 'fade-in' }];
  } else {
    layers = [{ key: top.id, frame: top, anim: null }];
  }

  const nav = { push, pop, replace, reset, stack, current: top };

  return (
    <MNavContext.Provider value={nav}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--canvas)' }}>
        {layers.map(l => (
          <div key={l.key} className="nav-layer" data-anim={l.anim || undefined}>
            {renderScreen(l.frame.screen, l.frame.params)}
          </div>
        ))}
      </div>
    </MNavContext.Provider>
  );
}

window.__mscreens = window.__mscreens || {};
function registerScreen(key, Component) { window.__mscreens[key] = Component; }

function renderScreen(screen, params) {
  const C = window.__mscreens[screen];
  if (!C) {
    return (
      <div className="dl-screen" style={{ padding: 40 }}>
        <div style={{ color: 'var(--ink-light)' }}>شاشة غير معروفة: {screen}</div>
      </div>
    );
  }
  return <C {...(params || {})} />;
}

// ─── Merchant App Provider ────────────────────────────────────────
function MerchantProvider({ children }) {
  const [store, setStore] = React.useState(STORE);
  const [acceptingOrders, setAcceptingOrders] = React.useState(true);
  const [queue, setQueue] = React.useState(QUEUE);
  const [history, setHistory] = React.useState(HISTORY);
  const [products, setProducts] = React.useState(M_PRODUCTS);
  const [categories, setCategories] = React.useState(M_CATEGORIES);
  const [modifiers, setModifiers] = React.useState(MODIFIERS);
  const [promos, setPromos] = React.useState(PROMOS);
  const [reviews, setReviews] = React.useState(M_REVIEWS);
  const [staff, setStaff] = React.useState(STAFF);
  const [hours, setHours] = React.useState(HOURS);
  const [notifications, setNotifications] = React.useState(M_NOTIFICATIONS);
  const [toast, setToast] = React.useState(null);
  const [authed, setAuthed] = React.useState(false);
  const [prepTime, setPrepTime] = React.useState(STORE.prepTime);
  const [deliveryRadius, setDeliveryRadius] = React.useState(STORE.deliveryRadius);
  const [tempClose, setTempClose] = React.useState(null); // { reason, until } | null

  const showToast = (msg, icon) => setToast({ msg, icon, id: Date.now() });

  // Move an order through states
  const setOrderStatus = (id, status) => {
    setQueue(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  // Move order to history on delivered/rejected
  const finalizeOrder = (id, status, reason) => {
    setQueue(prev => prev.filter(o => o.id !== id));
    const order = queue.find(o => o.id === id);
    if (order) {
      setHistory(prev => [{ id: order.id, status, date: 'دلوقتي',
        total: order.total, items: order.items?.length || 0,
        customerName: order.customerName, reason }, ...prev]);
    }
  };

  const counts = {
    new: queue.filter(o => o.status === 'new').length,
    accepted: queue.filter(o => o.status === 'accepted').length,
    preparing: queue.filter(o => o.status === 'preparing').length,
    ready: queue.filter(o => o.status === 'ready').length,
    picked: queue.filter(o => o.status === 'picked').length,
    active: queue.length,
  };

  const lowStockProducts = products.filter(p => p.availability === 'low' || p.availability === 'out');

  const value = {
    store, setStore,
    acceptingOrders, setAcceptingOrders,
    queue, setQueue, counts,
    history, setHistory,
    products, setProducts,
    categories, setCategories,
    modifiers, setModifiers,
    promos, setPromos,
    reviews, setReviews,
    staff, setStaff,
    hours, setHours,
    notifications, setNotifications,
    toast, showToast, dismissToast: () => setToast(null),
    authed, setAuthed,
    prepTime, setPrepTime,
    deliveryRadius, setDeliveryRadius,
    tempClose, setTempClose,
    setOrderStatus, finalizeOrder,
    lowStockProducts,
  };

  return (
    <MerchantContext.Provider value={value}>
      {children}
      {value.toast && (
        <Toast onDone={value.dismissToast} icon={value.toast.icon}>{value.toast.msg}</Toast>
      )}
    </MerchantContext.Provider>
  );
}

Object.assign(window, { Navigator, useNav, useMerchant, registerScreen, MerchantProvider });
