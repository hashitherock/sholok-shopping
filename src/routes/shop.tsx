import { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { zodValidator, fallback } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { SlidersHorizontal, X, SearchX, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ShopShell } from '@/components/storefront/shop-shell';
import { ProductCard } from '@/components/storefront/product-card';
import { useStore } from '@/components/storefront/store-context';
import { categories, products, searchProducts, money } from '@/data/catalog';

const schema = z.object({
  q: fallback(z.string(), '').default(''),
  category: fallback(z.string(), '').default(''),
  brands: fallback(z.string().array(), []).default([]),
  min: fallback(z.number(), 0).default(0),
  max: fallback(z.number(), 0).default(0),
  rating: fallback(z.number(), 0).default(0),
  stock: fallback(z.boolean(), false).default(false),
  sort: fallback(z.string(), '').default(''),
});

export const Route = createFileRoute('/shop')({
  validateSearch: zodValidator(schema),
  head: () => ({ meta: [
    { title: 'Shop all products | Sholok' },
    { name: 'description', content: 'Search and filter Sholok products by category, price, brand, rating and availability.' },
    { property: 'og:title', content: 'Shop all products | Sholok' },
    { property: 'og:description', content: 'Find fashion, beauty, home essentials and more across 13 categories.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ShopPage,
});

const sorts = [['recommended', 'Recommended'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['rating', 'Top rated'], ['popular', 'Most popular'], ['discount', 'Biggest discount']] as const;
const pricePresets: [string, number, number][] = [['Under ৳500', 0, 500], ['৳500 – ৳1,000', 500, 1000], ['৳1,000 – ৳2,000', 1000, 2000], ['Over ৳2,000', 2000, 0]];

function ShopPage() {
  const s = Route.useSearch();
  const go = Route.useNavigate();
  const store = useStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const validCategory = categories.some((c) => c.name === s.category) ? s.category : '';
  const sort = s.sort || store.prefs.sort;
  const update = (patch: Partial<typeof s>) => go({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const base = useMemo(() => searchProducts(s.q, validCategory ? products.filter((p) => p.category === validCategory) : products), [s.q, validCategory]);
  const brandOptions = [...new Set(base.map((p) => p.brand))].sort();
  const results = useMemo(() => {
    const list = base.filter((p) => (!s.brands.length || s.brands.includes(p.brand)) && (!s.min || p.price >= s.min) && (!s.max || p.price <= s.max) && p.rating >= s.rating && (!s.stock || p.stock > 0));
    const by: Record<string, (a: typeof list[number], b: typeof list[number]) => number> = {
      low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating,
      popular: (a, b) => b.sold - a.sold, discount: (a, b) => a.price / a.original - b.price / b.original,
    };
    return by[sort] ? [...list].sort(by[sort]) : list;
  }, [base, s.brands, s.min, s.max, s.rating, s.stock, sort]);

  const [minIn, setMinIn] = useState(s.min ? String(s.min) : '');
  const [maxIn, setMaxIn] = useState(s.max ? String(s.max) : '');
  const [priceError, setPriceError] = useState('');
  useEffect(() => { setMinIn(s.min ? String(s.min) : ''); setMaxIn(s.max ? String(s.max) : ''); }, [s.min, s.max]);
  const applyPrice = () => {
    const mn = minIn ? Number(minIn) : 0; const mx = maxIn ? Number(maxIn) : 0;
    if (!Number.isFinite(mn) || !Number.isFinite(mx) || mn < 0 || mx < 0) return setPriceError('Please enter positive amounts.');
    if (mx && mn > mx) return setPriceError('Minimum must be lower than maximum.');
    setPriceError(''); update({ min: mn, max: mx });
  };
  const active = [s.q && 'q', validCategory && 'category', s.brands.length && 'brands', (s.min || s.max) && 'price', s.rating && 'rating', s.stock && 'stock'].filter(Boolean).length;
  const clearAll = () => go({ search: { sort: s.sort }, replace: true });
  const title = s.q ? `Results for “${s.q}”` : validCategory || 'All products';

  const panel = (
    <div className="filter-panel">
      <fieldset><legend>Category</legend>
        <button type="button" className={`filter-chip ${!validCategory ? 'is-on' : ''}`} onClick={() => update({ category: '', brands: [] })}>All categories</button>
        {categories.map((c) => <button type="button" key={c.name} className={`filter-chip ${validCategory === c.name ? 'is-on' : ''}`} aria-pressed={validCategory === c.name} onClick={() => update({ category: c.name, brands: [] })}>{c.name}<span>{searchProducts(s.q, products.filter((p) => p.category === c.name)).length}</span></button>)}
      </fieldset>
      <fieldset><legend>Price (৳)</legend>
        <div className="price-inputs"><input inputMode="numeric" aria-label="Minimum price" placeholder="Min" value={minIn} onChange={(e) => setMinIn(e.target.value.replace(/[^\d]/g, ''))} /><span>–</span><input inputMode="numeric" aria-label="Maximum price" placeholder="Max" value={maxIn} onChange={(e) => setMaxIn(e.target.value.replace(/[^\d]/g, ''))} /><Button size="sm" onClick={applyPrice}>Apply</Button></div>
        {priceError && <p className="form-error" role="alert">{priceError}</p>}
        <div className="preset-row">{pricePresets.map(([l, mn, mx]) => <button type="button" key={l} className={`filter-pill ${s.min === mn && s.max === mx ? 'is-on' : ''}`} onClick={() => update({ min: mn, max: mx })}>{l}</button>)}</div>
      </fieldset>
      <fieldset><legend>Brand</legend>
        {brandOptions.map((b) => <label key={b} className="check-row"><input type="checkbox" checked={s.brands.includes(b)} onChange={() => update({ brands: s.brands.includes(b) ? s.brands.filter((x) => x !== b) : [...s.brands, b] })} />{b}</label>)}
      </fieldset>
      <fieldset><legend>Rating</legend>
        {[0, 4.5, 4.7].map((r) => <label key={r} className="check-row"><input type="radio" name="rating" checked={s.rating === r} onChange={() => update({ rating: r })} />{r ? <><Star className="star-mini" />{r} & up</> : 'Any rating'}</label>)}
      </fieldset>
      <fieldset><legend>Availability</legend>
        <label className="check-row"><input type="checkbox" checked={s.stock} onChange={(e) => update({ stock: e.target.checked })} />In stock only</label>
      </fieldset>
      {active > 0 && <Button variant="outline" onClick={clearAll}><X /> Clear all filters</Button>}
    </div>
  );

  return (
    <ShopShell crumbs={[{ label: 'Shop', ...(validCategory || s.q ? { to: '/shop' as const } : {}) }, ...(validCategory || s.q ? [{ label: title }] : [])]} initialQuery={s.q}>
      <div className="shop-layout">
        <aside className="shop-sidebar" aria-label="Filters">{panel}</aside>
        <section>
          <div className="shop-toolbar">
            <div><h1>{title}</h1><p>{results.length} {results.length === 1 ? 'product' : 'products'}{s.min || s.max ? ` · ${s.min ? money(s.min) : '৳0'} – ${s.max ? money(s.max) : 'any'}` : ''}</p></div>
            <div className="toolbar-actions">
              <Button variant="outline" className="filters-button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal /> Filters{active ? ` (${active})` : ''}</Button>
              <select aria-label="Sort products" value={sort} onChange={(e) => { store.setPrefs({ sort: e.target.value }); update({ sort: e.target.value }); }}>{sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </div>
          </div>
          {results.length ? <div className="products-grid shop-grid">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div> : (
            <div className="empty-state"><SearchX /><h3>No products match your filters</h3><p>Try a different search term or remove a filter.</p><div className="flex gap-2 justify-center"><Button onClick={clearAll}>Clear filters</Button><Button asChild variant="outline"><Link to="/">Back to home</Link></Button></div></div>
          )}
        </section>
      </div>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}><SheetContent side="left" className="filter-sheet"><SheetTitle>Filters</SheetTitle><SheetDescription>{results.length} products match</SheetDescription>{panel}<Button className="w-full mt-4" onClick={() => setFiltersOpen(false)}>Show {results.length} products</Button></SheetContent></Sheet>
    </ShopShell>
  );
}
