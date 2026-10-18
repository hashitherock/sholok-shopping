import { createFileRoute, Link } from '@tanstack/react-router';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShopShell } from '@/components/storefront/shop-shell';
import { ProductCard } from '@/components/storefront/product-card';
import { useStore } from '@/components/storefront/store-context';
import { products, defaultVariant } from '@/data/catalog';

export const Route = createFileRoute('/wishlist')({
  head: () => ({ meta: [
    { title: 'Your wishlist | Sholok' },
    { name: 'description', content: 'Your saved Sholok favourites, kept on this device.' },
    { property: 'og:title', content: 'Your wishlist | Sholok' },
    { property: 'og:description', content: 'Save favourites and add them to your bag any time.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: WishlistPage,
});

function WishlistPage() {
  const store = useStore();
  const items = store.wishlist.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined);
  const available = items.filter((p) => p.stock > store.inCart(p.id));
  return (
    <ShopShell crumbs={[{ label: 'Wishlist' }]}>
      <div className="shop-toolbar"><div><h1>Your wishlist</h1><p>{items.length} saved {items.length === 1 ? 'item' : 'items'}</p></div>
        {items.length > 0 && <div className="toolbar-actions"><Button disabled={!available.length} onClick={() => { available.forEach((p) => store.add(p, defaultVariant(p))); store.notify(`${available.length} items added to your bag`); }}><ShoppingBag /> Add all to cart</Button><Button variant="outline" onClick={store.clearWishlist}><Trash2 /> Clear</Button></div>}
      </div>
      {!store.ready ? <p className="text-muted-foreground py-10">Loading…</p> : items.length ? <div className="products-grid shop-grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div> : (
        <div className="empty-state"><Heart /><h2>A little room for your favourites</h2><p>Tap the heart on something you love and it will be saved here.</p><Button asChild><Link to="/shop">Discover products</Link></Button></div>
      )}
    </ShopShell>
  );
}
