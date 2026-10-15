import { describe, expect, it } from 'vitest';
import { categories, products, money } from '@/data/catalog';
describe('Sholok catalog', () => {
 it('preserves exactly the thirteen approved categories in order', () => {
  expect(categories.map(c => c.name)).toEqual(["Women's Clothing", "Men's Clothing", 'Beauty & Makeup', 'Personal Care', 'Fashion & Lifestyle', 'Health & Wellness', 'Baby Care', 'Home & Kitchen', 'Cleaning Supplies', 'Stationery & Office', 'Pet Care', 'Toys & Sports', 'Vehicle Essentials']);
 });
 it('provides a complete valid catalog without extra categories', () => {
  expect(products.length).toBeGreaterThanOrEqual(65);
  expect(new Set(products.map(p => p.id)).size).toBe(products.length);
  for (const p of products) {
   expect(categories.some(c => c.name === p.category)).toBe(true);
   expect(p.price).toBeGreaterThan(0);
   expect(p.original).toBeGreaterThanOrEqual(p.price);
   expect(p.image).toBeTruthy();
  }
 });
 it('uses Bangladeshi Taka', () => expect(money(1290)).toBe('৳1,290'));
});
