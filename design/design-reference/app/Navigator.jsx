// Navigator.jsx — stack-based screen manager with RTL push/pop transitions.
// Maintains a screen stack; renders the top layer with an enter animation,
// and the previous layer with an exit animation, then removes it.
//
// In RTL, "forward" (push) means the new screen slides in from the LEFT.
// "Back" (pop) means it slides out to the LEFT and the previous slides in
// from the RIGHT.

const { createContext: _createContext, useContext: _useContext } = React;

const NavContext = _createContext(null);
const AppContext = _createContext(null);

function useNav() { return _useContext(NavContext); }
function useApp() { return _useContext(AppContext); }

// ─── Stack model ──────────────────────────────────────────────────
// Each frame: { id, screen, params }
// We render up to 2 layers — the one being entered/exited and the one staying.
function Navigator({ initial = 'splash', initialStack, children }) {
  const [stack, setStack] = React.useState(initialStack || [{ id: 1, screen: initial }]);
  // 'idle' | 'pushing' | 'popping' | 'replacing'
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

  // Decide what to render & their animations
  // - During push: render beneath with push-out, top with push-in
  // - During pop:  render beneath with pop-in, top with pop-out
  // - During fading (replace): render only top with fade-in
  // - Idle: render only top, no anim
  let layers = [];
  if (transition.kind === 'pushing') {
    layers = [
      { key: beneath?.id, frame: beneath, anim: 'push-out' },
      { key: top.id, frame: top, anim: 'push-in' },
    ].filter(l => l.frame);
  } else if (transition.kind === 'popping') {
    // For pop: top is going away (was at stack length), beneath is the next one
    // Stack hasn't shrunk yet, so we draw stack[-2] coming in and stack[-1] going out.
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
    <NavContext.Provider value={nav}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--canvas)' }}>
        {layers.map(l => (
          <div key={l.key} className="nav-layer" data-anim={l.anim || undefined}>
            {renderScreen(l.frame.screen, l.frame.params)}
          </div>
        ))}
      </div>
    </NavContext.Provider>
  );
}

// ─── Screen registry ──────────────────────────────────────────────
// Map screen names to components. The map is built up by each screen file
// calling registerScreen(key, Component).
window.__screens = window.__screens || {};
function registerScreen(key, Component) { window.__screens[key] = Component; }

function renderScreen(screen, params) {
  const C = window.__screens[screen];
  if (!C) {
    return (
      <div className="dl-screen" style={{ padding: 40 }}>
        <div style={{ color: 'var(--ink-light)' }}>شاشة غير معروفة: {screen}</div>
      </div>
    );
  }
  return <C {...(params || {})} />;
}

// ─── App state provider (cart, location, addresses, auth) ─────────
function AppProvider({ children }) {
  const [cart, setCartRaw] = React.useState([]);
  const [authed, setAuthed] = React.useState(false);
  const [phone, setPhone] = React.useState('');
  const [addresses, setAddresses] = React.useState(ADDRESSES);
  const [selectedAddress, setSelectedAddress] = React.useState(ADDRESSES[0]);
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS);
  const [orders, setOrders] = React.useState(ORDERS);
  const [offline, setOffline] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [favorites, setFavorites] = React.useState(['noor']);

  const setCart = (next) => setCartRaw(prev => typeof next === 'function' ? next(prev) : next);

  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const showToast = (msg, icon) => {
    setToast({ msg, icon, id: Date.now() });
  };

  const addItem = (product, shop, qty = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        const out = [...prev]; out[idx] = { ...out[idx], qty: out[idx].qty + qty };
        return out;
      }
      return [...prev, {
        id: product.id, name: product.name, sub: product.sub,
        price: product.price, qty, hue: product.hue,
        shop: shop?.name || 'محل', shopId: shop?.id,
      }];
    });
  };

  const setItemQty = (id, qty) => {
    setCart(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const clearCart = () => setCart([]);

  const toggleFav = (shopId) => {
    setFavorites(prev => prev.includes(shopId) ? prev.filter(s => s !== shopId) : [...prev, shopId]);
  };

  const value = {
    cart, setCart, cartCount, cartTotal,
    authed, setAuthed, phone, setPhone,
    addresses, setAddresses, selectedAddress, setSelectedAddress,
    notifications, setNotifications,
    orders, setOrders,
    offline, setOffline,
    toast, showToast, dismissToast: () => setToast(null),
    favorites, toggleFav,
    addItem, setItemQty, clearCart,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {value.toast && (
        <Toast onDone={value.dismissToast} icon={value.toast.icon}>
          {value.toast.msg}
        </Toast>
      )}
    </AppContext.Provider>
  );
}

Object.assign(window, { Navigator, useNav, useApp, registerScreen, AppProvider });
