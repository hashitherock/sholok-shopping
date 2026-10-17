import { useEffect, useState } from 'react';
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router';
import { Heart, Minus, Plus, ShoppingBag, Star, Truck, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopShell } from '@/components/storefront/shop-shell';
import { ProductCard } from '@/components/storefront/product-card';
import { useStore } from '@/components/storefront/store-context';
import { products, productOptions, money, discount } from '@/data/catalog';

export const Route = createFileRoute('/product/$id')({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) => ({ meta: loaderData ? [
    { title: `${loaderData.name} | Sholok` },
    { name: 'description', content: loaderData.description },
    { property: 'og:title', content: `${loaderData.name} | Sholok` },
    { property: 'og:description', content: loaderData.description },
    { property: 'og:type', content: 'product' },
    { name: 'twitter:card', content: 'summary' },
  ] : [{ title: 'Product unavailable | Sholok' }, { name: 'robots', content: 'noindex' }] }),
  notFoundComponent: () => <ShopShell crumbs={[{ label: 'Not found' }]}><div className="empty-state"><h3>This product isn’t available</h3><p>It may have been removed from our catalogue.</p><Button asChild><Link to="/shop">Browse all products</Link></Button></div></ShopShell>,
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const p = products.find((x) => x.id === id)!;
  const opts = productOptions(p);
  const store = useStore();
  const go = useNavigate();
  const [size, setSize] = useState(opts.sizes?.[0] ?? '');
  const [color, setColor] = useState(opts.colors?.values[0] ?? '');
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  useEffect(() => { store.view(p.id); setSize(opts.sizes?.[0] ?? ''); setColor(opts.colors?.values[0] ?? ''); setQty(1); setShot(0); }, [p.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = Math.max(0, p.stock - store.inCart(p.id));
  const wished = store.wishlist.includes(p.id);
  const variant = [size, color].filter(Boolean).join(' · ') || undefined;
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const shots = [{ label: 'Front view', cls: '' }, { label: 'Close-up detail', cls: 'shot-zoom' }, { label: 'Side detail', cls: 'shot-side' }];
  const stockText = !p.stock ? 'Out of stock' : p.stock <= 10 ? `Only ${p.stock} left — order soon` : `In stock (${p.stock} available)`;

  return (
    <ShopShell crumbs={[{ label: p.category, to: '/shop', search: { category: p.category } }, { label: p.name }]}>
      <article className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-main"><img src={p.image} alt={`${p.name} – ${shots[shot]?.label}`} className={shots[shot]?.cls} /><span className="discount-badge">-{discount(p)}%</span></div>
          <div className="pdp-thumbs">{shots.map((s, i) => <button type="button" key={s.label} aria-label={s.label} aria-pressed={shot === i} className={shot === i ? 'is-on' : ''} onClick={() => setShot(i)}><img src={p.image} alt="" className={s.cls} /></button>)}</div>
        </div>
        <div className="pdp-info">
          <Link to="/shop" search={{ brands: [p.brand] }} className="pdp-brand">{p.brand}</Link>
          <h1>{p.name}</h1>
          <div className="rating"><Star /><span>{p.rating}</span><span className="review-count">({p.reviews} reviews) · {p.sold} sold</span></div>
          <div className="pdp-price"><strong>{money(p.price)}</strong><del>{money(p.original)}</del><span className="save-tag">Save {money(p.original - p.price)} ({discount(p)}%)</span></div>
          <p className={`stock-status ${!p.stock ? 'is-out' : p.stock <= 10 ? 'is-low' : ''}`}>{stockText}</p>
          {opts.sizes && <div className="option-group"><p>Size: <strong>{size}</strong></p><div className="variant-row" role="radiogroup" aria-label="Size">{opts.sizes.map((v) => <Button key={v} role="radio" aria-checked={size === v} variant="outline" className={size === v ? 'selected' : ''} onClick={() => setSize(v)}>{v}</Button>)}</div></div>}
          {opts.colors && <div className="option-group"><p>{opts.colors.label}: <strong>{color}</strong></p><div className="variant-row" role="radiogroup" aria-label={opts.colors.label}>{opts.colors.values.map((v) => <Button key={v} role="radio" aria-checked={color === v} variant="outline" className={color === v ? 'selected' : ''} onClick={() => setColor(v)}>{v}</Button>)}</div></div>}
          {p.stock > 0 && <div className="option-group"><p>Quantity</p><div className="quantity-row"><Button variant="outline" size="icon" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus /></Button><input aria-label="Quantity" inputMode="numeric" value={qty} onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ''), 10); setQty(Number.isFinite(n) ? Math.max(1, Math.min(Math.max(1, left), n)) : 1); }} /><Button variant="outline" size="icon" aria-label="Increase quantity" disabled={qty >= left} onClick={() => setQty((q) => Math.min(left, q + 1))}><Plus /></Button></div>{store.inCart(p.id) > 0 && <small className="text-muted-foreground">{store.inCart(p.id)} already in your bag · {left} more available</small>}</div>}
          <div className="pdp-actions">
            <Button disabled={!p.stock || left < 1} onClick={() => { if (store.add(p, variant, qty)) setQty(1); }}><ShoppingBag /> {left < 1 && p.stock ? 'Stock limit in bag' : 'Add to cart'}</Button>
            <Button variant="secondary" disabled={!p.stock || left < 1} onClick={() => { if (store.add(p, variant, qty)) go({ to: '/cart' }); }}><Zap /> Buy now</Button>
            <Button variant="outline" size="icon" aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wished} onClick={() => store.toggleWish(p.id)}><Heart fill={wished ? 'currentColor' : 'none'} /></Button>
          </div>
          <ul className="pdp-perks"><li><Truck /> Delivery in 3–5 days · free over ৳1,500</li><li><RotateCcw /> 7-day easy returns</li><li><ShieldCheck /> Cash on delivery available</li></ul>
          <section className="pdp-about"><h2>About this product</h2><p>{p.description}</p><dl><dt>Brand</dt><dd>{p.brand}</dd><dt>Category</dt><dd>{p.category}</dd><dt>Product code</dt><dd>{p.id.toUpperCase()}</dd>{opts.sizes && <><dt>Sizes</dt><dd>{opts.sizes.join(', ')}</dd></>}{opts.colors && <><dt>{opts.colors.label}s</dt><dd>{opts.colors.values.join(', ')}</dd></>}</dl></section>
        </div>
      </article>
      {related.length > 0 && <section className="store-section"><div className="section-heading"><div className="section-heading-main"><h2>More from {p.category}</h2></div></div><div className="products-grid shop-grid">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div></section>}
    </ShopShell>
  );
}
