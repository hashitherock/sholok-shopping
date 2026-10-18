import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, ShoppingBag, ShoppingCart, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from './store-context';

export type Crumb = { label: string; to?: '/shop'; search?: Record<string, string> };

export function ShopShell({ children, crumbs = [], initialQuery = '' }: { children: ReactNode; crumbs?: Crumb[]; initialQuery?: string }) {
  const store = useStore();
  const go = useNavigate();
  const [q, setQ] = useState(initialQuery);
  const count = store.cart.reduce((s, i) => s + i.quantity, 0);
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="store-header">
        <div className="container-store main-header">
          <div className="brand-group"><Link to="/" aria-label="Sholok home" className="brand"><ShoppingBag className="brand-icon" /><span>sholok<span className="brand-dot">.</span></span></Link></div>
          <div className="search-wrap">
            <form className="search-form" role="search" onSubmit={(e) => { e.preventDefault(); const v = q.trim(); if (v) store.saveSearch(v); go({ to: '/shop', search: v ? { q: v } : {} }); }}>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search in Sholok" aria-label="Search products" />
              <Button type="submit" aria-label="Search"><Search /></Button>
            </form>
          </div>
          <div className="header-actions">
            <Link to="/wishlist" className="header-action" aria-label={`Wishlist, ${store.wishlist.length} items`}><Heart />{store.wishlist.length > 0 && <span className="count-badge">{store.wishlist.length}</span>}<span className="action-label">Wishlist</span></Link>
            <Link to="/cart" className="header-action" aria-label={`Cart, ${count} items`}><ShoppingCart />{count > 0 && <span className="count-badge">{count}</span>}<span className="action-label">Cart</span></Link>
          </div>
        </div>
      </header>
      <main id="main-content" className="container-store shop-main">
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link to="/">Home</Link>
          {crumbs.map((c) => <span key={c.label} className="crumb"><ChevronRight />{c.to ? <Link to={c.to} search={c.search ?? {}}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}</span>)}
        </nav>
        {children}
      </main>
      <footer className="shop-footer"><div className="container-store">© 2026 Sholok · Demo storefront — no real payments or orders are processed.</div></footer>
    </>
  );
}
