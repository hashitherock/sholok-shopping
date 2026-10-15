import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { products, type Product } from '@/data/catalog';
import { validateCoupon } from '@/lib/pricing';

export type CartItem = { id: string; quantity: number; variant?: string | undefined };
export type Prefs = { sort: string };

type Store = {
  cart: CartItem[]; wishlist: string[]; recent: string[]; searches: string[]; coupon: string | null; prefs: Prefs; ready: boolean;
  add: (p: Product, variant?: string, qty?: number) => boolean;
  toggleWish: (id: string) => void;
  quantity: (id: string, variant: string | undefined, delta: number) => void;
  setQuantity: (id: string, variant: string | undefined, qty: number) => void;
  remove: (id: string, variant?: string) => void;
  clearWishlist: () => void;
  view: (id: string) => void;
  saveSearch: (q: string) => void;
  applyCoupon: (code: string, subtotal: number) => { ok: boolean; message: string };
  removeCoupon: () => void;
  setPrefs: (p: Partial<Prefs>) => void;
  inCart: (id: string) => number;
  notice: string; notify: (s: string) => void;
  cartOpen: boolean; setCartOpen: (v: boolean) => void;
};

const Context = createContext<Store | null>(null);
const stockOf = (id: string) => products.find((p) => p.id === id)?.stock ?? 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [searches, setSearches] = useState<string[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [prefs, setPrefsState] = useState<Prefs>({ sort: 'recommended' });
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sholok-store');
      if (raw) {
        const v = JSON.parse(raw);
        const arr = (x: unknown) => (Array.isArray(x) ? x.filter((i) => typeof i === 'string') : []);
        setCart(Array.isArray(v.cart) ? v.cart.filter((i: CartItem) => products.some((p) => p.id === i.id) && Number.isInteger(i.quantity) && i.quantity > 0).map((i: CartItem) => ({ ...i, quantity: Math.min(i.quantity, stockOf(i.id)) })).filter((i: CartItem) => i.quantity > 0) : []);
        setWishlist(arr(v.wishlist).filter((id) => products.some((p) => p.id === id)));
        setRecent(arr(v.recent)); setSearches(arr(v.searches));
        setCoupon(typeof v.coupon === 'string' ? v.coupon : null);
        if (v.prefs && typeof v.prefs.sort === 'string') setPrefsState({ sort: v.prefs.sort });
      }
    } catch { /* corrupted storage: start fresh */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('sholok-store', JSON.stringify({ cart, wishlist, recent, searches, coupon, prefs })); }, [ready, cart, wishlist, recent, searches, coupon, prefs]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 3000); return () => clearTimeout(t); }, [notice]);

  const inCart = (id: string) => cart.filter((i) => i.id === id).reduce((s, i) => s + i.quantity, 0);
  // Total quantity of a product across every variant may never exceed its stock.
  const othersQty = (list: CartItem[], id: string, variant?: string) => list.filter((i) => i.id === id && i.variant !== variant).reduce((s, i) => s + i.quantity, 0);

  const add = (p: Product, variant?: string, qty = 1) => {
    if (!p.stock) { setNotice('This product is out of stock'); return false; }
    const amount = Math.floor(qty);
    if (!Number.isFinite(amount) || amount < 1) { setNotice('Please choose a valid quantity'); return false; }
    const room = p.stock - inCart(p.id);
    if (room <= 0) { setNotice(`Only ${p.stock} available — all already in your bag`); return false; }
    const added = Math.min(room, amount);
    setCart((old) => {
      const found = old.find((i) => i.id === p.id && i.variant === variant);
      return found ? old.map((i) => (i === found ? { ...i, quantity: i.quantity + added } : i)) : [...old, { id: p.id, quantity: added, variant }];
    });
    setNotice(added < amount ? `Only ${added} more available — added to your bag` : `${p.name} added to your bag`);
    return true;
  };
  const setQuantity = (id: string, variant: string | undefined, qty: number) => setCart((v) => v.map((i) => {
    if (i.id !== id || i.variant !== variant) return i;
    const max = stockOf(id) - othersQty(v, id, variant);
    const n = Number.isFinite(qty) ? Math.floor(qty) : i.quantity;
    if (n > max) setNotice(`Only ${max} available for this item`);
    return { ...i, quantity: Math.max(1, Math.min(max, n)) };
  }));
  const quantity = (id: string, variant: string | undefined, delta: number) => {
    const item = cart.find((i) => i.id === id && i.variant === variant);
    if (item) setQuantity(id, variant, item.quantity + delta);
  };
  const applyCoupon = (code: string, subtotal: number) => {
    const r = validateCoupon(code, subtotal);
    if (r.ok) setCoupon(r.coupon.code);
    return { ok: r.ok, message: r.message };
  };

  return (
    <Context.Provider value={{
      cart, wishlist, recent, searches, coupon, prefs, ready, add, setQuantity, quantity, inCart, applyCoupon,
      removeCoupon: () => setCoupon(null),
      toggleWish: (id) => { const has = wishlist.includes(id); setWishlist((v) => (v.includes(id) ? v.filter((i) => i !== id) : [...v, id])); setNotice(has ? 'Removed from your wishlist' : 'Saved to your wishlist'); },
      clearWishlist: () => setWishlist([]),
      remove: (id, variant) => setCart((v) => v.filter((i) => !(i.id === id && i.variant === variant))),
      view: (id) => setRecent((v) => [id, ...v.filter((i) => i !== id)].slice(0, 12)),
      saveSearch: (q) => setSearches((v) => [q, ...v.filter((i) => i !== q)].slice(0, 5)),
      setPrefs: (p) => setPrefsState((v) => ({ ...v, ...p })),
      notice, notify: setNotice, cartOpen, setCartOpen,
    }}>
      {children}
      {notice && <div className="store-toast" role="status">{notice}</div>}
    </Context.Provider>
  );
}

export function useStore() { const value = useContext(Context); if (!value) throw new Error('StoreProvider is required'); return value; }
