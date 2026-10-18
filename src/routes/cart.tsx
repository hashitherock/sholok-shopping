import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingBag, Heart, Tag, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShopShell } from '@/components/storefront/shop-shell';
import { useStore } from '@/components/storefront/store-context';
import { products, money } from '@/data/catalog';
import { calculateTotals, coupons, FREE_DELIVERY_FROM } from '@/lib/pricing';

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [
    { title: 'Your shopping bag | Sholok' },
    { name: 'description', content: 'Review your Sholok bag, update quantities and apply coupon codes.' },
    { property: 'og:title', content: 'Your shopping bag | Sholok' },
    { property: 'og:description', content: 'Review items, coupons and totals in your Sholok bag.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: CartPage,
});

function CartPage() {
  const store = useStore();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checkout, setCheckout] = useState(false);
  const lines = store.cart.flatMap((item) => { const p = products.find((x) => x.id === item.id); return p ? [{ item, p, price: p.price, original: p.original, quantity: item.quantity }] : []; });
  const t = calculateTotals(lines, store.coupon);
  const apply = (c = code) => { const r = store.applyCoupon(c, t.subtotal); setMsg({ ok: r.ok, text: r.message }); if (r.ok) setCode(''); };

  if (!store.ready) return <ShopShell crumbs={[{ label: 'Shopping bag' }]}><p className="text-muted-foreground py-10">Loading your bag…</p></ShopShell>;

  return (
    <ShopShell crumbs={[{ label: 'Shopping bag' }]}>
      <h1 className="page-title">Your shopping bag {t.items > 0 && <span>({t.items} {t.items === 1 ? 'item' : 'items'})</span>}</h1>
      {!lines.length ? (
        <div className="empty-state"><ShoppingBag /><h2>Your bag is waiting for a little joy.</h2><p>Discover something you love.</p><Button asChild><Link to="/shop">Start shopping</Link></Button></div>
      ) : (
        <div className="cart-layout">
          <ul className="cart-page-list">
            {lines.map(({ item, p }) => {
              const max = p.stock - (store.inCart(p.id) - item.quantity);
              return (
                <li key={`${item.id}-${item.variant}`} className="cart-page-line">
                  <Link to="/product/$id" params={{ id: p.id }}><img src={p.image} alt={p.name} /></Link>
                  <div className="cart-line-info">
                    <Link to="/product/$id" params={{ id: p.id }} className="cart-line-name">{p.name}</Link>
                    <small>{p.brand}{item.variant ? ` · ${item.variant}` : ''}</small>
                    <div className="cart-line-price"><strong>{money(p.price)}</strong><del>{money(p.original)}</del></div>
                    {max <= 5 && <small className="stock-status is-low">Only {max} available</small>}
                    <div className="cart-line-actions">
                      <Button variant="link" size="sm" onClick={() => { if (!store.wishlist.includes(p.id)) store.toggleWish(p.id); store.remove(item.id, item.variant); }}><Heart /> Move to wishlist</Button>
                      <Button variant="link" size="sm" onClick={() => store.remove(item.id, item.variant)} aria-label={`Remove ${p.name}`}><Trash2 /> Remove</Button>
                    </div>
                  </div>
                  <div className="cart-line-qty">
                    <div className="quantity-row">
                      <Button variant="outline" size="icon" aria-label={`Decrease ${p.name} quantity`} disabled={item.quantity <= 1} onClick={() => store.quantity(item.id, item.variant, -1)}><Minus /></Button>
                      <QtyInput value={item.quantity} label={`${p.name} quantity`} onCommit={(n) => store.setQuantity(item.id, item.variant, n)} />
                      <Button variant="outline" size="icon" aria-label={`Increase ${p.name} quantity`} disabled={item.quantity >= max} onClick={() => store.quantity(item.id, item.variant, 1)}><Plus /></Button>
                    </div>
                    <strong className="line-total">{money(p.price * item.quantity)}</strong>
                  </div>
                </li>
              );
            })}
          </ul>
          <aside className="order-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <form className="coupon-form" onSubmit={(e) => { e.preventDefault(); apply(); }}>
              <label htmlFor="coupon"><Tag /> Coupon code</label>
              <div><input id="coupon" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setMsg(null); }} placeholder="e.g. SHOLOK10" /><Button type="submit">Apply</Button></div>
              {msg && <p role={msg.ok ? 'status' : 'alert'} className={msg.ok ? 'form-success' : 'form-error'}>{msg.ok ? <Check /> : <X />}{msg.text}</p>}
            </form>
            {store.coupon && <div className={`applied-coupon ${t.couponValid ? '' : 'is-invalid'}`}><span><strong>{store.coupon}</strong>{t.couponValid ? ` · ${t.coupon?.label}` : ` · No longer eligible: minimum ${money(t.coupon?.min ?? 0)}`}</span><Button variant="ghost" size="sm" onClick={() => { store.removeCoupon(); setMsg(null); }}>Remove</Button></div>}
            <div className="coupon-hints"><p>Demo coupons to try:</p>{coupons.filter((c) => !c.expired).map((c) => <Button variant="ghost" key={c.code} type="button" onClick={() => apply(c.code)}><strong>{c.code}</strong> {c.label}</Button>)}</div>
            <dl className="summary-rows">
              <div><dt>Subtotal ({t.items} items)</dt><dd>{money(t.subtotal)}</dd></div>
              {t.discount > 0 && <div className="is-saving"><dt>Coupon discount</dt><dd>−{money(t.discount)}</dd></div>}
              <div><dt>Delivery</dt><dd>{t.delivery ? money(t.delivery) : 'Free'}</dd></div>
              <div className="summary-total"><dt>Total</dt><dd>{money(t.total)}</dd></div>
            </dl>
            <p className="saving-note">You save {money(t.itemSavings + t.discount + (t.delivery ? 0 : 60))} on this order.{t.delivery > 0 && ` Add ${money(FREE_DELIVERY_FROM - t.subtotal)} more for free delivery.`}</p>
            <Button className="w-full" onClick={() => setCheckout(true)}>Proceed to checkout <ArrowRight /></Button>
            <Button asChild variant="link" className="w-full"><Link to="/shop">Continue shopping</Link></Button>
          </aside>
        </div>
      )}
      <Dialog open={checkout} onOpenChange={setCheckout}><DialogContent className="info-dialog"><DialogTitle>Demo checkout</DialogTitle><DialogDescription>This is a demonstration storefront. Your bag total is {money(t.total)}, but no payment is taken and no real order is placed. Your bag stays saved on this device.</DialogDescription><Button onClick={() => setCheckout(false)}>Got it</Button></DialogContent></Dialog>
    </ShopShell>
  );
}

function QtyInput({ value, label, onCommit }: { value: number; label: string; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => { if (draft !== null) { const n = parseInt(draft, 10); onCommit(Number.isFinite(n) && n > 0 ? n : value); setDraft(null); } };
  return <input aria-label={label} inputMode="numeric" value={draft ?? String(value)} onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') commit(); }} />;
}
